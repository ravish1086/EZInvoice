import { Component, OnInit } from '@angular/core';
import { InvoiceService } from '../services/invoice.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface SalesData {
  date: string;
  amount: number;
  count: number;
}

interface CustomerData {
  name: string;
  totalAmount: number;
  invoiceCount: number;
}

interface ProductData {
  name: string;
  totalAmount: number;
  quantity: number;
}

interface TaxSummary {
  rate: string;
  taxableValue: number;
  taxAmount: number;
}

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css'],
  standalone: true,
  imports: [TableModule, FormsModule, CommonModule]
})
export class AnalyticsComponent implements OnInit {
  salesData: SalesData[] = [];
  customerData: CustomerData[] = [];
  productData: ProductData[] = [];
  taxSummary: TaxSummary[] = [];
  
  totalRevenue: number = 0;
  totalInvoices: number = 0;
  totalCustomers: number = 0;
  avgInvoiceValue: number = 0;
  
  startDate: Date | undefined;
  endDate: Date | undefined;
  
  loading: boolean = true;
  maxSalesAmount: number = 0;
  maxTaxAmount: number = 0;

  constructor(
    private invoiceService: InvoiceService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  async loadAnalyticsData() {
    this.spinner.show();
    this.loading = true;
    
    try {
      const invoices = await this.invoiceService.getAllInvoicesDetails().toPromise();
      this.processAnalyticsData(invoices || []);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      this.spinner.hide();
      this.loading = false;
    }
  }

  processAnalyticsData(invoices: any[]) {
    // Calculate basic metrics
    this.totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalInvoiceValue, 0);
    this.totalInvoices = invoices.length;
    this.totalCustomers = new Set(invoices.map(inv => inv.customer.customerGst)).size;
    this.avgInvoiceValue = this.totalInvoices > 0 ? this.totalRevenue / this.totalInvoices : 0;

    // Sales over time (last 12 months)
    this.calculateSalesOverTime(invoices);

    // Top customers
    this.calculateTopCustomers(invoices);

    // Top products
    this.calculateTopProducts(invoices);

    // Tax summary
    this.calculateTaxSummary(invoices);

    // Derived values for template-safe calculations
    this.updateDerivedMaxValues();
  }

  updateDerivedMaxValues() {
    this.maxSalesAmount = this.salesData.length > 0
      ? Math.max(...this.salesData.map(s => s.amount))
      : 0;

    this.maxTaxAmount = this.taxSummary.length > 0
      ? Math.max(...this.taxSummary.map(t => t.taxAmount))
      : 0;
  }

  getBarHeight(amount: number): number {
    if (!this.maxSalesAmount) {
      return 0;
    }

    return (amount / this.maxSalesAmount) * 100;
  }

  calculateSalesOverTime(invoices: any[]) {
    const monthlySales = new Map<string, { amount: number; count: number }>();
    
    invoices.forEach(inv => {
      const date = new Date(inv.invoiceDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlySales.has(monthKey)) {
        monthlySales.set(monthKey, { amount: 0, count: 0 });
      }
      
      const data = monthlySales.get(monthKey)!;
      data.amount += inv.totalInvoiceValue;
      data.count += 1;
    });

    // Get last 12 months
    const now = new Date();
    this.salesData = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const data = monthlySales.get(monthKey) || { amount: 0, count: 0 };
      this.salesData.push({
        date: monthName,
        amount: data.amount,
        count: data.count
      });
    }
  }

  calculateTopCustomers(invoices: any[]) {
    const customerMap = new Map<string, { name: string; totalAmount: number; invoiceCount: number }>();
    
    invoices.forEach(inv => {
      const gstin = inv.customer.customerGst || 'Unknown';
      const name = inv.customer.customerName || 'Unknown Customer';
      
      if (!customerMap.has(gstin)) {
        customerMap.set(gstin, { name, totalAmount: 0, invoiceCount: 0 });
      }
      
      const customer = customerMap.get(gstin)!;
      customer.totalAmount += inv.totalInvoiceValue;
      customer.invoiceCount += 1;
    });

    this.customerData = Array.from(customerMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);
  }

  calculateTopProducts(invoices: any[]) {
    const productMap = new Map<string, { name: string; totalAmount: number; quantity: number }>();
    
    invoices.forEach(inv => {
      inv.products.forEach((product: any) => {
        const productId = product.productId;
        
        if (!productMap.has(productId)) {
          productMap.set(productId, { 
            name: product.productName, 
            totalAmount: 0, 
            quantity: 0 
          });
        }
        
        const productData = productMap.get(productId)!;
        productData.totalAmount += parseFloat(product.amount);
        productData.quantity += parseFloat(product.quantity);
      });
    });

    this.productData = Array.from(productMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);
  }

  calculateTaxSummary(invoices: any[]) {
    const taxRates = ['5', '12', '18', '28'];
    this.taxSummary = [];
    
    taxRates.forEach(rate => {
      const taxableKey = `taxable${rate}`;
      const taxAmtKey = `taxAmtsgstorcgst${rate}`;
      const igstKey = `taxAmtIgst${rate}`;
      
      const taxableValue = invoices.reduce((sum, inv) => sum + (inv[taxableKey] || 0), 0);
      const taxAmount = invoices.reduce((sum, inv) => sum + (inv[taxAmtKey] || 0) + (inv[igstKey] || 0), 0);
      
      if (taxableValue > 0) {
        this.taxSummary.push({
          rate: `${rate}%`,
          taxableValue: taxableValue,
          taxAmount: taxAmount
        });
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDateRange(): string {
    if (!this.startDate || !this.endDate) {
      return 'All Time';
    }
    
    const start = new Date(this.startDate).toLocaleDateString('en-IN');
    const end = new Date(this.endDate).toLocaleDateString('en-IN');
    return `${start} - ${end}`;
  }

  onDateFilter() {
    // Implement date filtering logic if needed
    console.log('Date filter applied:', this.startDate, this.endDate);
  }
}