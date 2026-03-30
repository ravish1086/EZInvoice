import { Component, OnInit, ViewChild } from '@angular/core';
import { StockService } from '../services/stock.service';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

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

  constructor(private stockservice: StockService) {

   }

  ngOnInit(): void {
    this.getAllStockEntries();
  }

  getAllStockEntries() {
    this.stockservice.getAllEntries().subscribe((res) => {
      this.allstockentries = res;
      console.log(this.allstockentries);
    });
  }

  clear(table: any) {
    table.clear();
    this.searchValue = '';
  }
}
