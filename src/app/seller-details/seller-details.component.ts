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
  sellerName: string = '';
  sellerGst: string = '';
  sellerPan: string = '';
  sellerContact: string = '';
  sellerAddress: string = '';
  sellerCity: string = '';
  sellerState: string = '';
  sellerCountry: string = '';
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
                sellerGst:res[i].sellerGst,
            sellerName:res[i].sellerName,
            sellerPan:res[i].sellerPan,
            sellerContact:res[i].sellerContact,
            sellerAddress:res[i].sellerAddress,
            sellerCity: res[i].sellerCity || "",
            sellerState: res[i].sellerState || "",
            sellerCountry: res[i].sellerCountry || "",
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
      sellerName: this.sellerName,
      sellerGst: this.sellerGst,
      sellerPan: this.sellerPan,
      sellerContact: this.sellerContact,
      sellerAddress: this.sellerAddress,
      sellerCity: this.sellerCity,
      sellerState: this.sellerState,
      sellerCountry: this.sellerCountry,
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
          this.sellerName = '';
          this.sellerGst = '';
          this.sellerPan = '';
          this.sellerContact = '';
          this.sellerAddress = '';
          this.sellerCity = '';
          this.sellerState = '';
          this.sellerCountry = '';
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
   
  }
}
