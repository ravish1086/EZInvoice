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
  invoiceNumber: string = '';
  selectedSeller: any = null;
  sellerName: string = '';
  purchaseDate: string = '';
  purchaseCategory: string = '';
  purchaseCategories = ['Film', 'Inks/Chemicals/Others Related', 'For Office Use'];
  sgstAmount: number | null = null;
  cgstAmount: number | null = null;
  igstAmount: number | null = null;
  totalTaxableAmount: number | null = null;
  totalInvoiceAmount: number | null = null;

  get isIntrastateSupply(): boolean {
    const sellerStateCode = this.selectedSeller?.sellerGst?.slice(0, 2);
    const companyStateCode = this.otherdataservice.appConfig?.companyGSTIN?.slice(0, 2);
    return !!sellerStateCode && !!companyStateCode && sellerStateCode === companyStateCode;
  }

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
      (p.purchaseId || '').toLowerCase().includes(inputStr.toLowerCase()) ||
      (p.invoiceNumber || '').toLowerCase().includes(inputStr.toLowerCase()) ||
      (p.purchaseCategory || '').toLowerCase().includes(inputStr.toLowerCase())
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
    this.invoiceNumber = '';
    this.selectedSeller = null;
    this.sellerName = '';
    this.purchaseDate = '';
    this.purchaseCategory = '';
    this.sgstAmount = null;
    this.cgstAmount = null;
    this.igstAmount = null;
    this.totalTaxableAmount = null;
    this.totalInvoiceAmount = null;
  }

  onSellerChange() {
    this.sellerName = this.selectedSeller ? this.selectedSeller.sellerName : '';
    this.sgstAmount = null;
    this.cgstAmount = null;
  }

  savePurchase() {
    if (
      !this.selectedSeller ||
      !this.invoiceNumber.trim() ||
      (this.isIntrastateSupply && (this.cgstAmount === null || this.sgstAmount === null)) ||
      (!this.isIntrastateSupply && this.igstAmount === null) ||
      !this.purchaseCategory ||
      this.totalTaxableAmount === null ||
      this.totalInvoiceAmount === null
    ) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill all required fields' });
      return;
    }

    const payload: any = {
      sellerId: this.selectedSeller._id || this.selectedSeller.id,
      invoiceNumber: this.invoiceNumber.trim(),
      sellerName: this.sellerName,
      purchaseDate: this.purchaseDate,
      purchaseCategory: this.purchaseCategory,
      sgstAmount: this.isIntrastateSupply ? this.sgstAmount : 0,
      cgstAmount: this.isIntrastateSupply ? this.cgstAmount : 0,
      igstAmount: this.isIntrastateSupply ? 0 : this.igstAmount,
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
    for (let i = index * 9; i < index * 9 + 9; i++) {
      if (element1[i]) element1[i].style.display = 'block';
    }
    let element2 = document.getElementsByClassName('editmode2') as HTMLCollectionOf<HTMLElement>;
    for (let j = index * 9; j < index * 9 + 9; j++) {
      if (element2[j]) element2[j].style.display = 'none';
    }
  }

  saveRecord(entry: any, index: number) {
    let element1 = document.getElementsByClassName('editmode1') as HTMLCollectionOf<HTMLElement>;
    for (let i = index * 9; i < index * 9 + 9; i++) {
      if (element1[i]) element1[i].style.display = 'none';
    }
    let element2 = document.getElementsByClassName('editmode2') as HTMLCollectionOf<HTMLElement>;
    for (let j = index * 9; j < index * 9 + 9; j++) {
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