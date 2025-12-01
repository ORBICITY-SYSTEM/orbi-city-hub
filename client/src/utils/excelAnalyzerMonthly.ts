import * as XLSX from 'xlsx';

export interface MonthlyStats {
  month: string;
  totalRevenue: number;
  totalNights: number;
  totalBookings: number;
  avgADR: number;
  roomCount: number;
  occupancyRate: number;
}

export interface RoomStats {
  room: string;
  revenue: number;
  nights: number;
  bookings: number;
  adr: number;
}

export interface ChannelStats {
  channel: string;
  revenue: number;
  nights: number;
  bookings: number;
  adr: number;
}

export interface BuildingStats {
  building: string;
  revenue: number;
  nights: number;
  bookings: number;
  adr: number;
}

export interface AnalysisResult {
  monthlyStats: MonthlyStats[];
  roomStats: RoomStats[];
  channelStats: ChannelStats[];
  buildingStats: BuildingStats[];
  overallStats: {
    totalRevenue: number;
    totalNights: number;
    totalBookings: number;
    avgADR: number;
    uniqueRooms: number;
    occupancyRate: number;
    revPAR: number;
  };
  filteredData: any[]; // Raw filtered data for export
}

// Helper function to extract channel from row (supports Georgian "წყარო")
function extractChannel(row: any): string {
  const possibleKeys = Object.keys(row).filter(key => 
    key.toLowerCase().includes('channel') || 
    key.toLowerCase().includes('წყარო') ||
    key.toLowerCase().includes('source') ||
    key.toLowerCase().includes('არხ') ||
    key.toLowerCase().includes('platform')
  );
  
  for (const key of possibleKeys) {
    const val = row[key];
    if (val && String(val).trim()) {
      return normalizeChannel(String(val).trim());
    }
  }
  
  return 'Unknown';
}

// Helper function to normalize and group channels
function normalizeChannel(channel: string): string {
  if (!channel) return 'Unknown';
  const ch = String(channel).toLowerCase().trim();
  
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
}

// Helper function to split combined rooms like "4022-4024" or "A 4022-4024"
function splitCombinedRooms(roomNumber: string): string[] {
  const match = roomNumber.match(/([A-Z]\s)?(\d+)-(\d+)/);
  if (match) {
    const prefix = match[1] || '';
    const start = parseInt(match[2]);
    const end = parseInt(match[3]);
    return [
      `${prefix}${start}`.trim(),
      `${prefix}${end}`.trim()
    ];
  }
  return [roomNumber.trim()];
}

// Helper to parse dates from Excel
function parseExcelDate(dateValue: any): Date {
  if (typeof dateValue === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
  }
  return new Date(dateValue);
}

// Check if a booking falls within the target month
function isBookingInTargetMonth(
  checkinDate: Date,
  checkoutDate: Date,
  targetYear: number,
  targetMonth: number
): boolean {
  const monthStart = new Date(targetYear, targetMonth - 1, 1);
  const monthEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59);
  
  // Booking overlaps with target month if checkout > month start AND checkin <= month end
  return checkoutDate > monthStart && checkinDate <= monthEnd;
}

// Calculate how many nights fall within the target month
// A "night" is defined as: the night FROM date X TO date X+1
// So a night on October 1st is the night from Oct 1 → Oct 2
function calculateNightsInMonth(
  checkinDate: Date,
  checkoutDate: Date,
  targetYear: number,
  targetMonth: number
): number {
  // Month boundaries: October 1 00:00 to November 1 00:00 (exclusive)
  const monthStart = new Date(targetYear, targetMonth - 1, 1);
  const monthEnd = new Date(targetYear, targetMonth, 1); // First day of NEXT month
  
  // Effective period within the month
  const effectiveStart = checkinDate > monthStart ? checkinDate : monthStart;
  const effectiveEnd = checkoutDate < monthEnd ? checkoutDate : monthEnd;
  
  // Calculate nights (full 24h periods)
  if (effectiveEnd <= effectiveStart) return 0;
  
  const millisDiff = effectiveEnd.getTime() - effectiveStart.getTime();
  const nights = millisDiff / (1000 * 60 * 60 * 24);
  
  return Math.max(0, Math.floor(nights));
}

export async function analyzeExcelFileForMonth(
  file: File,
  targetYear: number,
  targetMonth: number
): Promise<AnalysisResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const filteredData: any[] = [];
        const roomMap = new Map<string, { revenue: number; nights: number; bookings: number }>();
        const channelMap = new Map<string, { revenue: number; nights: number; bookings: number }>();
        const buildingMap = new Map<string, { revenue: number; nights: number; bookings: number }>();
        
        let totalRevenue = 0;
        let totalNights = 0;
        let totalBookings = 0;
        const uniqueRooms = new Set<string>();

        jsonData.forEach((row: any) => {
          const rawRoomNumber = row['ნომერი'] || row['Room'] || '';
          const checkin = row['შესვლა'] || row['Check-in'] || '';
          const checkout = row['გასვლა'] || row['Check-out'] || '';
          const nights = parseInt(row['ხანგრძლივობა'] || row['Nights'] || '0');
          const revenue = parseFloat(String(row['თანხა'] || row['Revenue'] || '0').replace(/,/g, ''));
          const channel = extractChannel(row);
          const buildingBlock = row['ბლოკი'] || row['Building'] || 'Unknown';

          if (!rawRoomNumber || !checkin || nights <= 0 || revenue <= 0) return;

          const checkinDate = parseExcelDate(checkin);
          const checkoutDate = parseExcelDate(checkout);

          // Only process bookings that overlap with target month
          if (!isBookingInTargetMonth(checkinDate, checkoutDate, targetYear, targetMonth)) {
            return;
          }

          // Calculate nights actually in target month
          const nightsInMonth = calculateNightsInMonth(checkinDate, checkoutDate, targetYear, targetMonth);
          if (nightsInMonth <= 0) return;

          // Split combined rooms
          const roomNumbers = splitCombinedRooms(rawRoomNumber);
          const revenuePerRoom = (revenue / nights) * nightsInMonth / roomNumbers.length;
          const nightsPerRoom = nightsInMonth / roomNumbers.length;

          // Process each room separately
          roomNumbers.forEach((roomNumber) => {
            uniqueRooms.add(roomNumber);
            
            totalRevenue += revenuePerRoom;
            totalNights += nightsPerRoom;
            totalBookings += 1 / roomNumbers.length;

            // Room stats
            const roomData = roomMap.get(roomNumber) || { revenue: 0, nights: 0, bookings: 0 };
            roomData.revenue += revenuePerRoom;
            roomData.nights += nightsPerRoom;
            roomData.bookings += 1 / roomNumbers.length;
            roomMap.set(roomNumber, roomData);
            
            // Channel stats
            const channelData = channelMap.get(channel) || { revenue: 0, nights: 0, bookings: 0 };
            channelData.revenue += revenuePerRoom;
            channelData.nights += nightsPerRoom;
            channelData.bookings += 1 / roomNumbers.length;
            channelMap.set(channel, channelData);
            
            // Building stats
            const buildingData = buildingMap.get(buildingBlock) || { revenue: 0, nights: 0, bookings: 0 };
            buildingData.revenue += revenuePerRoom;
            buildingData.nights += nightsPerRoom;
            buildingData.bookings += 1 / roomNumbers.length;
            buildingMap.set(buildingBlock, buildingData);
          });

          // Add to filtered data for export
          filteredData.push({
            ...row,
            'ნომერი / Room': rawRoomNumber,
            'შესვლა / Check-in': checkinDate.toLocaleDateString('ka-GE'),
            'გასვლა / Check-out': checkoutDate.toLocaleDateString('ka-GE'),
            'ღამეები თვეში / Nights in Month': nightsInMonth,
            'თანხა თვეში / Revenue in Month': revenue * (nightsInMonth / nights),
            'არხი / Channel': channel,
            'ბლოკი / Building': buildingBlock
          });
        });

        // Calculate occupancy and RevPAR
        const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
        const totalAvailableNights = uniqueRooms.size * daysInMonth;
        const occupancyRate = totalAvailableNights > 0 ? (totalNights / totalAvailableNights) * 100 : 0;
        const revPAR = totalAvailableNights > 0 ? totalRevenue / totalAvailableNights : 0;

        // Convert to arrays
        const roomStats: RoomStats[] = Array.from(roomMap.entries())
          .sort((a, b) => b[1].revenue - a[1].revenue)
          .map(([roomNumber, data]) => ({
            room: roomNumber,
            revenue: data.revenue,
            nights: data.nights,
            bookings: data.bookings,
            adr: data.nights > 0 ? data.revenue / data.nights : 0,
          }));

        const channelStats: ChannelStats[] = Array.from(channelMap.entries())
          .sort((a, b) => b[1].revenue - a[1].revenue)
          .map(([channel, data]) => ({
            channel,
            revenue: data.revenue,
            nights: data.nights,
            bookings: data.bookings,
            adr: data.nights > 0 ? data.revenue / data.nights : 0,
          }));

        const buildingStats: BuildingStats[] = Array.from(buildingMap.entries())
          .sort((a, b) => b[1].revenue - a[1].revenue)
          .map(([building, data]) => ({
            building,
            revenue: data.revenue,
            nights: data.nights,
            bookings: data.bookings,
            adr: data.nights > 0 ? data.revenue / data.nights : 0,
          }));

        const monthKey = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
        const monthlyStats: MonthlyStats[] = [{
          month: monthKey,
          totalRevenue,
          totalNights,
          totalBookings,
          avgADR: totalNights > 0 ? totalRevenue / totalNights : 0,
          roomCount: uniqueRooms.size,
          occupancyRate,
        }];

        const result: AnalysisResult = {
          monthlyStats,
          roomStats,
          channelStats,
          buildingStats,
          overallStats: {
            totalRevenue,
            totalNights,
            totalBookings,
            avgADR: totalNights > 0 ? totalRevenue / totalNights : 0,
            uniqueRooms: uniqueRooms.size,
            occupancyRate,
            revPAR,
          },
          filteredData,
        };

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// Export filtered data to Excel
export function exportFilteredDataToExcel(
  analysisResult: AnalysisResult,
  year: number,
  month: number
): void {
  const georgianMonths = [
    'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
    'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
  ];

  const workbook = XLSX.utils.book_new();

  // Sheet 1: Filtered Bookings
  const bookingsWS = XLSX.utils.json_to_sheet(analysisResult.filteredData);
  XLSX.utils.book_append_sheet(workbook, bookingsWS, 'ჯავშნები');

  // Sheet 2: Statistics Summary
  const summaryData = [
    ['მთავარი მაჩვენებლები', ''],
    ['თვე', `${georgianMonths[month - 1]} ${year}`],
    ['', ''],
    ['📊 შემოსავალი', ''],
    ['სულ შემოსავალი', analysisResult.overallStats.totalRevenue.toFixed(2)],
    ['საშუალო ღამის ფასი (ADR)', analysisResult.overallStats.avgADR.toFixed(2)],
    ['RevPAR', analysisResult.overallStats.revPAR.toFixed(2)],
    ['', ''],
    ['🏨 დაკავება', ''],
    ['სულ ღამეები', analysisResult.overallStats.totalNights.toFixed(1)],
    ['სულ ბრონირებები', analysisResult.overallStats.totalBookings.toFixed(1)],
    ['დაკავების მაჩვენებელი', `${analysisResult.overallStats.occupancyRate.toFixed(1)}%`],
    ['უნიკალური ოთახები', analysisResult.overallStats.uniqueRooms],
  ];
  const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summaryWS, 'სტატისტიკა');

  // Sheet 3: Room Stats
  const roomsData = [
    ['ოთახი', 'შემოსავალი', 'ღამეები', 'ბრონირებები', 'ADR'],
    ...analysisResult.roomStats.map(r => [
      r.room,
      r.revenue.toFixed(2),
      r.nights.toFixed(1),
      r.bookings.toFixed(1),
      r.adr.toFixed(2)
    ])
  ];
  const roomsWS = XLSX.utils.aoa_to_sheet(roomsData);
  XLSX.utils.book_append_sheet(workbook, roomsWS, 'ოთახები');

  // Sheet 4: Channel Stats
  const channelsData = [
    ['არხი', 'შემოსავალი', 'ღამეები', 'ბრონირებები', 'ADR'],
    ...analysisResult.channelStats.map(c => [
      c.channel,
      c.revenue.toFixed(2),
      c.nights.toFixed(1),
      c.bookings.toFixed(1),
      c.adr.toFixed(2)
    ])
  ];
  const channelsWS = XLSX.utils.aoa_to_sheet(channelsData);
  XLSX.utils.book_append_sheet(workbook, channelsWS, 'არხები');

  // Sheet 5: Building Stats
  const buildingsData = [
    ['ბლოკი', 'შემოსავალი', 'ღამეები', 'ბრონირებები', 'ADR'],
    ...analysisResult.buildingStats.map(b => [
      b.building,
      b.revenue.toFixed(2),
      b.nights.toFixed(1),
      b.bookings.toFixed(1),
      b.adr.toFixed(2)
    ])
  ];
  const buildingsWS = XLSX.utils.aoa_to_sheet(buildingsData);
  XLSX.utils.book_append_sheet(workbook, buildingsWS, 'ბლოკები');

  // Generate and download
  const filename = `Orbi_City_${georgianMonths[month - 1]}_${year}_Analysis.xlsx`;
  XLSX.writeFile(workbook, filename);
}
