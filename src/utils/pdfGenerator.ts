import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportReportToPdf(elementId: string, filename: string, pageSize: 'A4' | 'A5' = 'A4'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Report element #${elementId} not found`);
  }

  // Temporarily force overflow visible and white background for crisp rendering
  const prevOverflow = element.style.overflow;
  element.style.overflow = 'visible';

  // Ensure all web fonts and styles are fully loaded and rasterized before capturing
  if ((document as any).fonts?.ready) {
    await (document as any).fonts.ready;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2.5, // High resolution (300+ DPI equivalent) for sharp text and fine borders
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const isA5 = pageSize === 'A5';
    const pageWidth = isA5 ? 148 : 210;
    const pageHeight = isA5 ? 210 : 297;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: isA5 ? 'a5' : 'a4',
      compress: true
    });

    // Calculate aspect ratio
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Smart 1-Page Medical Report Fitting:
    // Standard clinical reports (CBC, LFT, RFT, Urine, Lipid, etc.) should fit 100% on a single page
    // so signatures, stamps, and QR verification codes are NEVER severed across page breaks!
    // We allow up to 35% proportional scaling (scaleFactor >= 0.74) to keep the report intact on 1 page.
    if (imgHeight <= pageHeight * 1.35) {
      const scaleFactor = Math.min(1, pageHeight / imgHeight);
      const finalWidth = imgWidth * scaleFactor;
      const finalHeight = imgHeight * scaleFactor;
      const xOffset = (pageWidth - finalWidth) / 2;
      const yOffset = 0;

      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight, undefined, 'FAST');
    } else {
      // For extensive multi-page reports (e.g. 20+ tests spanning multiple full pages)
      let heightLeft = imgHeight;
      let position = 0;
      const imgData = canvas.toDataURL('image/png', 1.0);

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 5) {
        position = heightLeft - imgHeight;
        pdf.addPage(isA5 ? 'a5' : 'a4', 'portrait');
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  } finally {
    element.style.overflow = prevOverflow;
  }
}

export function printDirectly(): void {
  window.print();
}
