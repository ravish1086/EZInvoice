import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { SellerModel } from '../models/seller.model';
import { OtherdataService } from '../services/otherdata.service';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-seller-details',
  templateUrl: './seller-details.component.html',
  styleUrls: ['./seller-details.component.css'],
  standalone: true,
  imports: [TableModule, FormsModule, CommonModule, ButtonModule, DialogModule, ToastModule],
  providers: [MessageService]
})
export class SellerDetailsComponent implements OnInit {
  seller: SellerModel[] = [];
  data: any;
  savedSellers: SellerModel[] = [];
  isImport=false;
  addSellerForm: boolean = false;
  customerName: string = '';
  customerGst: string = '';
  customerPan: string = '';
  customerContact: string = '';
  customerAddress: string = '';
  customerCity: string = '';
  customerState: string = '';
  customerCountry: string = '';
  editingIndex: number | null = null;
  constructor(private otherdataservice:OtherdataService, private messageService: MessageService, private loader: NgxSpinnerService) { }

  ngOnInit(): void {
    this.getSellerDetails();
  }
  getSellerDetails()
  {
    this.loader.show();
    this.otherdataservice.getSellerDetails().subscribe({
      next : res=>
        {
          this.loader.hide();
          console.log(res);
          this.savedSellers = [];
          for(let i=0;i<res.length;i++)
          {
            let seller:SellerModel = {
                customerGst:res[i].customerGst,
            customerName:res[i].customerName,
            customerPan:res[i].customerPan,
            customerContact:res[i].customerContact,
            customerAddress:res[i].customerAddress,
            customerCity: res[i].customerCity || "",
            customerState: res[i].customerState || "",
            customerCountry: res[i].customerCountry || "",
            _id: res[i]._id
            };
            this.savedSellers.push(seller);
          }
          console.log(this.savedSellers);
          this.otherdataservice.loadedSeller=this.savedSellers;
        },
        error : err=>
        {
          this.loader.hide();
          console.log(err);
        }
    })
  }
  addSeller()
  {
    let seller: SellerModel = {
      customerName: this.customerName,
      customerGst: this.customerGst,
      customerPan: this.customerPan,
      customerContact: this.customerContact,
      customerAddress: this.customerAddress,
      customerCity: this.customerCity,
      customerState: this.customerState,
      customerCountry: this.customerCountry,
      _id: ''
    };
    this.loader.show();
    this.otherdataservice.saveSeller(seller).subscribe(res=>
      {
        this.loader.hide();
        console.log(res);
        if(res)
        {
          this.messageService.add({severity:'success', summary:'Success', detail:'Seller added successfully'});
          seller._id = res._id || res.id || '';
          this.savedSellers.push(seller);
          this.customerName = '';
          this.customerGst = '';
          this.customerPan = '';
          this.customerContact = '';
          this.customerAddress = '';
          this.customerCity = '';
          this.customerState = '';
          this.customerCountry = '';
          this.addSellerForm = false;
        }
      },
      err=>{
        this.loader.hide();
        this.messageService.add({severity:'error', summary:'Error', detail:'Unable to save seller details'});
      })
  }
  showForm()
  {
      this.addSellerForm=!this.addSellerForm;
  }
  editSeller(index:number)
  {
    this.editingIndex = index;
  }
  saveSellerRecord(entry:SellerModel, index:number)
  {
    this.loader.show();
    this.otherdataservice.updateSeller(entry).subscribe(res=>
      {
        this.loader.hide();
        console.log(res);
        if(res)
        {
          this.messageService.add({severity:'success', summary:'Success', detail:'Seller updated successfully'});
          this.editingIndex = null;
        }
      },
      err=>{
        this.loader.hide();
        this.messageService.add({severity:'error', summary:'Error', detail:'Unable to update seller details'});
      })
  }
  cancelEdit()
  {
    this.editingIndex = null;
    this.getSellerDetails();
  }
  deleteSeller(id: string | undefined, index:number)
  {
    if(!id || !confirm('Are you sure you want to delete this seller?')) return;
    this.loader.show();
    this.otherdataservice.deleteSeller(id).subscribe(res=>
      {
        this.loader.hide();
        console.log(res);
        if(res)
        {
          this.messageService.add({severity:'success', summary:'Success', detail:'Seller deleted successfully'});
          this.savedSellers.splice(index, 1);
        }
      },
      err=>{
        this.loader.hide();
        this.messageService.add({severity:'error', summary:'Error', detail:'Unable to delete seller details'});
      })
  }
  onFileChange(evt: any) {
    const target : DataTransfer =  <DataTransfer>(evt.target);
    
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const bstr: string = e.target.result;

      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      const wsname : string = wb.SheetNames[0];

      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      console.log(ws);

      this.data = (XLSX.utils.sheet_to_json(ws, { header: 1 }));

      console.log(this.data);

      let x = this.data.slice(1);
      console.log(x);
        for(let i=1;i<this.data.length;i++)
        {
          
          let seller:SellerModel = {
            customerGst:this.data[i][3],
          customerName:this.data[i][0],
          customerPan:this.data[i][1],
          customerContact:this.data[i][2],
          customerAddress:this.data[i][4],
          customerCity: "",
          customerState: "",
          customerCountry: ""
          };

          this.seller.push(seller);
        }
        console.log(this.seller);
        this.otherdataservice.exportSellerData(this.seller).subscribe((res)=>
        {
          console.log(res);
        })
    };

    reader.readAsBinaryString(target.files[0]);
  }
}
