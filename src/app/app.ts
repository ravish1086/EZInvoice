import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {  OnInit, ViewChild } from '@angular/core';
import { OtherdataService } from './services/otherdata.service';
import { tap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { SessionService } from './services/session.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { MenuModule } from 'primeng/menu';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSpinnerModule, ToastModule, TabsModule, MenuModule, CommonModule, MenubarModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true
})
export class App {
  protected readonly title = signal('EZInvoice');
   @ViewChild('screen', { static: true }) screen: any;

  show = false;
  selectedFileBLOB: any;
  items: MenuItem[] | undefined;

  constructor(
    private _sanitizer: DomSanitizer,
    private otherDataService: OtherdataService,
    private router: Router,
    public sessionService:SessionService
  ) {}
  imagePath:any;
  ngOnInit() {
    // this.debugggingIssue()
    this.setNavMenuItems();
    this.loggedCompanyDetails();
  }
  capture() {}

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
          this.router.navigate(['home']);
        },
      },
      // {
      //   label: 'Stock Entries',
      //   icon: 'pi pi-chart-line',
      //   command: () => {
      //     this.router.navigate(['addedStockEntries']);
      //   },
      // },
      {
        label: 'Seller Details',
        icon: 'pi pi-list',
        command: () => {
          this.router.navigate(['sellerdetails']);
        },
      },
      {
        label: 'Product Details',
        icon: 'pi pi-inbox',
        command: () => {
          this.router.navigate(['productdetails']);
        },
      },
      {
        label: 'Create Invoice',
        icon: 'pi pi-inbox',
        command: () => {
            this.router.navigate(['createInvoice']);
        },
      },
      {
        label: 'Customers',
        icon: 'pi pi-inbox',
        command: () => {
          this.router.navigate(['customers']);
        },
      },
      {
        label: 'Sales Summary',
        icon: 'pi pi-inbox',
        command: () => {
          this.router.navigate(['saleSummary']);
        },
      },
      {
        label: 'HSN Summary',
        icon: 'pi pi-inbox',
        command: () => {
          this.router.navigate(['hsnSummary']);
        },
      },
      {
        label: 'Negative Invoice',
        icon: 'pi pi-inbox',
        command: () => {

            this.router.navigate(['createNegativeInvoice']);
        
        },
      },
      {
        label: 'Payments',
        icon: 'pi pi-inbox',
        command: () => {
          this.router.navigate(['payments']);
        },
      }
    ];
  }
}
