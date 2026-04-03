import { Component, OnInit, ViewChild } from '@angular/core';
import { OtherdataService } from '../services/otherdata.service';
import { tap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { MenuItem } from 'primeng/api';
import { Router, RouterOutlet } from '@angular/router';
import { SessionService } from '../services/session.service';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { MenubarModule } from 'primeng/menubar';
import { MenuModule } from 'primeng/menu';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [TableModule, FormsModule, CommonModule, RouterOutlet, DrawerModule, MenubarModule, MenuModule]
})
export class DashboardComponent {
  @ViewChild('screen', { static: true }) screen: any;
  title: string = 'EZInvoice';
  show: boolean = false;
  selectedFileBLOB: any;
  items: MenuItem[] | undefined;
  sidebarVisible: boolean = false;
  imagePath: any;

  constructor(
    private _sanitizer: DomSanitizer,
    private otherDataService: OtherdataService,
    private router: Router,
    public sessionService: SessionService
  ) {}
  
  ngOnInit() {
    // this.debugggingIssue()
    this.setNavMenuItems();
    // this.loggedCompanyDetails();
  }
  capture() {}
  
  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }
  
  onMenuItemClick() {
    this.sidebarVisible = false; // Close sidebar when menu item is clicked
  }

  DataURIToBlob(dataURI: string) {
    const splitDataURI = dataURI.split(',');
    const byteString =
      splitDataURI[0].indexOf('base64') >= 0
        ? atob(splitDataURI[1])
        : decodeURI(splitDataURI[1]);
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0];

    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++)
      ia[i] = byteString.charCodeAt(i);

    return new Blob([ia], { type: mimeString });
  }

  debugggingIssue() {
    // Debugging functionality removed as it referenced undefined data variable
  }

  loggedCompanyDetails() {
    const sessionData = localStorage.getItem('loggedInUserInfo');
    if (sessionData) {
      let sessionObject = JSON.parse(sessionData);
      this.sessionService.isUserInSystem = true;
      this.sessionService.sessionObject = sessionObject;
      this.otherDataService.appConfig = sessionObject;
    } else {
      this.sessionService.isUserInSystem = false;
      this.router.navigate(['login']);
    }

    // this.otherDataService.getAppConfig().subscribe((res) => {
    //   this.otherDataService.appConfig = res;
    // });
  }

  setNavMenuItems() {
    this.items = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        command: () => {
          this.onMenuItemClick();
          this.router.navigate(['/dashboard/home',]);
        },
      },
      {
        label: 'Stock Entries',
        icon: 'pi pi-chart-line',
        command: () => {
          this.router.navigate(['/dashboard/addedStockEntries']);
        },
      },
      // {
      //   label: 'Seller Details',
      //   icon: 'pi pi-list',
      //   command: () => {
      //     this.onMenuItemClick();
      //     this.router.navigate(['/dashboard/sellerdetails']);
      //   },
      // },
      {
        label: 'Product Details',
        icon: 'pi pi-inbox',
        command: () => {
          this.onMenuItemClick();
          this.router.navigate(['/dashboard/productdetails']);
        },
      },
      {
        label: 'Create Invoice',
        icon: 'pi pi-inbox',
        command: () => {
          this.onMenuItemClick();
          this.router.navigate(['/dashboard/createInvoice']);
        },
      },
      {
        label: 'Customers',
        icon: 'pi pi-inbox',
        command: () => {
          this.onMenuItemClick();
          this.router.navigate(['/dashboard/customers']);
        },
      },
      {
        label: 'Sales Summary',
        icon: 'pi pi-inbox',
        command: () => {
          this.onMenuItemClick();
          this.router.navigate(['/dashboard/saleSummary']);
        },
      },
      {
        label: 'HSN Summary',
        icon: 'pi pi-inbox',
        command: () => {
          this.onMenuItemClick();
          this.router.navigate(['/dashboard/hsnSummary']);
        },
      },
      {
        label: 'Analytics Dashboard',
        icon: 'pi pi-chart-bar',
        command: () => {
          this.onMenuItemClick();
          this.router.navigate(['/dashboard/analytics']);
        },
      },
      // {
      //   label: 'Negative Invoice',
      //   icon: 'pi pi-inbox',
      //   command: () => {
      //     this.onMenuItemClick();
      //     this.router.navigate(['/dashboard/createNegativeInvoice']);
      //   },
      // },
      {
        label: 'Payments',
        icon: 'pi pi-inbox',
        command: () => {
          this.onMenuItemClick();
          this.router.navigate(['/dashboard/payments']);
        },
      },
      {
        label: 'Opening Balances',
        icon: 'pi pi-wallet',
        command: () => {
          this.onMenuItemClick();
          this.router.navigate(['/dashboard/openingBalances']);
        },
      }
    ];
  }
}