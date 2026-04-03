import { ChangeDetectorRef, Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReceivedPayments } from '../models/payments.model';
import { InvoiceService } from '../services/invoice.service';
import { OtherdataService } from '../services/otherdata.service';
import { forkJoin } from 'rxjs';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'],
  standalone: true,
  imports: [TableModule, FormsModule, CommonModule, ReactiveFormsModule, DialogModule, NgxSpinnerModule, ConfirmDialogModule],
  providers: [ConfirmationService]
})
export class PaymentsComponent implements OnInit {
  paymentForm!: FormGroup;
  gst: any;
  paymentEntry: ReceivedPayments = {
    gst: null,
    customerName: '',
    dateofReceipt: '',
    amountReceived: 0,
    modeofPayment: '',
    paymentDetails: '',
    lastFYBalance: null
  };
  paymentHistory: any[] = [];
  invoiceHistory: any[] = [];
  openingBalancesHistory: any[] = [];
  customerList: any[] = [];
  filteredPaymentHistory: any[] = [];
  filteredInvoiceHistory: any[] = [];
  filterValue="all"
  typeofpayments=["Cheque","Online","Cash","NA"];
  netPaymentReceived:number=0;
  netInvoiceAmount:number=0;
  lastFYBalance:number=0
  balanceRemaining:number=0;
  paymentInvoiceCombined: any;
  splitView=true
  simpleReport:any[]=[]
  viewButtonLabel='Show Simplifield Report';
  showPaymentFormModal: boolean = false;
  isEditMode: boolean = false;
  currentEditId: string | null = null;
  constructor(private dateservice:OtherdataService,private invoiceservice:InvoiceService, private renderer:Renderer2,
    private loader:NgxSpinnerService, private fb: FormBuilder, private messageService:MessageService, private cdr:ChangeDetectorRef,
    private confirmationService:ConfirmationService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.dateservice.getCustomerDetails().subscribe(res=>
      {
        this.customerList=res;
      })
      let $obspaymentdetails =  this.dateservice.fetchPaymentDetails();
      let $obsinvoicedetails =  this.invoiceservice.getAllInvoicesDetails();
      let $obsopeningbalances = this.dateservice.fetchOpeningBalances();
      this.loader.show();
      forkJoin([$obsinvoicedetails,$obspaymentdetails, $obsopeningbalances]).subscribe({
        next : (data)=>{
          this.invoiceHistory=data[0];
        this.filteredInvoiceHistory=data[0];
          this.paymentHistory=data[1];
        this.filteredPaymentHistory=data[1];
          this.openingBalancesHistory=data[2];
        this.filterRecords("all");
        this.loader.hide();
        this.cdr.markForCheck();
        }
      })
      // this.fetchPaymentDetails();
      // this.fetchInvoiceDetails();
  }

  initForm() {
    this.paymentForm = this.fb.group({
      customerNameIndex: ['', Validators.required],
      dateofReceipt: [new Date().toISOString().substring(0, 10), Validators.required],
      amountReceived: ['', Validators.required],
      modeofPayment: ['', Validators.required],
      paymentDetails: [''],
      lastFYBalance: ['']
    });
  }

  toggleReportView()
  {
    this.splitView=!this.splitView;
    if(this.splitView)
    {
      this.viewButtonLabel = 'Show Simplifield Report'
    }
    else{
      this.viewButtonLabel = 'Show Split Report View'
    }
  }
  submitDetails()
  {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      this.messageService.add({severity:'error', summary: 'Invalid Form', detail: 'Please fill all the required fields.'});
      return;
    }
    const formValue = this.paymentForm.value;
    let index = Number(formValue.customerNameIndex);
    
    // Add validation for customer index
    if (index < 0 || index >= this.customerList.length) {
      this.messageService.add({severity:'error', summary: 'Invalid Customer', detail: 'Please select a valid customer.'});
      return;
    }
    
    console.log(formValue.customerNameIndex);
    this.gst = this.customerList[index].customerGst;
    this.paymentEntry.gst = this.gst?this.gst:null;
    this.paymentEntry.customerName = this.customerList[index].customerName;
    
    // Fix date handling - use proper date conversion
    const receiptDate = new Date(formValue.dateofReceipt);
    this.paymentEntry.dateofReceipt = receiptDate.toDateString();
    
    this.paymentEntry.amountReceived = formValue.amountReceived ? Number(formValue.amountReceived) : 0;
    this.paymentEntry.modeofPayment = formValue.modeofPayment ? formValue.modeofPayment : "";
    this.paymentEntry.paymentDetails = formValue.paymentDetails ? formValue.paymentDetails : "";
    
    let lastFYBal = formValue.lastFYBalance ? Number(formValue.lastFYBalance) : null;
    let openingBalanceEntry: any = null;
    if(lastFYBal && lastFYBal > 0){
      const currentYear = new Date().getFullYear();
      const financialYearStart = new Date(currentYear, 3, 1);
      openingBalanceEntry = {
        customerId: this.customerList[index]._id,
        customerName: this.paymentEntry.customerName,
        gst: this.paymentEntry.gst,
        balanceAmount: lastFYBal,
        dateofReceipt: financialYearStart.toISOString()
      };
    }

    let observables = [];
    if (this.isEditMode && this.paymentEntry._id) {
        observables.push(this.dateservice.updatePaymentDetails(this.paymentEntry));
    } else if (this.paymentEntry.amountReceived > 0) {
        observables.push(this.dateservice.insertPaymentDetails(this.paymentEntry));
    }
    
    if (openingBalanceEntry) {
      observables.push(this.dateservice.saveOpeningBalance(openingBalanceEntry));
    }

    if (observables.length > 0) {
      this.loader.show();
      forkJoin(observables).subscribe({
        next: (res) => {
          this.loader.hide();
          this.messageService.add({severity:'success', summary: 'Success', detail: 'Details saved successfully.'});
          this.showPaymentFormModal = false;
          setTimeout(() => {
            location.reload();
          }, 1000);
        },
        error: (err) => {
          this.loader.hide();
          console.error(err);
          this.messageService.add({severity:'error', summary: 'Error', detail: 'Failed to save details.'});
        }
      });
    } else {
      this.messageService.add({severity:'error', summary: 'Error', detail: 'Please provide either payment amount or opening balance.'});
    }
  }

  fetchPaymentDetails()
  {
    this.loader.show();
    this.dateservice.fetchPaymentDetails().subscribe({
      next: (res) => {
        console.log(res);
        this.paymentHistory = res;
        this.filterRecords(this.filterValue);
        this.loader.hide();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loader.hide();
        console.log(err);
        this.messageService.add({severity:'error', summary: 'Error', detail: 'Failed to fetch payment details.'});
      }
    });
  }

  fetchInvoiceDetails()
  {
    this.loader.show("sp1");
    this.invoiceservice.getAllInvoicesDetails().subscribe({
      next: (res) => {
        this.loader.hide("sp1");
        this.invoiceHistory = res;
        this.filteredInvoiceHistory = this.invoiceHistory;
      },
      error: (err) => {
        this.loader.hide("sp1");
        console.log(err);
        this.messageService.add({severity:'error', summary: 'Error', detail: 'Failed to fetch invoice details.'});
      }
    });
  }

  filterRecords(name: string)
  {
    this.simpleReport = [];
    let lastFYBalance = 0;
    console.log(name);
    this.filteredInvoiceHistory = [];
    this.filteredPaymentHistory = [];
    this.netPaymentReceived = 0;
    this.netInvoiceAmount = 0;
    this.balanceRemaining = 0;

    // Filter invoice history
    for(let i = 0; i < this.invoiceHistory.length; i++)
    {
      if(this.invoiceHistory[i].customer?.customerName === name || name === "all")
      {
        this.filteredInvoiceHistory.push(this.invoiceHistory[i]);
        this.netInvoiceAmount += Number(this.invoiceHistory[i].totalInvoiceValue || 0);
      }
    }
  
    // Filter payment history and calculate totals
    for(let i = 0; i < this.paymentHistory.length; i++)
    {
      if(this.paymentHistory[i].customerName === name || name === "all")
      {
        this.filteredPaymentHistory.push(this.paymentHistory[i]);
        this.netPaymentReceived += Number(this.paymentHistory[i].amountReceived || 0);
      }
    }

    let filteredOpeningBalances = [];
    for(let i = 0; i < this.openingBalancesHistory.length; i++)
    {
      if(this.openingBalancesHistory[i].customerName === name || name === "all")
      {
        filteredOpeningBalances.push(this.openingBalancesHistory[i]);
        lastFYBalance += Number(this.openingBalancesHistory[i].balanceAmount || 0);
       
      }
    }

    // Combine and process data for simplified report
    this.paymentInvoiceCombined = this.filteredInvoiceHistory.concat(this.filteredPaymentHistory).concat(filteredOpeningBalances);
    console.log(this.paymentInvoiceCombined);
    
    let simplifiedData: any[] = [];
    
    this.paymentInvoiceCombined.forEach((obj: any) => {
      let tempObj: any = {};
      
      if(obj.balanceAmount && obj.balanceAmount > 0)
      {
        tempObj['firmName'] = obj.customerName;
        tempObj['lastFy'] = obj.balanceAmount;
        tempObj['date'] = obj.createdAt || new Date(new Date().getFullYear() - 1, 3, 1).toISOString();
        simplifiedData.unshift(tempObj);
      }
      else if(obj.lastFYBalance > 0)
      {
        tempObj['firmName'] = obj.customerName;
        tempObj['lastFy'] = obj.lastFYBalance;
        tempObj['date'] = obj.dateofReceipt || new Date(new Date().getFullYear() - 1, 3, 1).toISOString();
        simplifiedData.unshift(tempObj);
      }
      else if(obj.invoiceDate)
      {
        tempObj['firmName'] = obj.customer?.customerName;
        tempObj['date'] = obj.invoiceDate;
        tempObj['invoiceValue'] = obj.totalInvoiceValue;
        tempObj['invoiceNumber'] = obj.invoiceNo;
        simplifiedData.push(tempObj); 
      } 
      else if(obj.dateofReceipt)
      {
        if(obj.amountReceived > 0)
        {
          tempObj['firmName'] = obj.customerName;
          tempObj['date'] = obj.dateofReceipt;
          tempObj['paymentReceived'] = obj.amountReceived;
          tempObj['modeofPayment'] = obj.modeofPayment;
          simplifiedData.push(tempObj); 
        }
      }
    });
      
    // Sort by date
    simplifiedData.sort((a, b) => {
      const keyA = new Date(a.date);
      const keyB = new Date(b.date);
      // Compare the 2 dates
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });
      
    console.log(simplifiedData);
    this.simpleReport = simplifiedData;
    this.balanceRemaining = this.calculateBalance(this.netInvoiceAmount, this.netPaymentReceived, lastFYBalance);
  }

  calculateBalance(netinvoiceamt: number, netpaymentReceived: number, lastFYBalance: number): number {
    return (netinvoiceamt + lastFYBalance - netpaymentReceived);
  }
  printReport()
  {
    const elementsToHide = ['ul-div', 'pbutton', 'labelTohide', 'dropdowntohide', 'toggleButton'];
    const contentOutlet = document.getElementsByClassName('content-outlet')[0];
    
    // Hide elements
    elementsToHide.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.style.display = "none";
      }
    });
    
    // Add print padding class
    if (contentOutlet) {
      this.renderer.addClass(contentOutlet, 'printPadding');
    }
    
    // Print
    window.print();
    
    // Restore elements
    elementsToHide.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.style.display = "inline-block";
      }
    });
    
    // Remove print padding class
    if (contentOutlet) {
      this.renderer.removeClass(contentOutlet, 'printPadding');
    }
  }

  openPaymentFormModal(): void {
    this.showPaymentFormModal = true;
    this.isEditMode = false;
    this.currentEditId = null;
    this.paymentEntry._id = undefined;
    this.paymentForm.reset({
      dateofReceipt: new Date().toISOString().substring(0, 10),
      customerNameIndex: '',
      modeofPayment: ''
    });
  }

  editPayment(payment: any): void {
    this.isEditMode = true;
    this.currentEditId = payment._id;
    this.paymentEntry._id = payment._id;
    this.showPaymentFormModal = true;
        
    let customerIndex = this.customerList.findIndex(c => c.customerName === payment.customerName);
        
    let dateString = '';
    if (payment.dateofReceipt) {
      let receiptDate = new Date(payment.dateofReceipt);
      if (!isNaN(receiptDate.getTime())) {
        dateString = receiptDate.toISOString().substring(0, 10);
      }
    }
        
    this.paymentForm.patchValue({
      customerNameIndex: customerIndex >= 0 ? customerIndex : '',
      dateofReceipt: dateString,
      amountReceived: payment.amountReceived,
      modeofPayment: payment.modeofPayment,
      paymentDetails: payment.paymentDetails,
      lastFYBalance: payment.lastFYBalance
    });
  }

  confirmDelete(payment: any, event: Event) {
    if (event) event.stopPropagation();
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this payment record?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if(payment._id) {
          this.loader.show();
          this.dateservice.deletePaymentDetails(payment._id).subscribe({
            next: (res) => {
              this.loader.hide();
              this.messageService.add({severity:'success', summary:'Success', detail:'Payment deleted successfully'});
              this.fetchPaymentDetails();
            },
            error: (err) => {
              this.loader.hide();
              this.messageService.add({severity:'error', summary:'Error', detail:'Failed to delete payment'});
              console.error(err);
            }
          });
        }
      }
    });
  }

  closePaymentFormModal(): void {
    this.showPaymentFormModal = false;
  }
}
