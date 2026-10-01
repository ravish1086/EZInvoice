import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OtherdataService } from '../services/otherdata.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PaymentAnalytics {
  _id: string;
  fy: string;
  gst: string;
  customerName: string;
  dateofReceipt: string;
  amountReceived: number;
  modeofPayment: string;
  paymentDetails: string;
  isActive: number;
  customerId: string;
}

interface CustomerSummary {
  customerName: string;
  totalReceived: number;
  paymentCount: number;
  lastPaymentDate: string;
}

interface ModeSummary {
  mode: string;
  count: number;
  totalAmount: number;
}

interface MonthlySummary {
  month: string;
  amount: number;
  count: number;
}

@Component({
  selector: 'app-payment-analytics',
  templateUrl: './payment-analytics.component.html',
  styleUrls: ['./payment-analytics.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PaymentAnalyticsComponent implements OnInit {
  payments: PaymentAnalytics[] = [];
  filteredPayments: PaymentAnalytics[] = [];
  customerSummary: CustomerSummary[] = [];
  modeSummary: ModeSummary[] = [];
  monthlySummary: MonthlySummary[] = [];

  totalPaymentsReceived: number = 0;
  totalTransactions: number = 0;
  avgPaymentValue: number = 0;
  uniqueCustomers: number = 0;

  filterCustomer: string = 'all';
  filterMode: string = 'all';
  filterFY: string = 'all';
  customerList: any[] = [];
  fyList: string[] = [];

  loading: boolean = true;
  maxMonthlyAmount: number = 0;

  constructor(
    private otherdataService: OtherdataService,
    private spinner: NgxSpinnerService,
    private messageService: MessageService,
    private cdk:ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPaymentAnalytics();
  }

  loadPaymentAnalytics() {
    this.spinner.show();
    this.loading = true;

    this.otherdataService.fetchPaymentDetails().subscribe({
      next: (res: any[]) => {
        this.payments = res.filter((p: any) => p.isActive !== 0 && p.amountReceived > 0);
        this.processAnalyticsData();
        this.cdk.markForCheck();
        this.spinner.hide();
        this.loading = false;
      },
      error: (err) => {
        this.spinner.hide();
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load payment analytics.' });
        console.error('Error loading payment analytics:', err);
      }
    });

    this.otherdataService.getCustomerDetails().subscribe({
      next: (res: any[]) => {
        this.customerList = res;
      },
      error: (err) => {
        console.error('Error loading customers:', err);
      }
    });
  }

  processAnalyticsData() {
    // Basic metrics
    this.totalPaymentsReceived = this.payments.reduce((sum, p) => sum + Number(p.amountReceived || 0), 0);
    this.totalTransactions = this.payments.length;
    this.avgPaymentValue = this.totalTransactions > 0 ? this.totalPaymentsReceived / this.totalTransactions : 0;
    this.uniqueCustomers = new Set(this.payments.map(p => p.customerId)).size;

    // Unique FY list
    const fySet = new Set(this.payments.map(p => p.fy).filter(Boolean));
    this.fyList = Array.from(fySet).sort().reverse();

    // Customer summary
    const customerMap = new Map<string, CustomerSummary>();
    this.payments.forEach(p => {
      const key = p.customerId || p.customerName;
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          customerName: p.customerName,
          totalReceived: 0,
          paymentCount: 0,
          lastPaymentDate: ''
        });
      }
      const entry = customerMap.get(key)!;
      entry.totalReceived += Number(p.amountReceived || 0);
      entry.paymentCount += 1;
      if (p.dateofReceipt && (!entry.lastPaymentDate || new Date(p.dateofReceipt) > new Date(entry.lastPaymentDate))) {
        entry.lastPaymentDate = p.dateofReceipt;
      }
    });
    this.customerSummary = Array.from(customerMap.values())
      .sort((a, b) => b.totalReceived - a.totalReceived);

    // Mode summary
    const modeMap = new Map<string, ModeSummary>();
    this.payments.forEach(p => {
      const mode = p.modeofPayment || 'Unknown';
      if (!modeMap.has(mode)) {
        modeMap.set(mode, { mode, count: 0, totalAmount: 0 });
      }
      const entry = modeMap.get(mode)!;
      entry.count += 1;
      entry.totalAmount += Number(p.amountReceived || 0);
    });
    this.modeSummary = Array.from(modeMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount);

    // Monthly summary (last 12 months)
    const monthlyMap = new Map<string, { amount: number; count: number }>();
    this.payments.forEach(p => {
      const d = new Date(p.dateofReceipt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap.has(key)) monthlyMap.set(key, { amount: 0, count: 0 });
      monthlyMap.get(key)!.amount += Number(p.amountReceived || 0);
      monthlyMap.get(key)!.count += 1;
    });

    const now = new Date();
    this.monthlySummary = [];
    for (let i = 11; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      const monthName = dt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const data = monthlyMap.get(key) || { amount: 0, count: 0 };
      this.monthlySummary.push({ month: monthName, amount: data.amount, count: data.count });
    }
    this.maxMonthlyAmount = this.monthlySummary.length > 0
      ? Math.max(...this.monthlySummary.map(m => m.amount))
      : 0;

    this.applyFilters();
  }

  applyFilters() {
    this.filteredPayments = this.payments.filter(p => {
      if (this.filterCustomer !== 'all' && p.customerId !== this.filterCustomer) return false;
      if (this.filterMode !== 'all' && p.modeofPayment !== this.filterMode) return false;
      if (this.filterFY !== 'all' && p.fy !== this.filterFY) return false;
      return true;
    });
  }

  onFilterChange() {
    this.applyFilters();
  }

  getBarHeight(amount: number): number {
    if (!this.maxMonthlyAmount || amount <= 0) return 0;
    return (amount / this.maxMonthlyAmount) * 100;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getModeColor(mode: string): string {
    const m = mode.toLowerCase();
    if (m === 'online' || m === 'upi') return '#3b82f6';
    if (m === 'cheque') return '#f59e0b';
    if (m === 'cash') return '#10b981';
    return '#6b7280';
  }

  getModeIcon(mode: string): string {
    const m = mode.toLowerCase();
    if (m === 'online' || m === 'upi') return 'pi-phone';
    if (m === 'cheque') return 'pi-file';
    if (m === 'cash') return 'pi-money-bill';
    return 'pi-circle';
  }
}