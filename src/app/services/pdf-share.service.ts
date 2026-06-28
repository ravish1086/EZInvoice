import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class PdfShareService {

  constructor() { }

  /**
   * Generates a PDF Blob from an HTML element using html2canvas and jsPDF.
   * @param element The HTML element to capture.
   */
  async generatePdfBlob(element: HTMLElement): Promise<Blob> {
    // Capture the element using html2canvas with scale: 2 for high quality
    const canvas = await html2canvas(element, {
      scale: 1,
      useCORS: true,
      logging: false,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');

    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 297;
    // Calculate the height of the image scaled to full page width
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if content spans multiple A4 pages
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf.output('blob');
  }

  /**
   * Shares a PDF Blob using the Web Share API if supported,
   * otherwise falls back to a standard browser download.
   * @param pdfBlob The generated PDF Blob.
   * @param filename The desired filename (e.g. Invoice_123.pdf).
   * @param title The title for the share sheet.
   * @param text The text message/caption for the share sheet.
   */
  async shareOrDownloadPdf(pdfBlob: Blob, filename: string, title: string, text: string): Promise<boolean> {
    const file = new File([pdfBlob], filename, { type: 'application/pdf' });

    // Check if sharing files is supported by the browser
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({
          files: [file],
          title: title,
          text: text
        });
        return true;
      } catch (error) {
        // If sharing was aborted by the user, we just return false without triggering the download fallback.
        if ((error as any).name === 'AbortError') {
          console.log('Web Share aborted by user');
          return false;
        }
        console.error('Web Share failed:', error);
      }
    }

    // Fallback: Trigger standard file download in browser
    this.downloadPdf(pdfBlob, filename);
    alert("Direct sharing is not supported on this browser/device. The PDF file has been downloaded instead.");
    return false;
  }

  /**
   * Helper to trigger a standard file download in the browser.
   */
  downloadPdf(pdfBlob: Blob, filename: string): void {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
