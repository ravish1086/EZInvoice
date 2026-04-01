import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { StockService } from '../services/stock.service';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-addedstockentries',
  templateUrl: './addedstockentries.component.html',
  styleUrls: ['./addedstockentries.component.css'],
  standalone: true,
  imports: [TableModule, FormsModule, CommonModule, ButtonModule, InputTextModule]
})
export class AddedstockentriesComponent implements OnInit {

  @ViewChild('dt') dt: any;

  allstockentries: any[] = [];
  searchValue: string = '';

  constructor(private stockservice: StockService, private spinner:NgxSpinnerService, private cdr:ChangeDetectorRef) {

   }

  ngOnInit(): void {
    this.getAllStockEntries();
  }

  getAllStockEntries() {
    this.spinner.show();
    this.stockservice.getAllEntries().subscribe((res) => {
      this.allstockentries = res;
      console.log(this.allstockentries);
      this.spinner.hide();
      this.cdr.markForCheck();
    });
  }

  clear(table: any) {
    table.clear();
    this.searchValue = '';
  }
}
