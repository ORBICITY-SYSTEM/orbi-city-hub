import * as XLSX from 'xlsx';

interface ProcessedRecord {
  roomNumber: string;
  buildingBlock: string;
  channel: string;
  checkinDate: string;
  checkoutDate: string;
  nights: number;
  revenue: number;
  date: string;
}

interface MonthlyRoomCount {
  month: string;
  roomCount: number;
  rooms: string[];
}

export interface ExcelProcessingResult {
  records: ProcessedRecord[];
  monthlyRoomCounts: MonthlyRoomCount[];
  roomFirstSeen: Map<string, string>;
  stats: {
    totalRecords: number;
    uniqueRooms: number;
    dateRange: { start: string; end: string };
  };
}

export const processExcelFile = async (file: File): Promise<ExcelProcessingResult> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { raw: false });

  // Debug: Log Excel columns
  if (data.length > 0) {
    console.log('📊 Excel Columns:', Object.keys(data[0]));
    console.log('📊 First Row Sample:', data[0]);
  }

  const processedRecords: ProcessedRecord[] = [];
  const roomFirstSeen = new Map<string, string>();
  let skippedRows = 0;

  for (const row of data as any[]) {
    const roomNumber = extractRoomNumber(row);
    const channel = normalizeChannel(extractChannel(row));
    
    const checkinRaw = extractCheckin(row);
    const checkoutRaw = extractCheckout(row);
    
    const checkin = parseExcelDate(checkinRaw);
    const checkout = parseExcelDate(checkoutRaw);

    // Enhanced debug logging for first 2 rows
    if (processedRecords.length < 2 && roomNumber) {
      console.log('✅ Successfully extracted:', {
        roomNumber,
        channel,
        checkin: checkin?.toISOString().split('T')[0],
        checkout: checkout?.toISOString().split('T')[0],
        revenue: extractRevenue(row)
      });
    }

    if (!roomNumber || !checkin || !checkout) {
      skippedRows++;
      if (skippedRows <= 3) {
        console.warn('⚠️ Skipped row (missing data):', {
          roomNumber,
          checkin: checkinRaw,
          checkout: checkoutRaw,
          row
        });
      }
      continue;
    }

    const totalNights = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));
    const totalRevenue = parseNumber(extractRevenue(row));

    if (totalRevenue <= 0 || totalNights <= 0) {
      skippedRows++;
      if (skippedRows <= 3) {
        console.warn('⚠️ Skipped row (invalid numbers):', {
          roomNumber,
          totalNights,
          totalRevenue,
        });
      }
      continue;
    }

    // Check if room number is a combined studio (A 4022-4024 or A 4023-4025)
    const roomsToProcess = splitCombinedRooms(roomNumber);
    const revenuePerRoom = totalRevenue / roomsToProcess.length;
    
    for (const singleRoom of roomsToProcess) {
      // Split bookings proportionally - exclude Dec 2024 and Oct 2025
      const splitRecords = splitBookingProportionally(
        singleRoom,
        channel,
        checkin,
        checkout,
        totalNights,
        revenuePerRoom
      );

      for (const record of splitRecords) {
        processedRecords.push(record);

        if (!roomFirstSeen.has(record.roomNumber)) {
          roomFirstSeen.set(record.roomNumber, record.date);
        } else {
          const existing = roomFirstSeen.get(record.roomNumber)!;
          if (record.date < existing) {
            roomFirstSeen.set(record.roomNumber, record.date);
          }
        }
      }
    }
  }

  const monthlyRoomCounts = calculateMonthlyRoomCounts(processedRecords, roomFirstSeen);

  const dates = processedRecords.map(r => r.date).sort();
  const stats = {
    totalRecords: processedRecords.length,
    uniqueRooms: roomFirstSeen.size,
    dateRange: {
      start: dates[0] || '',
      end: dates[dates.length - 1] || '',
    },
  };

  console.log('✅ Processing complete:', {
    totalRecords: stats.totalRecords,
    uniqueRooms: stats.uniqueRooms,
    skippedRows,
    dateRange: stats.dateRange,
  });

  return {
    records: processedRecords,
    monthlyRoomCounts,
    roomFirstSeen,
    stats,
  };
};

const splitCombinedRooms = (roomNumber: string): string[] => {
  const normalized = roomNumber.toUpperCase().replace(/\s+/g, ' ').trim();
  
  // Check for combined studios: A 4022-4024 or A 4023-4025
  if (normalized === 'A 4022-4024' || normalized === 'A4022-4024') {
    return ['A 4022', 'A 4024'];
  }
  if (normalized === 'A 4023-4025' || normalized === 'A4023-4025') {
    return ['A 4023', 'A 4025'];
  }
  
  // Single room, return as-is
  return [roomNumber];
};

const splitBookingProportionally = (
  roomNumber: string,
  channel: string,
  checkin: Date,
  checkout: Date,
  totalNights: number,
  totalRevenue: number
): ProcessedRecord[] => {
  const result: ProcessedRecord[] = [];
  const buildingBlock = extractBuildingBlock(roomNumber);
  
  let currentDate = new Date(checkin);
  const endDate = new Date(checkout);
  
  while (currentDate < endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Skip ALL 2024 data - only include 2025 January-September
    if (year === 2024) {
      currentDate = new Date(2025, 0, 1); // Jump to 2025-01-01
      continue;
    }
    
    // Skip October 2025 onwards
    if (year === 2025 && month >= 9) {
      currentDate = new Date(year, month + 1, 1);
      continue;
    }
    
    // Calculate nights in this month
    const monthEnd = new Date(year, month + 1, 1);
    const periodEnd = endDate < monthEnd ? endDate : monthEnd;
    const nightsInMonth = Math.ceil((periodEnd.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (nightsInMonth > 0) {
      const proportion = nightsInMonth / totalNights;
      const revenueForMonth = totalRevenue * proportion;
      
      const checkinStr = currentDate.toISOString().split('T')[0];
      const checkoutStr = periodEnd.toISOString().split('T')[0];
      
      result.push({
        roomNumber,
        buildingBlock,
        channel,
        checkinDate: checkinStr,
        checkoutDate: checkoutStr,
        nights: nightsInMonth,
        revenue: revenueForMonth,
        date: checkinStr,
      });
    }
    
    currentDate = monthEnd;
  }
  
  return result;
};

const extractRoomNumber = (row: any): string => {
  // Try all possible column name variations including exact Georgian match
  const possibleKeys = Object.keys(row).filter(key => {
    const lower = key.toLowerCase();
    return lower.includes('room') || 
           lower.includes('ოთახ') ||
           lower.includes('studio') ||
           lower.includes('სტუდიო') ||
           key === 'ნომერი' ||  // Exact match for Georgian "Number"
           lower.includes('ნომერ') ||
           lower === 'number';
  });
  
  for (const key of possibleKeys) {
    const val = row[key];
    if (val && String(val).trim()) {
      return String(val).trim().toUpperCase();
    }
  }
  
  return '';
};

const extractChannel = (row: any): string => {
  const possibleKeys = Object.keys(row).filter(key => 
    key.toLowerCase().includes('channel') || 
    key.toLowerCase().includes('წყარო') ||
    key.toLowerCase().includes('source') ||
    key.toLowerCase().includes('platform')
  );
  
  for (const key of possibleKeys) {
    const val = row[key];
    if (val && String(val).trim()) {
      return String(val).trim();
    }
  }
  
  return 'Direct';
};

const extractCheckin = (row: any): any => {
  const possibleKeys = Object.keys(row).filter(key => 
    key.toLowerCase().includes('checkin') || 
    key.toLowerCase().includes('check-in') ||
    key.toLowerCase().includes('check in') ||
    key.toLowerCase().includes('start') ||
    key.toLowerCase().includes('დაწყება') ||
    key.toLowerCase().includes('შესვლა')
  );
  
  for (const key of possibleKeys) {
    const val = row[key];
    if (val) return val;
  }
  
  return null;
};

const extractCheckout = (row: any): any => {
  const possibleKeys = Object.keys(row).filter(key => 
    key.toLowerCase().includes('checkout') || 
    key.toLowerCase().includes('check-out') ||
    key.toLowerCase().includes('check out') ||
    key.toLowerCase().includes('end') ||
    key.toLowerCase().includes('დასრულება') ||
    key.toLowerCase().includes('გასვლა')
  );
  
  for (const key of possibleKeys) {
    const val = row[key];
    if (val) return val;
  }
  
  return null;
};

const extractRevenue = (row: any): any => {
  const possibleKeys = Object.keys(row).filter(key => 
    key.toLowerCase().includes('revenue') || 
    key.toLowerCase().includes('შემოსავალ') ||
    key.toLowerCase().includes('price') ||
    key.toLowerCase().includes('ფას') ||
    key.toLowerCase().includes('amount') ||
    key.toLowerCase().includes('თანხა') ||
    key.toLowerCase().includes('total')
  );
  
  for (const key of possibleKeys) {
    const val = row[key];
    if (val !== undefined && val !== null && val !== '') {
      return val;
    }
  }
  
  return 0;
};

const extractBuildingBlock = (roomNumber: string): string => {
  const room = roomNumber.toUpperCase();
  if (room.startsWith('A')) return 'A';
  if (room.startsWith('C')) return 'C';
  if (room.startsWith('D1')) return 'D1';
  if (room.startsWith('D2')) return 'D2';
  return 'Unknown';
};

const normalizeChannel = (channel: string): string => {
  if (!channel) return 'Social Media';
  const ch = String(channel).toLowerCase().trim();
  
  // Group Direct and Google into Social Media
  if (ch.includes('direct') || ch.includes('პირდაპირ') || 
      ch.includes('google') || ch.includes('facebook') || 
      ch.includes('instagram') || ch.includes('social')) {
    return 'Social Media';
  }
  
  if (ch.includes('booking')) return 'Booking.com';
  if (ch.includes('agoda')) return 'Agoda';
  if (ch.includes('expedia')) return 'Expedia';
  if (ch.includes('airbnb')) return 'Airbnb';
  if (ch.includes('ostrovok')) return 'Ostrovok';
  
  return channel;
};

const parseExcelDate = (value: any): Date | null => {
  if (!value) return null;
  
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    return new Date(date.y, date.m - 1, date.d);
  }
  
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const parseNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(String(value).replace(/[^\d.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

const calculateMonthlyRoomCounts = (
  records: ProcessedRecord[],
  roomFirstSeen: Map<string, string>
): MonthlyRoomCount[] => {
  const monthlyMap = new Map<string, Set<string>>();

  records.forEach(record => {
    const recordMonth = record.date.substring(0, 7);
    
    roomFirstSeen.forEach((firstDate, roomNumber) => {
      const firstMonth = firstDate.substring(0, 7);
      if (firstMonth <= recordMonth) {
        if (!monthlyMap.has(recordMonth)) {
          monthlyMap.set(recordMonth, new Set());
        }
        monthlyMap.get(recordMonth)!.add(roomNumber);
      }
    });
  });

  return Array.from(monthlyMap.entries())
    .map(([month, rooms]) => ({
      month,
      roomCount: rooms.size,
      rooms: Array.from(rooms),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};
