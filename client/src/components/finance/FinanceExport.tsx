import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AnalysisResult } from "@/utils/excelAnalyzer";

interface FinanceExportProps {
  analysisResult: AnalysisResult;
}

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: { finalY: number };
  }
}

export const FinanceExport = ({ analysisResult }: FinanceExportProps) => {
  const { t } = useLanguage();

  const formatCurrency = (amount: number) => `${Math.round(amount)}₾`;

  const getMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('ka-GE', { year: 'numeric', month: 'long' });
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['ფინანსური ანალიზი - ORBI CITY', ''],
      [''],
      ['ზოგადი სტატისტიკა', ''],
      ['სულ შემოსავალი', formatCurrency(analysisResult.overallStats.totalRevenue)],
      ['სულ ღამეები', Math.round(analysisResult.overallStats.totalNights).toLocaleString()],
      ['სულ ბრონები', Math.round(analysisResult.overallStats.totalBookings).toLocaleString()],
      ['საშუალო ADR', formatCurrency(analysisResult.overallStats.avgADR)],
      ['უნიკალური ოთახები', analysisResult.overallStats.uniqueRooms],
      ['დატვირთვის პროცენტი', `${Math.round(analysisResult.overallStats.occupancyRate || 0)}%`],
      ['RevPAR', formatCurrency(analysisResult.overallStats.revPAR || 0)],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, 'მიმოხილვა');

    // Monthly Stats Sheet
    const monthlyHeaders = [['თვე', 'სტუდიოები', 'შემოსავალი', 'ღამეები', 'ბრონები', 'საშ. ADR', 'დატვირთვა %']];
    const monthlyData = analysisResult.monthlyStats.map(stat => [
      getMonthName(stat.month),
      stat.roomCount,
      Math.round(stat.totalRevenue),
      Math.round(stat.totalNights),
      Math.round(stat.totalBookings),
      Math.round(stat.avgADR),
      Math.round(stat.occupancyRate || 0),
    ]);
    const ws2 = XLSX.utils.aoa_to_sheet([...monthlyHeaders, ...monthlyData]);
    XLSX.utils.book_append_sheet(wb, ws2, 'თვიური სტატისტიკა');

    // Room Stats Sheet
    const roomHeaders = [['ოთახი', 'შემოსავალი', 'ღამეები', 'ბრონები', 'საშ. ADR']];
    const roomData = analysisResult.roomStats.map(stat => [
      stat.room,
      Math.round(stat.revenue),
      Math.round(stat.nights),
      Math.round(stat.bookings),
      Math.round(stat.adr),
    ]);
    const ws3 = XLSX.utils.aoa_to_sheet([...roomHeaders, ...roomData]);
    XLSX.utils.book_append_sheet(wb, ws3, 'ოთახების სტატისტიკა');

    // Channel Stats Sheet
    if (analysisResult.channelStats && analysisResult.channelStats.length > 0) {
      const channelHeaders = [['არხი', 'შემოსავალი', 'ღამეები', 'ბრონები', 'საშ. ADR']];
      const channelData = analysisResult.channelStats.map(stat => [
        stat.channel,
        Math.round(stat.revenue),
        Math.round(stat.nights),
        Math.round(stat.bookings),
        Math.round(stat.adr),
      ]);
      const ws4 = XLSX.utils.aoa_to_sheet([...channelHeaders, ...channelData]);
      XLSX.utils.book_append_sheet(wb, ws4, 'გაყიდვის არხები');
    }

    // Building Stats Sheet
    if (analysisResult.buildingStats && analysisResult.buildingStats.length > 0) {
      const buildingHeaders = [['შენობა', 'შემოსავალი', 'ღამეები', 'ბრონები', 'საშ. ADR']];
      const buildingData = analysisResult.buildingStats.map(stat => [
        stat.building,
        Math.round(stat.revenue),
        Math.round(stat.nights),
        Math.round(stat.bookings),
        Math.round(stat.adr),
      ]);
      const ws5 = XLSX.utils.aoa_to_sheet([...buildingHeaders, ...buildingData]);
      XLSX.utils.book_append_sheet(wb, ws5, 'შენობების სტატისტიკა');
    }

    XLSX.writeFile(wb, `ORBI_CITY_ფინანსური_ანგარიში_${new Date().toLocaleDateString('ka-GE')}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Add Georgian font support (using built-in fonts for now)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('ORBI CITY', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 8;
    doc.setFontSize(14);
    doc.text('ფინანსური ანალიზი', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;

    // Overall Statistics
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ზოგადი სტატისტიკა', 14, yPos);
    yPos += 8;

    const overallStats = [
      ['სულ შემოსავალი', formatCurrency(analysisResult.overallStats.totalRevenue)],
      ['სულ ღამეები', Math.round(analysisResult.overallStats.totalNights).toLocaleString()],
      ['სულ ბრონები', Math.round(analysisResult.overallStats.totalBookings).toLocaleString()],
      ['საშუალო ADR', formatCurrency(analysisResult.overallStats.avgADR)],
      ['უნიკალური სტუდიოები', analysisResult.overallStats.uniqueRooms.toString()],
      ['დატვირთვის პროცენტი', `${Math.round(analysisResult.overallStats.occupancyRate || 0)}%`],
      ['RevPAR', formatCurrency(analysisResult.overallStats.revPAR || 0)],
    ];

    doc.autoTable({
      startY: yPos,
      head: [],
      body: overallStats,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], fontStyle: 'bold' },
      styles: { font: 'helvetica', fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 70 },
        1: { cellWidth: 'auto', halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    });

    yPos = doc.lastAutoTable?.finalY || yPos + 60;
    yPos += 10;

    // Monthly Statistics
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('თვიური სტატისტიკა', 14, yPos);
    yPos += 8;

    const monthlyData = analysisResult.monthlyStats.map(stat => [
      getMonthName(stat.month),
      stat.roomCount.toString(),
      formatCurrency(stat.totalRevenue),
      Math.round(stat.totalNights).toString(),
      Math.round(stat.totalBookings).toString(),
      formatCurrency(stat.avgADR),
      `${Math.round(stat.occupancyRate || 0)}%`,
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['თვე', 'სტუდიოები', 'შემოსავალი', 'ღამეები', 'ბრონები', 'საშ. ADR', 'დატვირთვა']],
      body: monthlyData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], fontStyle: 'bold', fontSize: 9 },
      styles: { font: 'helvetica', fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 28, halign: 'right' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 25, halign: 'right' },
        6: { cellWidth: 22, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
    });

    yPos = doc.lastAutoTable?.finalY || yPos;
    yPos += 10;

    // Room Statistics (Top 15)
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ოთახების სტატისტიკა (TOP 15)', 14, yPos);
    yPos += 8;

    const topRooms = analysisResult.roomStats.slice(0, 15);
    const roomData = topRooms.map(stat => [
      stat.room,
      formatCurrency(stat.revenue),
      Math.round(stat.nights).toString(),
      Math.round(stat.bookings).toString(),
      formatCurrency(stat.adr),
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['ოთახი', 'შემოსავალი', 'ღამეები', 'ბრონები', 'საშ. ADR']],
      body: roomData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], fontStyle: 'bold', fontSize: 9 },
      styles: { font: 'helvetica', fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 35, halign: 'right' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 35, halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    });

    // Channel Statistics
    if (analysisResult.channelStats && analysisResult.channelStats.length > 0) {
      doc.addPage();
      yPos = 20;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('გაყიდვის არხების სტატისტიკა', 14, yPos);
      yPos += 8;

      const channelData = analysisResult.channelStats.map(stat => [
        stat.channel,
        formatCurrency(stat.revenue),
        Math.round(stat.nights).toString(),
        Math.round(stat.bookings).toString(),
        formatCurrency(stat.adr),
      ]);

      doc.autoTable({
        startY: yPos,
        head: [['არხი', 'შემოსავალი', 'ღამეები', 'ბრონები', 'საშ. ADR']],
        body: channelData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], fontStyle: 'bold', fontSize: 9 },
        styles: { font: 'helvetica', fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 35, halign: 'right' },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 35, halign: 'right' },
        },
        margin: { left: 14, right: 14 },
      });
    }

    // Building Statistics
    if (analysisResult.buildingStats && analysisResult.buildingStats.length > 0) {
      yPos = doc.lastAutoTable?.finalY || yPos;
      yPos += 15;

      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('შენობების სტატისტიკა', 14, yPos);
      yPos += 8;

      const buildingData = analysisResult.buildingStats.map(stat => [
        stat.building,
        formatCurrency(stat.revenue),
        Math.round(stat.nights).toString(),
        Math.round(stat.bookings).toString(),
        formatCurrency(stat.adr),
      ]);

      doc.autoTable({
        startY: yPos,
        head: [['შენობა', 'შემოსავალი', 'ღამეები', 'ბრონები', 'საშ. ADR']],
        body: buildingData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], fontStyle: 'bold', fontSize: 9 },
        styles: { font: 'helvetica', fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 35, halign: 'right' },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 35, halign: 'right' },
        },
        margin: { left: 14, right: 14 },
      });
    }

    // Add footer to all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `გვერდი ${i} / ${pageCount} | © ORBI CITY ${new Date().getFullYear()}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`ORBI_CITY_ფინანსური_ანგარიში_${new Date().toLocaleDateString('ka-GE')}.pdf`);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          {t("გადმოწერა", "Export")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportToPDF} className="gap-2">
          <FileText className="h-4 w-4" />
          {t("PDF ფორმატში", "Export as PDF")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          {t("Excel ფორმატში", "Export as Excel")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={printReport} className="gap-2">
          <Printer className="h-4 w-4" />
          {t("დაბეჭდვა", "Print")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
