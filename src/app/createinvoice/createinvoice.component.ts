import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GenerateInvoice, Invoice } from '../models/invoice.model';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { ProductDetails, ProductInvoice } from '../models/product.model';
import { OtherdataService } from '../services/otherdata.service';
import { CustomerModel } from '../models/customer.model';
import { InvoiceService } from '../services/invoice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StockService } from '../services/stock.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonModule } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-createinvoice',
  templateUrl: './createinvoice.component.html',
  styleUrls: ['./createinvoice.component.css'],
  standalone: true,
  imports: [FormsModule, TableModule, CommonModule, InputNumberModule, SelectModule]
})
export class CreateinvoiceComponent implements OnInit {
  interstate = false;
  products: ProductDetails[] = [];
  customer: CustomerModel = {
    _id: undefined,
    customerAddress: "",
    customerContact: "",
    customerGst: "",
    customerName: "",
    customerPan: "",
    customerCity: "",
    customerState: "",
    customerCountry: "",
    customershopNo: "",
    customerArea: "",
    id: 0
  };
  customers: CustomerModel[] = [];
  totalTaxableValue: number = 0;
  totalInvoiceValue: number = 0;
  totalTax: number = 0;
  sgstorcgstamt28: number = 0;
  sgstorcgstamt18: number = 0;
  sgstorcgstamt12: number = 0;
  sgstorcgstamt5: number = 0;
  igstamt28: number = 0;
  igstamt18: number = 0;
  igstamt12: number = 0;
  igstamt5: number = 0;
  taxable5: number = 0;
  taxable12: number = 0;
  taxable18: number = 0;
  taxable28: number = 0;
  reverseCharge: string = "N";
  invoiceNumber: any;
  customerState: any;
  todaysDate: any;

  ///////////////////////
  customerName: any;
  /////////
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
  balancerow: number = 40;
  balancerows: any[] = [];
  invoiceNum: any;
  invoiceTypes = [
    { label: 'Product', value: 'product' },
    { label: 'Negative', value: 'negative' }
  ];
  invoiceType: string = "product";
  isEditMode: boolean = false;
  invoiceId: string = '';
  
  constructor(
    private otherdata: OtherdataService,
    private invoiceservice: InvoiceService,
    private router: Router,
    private route: ActivatedRoute,
    private stockservice: StockService,
    private spinner: NgxSpinnerService, private messageService: MessageService,
    private cdRef: ChangeDetectorRef
  ) { }



  ngOnInit(): void {
    this.route.params.subscribe(params=>
      {
        this.invoiceNum=params['invoicenum'];
        if(this.invoiceNum){
          this.isEditMode = true;
            this.initializeComponentEdit();
        }
        else{
          this.initializeComponentCreate();
          this.addRow();
        }
      });
  }

  initializeComponentCreate(){
    this.todaysDate=new Date()
    this.invoiceservice.getLastInvoiceNumber().subscribe((res:any)=>
      {
        this.invoiceId = res._id;
        this.invoiceNumber=res.invoiceNumber;
      })
    this.otherdata.getProductDetails().subscribe(res=>
      {
        this.products=res;
      });

      this.otherdata.getCustomerDetails().subscribe(res=>{
        this.customers=res;
      })
  }

  initializeComponentEdit(){
    this.spinner.show();
    this.otherdata.getProductDetails().subscribe(res=>
      {
        this.products=res;
        this.otherdata.getCustomerDetails().subscribe(res=>{
        this.customers=res;

        this.generatedInvoice=this.invoiceservice.getInvoiceDetails(this.invoiceNum).subscribe(res=>
          {
            this.generatedInvoice=res;
            console.log(this.generatedInvoice);
            this.balancerow=this.balancerow-this.generatedInvoice.products.length
            for(let i=0;i<this.balancerow;i++)
            {
              this.balancerows.push(i);
            }
    
            this.invoiceNumber=this.generatedInvoice.invoiceNo;
            this.todaysDate=this.generatedInvoice.invoiceDate;
            this.reverseCharge=this.generatedInvoice.reverseCharge
            this.customerName=this.generatedInvoice.customer.customerName
            this.invoiceView=this.generatedInvoice.products;
            this.sgstorcgstamt28=this.generatedInvoice.taxAmtsgstorcgst28
            this.sgstorcgstamt18=this.generatedInvoice.taxAmtsgstorcgst18
            this.sgstorcgstamt12=this.generatedInvoice.taxAmtsgstorcgst12
            this.sgstorcgstamt5=this.generatedInvoice.taxAmtsgstorcgst5
            this.igstamt28=this.generatedInvoice.taxAmtIgst28
            this.igstamt18=this.generatedInvoice.taxAmtIgst18
            this.igstamt12=this.generatedInvoice.taxAmtIgst12
            this.igstamt5=this.generatedInvoice.taxAmtIgst5
            this.totalTax=this.generatedInvoice.taxAmtsgstorcgst5+this.generatedInvoice.taxAmtsgstorcgst12+this.generatedInvoice.taxAmtsgstorcgst18+this.generatedInvoice.taxAmtsgstorcgst28 + this.generatedInvoice.taxAmtIgst5+this.generatedInvoice.taxAmtIgst12+this.generatedInvoice.taxAmtIgst18+this.generatedInvoice.taxAmtIgst28
            this.totalTaxableValue=this.generatedInvoice.totalTaxableValue
            this.totalInvoiceValue=this.generatedInvoice.totalInvoiceValue
            this.invoiceType = this.generatedInvoice.invoiceType;
            if (!this.invoiceType) {
              this.invoiceType = 'product';
            }
            this.taxable12=this.generatedInvoice.taxable12
            this.taxable5=this.generatedInvoice.taxable5
            this.taxable18=this.generatedInvoice.taxable18
            this.taxable28=this.generatedInvoice.taxable28
            this.populateCustomerFields(this.generatedInvoice.customer.customerName);
            this.spinner.hide();
            this.cdRef.detectChanges();
          });
    
          this.otherdata.getAppConfig().subscribe(res=>
            {
              this.otherdata.appConfig = res;
              console.log(this.otherdata.appConfig)
    
    
              this.companyName=this.otherdata.appConfig.companyName;
              this.gstin=this.otherdata.appConfig.companyGSTIN
              this.ownerName=this.otherdata.appConfig.ownerName
              this.city=this.otherdata.appConfig.city
              this.pin=this.otherdata.appConfig.pin
              this.mob=this.otherdata.appConfig.mobile
              this.state=this.otherdata.appConfig.state
              this.stateCode=this.otherdata.appConfig.stateCode
              this.email=this.otherdata.appConfig.email
              this.houseNum=this.otherdata.appConfig.houseNo
              this.area=this.otherdata.appConfig.area
              this.pan=this.otherdata.appConfig.pan
            });
          
      })
   
    },
  error=>{
    this.spinner.hide();
  });
  }

  invoiceView:Invoice[]=[];
  addRow()
  {
    var invoice: Invoice = {
      product_id: null,
      productId: 0,
      productName: "",
      hsn: "",
      quantityInStock:0,
      taxRate: '0',
      rate: 0,
      amount: '0',
      quantity: '0',
      unit: "",
      description: "",
      sgst: '0',
      cgst: '0',
      Igst: '0',
      taxableAmount: '0'
    };
    this.invoiceView.push(invoice);
  }
  deleteRow()
  {
    // var invoice=new Invoice();
    // invoice.productId=0;
    // invoice.productName="";
    // invoice.hsn="";
    // invoice.taxRate="";
    // invoice.rate="";
    // invoice.amount="";
    // invoice.quantity="";
    // invoice.description=""
    this.invoiceView.pop();
    this.calculateAmount(this.invoiceView.length -1);

  }

  sendData()
  {
    console.log(this.invoiceView)
  }
  calculateAmount(index:number)
  { 
    this.totalTaxableValue=0;
  this.totalInvoiceValue=0;
  this.totalTax=0;
  this.sgstorcgstamt28=0;
  this.sgstorcgstamt18=0;
  this.sgstorcgstamt12=0;
  this.sgstorcgstamt5=0;
 this.igstamt28=0;
 this.igstamt18=0;
 this.igstamt12=0;
 this.igstamt5=0;
 this.taxable5=0;
 this.taxable12=0;
 this.taxable18=0;
 this.taxable28=0;

    this.invoiceView[index].taxableAmount=((Number(this.invoiceView[index].rate)*Number(this.invoiceView[index].quantity))).toFixed(2);
    var taxamount=  Number(((Number(this.invoiceView[index].rate)*(Number(this.invoiceView[index].taxRate)/100))*Number(this.invoiceView[index].quantity)).toFixed(2));
    
    if(!this.interstate){
      this.invoiceView[index].sgst=String(taxamount/2);
      this.invoiceView[index].cgst=String(taxamount/2);
      this.invoiceView[index].Igst = String(0);
    }
    else{
      this.invoiceView[index].Igst = String(taxamount);
      this.invoiceView[index].sgst=String(0);
      this.invoiceView[index].cgst=String(0);
    }
    
    this.invoiceView[index].amount=((
        (Number(this.invoiceView[index].rate)*(Number(this.invoiceView[index].taxRate)/100))
        +(Number(this.invoiceView[index].rate)))
        *Number(this.invoiceView[index].quantity)).toFixed(2);
      console.log( this.invoiceView[index].amount);

      for(let i=0;i<this.invoiceView.length;i++)
      {
        if(this.invoiceView[i].taxRate=="28")
        {
          this.taxable28=Number((this.taxable28+Number(this.invoiceView[i].taxableAmount)).toFixed(2));
          if(!this.interstate)
          {
            this.sgstorcgstamt28=Number((this.sgstorcgstamt28+Number(this.invoiceView[i].sgst)).toFixed(2));
            
          }
          else{
            this.igstamt28=Number((this.igstamt28+Number(this.invoiceView[i].Igst)).toFixed(2));
          }
        }
       else if(this.invoiceView[i].taxRate=="18")
        {
          this.taxable18=Number((this.taxable18+Number(this.invoiceView[i].taxableAmount)).toFixed(2));
          if(!this.interstate)
          {
            this.sgstorcgstamt18=Number((this.sgstorcgstamt18+Number(this.invoiceView[i].sgst)).toFixed(2));
            
          }
          else{
            this.igstamt18=Number((this.igstamt18+Number(this.invoiceView[i].Igst)).toFixed(2));
          }
        }
        else if(this.invoiceView[i].taxRate=="12")
        {
          this.taxable12=Number((this.taxable12+Number(this.invoiceView[i].taxableAmount)).toFixed(2));
          if(!this.interstate)
          {
            this.sgstorcgstamt12=Number((this.sgstorcgstamt12+Number(this.invoiceView[i].sgst)).toFixed(2));
       
          }
          else{
            this.igstamt12=Number((this.igstamt12+Number(this.invoiceView[i].Igst)).toFixed(2));
          }
        }
        else if(this.invoiceView[i].taxRate=="5")
        {
          this.taxable5=Number((this.taxable5+Number(this.invoiceView[i].taxableAmount)).toFixed(2));
          if(!this.interstate)
          {
            this.sgstorcgstamt5=Number((this.sgstorcgstamt5+Number(this.invoiceView[i].sgst)).toFixed(2));
           
          }
          else{
            this.igstamt5=Number((this.igstamt5+Number(this.invoiceView[i].Igst)).toFixed(2));
            
          }
        }
        
        // this.totalTaxableValue=Number((Number(this.totalTaxableValue)+Number(this.invoiceView[i].taxableAmount)).toFixed(2));
        // this.totalTax=Number((Number(this.totalTax)+Number(this.invoiceView[i].sgst)+Number(this.invoiceView[i].sgst)).toFixed(2));
        // this.totalInvoiceValue=Number((Number(this.totalInvoiceValue)+Number(this.invoiceView[i].amount)).toFixed(2));
        this.totalTaxableValue=Number((Number(this.totalTaxableValue)+Number(this.invoiceView[i].taxableAmount)).toFixed(2));
        this.totalTax=Number((Number(this.totalTax)+Number(this.invoiceView[i].sgst)+Number(this.invoiceView[i].sgst) + Number(this.invoiceView[i].Igst)).toFixed(2));
        this.totalInvoiceValue=Number((Number(this.totalInvoiceValue)+Number(this.invoiceView[i].amount)).toFixed(2));
      }


    }
    populateFields(productId:any,indexofItemList:number)
    {
      // console.log(productName)
      let i=0;
      for(let j=0;j<this.products.length;j++)
      {
        if(this.products[j]._id === (productId))
        {
          console.log("match success")
          console.log(this.products[i].productHsn);
          i=j;
        }
      }
      this.invoiceView[indexofItemList].quantityInStock=this.products[i].inStock
      this.invoiceView[indexofItemList].product_id=this.products[i]._id
      this.invoiceView[indexofItemList].productName=this.products[i].productName

      this.invoiceView[indexofItemList].productId=this.products[i].id
        this.invoiceView[indexofItemList].hsn=this.products[i].productHsn
        this.invoiceView[indexofItemList].rate=this.products[i].productPrice
        this.invoiceView[indexofItemList].taxRate=String(this.products[i].productTaxRate)
        this.invoiceView[indexofItemList].unit=this.products[i].productUnit
        this.invoiceView[indexofItemList].Igst=""
        this.invoiceView[indexofItemList].amount=""
        this.invoiceView[indexofItemList].cgst=""
        this.invoiceView[indexofItemList].sgst=""
        this.invoiceView[indexofItemList].quantity=""
        this.invoiceView[indexofItemList].amount=""
        console.log(this.invoiceView[indexofItemList])
    }
    populateCustomerFields(customerGst:string)
    {
      this.customer = {
        _id: undefined,
        customerAddress: "",
        customerContact: "",
        customerGst: "",
        customerName: "",
        customerPan: "",
        customerCity: "",
        customerState: "",
        customerCountry: "",
        customershopNo: "",
        customerArea: "",
        id: 0
      };
      console.log(customerGst)
      let i=0;
      for(let j=0;j<this.customers.length;j++)
      {
        if(this.customers[j].customerName === (customerGst))
        {
          console.log("match success")         
             i=j;
          console.log(this.customers[i].customerAddress);
        }
      }
        this.customer.customerAddress=this.customers[i].customerAddress
        this.customer.customerContact=this.customers[i].customerContact
        this.customer.customerPan=this.customers[i].customerPan
        
        this.customer.customerState=this.customers[i].customerState
        this.customer.customerName=this.customers[i].customerName
        this.customer.customerGst=this.customers[i].customerGst
        console.log(this.customer)
        if(this.customer.customerGst && this.customer.customerGst?.slice(0,2) != this.otherdata.appConfig.companyGSTIN.slice(0,2)){
          // activate interstate - IGST 
          this.interstate = true
          console.log(this.interstate)
        }
        else{
          this.interstate = false;
        }
    }
    createInvoice()
    {
      if(this.totalTaxableValue<=0){
        alert("Please add atleast one product.");
        return;
      }

      this.spinner.show();
      var generateInvoice: GenerateInvoice = {
        _id: this.isEditMode ? this.generatedInvoice._id : null,
        invoiceNo: this.invoiceNumber,
        invoiceDate: new Date(this.todaysDate).toDateString(),
        placeOfSupply: this.customer.customerState,
        reverseCharge: this.reverseCharge,
        totalTax: this.totalTax,
        totalTaxableValue: this.totalTaxableValue,
        totalInvoiceValue: this.totalInvoiceValue,
        taxAmtsgstorcgst28: this.sgstorcgstamt28,
        taxAmtsgstorcgst18: this.sgstorcgstamt18,
        taxAmtsgstorcgst12: this.sgstorcgstamt12,
        taxAmtsgstorcgst5: this.sgstorcgstamt5,
        taxAmtIgst28: this.igstamt28,
        taxAmtIgst18: this.igstamt18,
        taxAmtIgst12: this.igstamt12,
        taxAmtIgst5: this.igstamt5,
        taxable28: this.taxable28,
        taxable18: this.taxable18,
        taxable12: this.taxable12,
        taxable5: this.taxable5,
        customer: this.customer,
        products: this.invoiceView,
        invoiceStatus: "valid",
        invoiceType: this.invoiceType
      };
      console.log(generateInvoice);
      if(this.isEditMode)
        this.updateInvoiceApiACall(generateInvoice);
      else
        this.generateInvoiceApiCall(generateInvoice);
    }
    
    generateInvoiceApiCall(generateInvoice:any){
      this.invoiceservice.generateInvoice(generateInvoice).subscribe((res:any)=>
        {
          console.log(res);
          if(res===null || res===undefined)
          {
            this.messageService.add({severity:'error', summary: 'Error', detail: 'Failed to generate invoice.'});
          }
          else{
            this.messageService.add({severity:'success', summary: 'Success', detail: 'Invoice generated successfully.'});
            for(let j=0;j<this.invoiceView.length;j++)
            {
              setTimeout(
                ()=>{
                  this.stockservice.updateStock(
                    {
                      "inStock":(Number(this.invoiceView[j].quantityInStock)-Number(this.invoiceView[j].quantity)),
                      "_id": this.invoiceView[j].product_id
                    }
                  ).subscribe(res=>
                    {
                      console.log(res);
                    })
                },100
              )
            }
            
            // this.invoiceservice.setLastInvoiceNumber(setLastInvoiceNumber).subscribe(res=>
            //   {
            //     console.log(res);
            //   })
            setTimeout((run:any)=>
              {
                this.spinner.hide();
                  this.router.navigate(['/dashboard/generatedInvoice',res._id])
              },500);
          }
        }
        );
    }

    updateInvoiceApiACall(generateInvoice:any){
      this.invoiceservice.updateInvoice(this.generatedInvoice._id, generateInvoice).subscribe(res=>
        {
          console.log(res);
          if(res===null || res===undefined)
          {
            alert("Something Wrong Occurred");
          }
          else{
            alert("Invoice Updated");

            setTimeout((run:any)=>
              {
                  this.spinner.hide();
                  this.router.navigate(['/dashboard/generatedInvoice',res._id])
              },2000);
          }
        }
        );
    }

    showTaxBrief=false;

    toggleView(){
      this.showTaxBrief = !this.showTaxBrief;
    }
}
