import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class PdfShareService {

  constructor() { }

  async generatePdfBlob(element: HTMLElement, excludeSelectors: string[] = []): Promise<Blob> {
    // Create an invisible container to hold the clone within viewport layout bounds
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '1024px';
    container.style.height = '0';
    container.style.overflow = 'hidden';
    container.style.zIndex = '-9999';

    // Clone the element to render it offscreen in desktop size
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Remove excluded elements from the clone
    excludeSelectors.forEach(selector => {
      clone.querySelectorAll(selector).forEach(el => el.remove());
    });

    clone.classList.add('desktop-layout');
    clone.style.width = '1024px'; // Force standard desktop layout width
    clone.style.height = 'auto';
    clone.style.transform = 'none';
    
    container.appendChild(clone);
    document.body.appendChild(container);

    try {
      // Capture the element using html2canvas with scale: 2 for high quality
      const canvas = await html2canvas(clone, {
        scale: 2,
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
    } finally {
      // Always remove the container from the DOM
      document.body.removeChild(container);
    }
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
    const shareData = {
      files: [file],
      title: title,
      text: text
    };

    // Check if sharing files is supported by the browser
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare(shareData)
    ) {
      try {
        await navigator.share(shareData);
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
