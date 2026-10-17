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
  editingPurchaseId: string | null = null;
  searchValue: string = '';
  monthFilter: string = '';
  periodStart: string = '';
  periodEnd: string = '';
  sellerFilter: string = '';
  categoryFilter: string = '';

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
        this.filterPurchases();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loader.hide();
        console.error('Error fetching purchases', err);
      }
    });
  }

  searchPurchases(inputStr: string) {
    this.searchValue = inputStr;
    this.filterPurchases();
  }

  filterPurchases() {
    const search = this.searchValue.trim().toLowerCase();
    this.savedPurchases = this.purchases.filter(purchase => {
      const dateKey = this.getPurchaseDateKey(purchase.purchaseDate);
      const matchesSearch = !search ||
        (purchase.sellerName || '').toLowerCase().includes(search) ||
        (purchase.purchaseId || '').toLowerCase().includes(search) ||
        (purchase.invoiceNumber || '').toLowerCase().includes(search) ||
        (purchase.purchaseCategory || '').toLowerCase().includes(search);
      const matchesMonth = !this.monthFilter || dateKey?.startsWith(this.monthFilter);
      const matchesPeriodStart = !this.periodStart || (!!dateKey && dateKey >= this.periodStart);
      const matchesPeriodEnd = !this.periodEnd || (!!dateKey && dateKey <= this.periodEnd);
      const matchesSeller = !this.sellerFilter || purchase.sellerName === this.sellerFilter;
      const matchesCategory = !this.categoryFilter || purchase.purchaseCategory === this.categoryFilter;

      return matchesSearch && matchesMonth && matchesPeriodStart && matchesPeriodEnd &&
        matchesSeller && matchesCategory;
    });
  }

  private getPurchaseDateKey(purchaseDate?: string): string | null {
    if (!purchaseDate) return null;
    if (/^\d{4}-\d{2}-\d{2}/.test(purchaseDate)) return purchaseDate.slice(0, 10);

    const parsedDate = new Date(purchaseDate);
    if (Number.isNaN(parsedDate.getTime())) return null;
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get filteredAnalytics() {
    return this.savedPurchases.reduce<{
      invoiceValue: number;
      taxableValue: number;
      cgstAmount: number;
      sgstAmount: number;
      igstAmount: number;
      taxValue: number;
      categoryBreakdown: { category: string; invoiceValue: number }[];
    }>((totals, purchase) => {
      const invoiceValue = Number(purchase.totalInvoiceAmount) || 0;
      totals.invoiceValue += invoiceValue;
      totals.taxableValue += Number(purchase.totalTaxableAmount) || 0;
      totals.cgstAmount += Number(purchase.cgstAmount) || 0;
      totals.sgstAmount += Number(purchase.sgstAmount) || 0;
      totals.igstAmount += Number(purchase.igstAmount) || 0;
      totals.taxValue += (Number(purchase.cgstAmount) || 0) +
        (Number(purchase.sgstAmount) || 0) +
        (Number(purchase.igstAmount) || 0);
      const category = purchase.purchaseCategory || 'Uncategorized';
      const categoryTotal = totals.categoryBreakdown.find(item => item.category === category);
      if (categoryTotal) {
        categoryTotal.invoiceValue += invoiceValue;
      } else {
        totals.categoryBreakdown.push({ category, invoiceValue });
      }
      return totals;
    }, {
      invoiceValue: 0,
      taxableValue: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      taxValue: 0,
      categoryBreakdown: []
    });
  }

  showForm() {
    this.resetForm();
    this.editingPurchaseId = null;
    this.addPurchaseForm = true;
  }

  closeForm() {
    this.addPurchaseForm = false;
    this.editingPurchaseId = null;
    this.resetForm();
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
      (!this.selectedSeller && !this.editingPurchaseId) ||
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
      sellerId: this.selectedSeller?._id || this.selectedSeller?.id,
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
    const request = this.editingPurchaseId
      ? this.otherdataservice.updatePurchase({ ...payload, _id: this.editingPurchaseId })
      : this.otherdataservice.savePurchase(payload);
    request.subscribe({
      next: (res) => {
        this.loader.hide();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.editingPurchaseId ? 'Purchase updated' : 'Purchase saved'
        });
        this.addPurchaseForm = false;
        this.editingPurchaseId = null;
        this.getPurchases();
      },
      error: (err) => {
        this.loader.hide();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.editingPurchaseId ? 'Update failed' : 'Failed to save purchase'
        });
        console.error(err);
      }
    });
  }

  openEdit(entry: PurchaseModel) {
    this.resetForm();
    this.editingPurchaseId = entry._id || null;
    this.purchaseId = entry.purchaseId || '';
    this.invoiceNumber = entry.invoiceNumber || '';
    this.sellerName = entry.sellerName || '';
    this.selectedSeller = this.savedSellers.find(seller =>
      (seller._id && String(seller._id) === String(entry.sellerId)) || seller.sellerName === entry.sellerName
    ) || null;
    this.purchaseDate = this.getPurchaseDateKey(entry.purchaseDate) || '';
    this.purchaseCategory = entry.purchaseCategory || '';
    this.sgstAmount = Number(entry.sgstAmount) || 0;
    this.cgstAmount = Number(entry.cgstAmount) || 0;
    this.igstAmount = Number(entry.igstAmount) || 0;
    this.totalTaxableAmount = Number(entry.totalTaxableAmount) || 0;
    this.totalInvoiceAmount = Number(entry.totalInvoiceAmount) || 0;
    this.addPurchaseForm = true;
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
    this.monthFilter = '';
    this.periodStart = '';
    this.periodEnd = '';
    this.sellerFilter = '';
    this.categoryFilter = '';
    this.filterPurchases();
  }
}