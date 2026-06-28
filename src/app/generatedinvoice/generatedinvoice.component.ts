
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import jsPDF from 'jspdf';
import { InvoiceService } from '../services/invoice.service';
import { OtherdataService } from '../services/otherdata.service';
import { PdfShareService } from '../services/pdf-share.service';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generatedinvoice',
  templateUrl: './generatedinvoice.component.html',
  styleUrls: ['./generatedinvoice.component.css'],
  standalone: true,
  imports: [TableModule, FormsModule, CommonModule]
})
export class GeneratedinvoiceComponent implements OnInit {
  
  @ViewChild('invoiceSection') invoiceSection!: ElementRef;  
  generatedInvoice: any;
  gstin: any;
  companyName: any;
  ownerName: any;
  state: any;
  pin: any;
  email: any;
  stateCode: any;
  city: any;
  mob: any;
  houseNum: any;
  area: any;
  pan: any;
  balancerow: number = 22;
  balancerows: any[] = [];
  invoiceNum: any;
  invoiceType: string = "Original";
  interstate: boolean = false;
  isProcessing: boolean = false;

  public SavePDF(): void {  
    if (!this.invoiceSection) return;
    let content = this.invoiceSection.nativeElement;  
    let doc = new jsPDF('p', 'px', 'a4');
  } 

  async shareToWhatsApp() {
    if (!this.invoiceSection) {
      console.error('Invoice section element not found.');
      return;
    }

    this.isProcessing = true;
    this.cdr.markForCheck();

    try {
      const element = this.invoiceSection.nativeElement;
      const invoiceNo = this.generatedInvoice?.invoiceNo || 'Invoice';
      const filename = `Invoice_${invoiceNo}.pdf`;
      const title = `Invoice ${invoiceNo}`;
      const text = `Please find attached my invoice ${invoiceNo}.`;

      const pdfBlob = await this.pdfShareService.generatePdfBlob(element);
      await this.pdfShareService.shareOrDownloadPdf(pdfBlob, filename, title, text);
    } catch (error) {
      console.error('Error generating or sharing PDF:', error);
      alert('An error occurred while generating or sharing the PDF.');
    } finally {
      this.isProcessing = false;
      this.cdr.markForCheck();
    }
  } 

  async downloadInvoicePdf() {
    if (!this.invoiceSection) {
      console.error('Invoice section element not found.');
      return;
    }

    this.isProcessing = true;
    this.cdr.markForCheck();

    try {
      const element = this.invoiceSection.nativeElement;
      const invoiceNo = this.generatedInvoice?.invoiceNo || 'Invoice';
      const filename = `Invoice_${invoiceNo}.pdf`;

      const pdfBlob = await this.pdfShareService.generatePdfBlob(element);
      this.pdfShareService.downloadPdf(pdfBlob, filename);
    } catch (error) {
      console.error('Error generating or downloading PDF:', error);
      alert('An error occurred while generating or downloading the PDF.');
    } finally {
      this.isProcessing = false;
      this.cdr.markForCheck();
    }
  } 
  onPrintO(divName: any) {
    // this.SavePDF()
    console.log("print Method Called");
    //this.invoiceType="Original";
    (document.getElementById('nav-div') as HTMLFormElement).style.display="none";
  (document.getElementById('ul-div') as HTMLFormElement).style.display="none";
  (document.getElementById('buttons') as HTMLFormElement).style.display="none";

  (document.getElementById('screenshot-div') as HTMLFormElement).style.display="none";
    window.print();
    (document.getElementById('nav-div') as HTMLFormElement).style.display="block";
    (document.getElementById('ul-div') as HTMLFormElement).style.display="inline-flex";
    (document.getElementById('buttons') as HTMLFormElement).style.display="block";

    (document.getElementById('screenshot-div') as HTMLFormElement).style.display="block";
      
}
// onPrintD(divName) {
//   //this.invoiceType="Duplicate";
//   console.log("print Method Called");
//   // let printContents = document.getElementById(divName).innerHTML;
//   // let originalContents = document.body.innerHTML;
//   // document.body.innerHTML = printContents;
//   // window.print();
//   // document.body.innerHTML = originalContents;
 
//   (document.getElementById('nav-div') as HTMLFormElement).style.display="none";
//   (document.getElementById('ul-div') as HTMLFormElement).style.display="none";
//   if(document.getElementById('screenshot-div')!=null)
//   (document.getElementById('screenshot-div') as HTMLFormElement).style.display="none";
//     window.print();
//     (document.getElementById('nav-div') as HTMLFormElement).style.display="block";
//     (document.getElementById('ul-div') as HTMLFormElement).style.display="block";
//     if(document.getElementById('screenshot-div')!=null)
//     (document.getElementById('screenshot-div') as HTMLFormElement).style.display="block";
      
// }
toggleOD(type: any) {
  this.invoiceType = type;
}

  constructor(
    private invoiceService: InvoiceService, 
    private otherDataService: OtherdataService, 
    private router: Router, 
    private route: ActivatedRoute, 
    private cdr: ChangeDetectorRef,
    private pdfShareService: PdfShareService
  ) { }

ngOnInit(): void {
  this.route.params.subscribe(params => {
    this.invoiceNum = params['invoicenum'];
    console.log(params)
  
    this.invoiceService.getInvoiceDetails(this.invoiceNum).subscribe(res => {
      this.generatedInvoice = res;
      console.log(this.generatedInvoice);
      this.balancerow = this.balancerow - this.generatedInvoice.products.length;
      if (this.generatedInvoice.customer?.customerGst?.slice(0, 2) != this.otherDataService.appConfig.companyGSTIN.slice(0, 2) && this.generatedInvoice.customer?.customerGst) {
        // activate interstate - IGST 
        this.interstate = true
      }
      for (let i = 0; i < this.balancerow; i++) {
        this.balancerows.push(i);
      }
      this.cdr.markForCheck();
    });
   
    this.otherDataService.getAppConfig().subscribe(res => {
      this.otherDataService.appConfig = res;
      console.log(this.otherDataService.appConfig)

      this.companyName = this.otherDataService.appConfig.companyName;
      this.gstin = this.otherDataService.appConfig.companyGSTIN
      this.ownerName = this.otherDataService.appConfig.ownerName
      this.city = this.otherDataService.appConfig.city
      this.pin = this.otherDataService.appConfig.pin
      this.mob = this.otherDataService.appConfig.mobile
      this.state = this.otherDataService.appConfig.state
      this.stateCode = this.otherDataService.appConfig.stateCode
      this.email = this.otherDataService.appConfig.email
      this.houseNum = this.otherDataService.appConfig.houseNo
      this.area = this.otherDataService.appConfig.area
      this.pan = this.otherDataService.appConfig.pan
      this.cdr.markForCheck();
    });
  })
}

inWords(num: number): string {
  const numStr = Number(num).toFixed(0);

  var a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  var b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if ((numStr).length > 9) return 'overflow';
  let n: any = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ''; 
  var str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
  return str;
}
}