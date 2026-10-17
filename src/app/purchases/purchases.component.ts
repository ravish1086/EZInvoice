import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OtherdataService } from '../services/otherdata.service';
import { SellerModel } from '../models/seller.model';
import { PurchaseModel } from '../models/purchase.model';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.css'],
  standalone: true,
  imports: [TableModule, FormsModule, CommonModule, CurrencyPipe, ButtonModule, DialogModule]
})
export class PurchasesComponent implements OnInit {
  purchases: PurchaseModel[] = [];
  savedPurchases: PurchaseModel[] = [];
  savedSellers: SellerModel[] = [];
  addPurchaseForm: boolean = false;
  searchValue: string = '';

  // Form fields
  purchaseId: string = '';
  selectedSeller: any = null;
  sellerName: string = '';
  purchaseDate: string = '';
  sgstAmount: number | null = null;
  cgstAmount: number | null = null;
  igstAmount: number | null = null;
  totalTaxableAmount: number | null = null;
  totalInvoiceAmount: number | null = null;

  constructor(
    private otherdataservice: OtherdataService,
    private messageService: MessageService,
    private loader: NgxSpinnerService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getSellers();
    this.getPurchases();
  }

  getSellers() {
    this.otherdataservice.getSellerDetails().subscribe({
      next: (res) => {
        this.savedSellers = res;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching sellers', err);
      }
    });
  }

  getPurchases() {
    this.loader.show();
    this.otherdataservice.getAllPurchases().subscribe({
      next: (res) => {
        this.loader.hide();
        this.purchases = res;
        this.savedPurchases = res;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loader.hide();
        console.error('Error fetching purchases', err);
      }
    });
  }

  searchPurchases(inputStr: string) {
    this.savedPurchases = this.purchases.filter(p =>
      (p.sellerName || '').toLowerCase().includes(inputStr.toLowerCase()) ||
      (p.purchaseId || '').toLowerCase().includes(inputStr.toLowerCase())
    );
  }

  showForm() {
    this.addPurchaseForm = !this.addPurchaseForm;
    if (this.addPurchaseForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.purchaseId = '';
    this.selectedSeller = null;
    this.sellerName = '';
    this.purchaseDate = '';
    this.sgstAmount = null;
    this.cgstAmount = null;
    this.igstAmount = null;
    this.totalTaxableAmount = null;
    this.totalInvoiceAmount = null;
  }

  onSellerChange() {
    this.sellerName = this.selectedSeller ? this.selectedSeller.sellerName : '';
  }

  savePurchase() {
    if (!this.selectedSeller || this.sgstAmount === null || this.cgstAmount === null || this.igstAmount === null || this.totalTaxableAmount === null || this.totalInvoiceAmount === null) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill all required fields' });
      return;
    }

    const payload: any = {
      sellerId: this.selectedSeller._id || this.selectedSeller.id,
      sellerName: this.sellerName,
      purchaseDate: this.purchaseDate,
      sgstAmount: this.sgstAmount,
      cgstAmount: this.cgstAmount,
      igstAmount: this.igstAmount,
      totalTaxableAmount: this.totalTaxableAmount,
      totalInvoiceAmount: this.totalInvoiceAmount
    };
    if (this.purchaseId) {
      payload.purchaseId = this.purchaseId;
    }

    this.loader.show();
    this.otherdataservice.savePurchase(payload).subscribe({
      next: (res) => {
        this.loader.hide();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Purchase saved' });
        this.addPurchaseForm = false;
        this.getPurchases();
      },
      error: (err) => {
        this.loader.hide();
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save purchase' });
        console.error(err);
      }
    });
  }

  toggleEdit(index: number) {
    let element1 = document.getElementsByClassName('editmode1') as HTMLCollectionOf<HTMLElement>;
    for (let i = index * 4; i < index * 4 + 4; i++) {
      if (element1[i]) element1[i].style.display = 'block';
    }
    let element2 = document.getElementsByClassName('editmode2') as HTMLCollectionOf<HTMLElement>;
    for (let j = index * 4; j < index * 4 + 4; j++) {
      if (element2[j]) element2[j].style.display = 'none';
    }
  }

  saveRecord(entry: any, index: number) {
    let element1 = document.getElementsByClassName('editmode1') as HTMLCollectionOf<HTMLElement>;
    for (let i = index * 4; i < index * 4 + 4; i++) {
      if (element1[i]) element1[i].style.display = 'none';
    }
    let element2 = document.getElementsByClassName('editmode2') as HTMLCollectionOf<HTMLElement>;
    for (let j = index * 4; j < index * 4 + 4; j++) {
      if (element2[j]) element2[j].style.display = 'block';
    }

    this.loader.show();
    this.otherdataservice.updatePurchase(entry).subscribe({
      next: (res) => {
        this.loader.hide();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Purchase updated' });
        this.getPurchases();
      },
      error: (err) => {
        this.loader.hide();
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed' });
      }
    });
  }

  deleteRecord(entry: any) {
    if (!entry._id) return;
    if (confirm('Are you sure you want to delete this purchase?')) {
      this.loader.show();
      this.otherdataservice.deletePurchase(entry._id).subscribe({
        next: (res) => {
          this.loader.hide();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Purchase deleted' });
          this.getPurchases();
        },
        error: (err) => {
          this.loader.hide();
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' });
        }
      });
    }
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = '';
  }
}