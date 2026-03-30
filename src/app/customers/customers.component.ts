import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CustomerModel } from '../models/customer.model';
import { OtherdataService } from '../services/otherdata.service';
import * as XLSX from 'xlsx';
import { GSTPrefixes } from '../models/gstPrefix.model';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css'],
  standalone: true,
  imports: [FormsModule, TableModule, ButtonModule, DialogModule, CommonModule]
})
export class CustomersComponent implements OnInit {
  name: string = '';
  gst: string = '';
  pan: string = '';
  contact: string = '';
  address: string = '';
  shopno: string = '';
  area: string = '';
  city: string = '';
  state: string = '';
  country: string = '';
  attachment: any;
  addCustomerForm: boolean = false;
  customers: CustomerModel[] = [];
  data: any;
  savedCustomers: CustomerModel[] = [];
  isImport: boolean = true;
  
  constructor(
    private otherdataservice: OtherdataService, 
    private messageService: MessageService, 
    private loader: NgxSpinnerService, private cdr:ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getcustomerDetails();
  }
  searchCustomer(inputStr:string)
  {
    this.savedCustomers=this.otherdataservice.loadedCustomers
    this.savedCustomers=this.savedCustomers.filter(product=> (product.customerName).toLowerCase().includes((inputStr).toLowerCase()) )
    
  }
  addCustomer()
  {
    let customer: CustomerModel = {
      customerName: this.name,
      customerGst: this.gst,
      customerPan: this.pan,
      customerContact: this.contact,
      customerAddress: this.address,
      customershopNo: this.shopno,
      customerArea: this.area,
      customerCity: this.city,
      customerState: this.state,
      customerCountry: this.country,
      id: 0 // Will be set by backend
    };
    this.otherdataservice.addCustomerToDb(customer).subscribe(res=>
      {
        console.log(res);
        if((res))
        {
          alert("Customer has been added Successfully");
          customer._id = res._id || res.id;
          customer.id = res.id || res._id;
          this.savedCustomers.push(customer)
          // Reset form
          this.name = '';
          this.gst = '';
          this.pan = '';
          this.contact = '';
          this.address = '';
          this.shopno = '';
          this.area = '';
          this.city = '';
          this.state = '';
          this.country = '';
          // Close dialog
          this.addCustomerForm = false;
        }
      })
  }
  showForm()
  {
      this.addCustomerForm=!this.addCustomerForm;
  }
  getcustomerDetails()
  {
    this.loader.show();
    this.otherdataservice.getCustomerDetails().subscribe({
      next : res=>
        {
          this.loader.hide();
          console.log(res);
            for(let i=0;i<res.length;i++)
            {
              let customer: CustomerModel = {
                _id: res[i]._id,
                customerGst: res[i].customerGst,
                customerName: res[i].customerName,
                customerPan: res[i].customerPan,
                customerContact: res[i].customerContact,
                customerCity: res[i].customerCity,
                customerState: res[i].customerState,
                customerCountry: res[i].customerCountry,
                customerAddress: res[i].customerAddress,
                id: res[i].id,
                customershopNo: res[i].customershopNo || "",
                customerArea: res[i].customerArea || ""
              };
              this.savedCustomers.push(customer);
            }
            
           
            console.log(this.savedCustomers);
            this.otherdataservice.loadedCustomers=this.savedCustomers;
            this.cdr.markForCheck();
        },
        error : err=>
        {
          this.loader.hide();
          console.log(err);
        }

    })
  }
  onFileChange(evt: any) {
    const target : DataTransfer =  <DataTransfer>(evt.target);
    
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    let formData = new FormData();
    formData.append("file", evt.target.files[0])
    this.otherdataservice.importCustomerData(formData).subscribe({
      next:  (response)=>{
        if(!response.status)
          this.messageService.add({severity : 'error', detail: response.message, summary : 'Error'})
        else
        this.messageService.add({severity : 'success', detail: response.message, summary : 'Success'})

        this.attachment = null;
        console.log(response)
      }
    })

    return;
   
}

toggleEdit(index:number)
{
 // Desktop edit mode
 let  element1 = document.getElementsByClassName('editmode1') as HTMLCollectionOf<HTMLElement>
 for(let i=index*5;i<index*5+5;i++)
 {
  if(element1[i]) {
    element1[i].style.display='block';
  }
 }
 let  element2 = document.getElementsByClassName('editmode2') as HTMLCollectionOf<HTMLElement>
 for(let j=index*5;j<index*5+5;j++)
 {
  if(element2[j]) {
    element2[j].style.display='none';
  }
 }
 
 // Mobile edit mode
 let  element1Mobile = document.getElementsByClassName('editmode1-mobile') as HTMLCollectionOf<HTMLElement>
 for(let i=index*5;i<index*5+5;i++)
 {
  if(element1Mobile[i]) {
    element1Mobile[i].style.display='block';
  }
 }
 let  element2Mobile = document.getElementsByClassName('editmode2-mobile') as HTMLCollectionOf<HTMLElement>
 for(let j=index*5;j<index*5+5;j++)
 {
  if(element2Mobile[j]) {
    element2Mobile[j].style.display='none';
  }
 }
 
}
SaveRecords(entry:any,index:number)
{
  // Desktop edit mode
  let  element1 = document.getElementsByClassName('editmode1') as HTMLCollectionOf<HTMLElement>
  for(let i=index*5;i<index*5+5;i++)
  {
    if(element1[i]) {
      element1[i].style.display='none';
    }
  }

  let  element2 = document.getElementsByClassName('editmode2') as HTMLCollectionOf<HTMLElement>
  for(let j=index*5;j<index*5+5;j++)
  {
    if(element2[j]) {
      element2[j].style.display='block';
    }
  }
  
  // Mobile edit mode
  let  element1Mobile = document.getElementsByClassName('editmode1-mobile') as HTMLCollectionOf<HTMLElement>
  for(let i=index*5;i<index*5+5;i++)
  {
    if(element1Mobile[i]) {
      element1Mobile[i].style.display='none';
    }
  }

  let  element2Mobile = document.getElementsByClassName('editmode2-mobile') as HTMLCollectionOf<HTMLElement>
  for(let j=index*5;j<index*5+5;j++)
  {
    if(element2Mobile[j]) {
      element2Mobile[j].style.display='block';
    }
  }
  
  this.otherdataservice.saveCustomer(entry,entry._id).subscribe(res=>
    {
      console.log(res);
    })
 
}

updateState(){
  if(this.gst.length==15){
    let stateCode:string = this.gst.slice(0,2);
    this.state = GSTPrefixes[stateCode];
    this.pan = this.gst.slice(2,12)
  }
}

  searchValue: string = '';
  clear(table: Table) {
    table.clear();
    this.searchValue = ''
}
}
