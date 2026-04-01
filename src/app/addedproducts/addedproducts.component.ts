import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { ProductDetails } from '../models/product.model';
import { OtherdataService } from '../services/otherdata.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-addedproducts',
  templateUrl: './addedproducts.component.html',
  styleUrls: ['./addedproducts.component.css'],
  standalone: true,
  imports: [FormsModule, TableModule, CommonModule, ButtonModule, InputNumberModule, DialogModule]
})
export class AddedproductsComponent implements OnInit {
  data: any;
  editmode = false;
  isImport = true;
  product: ProductDetails[] = [];
  savedProducts: ProductDetails[] = [];
  addProductsForm = false;
  name: string = '';
  hsn: string = '';
  price: number | null = null;
  taxrate: number | null = null;
  unit: string = '';
  // parentArray;
  constructor(private otherdataservice: OtherdataService, private spinner: NgxSpinnerService, private cdr:ChangeDetectorRef) {

  }


  ngOnInit(): void {
    this.getSavedProducts();
  }
  searchProduct(inputStr: string) {
    this.savedProducts = this.otherdataservice.loadedProducts;
    this.savedProducts = this.savedProducts.filter((product) =>
      product.productName.toLowerCase().includes(inputStr.toLowerCase())
    );
  }
  toggleEdit(index: number) {
    // Desktop edit mode
    let element1 = document.getElementsByClassName(
      'editmode1'
    ) as HTMLCollectionOf<HTMLElement>;
    for (let i = index * 6; i < index * 6 + 6; i++) {
      if (element1[i]) {
        element1[i].style.display = 'block';
      }
    }
    let element2 = document.getElementsByClassName(
      'editmode2'
    ) as HTMLCollectionOf<HTMLElement>;
    for (let j = index * 6; j < index * 6 + 6; j++) {
      if (element2[j]) {
        element2[j].style.display = 'none';
      }
    }
    
    // Mobile edit mode
    let element1Mobile = document.getElementsByClassName(
      'editmode1-mobile'
    ) as HTMLCollectionOf<HTMLElement>;
    for (let i = index * 6; i < index * 6 + 6; i++) {
      if (element1Mobile[i]) {
        element1Mobile[i].style.display = 'block';
      }
    }
    let element2Mobile = document.getElementsByClassName(
      'editmode2-mobile'
    ) as HTMLCollectionOf<HTMLElement>;
    for (let j = index * 6; j < index * 6 + 6; j++) {
      if (element2Mobile[j]) {
        element2Mobile[j].style.display = 'none';
      }
    }
  }

  SaveRecords(entry: any, index: number) {
    // Desktop edit mode
    let element1 = document.getElementsByClassName(
      'editmode1'
    ) as HTMLCollectionOf<HTMLElement>;
    for (let i = index * 6; i < index * 6 + 6; i++) {
      if (element1[i]) {
        element1[i].style.display = 'none';
      }
    }
    let element2 = document.getElementsByClassName(
      'editmode2'
    ) as HTMLCollectionOf<HTMLElement>;
    for (let j = index * 6; j < index * 6 + 6; j++) {
      if (element2[j]) {
        element2[j].style.display = 'block';
      }
    }
    
    // Mobile edit mode
    let element1Mobile = document.getElementsByClassName(
      'editmode1-mobile'
    ) as HTMLCollectionOf<HTMLElement>;
    for (let i = index * 6; i < index * 6 + 6; i++) {
      if (element1Mobile[i]) {
        element1Mobile[i].style.display = 'none';
      }
    }
    let element2Mobile = document.getElementsByClassName(
      'editmode2-mobile'
    ) as HTMLCollectionOf<HTMLElement>;
    for (let j = index * 6; j < index * 6 + 6; j++) {
      if (element2Mobile[j]) {
        element2Mobile[j].style.display = 'block';
      }
    }
    this.spinner.show();
    this.otherdataservice.saveProducts(entry, entry.id).subscribe((res) => {
      console.log(res);
      this.spinner.hide();
    });
  }

  showForm() {
    this.addProductsForm = !this.addProductsForm;
  }

  getSavedProducts() {
    this.spinner.show();
    this.otherdataservice.getProductDetails().subscribe((res) => {
      console.log(res);
      for (let i = 0; i < res.length; i++) {
        let product: ProductDetails = {
          _id: res[i]._id,
          productName: res[i].productName,
          productHsn: res[i].productHsn,
          productPrice: Number(res[i].productPrice),
          productTaxRate: Number(res[i].productTaxRate),
          productUnit: res[i].productUnit,
          inStock: res[i].inStock,
          id: res[i].id
        };
        this.savedProducts.push(product);
      }
      // this.parentArray=this.savedProducts
      this.otherdataservice.loadedProducts = this.savedProducts;
      this.spinner.hide();
      this.cdr.markForCheck();
    });
  }

  addProduct() {
    let product: ProductDetails = {
      productName: this.name || '',
      productHsn: this.hsn || '',
      productPrice: this.price || 0,
      productTaxRate: this.taxrate || 0,
      productUnit: this.unit || '',
      inStock: 0,
      id: 0 // Will be set by backend
    };
    this.otherdataservice.addProducttoDb(product).subscribe((res) => {
      console.log(res);
      if ((res)) {
        alert('Product has been added Successfully');
        product._id = res._id || res.id;
        product.id = res.id || res._id;
        this.savedProducts.push(product);
        // Reset form
        this.name = '';
        this.hsn = '';
        this.price = null;
        this.taxrate = null;
        this.unit = '';
        // Close dialog
        this.addProductsForm = false;
      }
    });
  }
  onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>evt.target;

    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const bstr: string = e.target.result;

      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      const wsname: string = wb.SheetNames[0];

      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      console.log(ws);

      this.data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      //console.log(this.data);

      let x = this.data.slice(1);
      console.log(x);
      for (let i = 1; i < this.data.length; i++) {
        let product: ProductDetails = {
          productName: this.data[i][0],
          productHsn: this.data[i][1],
          productPrice: Number(this.data[i][2]),
          productTaxRate: Number(this.data[i][3]),
          productUnit: this.data[i][4],
          inStock: 0,
          id: 0 // Will be set by backend
        };
        this.otherdataservice.exportProductDetails(product).subscribe((res) => {
          console.log(res);
        });
      }
      console.log(this.product);
      this.otherdataservice
        .exportProductDetails(this.product)
        .subscribe((res) => {
          console.log(res);
        });
    };

    reader.readAsBinaryString(target.files[0]);
  }

  searchValue: string = '';
  clear(table: Table) {
    table.clear();
    this.searchValue = '';
  }

  clearSearch() {
    this.searchValue = '';
    this.savedProducts = this.otherdataservice.loadedProducts;
  }
}
