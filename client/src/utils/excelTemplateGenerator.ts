import * as XLSX from 'xlsx';

/**
 * Generates a sample Excel template for monthly analysis uploads
 * Includes correct column headers and example data
 */
export function generateExcelTemplate(): void {
  // Define column headers (Georgian / English)
  const headers = [
    'ნომერი / Room',
    'შესვლა / Check-in',
    'გასვლა / Check-out',
    'ხანგრძლივობა / Nights',
    'თანხა / Revenue',
    'წყარო / Channel',
    'ბლოკი / Building'
  ];

  // Sample data with realistic examples
  const sampleData = [
    headers,
    [
      'A 4022',
      '2025-10-01',
      '2025-10-05',
      4,
      800,
      'Booking.com',
      'A'
    ],
    [
      'B 3015',
      '2025-10-03',
      '2025-10-07',
      4,
      950,
      'Airbnb',
      'B'
    ],
    [
      'A 4025',
      '2025-10-05',
      '2025-10-12',
      7,
      1400,
      'Direct',
      'A'
    ],
    [
      'C 2008',
      '2025-10-08',
      '2025-10-15',
      7,
      1050,
      'Agoda',
      'C'
    ],
    [
      '4022-4024',
      '2025-10-10',
      '2025-10-14',
      4,
      1600,
      'Expedia',
      'A'
    ],
    [
      'B 3020',
      '2025-10-12',
      '2025-10-20',
      8,
      1280,
      'Booking.com',
      'B'
    ],
    [
      'A 4030',
      '2025-10-15',
      '2025-10-18',
      3,
      600,
      'Social Media',
      'A'
    ],
    [
      'C 2012',
      '2025-10-18',
      '2025-10-25',
      7,
      1120,
      'Direct',
      'C'
    ],
  ];

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(sampleData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 15 }, // Room Number
    { wch: 15 }, // Check-in
    { wch: 15 }, // Check-out
    { wch: 18 }, // Nights
    { wch: 15 }, // Revenue
    { wch: 18 }, // Channel
    { wch: 15 }, // Building
  ];

  // Style header row (make it bold)
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;
    
    worksheet[cellAddress].s = {
      font: { bold: true, sz: 12 },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings Template');

  // Add instructions sheet
  const instructionsData = [
    ['📋 Orbi City - Excel ატვირთვის ინსტრუქცია'],
    [''],
    ['საჭირო სვეტები:'],
    ['1. ნომერი / Room', 'ოთახის ნომერი (მაგ: A 4022, 4022-4024)'],
    ['2. შესვლა / Check-in', 'შესვლის თარიღი (YYYY-MM-DD ფორმატში)'],
    ['3. გასვლა / Check-out', 'გასვლის თარიღი (YYYY-MM-DD ფორმატში)'],
    ['4. თანხა / Revenue', 'ჯავშნის თანხა (რიცხვი)'],
    [''],
    ['რეკომენდებული სვეტები:'],
    ['5. ხანგრძლივობა / Nights', 'ღამეების რაოდენობა (თუ არ არის, დაითვლება ავტომატურად)'],
    ['6. წყარო / Channel', 'ბრონირების არხი (მაგ: Booking.com, Airbnb, Direct)'],
    ['7. ბლოკი / Building', 'შენობის ბლოკი (მაგ: A, B, C)'],
    [''],
    ['მნიშვნელოვანი:'],
    ['• შეგიძლიათ გამოიყენოთ როგორც ქართული, ისე ინგლისური სვეტების სახელები'],
    ['• თარიღები უნდა იყოს Excel თარიღის ფორმატში ან YYYY-MM-DD'],
    ['• კომბინირებული ოთახები (მაგ: 4022-4024) ავტომატურად დაიყოფა'],
    ['• სისტემა ავტომატურად დაითვლის თვიურ შემოსავლებს პროპორციულად'],
    [''],
    ['📊 თვიური ანალიზის ლოგიკა:'],
    ['• თუ ჯავშანი სრულად თვეში არის - ყველა ღამე და თანხა ითვლება'],
    ['• თუ ჯავშანი თვეებს გადაკვეთს - მხოლოდ კონკრეტული თვის ღამეები და პროპორციული თანხა'],
    ['• მაგალითი: 28 მარტიდან 5 აპრილამდე → აპრილში მხოლოდ 5 ღამე'],
    [''],
    ['📁 შენახვა:'],
    ['• შეინახეთ .xlsx ან .xls ფორმატში'],
    ['• ფაილის მაქსიმალური ზომა: 20MB'],
    [''],
    ['Created by: Orbi City Management System'],
    ['Version: 1.0'],
  ];

  const instructionsWS = XLSX.utils.aoa_to_sheet(instructionsData);
  instructionsWS['!cols'] = [
    { wch: 40 },
    { wch: 60 },
  ];
  
  XLSX.utils.book_append_sheet(workbook, instructionsWS, 'ინსტრუქცია');

  // Generate filename with current date
  const today = new Date();
  const filename = `OtelMS_Import_Template_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, filename);
}

/**
 * Generates a minimal template with only headers (no sample data)
 */
export function generateMinimalExcelTemplate(): void {
  const headers = [
    'ნომერი / Room',
    'შესვლა / Check-in',
    'გასვლა / Check-out',
    'ხანგრძლივობა / Nights',
    'თანხა / Revenue',
    'წყარო / Channel',
    'ბლოკი / Building'
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([headers]);

  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 },
    { wch: 15 },
    { wch: 18 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

  const today = new Date();
  const filename = `OtelMS_Template_Empty_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.xlsx`;

  XLSX.writeFile(workbook, filename);
}
