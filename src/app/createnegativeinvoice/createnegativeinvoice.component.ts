import { Component, OnInit } from '@angular/core';
import { GenerateInvoice, Invoice } from '../models/invoice.model';
import { FormsModule } from '@angular/forms';
import { ProductDetails } from '../models/product.model';
import { OtherdataService } from '../services/otherdata.service';
import { CustomerModel } from '../models/customer.model';
import { InvoiceService } from '../services/invoice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-createnegativeinvoice',
  templateUrl: './createnegativeinvoice.component.html',
  styleUrls: ['./createnegativeinvoice.component.css'],
  standalone: true,
  imports: [FormsModule, TableModule, CommonModule]
})
export class CreatenegativeinvoiceComponent implements OnInit {
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
  invoiceNumber: any = 4;
  customerState: any;
  todaysDate: any;

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
  invoiceType: string = "";
  isEditMode: boolean = false;
  invoiceId: string = '';

  constructor(private otherdata:OtherdataService,private invoiceservice:InvoiceService,private router:Router,private route: ActivatedRoute ) { 

  }



  ngOnInit(): void {
    this.todaysDate=new Date()
    this.route.params.subscribe(params=>
      {
        this.invoiceNum=params['invoicenum'];
        if(this.invoiceNum){
          this.isEditMode = true;

            this.initializeEditInvoice();
        }
        else{
          this.intializeCreateInvoice();
        }
      });
  }

  intializeCreateInvoice(){
    this.invoiceservice.getLastInvoiceNumber().subscribe((res:any)=>
      {
        this.invoiceId = res._id;
        this.invoiceNumber=Number(res.invoiceNumber)+1;
      })
    this.otherdata.getProductDetails().subscribe(res=>
      {
        this.products=res;
      });

      this.otherdata.getCustomerDetails().subscribe(res=>{
        this.customers=res;
      })
  }

  initializeEditInvoice(){
    // this.todaysDate=new Date()
    this.otherdata.getProductDetails().subscribe(res=>
      {
        this.products=res;
      

      this.otherdata.getCustomerDetails().subscribe(res=>{
        this.customers=res;

        this.route.params.subscribe(params=>
          {
            this.invoiceNum=params['invoicenum'];
            console.log(params)
          
       //var invoiceNum=2;
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
            this.totalTax=this.generatedInvoice.taxAmtsgstorcgst5+this.generatedInvoice.taxAmtsgstorcgst12+this.generatedInvoice.taxAmtsgstorcgst18+this.generatedInvoice.taxAmtsgstorcgst28
            this.totalTaxableValue=this.generatedInvoice.totalTaxableValue
            this.totalInvoiceValue=this.generatedInvoice.totalInvoiceValue
            this.invoiceType=this.generatedInvoice.invoiceType
            this.taxable12=this.generatedInvoice.taxable12
            this.taxable5=this.generatedInvoice.taxable5
            this.taxable18=this.generatedInvoice.taxable18
            this.taxable28=this.generatedInvoice.taxable28
            this.populateCustomerFields(this.generatedInvoice.customer.customerName)
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
          
      })
   
    });
}

  invoiceView: Invoice[] = [];
  addRow() {
    var invoice: Invoice = {
      product_id: undefined,
      quantityInStock: 0,
      productId: 0,
      productName: "",
      hsn: "",
      taxRate: '0',
      quantity: '0',
      rate: 0,
      amount: '0',
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
  
    this.invoiceView.pop()
  }

  sendData()
  {
    console.log(this.invoiceView)
  }
    calculateAmount(index:any)
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

    this.invoiceView[index].taxableAmount = (Number(this.invoiceView[index].rate) * Number(this.invoiceView[index].quantity)).toFixed(2);
    var taxamount = Number(((Number(this.invoiceView[index].rate) * (Number(this.invoiceView[index].taxRate) / 100)) * Number(this.invoiceView[index].quantity)).toFixed(2));
    
    if(!this.interstate){
      this.invoiceView[index].sgst = (taxamount/2).toFixed(2);
      this.invoiceView[index].cgst = (taxamount/2).toFixed(2);
      this.invoiceView[index].Igst = '0';
    }
    else{
      this.invoiceView[index].Igst = (taxamount).toFixed(2);
      this.invoiceView[index].sgst = '0';
      this.invoiceView[index].cgst = '0';
    }
    this.invoiceView[index].amount = (((
        (Number(this.invoiceView[index].rate)*(Number(this.invoiceView[index].taxRate)/100))
        +(Number(this.invoiceView[index].rate)))
        *Number(this.invoiceView[index].quantity)).toFixed(2));
      console.log( this.invoiceView[index].amount);

      for(let i=0;i<this.invoiceView.length;i++)
      {
        if(this.invoiceView[i].taxRate === '28')
        {
          this.taxable28 = Number(this.taxable28 + this.invoiceView[i].taxableAmount);
          if(!this.interstate)
          {
            this.sgstorcgstamt28 = Number(this.sgstorcgstamt28 + this.invoiceView[i].sgst);
            
          }
          else{
            this.igstamt28 = Number(this.igstamt28 + this.invoiceView[i].Igst);
          }
        }
       else if(this.invoiceView[i].taxRate === '18')
        {
          this.taxable18 = Number(this.taxable18 + this.invoiceView[i].taxableAmount);
          if(!this.interstate)
          {
            this.sgstorcgstamt18 = Number(this.sgstorcgstamt18 + this.invoiceView[i].sgst);
            
          }
          else{
            this.igstamt18 = Number(this.igstamt18 + this.invoiceView[i].Igst);
          }
        }
        else if(this.invoiceView[i].taxRate === '12')
        {
          this.taxable12 = Number(this.taxable12 + this.invoiceView[i].taxableAmount);
          if(!this.interstate)
          {
            this.sgstorcgstamt12 = Number(this.sgstorcgstamt12 + this.invoiceView[i].sgst);
       
          }
          else{
            this.igstamt12 =  Number(this.igstamt12 + this.invoiceView[i].Igst);
          }
        }
        else if(this.invoiceView[i].taxRate === '5')
        {
          this.taxable5 = Number(this.taxable5 + this.invoiceView[i].taxableAmount);
          if(!this.interstate)
          {
            this.sgstorcgstamt5 = Number(this.sgstorcgstamt5 + this.invoiceView[i].sgst);
           
          }
          else{
            this.igstamt5 = Number(this.igstamt5 + this.invoiceView[i].Igst);
            
          }
        }
        
        this.totalTaxableValue = Number(this.totalTaxableValue + this.invoiceView[i].taxableAmount);
        this.totalTax = Number(this.totalTax + this.invoiceView[i].sgst)
        this.totalInvoiceValue = Number(this.totalInvoiceValue + this.invoiceView[i].amount);
      }


    }
    populateFields(productName:any,indexofItemList:any)
    {
      console.log(productName)
      let i=0;
      for(let j=0;j<this.products.length;j++)
      {
        if(this.products[j].productName === (productName))
        {
          console.log("match success")
          console.log(this.products[i].productHsn);
          i=j;
        }
      }
      this.invoiceView[indexofItemList].quantityInStock = this.products[i].inStock
      this.invoiceView[indexofItemList].productId = this.products[i].id
        this.invoiceView[indexofItemList].hsn = this.products[i].productHsn
        this.invoiceView[indexofItemList].rate = this.products[i].productPrice
        this.invoiceView[indexofItemList].taxRate = (this.products[i].productTaxRate).toFixed(2);
        this.invoiceView[indexofItemList].unit = this.products[i].productUnit
        this.invoiceView[indexofItemList].hsn = this.products[i].productHsn
        this.invoiceView[indexofItemList].rate = this.products[i].productPrice
        this.invoiceView[indexofItemList].taxRate = (this.products[i].productTaxRate).toFixed(2);
        this.invoiceView[indexofItemList].unit = this.products[i].productUnit
        this.invoiceView[indexofItemList].Igst = '0'
        this.invoiceView[indexofItemList].amount =  '0'
        this.invoiceView[indexofItemList].cgst = '0'
        this.invoiceView[indexofItemList].sgst = '0'
        this.invoiceView[indexofItemList].quantity = '0'
        this.invoiceView[indexofItemList].amount = '0'
        console.log(this.invoiceView[indexofItemList])
      }
    populateCustomerFields(customerGst:any)
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
      if(this.totalTaxableValue <= 0){
        alert("Please add atleast one product.");
        return;
      }
      var generateInvoice: GenerateInvoice = {
        _id: this.isEditMode ? this.generatedInvoice._id : null,
        invoiceNo: this.invoiceNumber,
        invoiceDate: new Date(this.todaysDate).toDateString(),
        placeOfSupply: this.customer.customerState,
        reverseCharge: this.reverseCharge,
        totalTaxableValue: this.totalTaxableValue,
        totalInvoiceValue: this.totalInvoiceValue,
        totalTax: this.totalTax,
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
        invoiceStatus: "valid",
        customer: this.customer,
        products: this.invoiceView,
        invoiceType: "negative"
      };
      console.log(generateInvoice);
      if(this.isEditMode)
        this.updateInvoiceApiCall(generateInvoice);
      else
        this.generateInvoiceApiCall(generateInvoice);
    }

    generateInvoiceApiCall(generateInvoice:any){
      this.invoiceservice.generateInvoice(generateInvoice).subscribe(res=>
        {
          console.log(res);
          if(res===null || res===undefined)
          {
            alert("Something Wrong Occurred");
          }
          else{
            alert("Invoice Generated");
            var setLastInvoiceNumber:any={
              "_id": this.invoiceId,
            "invoiceNumber":this.invoiceNumber
            }
            this.invoiceservice.setLastInvoiceNumber(setLastInvoiceNumber).subscribe((res:any)=>
              {
                console.log(res);
              })
            setTimeout((run:any)=>
              {
                  this.router.navigate(['generatedInvoice',res._id])
              },2000);
          }
        }
        );
    }

    updateInvoiceApiCall(generateInvoice:any){
      this.invoiceservice.updateInvoice(generateInvoice, this.generatedInvoice.id).subscribe((res:any)=>
        {
          console.log(res);
          if(res===null || res===undefined)
          {
            alert("Something Wrong Occurred");
          }
          else{
            alert("Invoice Updated");
            var setLastInvoiceNumber={
            "invoiceNumber":this.invoiceNumber
            }
            setTimeout((run:any)=>
              {
                  this.router.navigate(['generatedInvoice',this.generatedInvoice._id])
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
