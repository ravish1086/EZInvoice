import { Routes } from '@angular/router';
import { AddedproductsComponent } from './addedproducts/addedproducts.component';
import { AddedstockentriesComponent } from './addedstockentries/addedstockentries.component';
import { CreateinvoiceComponent } from './createinvoice/createinvoice.component';
import { CreatenegativeinvoiceComponent } from './createnegativeinvoice/createnegativeinvoice.component';
import { CustomersComponent } from './customers/customers.component';
import { GeneratedinvoiceComponent } from './generatedinvoice/generatedinvoice.component';

import { HomeComponent } from './home/home.component';
import { HsnsummaryComponent } from './hsnsummary/hsnsummary.component';
import { PaymentsComponent } from './payments/payments.component';
import { SalesummaryComponent } from './salesummary/salesummary.component';
import { AnalyticsComponent } from './analytics/analytics.component';

import { SellerDetailsComponent } from './seller-details/seller-details.component';
import { LoginComponent } from './login/login.component';
import { RegisterUserComponent } from './register-user/register-user.component';
import { DashboardComponent } from './dashboard/dashboard.component';


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
        path: 'analytics',
        component: AnalyticsComponent,
      }
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
