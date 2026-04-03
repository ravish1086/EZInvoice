import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OtherdataService } from '../services/otherdata.service';
import { CustomerModel } from '../models/customer.model';
import { MessageService } from 'primeng/api';
import { Table, TableModule, SortableColumn, SortIcon } from 'primeng/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-openingbalances',
  templateUrl: './openingbalances.component.html',
  styleUrls: ['./openingbalances.component.css'],
  standalone: true,
  imports: [FormsModule, TableModule, ButtonModule, DialogModule, CommonModule]
})
export class OpeningbalancesComponent implements OnInit {
  addBalanceForm: boolean = false;
  openingBalances: any[] = [];
  savedCustomers: CustomerModel[] = [];
  displayData: any[] = [];
  
  // Form fields
  selectedCustomer: any = null;
  fy: string = this.getPreviousFinancialYear();
  balanceAmount: number | null = null;
  dateofReceipt: string = '';
  
  financialYears: string[] = ['23-24', '24-25', '25-26', '26-27', '27-28', '28-29', '29-30'];
  
  // Filters
  showAllHistory: boolean = false;
  searchValue: string = '';
  
  // Analytics
  totalOpeningBalance: number = 0;
  customersWithBalance: number = 0;
  averageBalance: number = 0;
  
  openingBalancesFetched: boolean = false;

  constructor(
    private otherdataservice: OtherdataService,
    private messageService: MessageService,
    private loader: NgxSpinnerService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getCustomers();
    this.getOpeningBalances();
  }

  getCustomers() {
    this.otherdataservice.getCustomerDetails().subscribe({
      next: (res) => {
        this.savedCustomers = res;
        this.otherdataservice.loadedCustomers = res;
        if (this.openingBalancesFetched) {
          this.buildDisplayData();
        }
      },
      error: (err) => {
        console.error('Error fetching customers', err);
      }
    });
  }

  getOpeningBalances() {
    this.loader.show();
    this.otherdataservice.fetchOpeningBalances('', this.showAllHistory).subscribe({
      next: (res) => {
        this.loader.hide();
        this.openingBalances = res;
        this.openingBalancesFetched = true;
        if (this.savedCustomers.length > 0) {
          this.buildDisplayData();
        } else if (this.savedCustomers.length === 0) {
          this.buildDisplayData(); // fallback if no customers
        }
        this.calculateAnalytics();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loader.hide();
        console.error('Error fetching opening balances', err);
      }
    });
  }

  buildDisplayData() {
    this.displayData = [];
    
    this.savedCustomers.forEach(customer => {
      const balancesForCustomer = this.openingBalances.filter(b => b.customerName === customer.customerName || b.customerId === (customer._id || customer.id));
      
      if (balancesForCustomer.length > 0) {
        balancesForCustomer.forEach(ob => {
          this.displayData.push({
            customerName: customer.customerName,
            customerId: customer._id || customer.id,
            fy: ob.fy,
            balanceAmount: ob.balanceAmount,
            _id: ob._id
          });
        });
      } else {
        // Show empty record for this customer
        this.displayData.push({
          customerName: customer.customerName,
          customerId: customer._id || customer.id,
          fy: this.getPreviousFinancialYear(),
          balanceAmount: null,
          _id: null
        });
      }
    });

    // Add any balances that don't match a current customer (e.g. deleted customers)
    this.openingBalances.forEach(ob => {
      if (!this.displayData.find(d => d._id === ob._id)) {
        this.displayData.push({
          customerName: ob.customerName,
          customerId: ob.customerId,
          fy: ob.fy,
          balanceAmount: ob.balanceAmount,
          _id: ob._id
        });
      }
    });
  }

  calculateAnalytics() {
    let validBalances = this.openingBalances.filter(b => b.balanceAmount > 0);
    this.totalOpeningBalance = validBalances.reduce((sum, item) => sum + (Number(item.balanceAmount) || 0), 0);
    this.customersWithBalance = validBalances.length;
    this.averageBalance = this.customersWithBalance > 0 ? this.totalOpeningBalance / this.customersWithBalance : 0;
  }

  toggleHistory() {
    this.showAllHistory = !this.showAllHistory;
    this.getOpeningBalances();
  }

  showForm() {
    this.addBalanceForm = !this.addBalanceForm;
    if (this.addBalanceForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.selectedCustomer = null;
    this.fy = this.getPreviousFinancialYear();
    this.balanceAmount = null;
    this.dateofReceipt = '';
  }

  getPreviousFinancialYear(): string {
    const todaysDate = new Date();
    if (todaysDate.getMonth() <= 2) {
      return `${(todaysDate.getFullYear() - 2).toString().slice(-2)}-${(todaysDate.getFullYear() - 1).toString().slice(-2)}`;
    } else {
      return `${(todaysDate.getFullYear() - 1).toString().slice(-2)}-${todaysDate.getFullYear().toString().slice(-2)}`;
    }
  }

  addOpeningBalance() {
    if (!this.selectedCustomer || this.balanceAmount === null) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill required fields' });
      return;
    }

    const payload = {
      customerId: this.selectedCustomer._id || this.selectedCustomer.id,
      customerName: this.selectedCustomer.customerName,
      fy: this.fy,
      dateofReceipt: this.dateofReceipt,
      balanceAmount: this.balanceAmount
    };

    this.loader.show();
    this.otherdataservice.saveOpeningBalance(payload).subscribe({
      next: (res) => {
        this.loader.hide();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Opening balance saved' });
        this.addBalanceForm = false;
        this.getOpeningBalances(); // refresh list
      },
      error: (err) => {
        this.loader.hide();
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save balance' });
        console.error(err);
      }
    });
  }

  toggleEdit(index: number) {
    let element1 = document.getElementsByClassName('editmode1') as HTMLCollectionOf<HTMLElement>;
    for (let i = index * 3; i < index * 3 + 3; i++) {
      if (element1[i]) element1[i].style.display = 'block';
    }
    let element2 = document.getElementsByClassName('editmode2') as HTMLCollectionOf<HTMLElement>;
    for (let j = index * 3; j < index * 3 + 3; j++) {
      if (element2[j]) element2[j].style.display = 'none';
    }
  }

  saveRecord(entry: any, index: number) {
    let element1 = document.getElementsByClassName('editmode1') as HTMLCollectionOf<HTMLElement>;
    for (let i = index * 3; i < index * 3 + 3; i++) {
      if (element1[i]) element1[i].style.display = 'none';
    }
    let element2 = document.getElementsByClassName('editmode2') as HTMLCollectionOf<HTMLElement>;
    for (let j = index * 3; j < index * 3 + 3; j++) {
      if (element2[j]) element2[j].style.display = 'block';
    }

    this.loader.show();
    
    if (entry._id) {
      this.otherdataservice.updateOpeningBalance(entry).subscribe({
        next: (res) => {
          this.loader.hide();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Opening balance updated' });
          this.getOpeningBalances();
        },
        error: (err) => {
          this.loader.hide();
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed' });
        }
      });
    } else {
      const payload = {
        customerId: entry.customerId,
        customerName: entry.customerName,
        fy: entry.fy,
        balanceAmount: entry.balanceAmount
      };
      this.otherdataservice.saveOpeningBalance(payload).subscribe({
        next: (res) => {
          this.loader.hide();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Opening balance saved' });
          this.getOpeningBalances();
        },
        error: (err) => {
          this.loader.hide();
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Save failed' });
        }
      });
    }
  }

  deleteRecord(entry: any) {
    if (!entry._id) return;
    if (confirm('Are you sure you want to delete this opening balance?')) {
      this.loader.show();
      this.otherdataservice.deleteOpeningBalance(entry._id).subscribe({
        next: (res) => {
          this.loader.hide();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Opening balance deleted' });
          this.getOpeningBalances();
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
