import { Routes } from '@angular/router';

export const routes: Routes = [
      {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'sellerdetails',
        component: SellerDetailsComponent,
      },
      {
        path:'addedStockEntries',
        component: AddedstockentriesComponent
      },
      {
        path: 'productdetails',
        component: AddedproductsComponent,
      },
      {
        path: 'createInvoice',
        component: CreateinvoiceComponent,
      },
      {
        path: 'customers',
        component: CustomersComponent,
      },
      {
        path: 'generatedInvoice/:invoicenum',
        component: GeneratedinvoiceComponent,
      },
      {
        path: 'createNegativeInvoice',
        component: CreatenegativeinvoiceComponent,
      },
      {
        path: 'saleSummary',
        component: SalesummaryComponent,
      },
      {
        path: 'hsnSummary',
        component: HsnsummaryComponent,
      },
      {
        path: 'editInvoice/:invoicenum',
        component: CreateinvoiceComponent,
      },
      {
        path: 'editNegativeInvoice/:invoicenum',
        component: CreatenegativeinvoiceComponent,
      },
      {
        path: 'payments',
        component: PaymentsComponent,
      },
      {
        path: 'demo',
        component: DemoComponent,
      },
    ],
  },

  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'registerUser',
    component: RegisterUserComponent,
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
