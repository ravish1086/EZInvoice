import { Component, OnInit } from '@angular/core';
import { StockService } from '../services/stock.service';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-addedstockentries',
  templateUrl: './addedstockentries.component.html',
  styleUrls: ['./addedstockentries.component.css'],
  standalone: true,
  imports: [TableModule, FormsModule, CommonModule]
})
export class AddedstockentriesComponent implements OnInit {

  allstockentries: any[] = [];

  constructor(private stockservice: StockService) {

   }

  ngOnInit(): void {
    this.getAllStockEntries();
  }

    getAllStockEntries()
    {
      this.stockservice.getAllEntries().subscribe((res) => {
        this.allstockentries = res;
        console.log(this.allstockentries);
      });
    }
}
