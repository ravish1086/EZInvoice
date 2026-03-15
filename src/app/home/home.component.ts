
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductDetails } from '../models/product.model';
import { SellerModel } from '../models/seller.model';
import { OtherdataService } from '../services/otherdata.service';
import { StockService } from '../services/stock.service';
import { InvoiceService } from '../services/invoice.service';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [TableModule, FormsModule, CommonModule, ReactiveFormsModule, DialogModule]
})
export class HomeComponent implements OnInit {
  selectedProductId: number | null = null;
  selectedProductQuantity: number | null = null;
  products:ProductDetails[]=[];
  sellers:SellerModel[]=[];
  savedProducts:ProductDetails[]=[];
  savedSellers:SellerModel[]=[];
  stockentryreq=  { 
    "invoiceNum": "",
    "purchasedFrom": "",
    "productName": "",
    "datePurchase": "",
    "quantity": "",
    "unit": "",
    "rate": "",
    "amount": ""
  };



  productForm=new FormGroup({
    invoiceNum:new FormControl(),
    purchasedFrom:new FormControl(),
    productName:new FormControl(),
   
    datePurchase:new FormControl(),
    quantity:new FormControl(),
    unit:new FormControl(),
    rate:new FormControl(),
    amount:new FormControl()
  
  });

  showStockEntryModal = false;

      constructor(private stockservice:StockService,private otherdataservice:OtherdataService, private invoiceService:InvoiceService)
    {
     
    }
    populateFields(productName: any)
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
          // let productIndex=j
          this.selectedProductId=this.products[j].id
          this.selectedProductQuantity=this.products[j].inStock
         
          this.productForm.controls['unit'].setValue(this.products[j].productUnit)
          this.productForm.controls['rate'].setValue(this.products[j].productPrice)
         console.log(this.productForm.controls['productName'].value)
  console.log(productName)
  console.log(this.selectedProductId)
  console.log(this.selectedProductQuantity)
  return;
        }
      }
    }
      ngOnInit()
      {
        this.getSavedProducts();
        this.getSellerDetails();
        // this.getTotalValueOfInvoiceAndReceivedAmount();
        this.getNetTotalForEachCustomer();
        // if(this.otherdataservice.loadedProducts.length>0){
        //   this.products=this.otherdataservice.loadedProducts;
        //   }
        //   else{
        //       this.getSavedProducts();
        //   }
          // if(this.otherdataservice.loadedSeller.length>0){
          // this.sellers=this.otherdataservice.loadedSeller;      
          // }
          //   else{
          //    this.getSellerDetails();
          // }
      }
      mapSelectedProduct()
      {
       
        let productName=(this.productForm.controls['productName'].value);
        // let productIndex=(this.productForm.controls['productName'].value).split('_arr_')[1];
        // this.selectedProductId=(this.productForm.controls['productName'].value).split('_arr_')[2]
      this.populateFields(productName)

      }
      onSubmit()
      {
        this.setReqData();
        console.log(this.stockentryreq);
        try{
          this.stockservice.addEntry(this.stockentryreq).subscribe((res)=>
          {
            console.log(res);
            if(res)
            {
              this.stockservice.updateStock(
                {
                  "inStock":(Number(this.stockentryreq.quantity)+(this.selectedProductQuantity?this.selectedProductQuantity:0))
                }
              ).subscribe(response=>
                {
                  alert("Details Added Successfully")
                  console.log(response)
                  // Reset form
                  this.productForm.reset();
                  this.selectedProductId = null;
                  this.selectedProductQuantity = null;
                  // Close modal
                  this.showStockEntryModal = false;
                })
            }
          },error=>
          {
            console.log(error);
          });
        }
        catch(e)
        {
          console.log(e);
        }
      } 
      setReqData()
      {
        this.stockentryreq.invoiceNum=String(this.productForm.value.invoiceNum);
        this.stockentryreq.purchasedFrom=String(this.productForm.value.purchasedFrom);
        this.stockentryreq.productName=String(this.productForm.value.productName).split('_')[0];
        this.stockentryreq.datePurchase=String(this.productForm.value.datePurchase);
        this.stockentryreq.quantity=String(this.productForm.value.quantity);
        this.stockentryreq.unit=String(this.productForm.value.unit);
        this.stockentryreq.rate=String(this.productForm.value.rate);
        this.stockentryreq.amount=String(this.productForm.value.amount);
      }

      getSavedProducts()
      {
        this.otherdataservice.getProductDetails().subscribe(res=>
          {
            console.log(res);
            for(let i=0;i<res.length;i++)
            {
              let product: ProductDetails = {
                inStock: res[i].inStock,
                id: res[i].id,
                productName: res[i].productName,
                productHsn: res[i].productHsn,
                productPrice: Number(res[i].productPrice),
                productTaxRate: Number(res[i].productTaxRate),
                productUnit: res[i].productUnit
              };
              this.savedProducts.push(product);
            }
            this.products=this.savedProducts;
            this.otherdataservice.loadedProducts=this.savedProducts;
          })
      }

      getSellerDetails()
      {
        this.otherdataservice.getSellerDetails().subscribe(res=>
          {
            console.log(res);
              for(let i=0;i<res.length;i++)
              {
                let seller: SellerModel = {
                  sellerGst: res[i].sellerGst,
                  sellerName: res[i].sellerName,
                  sellerPan: res[i].sellerPan,
                  sellerContact: res[i].sellerContact,
                  sellerAddress: res[i].sellerAddress
                };
                this.savedSellers.push(seller);
              }
              
             this.sellers=this.savedSellers
              console.log(this.savedSellers);
              this.otherdataservice.loadedSeller=this.savedSellers;
          })
      }

      dashboardData:any = {};
      getTotalValueOfInvoiceAndReceivedAmount(){
          this.invoiceService.getTotalValueOfInvoiceAndReceivedAmount().subscribe((res)=>{
            this.dashboardData = {...res}
            console.log(res);
          })
      }

      NetTotalForEachCustomer: any[] = [];
      getNetTotalForEachCustomer(){
        this.invoiceService.getTotalValueOfInvoiceAndReceivedAmount().subscribe((res:any)=>{
          this.NetTotalForEachCustomer = res;
          console.log(res);
        })
      }

      openStockEntryModal(){
        this.showStockEntryModal = true;
      }

      closeStockEntryModal(){
        this.showStockEntryModal = false;
        this.productForm.reset();
      }
}
