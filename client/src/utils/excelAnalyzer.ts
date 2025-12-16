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
}

// Helper function to split combined rooms like "4022-4024" or "A 4022-4024"
// These are 2 separate studios connected by a door, so 4022-4024 = 2 rooms: 4022 and 4024
function splitCombinedRooms(roomNumber: string): string[] {
  const match = roomNumber.match(/([A-Z]\s)?(\d+)-(\d+)/);
  if (match) {
    const prefix = match[1] || '';
    const start = parseInt(match[2]);
    const end = parseInt(match[3]);
    // Only return start and end (2 rooms), not all in between
    return [
      `${prefix}${start}`.trim(),
      `${prefix}${end}`.trim()
    ];
  }
  return [roomNumber.trim()];
}

export async function analyzeExcelFile(file: File): Promise<AnalysisResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Monthly stats accumulator
        const monthlyMap = new Map<string, { revenue: number; nights: number; bookings: number; rooms: Set<string> }>();
        
        // Room stats accumulator
        const roomMap = new Map<string, { revenue: number; nights: number; bookings: number }>();
        
        // Channel stats accumulator
        const channelMap = new Map<string, { revenue: number; nights: number; bookings: number }>();
        
        // Building stats accumulator  
        const buildingMap = new Map<string, { revenue: number; nights: number; bookings: number }>();
        
        // Track when each room was first seen
        const roomFirstSeen = new Map<string, string>(); // roomNumber -> monthKey
        
        let totalRevenue = 0;
        let totalNights = 0;
        let totalBookings = 0;

        jsonData.forEach((row: any) => {
          const rawRoomNumber = row['ნომერი'] || row['Room'] || '';
          const checkin = row['შესვლა'] || row['Check-in'] || '';
          const checkout = row['გასვლა'] || row['Check-out'] || '';
          const nights = parseInt(row['ხანგრძლივობა'] || row['Nights'] || '0');
          const revenue = parseFloat(String(row['თანხა'] || row['Revenue'] || '0').replace(/,/g, ''));
          const channel = extractChannel(row);
          const buildingBlock = row['ბლოკი'] || row['Building'] || 'Unknown';

          if (!rawRoomNumber || !checkin || nights <= 0 || revenue <= 0) return;

          // Split combined rooms
          const roomNumbers = splitCombinedRooms(rawRoomNumber);
          const revenuePerRoom = revenue / roomNumbers.length;
          const nightsPerRoom = nights / roomNumbers.length;

          // Parse dates
          let checkinDate: Date;
          if (typeof checkin === 'number') {
            const excelEpoch = new Date(1899, 11, 30);
            checkinDate = new Date(excelEpoch.getTime() + checkin * 24 * 60 * 60 * 1000);
          } else {
            checkinDate = new Date(checkin);
          }

          let checkoutDate: Date;
          if (typeof checkout === 'number') {
            const excelEpoch = new Date(1899, 11, 30);
            checkoutDate = new Date(excelEpoch.getTime() + checkout * 24 * 60 * 60 * 1000);
          } else {
            checkoutDate = new Date(checkout);
          }

          // Process each room separately
          roomNumbers.forEach((roomNumber) => {
            // Skip 2024 data - only process 2025 Jan-Sep
            if (checkinDate.getFullYear() < 2025) {
              // Calculate what portion falls in 2025
              const firstDayOf2025 = new Date(2025, 0, 1);
              if (checkoutDate <= firstDayOf2025) return; // Completely in 2024
              
              // Adjust for partial booking
              const totalBookingNights = Math.floor((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
              const nightsIn2025 = Math.floor((checkoutDate.getTime() - firstDayOf2025.getTime()) / (1000 * 60 * 60 * 24));
              const adjustedRevenue = (revenuePerRoom / totalBookingNights) * nightsIn2025;
              const adjustedNights = nightsIn2025 / roomNumbers.length;
              
              // Update totals
              totalRevenue += adjustedRevenue;
              totalNights += adjustedNights;
              totalBookings += 1 / roomNumbers.length;

              // Process each month the booking spans in 2025
              let currentDate = new Date(firstDayOf2025);
              while (currentDate < checkoutDate && currentDate.getFullYear() === 2025 && currentDate.getMonth() < 9) {
                const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
                
                // Track first seen
                if (!roomFirstSeen.has(roomNumber)) {
                  roomFirstSeen.set(roomNumber, monthKey);
                }
                
                const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                const monthNights = Math.min(
                  Math.floor((checkoutDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
                  Math.floor((monthEnd.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
                ) / roomNumbers.length;
                const monthRevenue = (adjustedRevenue / adjustedNights) * monthNights;

                const monthData = monthlyMap.get(monthKey) || { revenue: 0, nights: 0, bookings: 0, rooms: new Set() };
                monthData.revenue += monthRevenue;
                monthData.nights += monthNights;
                monthData.bookings += 1 / roomNumbers.length;
                monthData.rooms.add(roomNumber);
                monthlyMap.set(monthKey, monthData);

                currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
              }

              // Room stats
              const roomData = roomMap.get(roomNumber) || { revenue: 0, nights: 0, bookings: 0 };
              roomData.revenue += adjustedRevenue;
              roomData.nights += adjustedNights;
              roomData.bookings += 1 / roomNumbers.length;
              roomMap.set(roomNumber, roomData);
              
              return;
            }

            // Skip October 2025 onwards
            if (checkinDate.getFullYear() === 2025 && checkinDate.getMonth() >= 9) {
              return;
            }

            // Update totals
            totalRevenue += revenuePerRoom;
            totalNights += nightsPerRoom;
            totalBookings += 1 / roomNumbers.length;

            // Process each month the booking spans
            let currentDate = new Date(checkinDate);
            while (currentDate < checkoutDate) {
              const year = currentDate.getFullYear();
              const month = currentDate.getMonth();
              
              // Skip if not 2025 Jan-Sep
              if (year !== 2025 || month >= 9) {
                currentDate = new Date(year, month + 1, 1);
                continue;
              }

              const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
              
              // Track first seen
              if (!roomFirstSeen.has(roomNumber)) {
                roomFirstSeen.set(roomNumber, monthKey);
              }
              
              const monthEnd = new Date(year, month + 1, 0);
              const monthNights = Math.min(
                Math.floor((checkoutDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
                Math.floor((monthEnd.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
              ) / roomNumbers.length;
              const monthRevenue = (revenuePerRoom / nightsPerRoom) * monthNights;

              const monthData = monthlyMap.get(monthKey) || { revenue: 0, nights: 0, bookings: 0, rooms: new Set() };
              monthData.revenue += monthRevenue;
              monthData.nights += monthNights;
              monthData.bookings += 1 / roomNumbers.length;
              monthData.rooms.add(roomNumber);
              monthlyMap.set(monthKey, monthData);

              currentDate = new Date(year, month + 1, 1);
            }

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
        });

        // Calculate cumulative room count per month
        const sortedMonths = Array.from(monthlyMap.keys()).sort();
        const cumulativeRoomCount = new Map<string, number>();
        
        sortedMonths.forEach(monthKey => {
          // Count rooms first seen up to and including this month
          const roomsSeenThisMonth = Array.from(roomFirstSeen.entries()).filter(
            ([_, firstMonth]) => firstMonth <= monthKey
          ).length;
          cumulativeRoomCount.set(monthKey, roomsSeenThisMonth);
        });

        // Calculate total available nights for occupancy
        let totalAvailableNights = 0;
        monthlyMap.forEach((data, monthKey) => {
          const [year, month] = monthKey.split('-').map(Number);
          const daysInMonth = new Date(year, month, 0).getDate();
          const roomCount = cumulativeRoomCount.get(monthKey) || 0;
          totalAvailableNights += roomCount * daysInMonth;
        });

        const overallOccupancyRate = totalAvailableNights > 0 ? (totalNights / totalAvailableNights) * 100 : 0;
        const overallRevPAR = totalAvailableNights > 0 ? totalRevenue / totalAvailableNights : 0;

        // Convert to arrays and calculate ADR
        const monthlyStats: MonthlyStats[] = Array.from(monthlyMap.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([month, data]) => {
            const [year, monthNum] = month.split('-').map(Number);
            const daysInMonth = new Date(year, monthNum, 0).getDate();
            const roomCount = cumulativeRoomCount.get(month) || 0;
            const availableNights = roomCount * daysInMonth;
            const occupancyRate = availableNights > 0 ? (data.nights / availableNights) * 100 : 0;
            
            return {
              month,
              totalRevenue: data.revenue,
              totalNights: data.nights,
              totalBookings: data.bookings,
              avgADR: data.nights > 0 ? data.revenue / data.nights : 0,
              roomCount,
              occupancyRate,
            };
          });

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
            uniqueRooms: roomMap.size,
            occupancyRate: overallOccupancyRate,
            revPAR: overallRevPAR,
          },
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
