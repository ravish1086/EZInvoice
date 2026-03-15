import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { PasswordModule } from 'primeng/password';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SelectModule } from 'primeng/select';
import { DrawerModule } from 'primeng/drawer';
import { MenuModule } from 'primeng/menu';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    InputNumberModule,
    InputTextModule,
    DialogModule,
    ButtonModule,
    TableModule,
    ToolbarModule,
    InputGroupModule,
    InputGroupAddonModule,
    PasswordModule,
    ToastModule,
    ProgressSpinnerModule,
    NgxSpinnerModule,
    SelectModule,
    DrawerModule,
    MenuModule
  ],
  exports: [
    InputNumberModule,
    InputTextModule,
    DialogModule,
    ButtonModule,
    TableModule,
    ToolbarModule,
    InputGroupModule,
    InputGroupAddonModule,
    PasswordModule,ToastModule,
    ProgressSpinnerModule,
    NgxSpinnerModule,
    SelectModule,
    DrawerModule,
    MenuModule
  ],
})
export class PrimeNgModule {}
