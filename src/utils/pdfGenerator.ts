import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportReportToPdf(elementId: string, filename: string, pageSize: 'A4' | 'A5' = 'A4'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Report element #${elementId} not found`);
  }

  // Temporarily force exact preview size and white background for crisp rendering
  const prevOverflow = element.style.overflow;
  element.style.overflow = 'visible';

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution for crisp text
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Page dimensions in mm
    const isA5 = pageSize === 'A5';
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: isA5 ? 'a5' : 'a4'
    });

    const pageWidth = isA5 ? 148 : 210;
    const pageHeight = isA5 ? 210 : 297;

    // Calculate aspect ratio
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Multi-page handling if report exceeds 1 page
    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage(isA5 ? 'a5' : 'a4', 'portrait');
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  } finally {
    element.style.overflow = prevOverflow;
  }
}

export function printDirectly(): void {
  window.print();
}
