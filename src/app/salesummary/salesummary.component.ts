import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InvoiceService } from '../services/invoice.service';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { B2BModel, B2CModel } from '../models/b2breport.model';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-salesummary',
  templateUrl: './salesummary.component.html',
  styleUrls: ['./salesummary.component.css'],
  standalone: true,
  imports: [TableModule, FormsModule, CommonModule]
})
export class SalesummaryComponent implements OnInit {
  summary: any;
  b2bsummary: B2BModel[] = [];
  b2csummary: B2CModel[] = [];
  startDate!: Date;
  endDate!: Date;
  summaryBackup: any;
  constructor(private invoiceService:InvoiceService,private router:Router, private spinner:NgxSpinnerService) { }

  ngOnInit(): void {
    this.spinner.show();
    this.invoiceService.getAllInvoicesDetails().subscribe((res:any)=>
      {
        this.summary=res;
        this.calculateTotal(this.summary)
        this.summaryBackup=res;
        this.spinner.hide();
        //this.downloadCSVForB2B()
      })
    
  }
  calculateTotal(sumary:any)
  {

  }
  optionsb2b = { 
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalseparator: '.',
    showLabels: true, 
    showTitle: false,
    title: '',
    useBom: true,
    headers: ["GSTIN/UIN of Recipient", "Receiver Name", "Invoice Number","Invoice date","Invoice Value","Place Of Supply","Reverse Charge","Applicable % of Tax Rate","Invoice Type","E-Commerce GSTIN","Rate","Taxable Value","Cess Amount"]
  };
  optionsb2c = { 
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalseparator: '.',
    showLabels: true, 
    showTitle: false,
    title: '',
    useBom: true,
    headers: ["Type", "Place Of Supply", "Rate","Applicable % of Tax Rate","Taxable Value","Cess Amount","E-Commerce GSTIN"]
  };
  optionsSummary = { 
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalseparator: '.',
    showLabels: true, 
    showTitle: false,
    title: '',
    useBom: true,
    headers: ["Name", "GSTIN", "State of Supply","Invoice Number","Date","Invoice Value","Taxable Value","CGST AMT","SGST AMT","IGST AMT","Total Tax"]
  };
 monthList=["Jan","Feb","Mar","Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec"]
downloadCSVForB2B()
{
  this.generateB2BSummary();
  let name = this.monthList[new Date(this.startDate).getMonth()] + "_" +this.monthList[new Date(this.endDate).getMonth()]+" "+new Date(this.startDate).getFullYear() + "_" + [(new Date(this.startDate).getFullYear())+1] + "_B2B_GSTR 1_3b";
  // console.log(this.b2bsummary)
  new ngxCsv(this.b2bsummary, name, this.optionsb2b);
}
downloadCSVForB2C()
{
  this.generateB2CSummary();
  let name = this.monthList[new Date(this.startDate).getMonth()] + "_" +this.monthList[new Date(this.endDate).getMonth()]+" "+new Date(this.startDate).getFullYear() + "_" +[new Date(this.startDate).getFullYear()+1] + "_B2C_GSTR 1_3b";
  new ngxCsv(this.b2csummary, name, this.optionsb2c);
}
downloadCSVCurrentReport()
{
  // this.generateB2CSummary();
  // let name = this.monthList[new Date(this.startDate).getMonth()] + "_" +this.monthList[new Date(this.endDate).getMonth()]+" "+new Date(this.startDate).getFullYear() + "_" +[new Date(this.startDate).getFullYear()+1] + "_B2C_GSTR 1_3b";
  let summaryForExcel=[]
  for(let i=0;i<this.summary.length;i++)
  {
    let obj={
      "Name":this.summary[i].customer.customerName,
      "GSTIN":this.summary[i].customer.customerGst,
      "State Of Supply":this.summary[i].customer.customerState,
      "Invoice Number":this.summary[i].invoiceNo,
      "Date":this.summary[i].invoiceDate,
      "Invoice Value":this.summary[i].totalInvoiceValue.toFixed(0),
      "Taxable Value":this.summary[i].totalTaxableValue,
      "CSGT Amount":(this.summary[i].taxAmtsgstorcgst5+this.summary[i].taxAmtsgstorcgst12+this.summary[i].taxAmtsgstorcgst18+this.summary[i].taxAmtsgstorcgst28),
      "SGST Amount":(this.summary[i].taxAmtsgstorcgst5+this.summary[i].taxAmtsgstorcgst12+this.summary[i].taxAmtsgstorcgst18+this.summary[i].taxAmtsgstorcgst28),
      "IGST Amount":(this.summary[i].taxAmtIgst5+this.summary[i].taxAmtIgst12+this.summary[i].taxAmtIgst18+this.summary[i].taxAmtIgst28),
      "Total Tax":(this.summary[i].taxAmtsgstorcgst5+this.summary[i].taxAmtsgstorcgst12+this.summary[i].taxAmtsgstorcgst18+this.summary[i].taxAmtsgstorcgst28+this.summary[i].taxAmtsgstorcgst5+this.summary[i].taxAmtsgstorcgst12+this.summary[i].taxAmtsgstorcgst18+this.summary[i].taxAmtsgstorcgst28+this.summary[i].taxAmtIgst5+this.summary[i].taxAmtIgst12+this.summary[i].taxAmtIgst18+this.summary[i].taxAmtIgst28)
    }
    summaryForExcel.push(obj)
  }
  new ngxCsv(summaryForExcel, "Report", this.optionsSummary);
}
  editInvoice(id:any, invoiceType:string)
  {
    id=id;
    if(invoiceType == 'product')
      this.router.navigate(['/dashboard/editInvoice',id]);
    else
      this.router.navigate(['/dashboard/editNegativeInvoice',id]);
  }
  viewInvoice(id:any)
  {
    id=id
    this.router.navigate(['/dashboard/generatedInvoice',id]);
  }

  filterRecords()
  {
    this.summary=this.summaryBackup
    var filteredSummary=[];
    var summary=this.summary
    // var invdate=new Date(summary[0].invoiceDate);
    var startdate=new Date(this.startDate).setHours(0,0,0,0)
    var enddate=new Date(this.endDate).setHours(0,0,0,0)
    
    // console.log(startdate)
    // console.log(enddate)

    // console.log(startdate>new Date())

    for(let i=0;i<summary.length;i++)
    {
     let date=new Date(summary[i].invoiceDate).setHours(0,0,0,0);
    //  console.log(date)
    console.log( date.valueOf() == startdate.valueOf()) 
    console.log(date)
    console.log(startdate)
    // console.log(date>startdate )
     
      if((date>startdate || date.valueOf() == startdate.valueOf()) && (date<enddate || date.valueOf() == enddate.valueOf()))
      {
        filteredSummary.push(summary[i]);
      }
    }
    this.summary=filteredSummary;

    console.log(this.summary)

  }
  
  generateB2CSummary()
  {
    let  rowData5: B2CModel = { type: "", placeofsupply: "", rate: 0, applicabletaxrate: "", taxablevalue: 0, cessamount: "", ecomGstin: "" };
    let  rowData12: B2CModel = { type: "", placeofsupply: "", rate: 0, applicabletaxrate: "", taxablevalue: 0, cessamount: "", ecomGstin: "" };
    let  rowData18: B2CModel = { type: "", placeofsupply: "", rate: 0, applicabletaxrate: "", taxablevalue: 0, cessamount: "", ecomGstin: "" };
    let  rowData28: B2CModel = { type: "", placeofsupply: "", rate: 0, applicabletaxrate: "", taxablevalue: 0, cessamount: "", ecomGstin: "" };
    // rowData5.taxablevalue=0
    // rowData12.taxablevalue=0
    // rowData18.taxablevalue=0
    // rowData28.taxablevalue=0
    for(let i=0;i<this.summary.length;i++){

      if(this.summary[i].customer.customerGst=="" || !(this.summary[i].customer.customerGst)){
          //  let  rowData=new B2CModel();
          //rowData.gstin=this.summary[i].customer.customerGst
    //  rowData.type="OE"
    //  rowData.placeofsupply="09-"+this.summary[i].placeOfSupply;
       
          if(this.summary[i].taxable5!=0)
        { 
          rowData5.type="OE";
          rowData5.placeofsupply="09-"+this.summary[i].placeOfSupply;
          rowData5.rate=5;
          rowData5.applicabletaxrate="";
          rowData5.taxablevalue=Number(this.summary[i].taxable5)+Number(rowData5.taxablevalue)
          rowData5.cessamount=""
          rowData5.ecomGstin=""
        
        }
        if(this.summary[i].taxable12!=0)
        {
          
          rowData12.type="OE";
          rowData12.placeofsupply="09-"+this.summary[i].placeOfSupply;
          rowData12.rate=12;
          rowData12.applicabletaxrate="";
          rowData12.taxablevalue=Number(this.summary[i].taxable12)+Number(rowData12.taxablevalue)
          rowData12.cessamount=""
          rowData12.ecomGstin=""
         
        }
        if(this.summary[i].taxable18!=0)
        {
          rowData18.type="OE";
          rowData18.placeofsupply="09-"+this.summary[i].placeOfSupply;
          rowData18.rate=18;
          rowData18.applicabletaxrate="";
          rowData18.taxablevalue=Number(this.summary[i].taxable18)+Number(rowData18.taxablevalue)
          rowData18.cessamount=""
          rowData18.ecomGstin=""
        }
        if(this.summary[i].taxable28!=0)
        {
          rowData28.type="OE";
          rowData28.placeofsupply="09-"+this.summary[i].placeOfSupply;
          rowData28.rate=28;
          rowData28.applicabletaxrate="";
          rowData28.taxablevalue=Number(this.summary[i].taxable28)+Number(rowData28.taxablevalue)
          rowData28.cessamount=""
          rowData28.ecomGstin=""
        }
        
       
    }
  }
  if(rowData5.taxablevalue!=0 && (rowData5.taxablevalue))
  this.b2csummary.push(rowData5);
  if(rowData12.taxablevalue!=0 && (rowData12.taxablevalue))
  this.b2csummary.push(rowData12);
  if(rowData18.taxablevalue!=0 && (rowData18.taxablevalue))
  this.b2csummary.push(rowData18);
  if(rowData28.taxablevalue!=0 && (rowData28.taxablevalue))
  this.b2csummary.push(rowData28);
  
  console.log(this.b2csummary);  
  }
  generateB2BSummary()
  {

    for(let i=0;i<this.summary.length;i++){
      
        if(this.summary[i].customer.customerGst!="" && (this.summary[i].customer.customerGst)){
             let rowData: B2BModel = {
               gstin: this.summary[i].customer.customerGst,
               name: this.summary[i].customer.customerName,
               invoiceNumber: this.summary[i].invoiceNo,
               invoiceDate: this.converDateToDDMMMYYYY(this.summary[i].invoiceDate),
               invoiceValue: Number(this.summary[i].totalInvoiceValue.toFixed(0)),
               placeOfSupply: this.summary[i].customer.customerGst.slice(0,2) + "-" + ((this.summary[i].placeOfSupply && this.summary[i].placeOfSupply != undefined)?this.summary[i].placeOfSupply:"Uttar Pradesh"),
               reverseCharge: this.summary[i].reverseCharge,
               applicableTaxRate: "",
               invoiceType: "Regular B2B",
               eCommerceGstin: "",
               taxRate: 0,
               taxableValue: 0,
               cessAmount: 0
             };

             if(this.summary[i].taxable5!=0)
             { 
               let rowData: B2BModel = {
                 gstin: this.summary[i].customer.customerGst,
                 name: this.summary[i].customer.customerName,
                 invoiceNumber: this.summary[i].invoiceNo,
                 invoiceDate: this.converDateToDDMMMYYYY(this.summary[i].invoiceDate),
                 invoiceValue: Number(this.summary[i].totalInvoiceValue.toFixed(0)),
                 placeOfSupply: this.summary[i].customer.customerGst.slice(0,2) + "-" + ((this.summary[i].placeOfSupply && this.summary[i].placeOfSupply != undefined)?this.summary[i].placeOfSupply:"Uttar Pradesh"),
                 reverseCharge: this.summary[i].reverseCharge,
                 applicableTaxRate: "",
                 invoiceType: "Regular B2B",
                 eCommerceGstin: "",
                 taxRate: 5,
                 taxableValue: this.summary[i].taxable5,
                 cessAmount: 0
               };
               
               this.b2bsummary.push(rowData);
             }
          if(this.summary[i].taxable12!=0)
          {
            let rowData: B2BModel = {
              gstin: this.summary[i].customer.customerGst,
              name: this.summary[i].customer.customerName,
              invoiceNumber: this.summary[i].invoiceNo,
              invoiceDate: this.converDateToDDMMMYYYY(this.summary[i].invoiceDate),
              invoiceValue: Number(this.summary[i].totalInvoiceValue.toFixed(0)),
              placeOfSupply: this.summary[i].customer.customerGst.slice(0,2) + "-" + ((this.summary[i].placeOfSupply && this.summary[i].placeOfSupply != undefined)?this.summary[i].placeOfSupply:"Uttar Pradesh"),
              reverseCharge: this.summary[i].reverseCharge,
              applicableTaxRate: "",
              invoiceType: "Regular B2B",
              eCommerceGstin: "",
              taxRate: 12,
              taxableValue: this.summary[i].taxable12,
              cessAmount: 0
            };
          
            this.b2bsummary.push(rowData);
          }
          if(this.summary[i].taxable18!=0)
          {
            let rowData: B2BModel = {
              gstin: this.summary[i].customer.customerGst,
              name: this.summary[i].customer.customerName,
              invoiceNumber: this.summary[i].invoiceNo,
              invoiceDate: this.converDateToDDMMMYYYY(this.summary[i].invoiceDate),
              invoiceValue: Number(this.summary[i].totalInvoiceValue.toFixed(0)),
              placeOfSupply: this.summary[i].customer.customerGst.slice(0,2) + "-" + ((this.summary[i].placeOfSupply && this.summary[i].placeOfSupply != undefined)?this.summary[i].placeOfSupply:"Uttar Pradesh"),
              reverseCharge: this.summary[i].reverseCharge,
              applicableTaxRate: "",
              invoiceType: "Regular B2B",
              eCommerceGstin: "",
              taxRate: 18,
              taxableValue: this.summary[i].taxable18,
              cessAmount: 0
            };
          
            this.b2bsummary.push(rowData);
          }
          if(this.summary[i].taxable28!=0)
          {
            let rowData: B2BModel = {
              gstin: this.summary[i].customer.customerGst,
              name: this.summary[i].customer.customerName,
              invoiceNumber: this.summary[i].invoiceNo,
              invoiceDate: this.converDateToDDMMMYYYY(this.summary[i].invoiceDate),
              invoiceValue: Number(this.summary[i].totalInvoiceValue.toFixed(0)),
              placeOfSupply: this.summary[i].customer.customerGst.slice(0,2) + "-" + ((this.summary[i].placeOfSupply && this.summary[i].placeOfSupply != undefined)?this.summary[i].placeOfSupply:"Uttar Pradesh"),
              reverseCharge: this.summary[i].reverseCharge,
              applicableTaxRate: "",
              invoiceType: "Regular B2B",
              eCommerceGstin: "",
              taxRate: 28,
              taxableValue: this.summary[i].taxable28,
              cessAmount: 0
            };
          
            this.b2bsummary.push(rowData);
          }
          
         
      }
    }
    console.log(this.b2bsummary);  
  }

  converDateToDDMMMYYYY(datein:string):string
  {
    let convertedDate;
    let date=new Date(datein);
    let months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    convertedDate=date.getDate() + "-" +months[date.getMonth()] + "-" +date.getFullYear();
    return convertedDate;
  }
}
