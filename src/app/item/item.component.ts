import { Component, OnInit } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css'],
  standalone: true,
  imports: [TableModule, FormsModule]
})
export class ItemComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
