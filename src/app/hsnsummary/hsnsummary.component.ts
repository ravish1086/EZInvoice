import { Component, OnInit } from '@angular/core';
import { HSNforGST, HsnSummaryModel } from '../models/hsn.model';
import { HsnService } from '../services/hsn.service';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hsnsummary',
  templateUrl: './hsnsummary.component.html',
  styleUrls: ['./hsnsummary.component.css'],
  standalone: true,
  imports: [TableModule, FormsModule, CommonModule]
})
export class HsnsummaryComponent implements OnInit {
  allinvoicesdetails: any;
  hsnsummary: HsnSummaryModel[] = [];
  hsnforGST: HSNforGST[] = [];
  distincthsnlist: string[] = [];
  generatedHSNsummary: HsnSummaryModel[] = [];
  startDate: Date | undefined;
  endDate: Date | undefined;
  hsnNumUQC = [
    {
      "num": "3812",
      "uqc": "PAC-PACKS",
    },
    {
      "num": "3506",
      "uqc": "KGS-KILOGRAMS"
    }
    , {
      "num": "3702",
      "uqc": "ROL-ROLLS"
    }
    , {
      "num": "3705",
      "uqc": "OTH-OTHERS"
    }
    , {
      "num": "3809",
      "uqc": "PAC-PACKS"
    }
    , {
      "num": "8443",
      "uqc": "PCS-PIECES"
    }
    , {
      "num": "3824",
      "uqc": "BTL-BOTTLES"
    }
    , {
      "num": "3814",
      "uqc": "LTR-LITRES"
    }
    , {
      "num": "3920",
      "uqc": "OTH-OTHERS"
    }
    , {
      "num": "2918",
      "uqc": "PAC-PACKS"
    }
    , {
      "num": "2902",
      "uqc": "BTL-BOTTLES"
    }
    , {
      "num": "3912",
      "uqc": "PCS-PIECES"
    }
    , {
      "num": "3707",
      "uqc": "LTR-LITRES"
    }
    , {
      "num": "3215",
      "uqc": "KGS-KILOGRAMS"
    }
    , {
      "num": "5909",
      "uqc": "MTR-METERS"
    }
    , {
      "num": "5111",
      "uqc": "MTR-METERS"
    }
    , {
      "num": "2809",
      "uqc": "LTR-LITRES"
    }
    , {
      "num": "1301",
      "uqc": "KGS-KILOGRAMS"
    }
    , {
      "num": "8442",
      "uqc": "OTH-OTHERS"
    }, {
      "num": "2905",
      "uqc": "LTR-LITRES"
    }, {
      "num": "4806",
      "uqc": "PAC-PACKS"
    }
  ]
  constructor(private hsnservice:HsnService) { }

  ngOnInit(): void {
  this.hsnservice.getAllInvoicesDetails().subscribe(res=>
    {
      this.allinvoicesdetails=res;
      this.processData(this.allinvoicesdetails);
    })
  }
  filterRecords() {
    var filteredSummary: any[] = [];
    var summary = this.allinvoicesdetails;
    
    if (!this.startDate || !this.endDate) {
      console.log('Please select both start and end dates');
      return;
    }
    
    var startdate = new Date(this.startDate).setHours(0, 0, 0, 0);
    var enddate = new Date(this.endDate).setHours(0, 0, 0, 0);
    
    console.log('Start date:', startdate);
    console.log('End date:', enddate);
    
    for (let i = 0; i < summary.length; i++) {
      let date = new Date(summary[i].invoiceDate).setHours(0, 0, 0, 0);
      if ((date >= startdate) && (date <= enddate)) {
        filteredSummary.push(summary[i]);
      }
    }
    
    console.log(filteredSummary);
    this.processData(filteredSummary);
  }
  hsnNumToUQC(hsn: string): string {
    let uqc: string = '';
    for (let i = 0; i < this.hsnNumUQC.length; i++) {
      if (this.hsnNumUQC[i].num === hsn) {
        uqc = this.hsnNumUQC[i].uqc;
        break;
      }
    }
    return uqc;
  }
  processData(datatobeprocessed: any) {
    this.hsnsummary=[];
    let summaryobj=datatobeprocessed;
    for(let i=0;i<summaryobj.length;i++)
    { 
        let productsobj=summaryobj[i].products
      for(let j=0;j<productsobj.length;j++)
      {
        let hsnsum: HsnSummaryModel = {
          hsn: String(productsobj[j].hsn),
          quantity: Number(productsobj[j].quantity),
          taxableAmount: Number(productsobj[j].taxableAmount),
          sgst: Number(productsobj[j].sgst),
          cgst: Number(productsobj[j].cgst),
          igst: Number(productsobj[j].Igst),
          taxRate: Number(productsobj[j].taxRate),
          unit: String(productsobj[j].unit)
        };
          
        this.hsnsummary.push(hsnsum);
          
      }
      
    }
    console.log(this.hsnsummary)
    this.filterHsnSummary(this.hsnsummary);
  }

  options = { 
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalseparator: '.',
    showLabels: true, 
    showTitle: false,
    title: '',
    useBom: true,
    headers: ["HSN", "Description", "UQC","Total Quantity","Total Value","Taxable Value","Integrated Tax Amount","Central Tax Amount","State/UT Tax Amount","Cess Amount","Rate"]
  };
 
downloadHSNCSV()
{
   this.generateHsnSummaryGST(this.generatedHSNsummary);
  new ngxCsv(this.hsnforGST, "HSNReport", this.options);
}
  generateHsnSummaryGST(generatedSummary: any) {
    this.hsnforGST=[];
    for(let i=0;i<generatedSummary.length;i++)
    {
      let hsnrow: HSNforGST = {
        hsn: this.generatedHSNsummary[i].hsn,
        description: "", //this.generatedHSNsummary[i]
        uqc: this.hsnNumToUQC(this.generatedHSNsummary[i].hsn), //this.generatedHSNsummary[i]
        quantity: Number(this.generatedHSNsummary[i].quantity),
        totalvalue: Number(Number(this.generatedHSNsummary[i].taxableAmount)+Number(this.generatedHSNsummary[i].cgst)+Number(this.generatedHSNsummary[i].sgst)+Number(this.generatedHSNsummary[i].igst)),
        taxableValue: Number(this.generatedHSNsummary[i].taxableAmount),
        integratedTax: Number(this.generatedHSNsummary[i].igst),
        centraltax: Number(this.generatedHSNsummary[i].cgst),
        stateTax: Number(this.generatedHSNsummary[i].sgst),
        cess: 0, //this.generatedHSNsummary[i]
        rate: Number(this.generatedHSNsummary[i].taxRate)
      };

      this.hsnforGST.push(hsnrow);
    }
      
  }
  filterHsnSummary(createHsnDetails: any) {
    let hsnsummary=createHsnDetails
    this.generatedHSNsummary=[]
    this.distincthsnlist=[];
    for(let i=0;i<hsnsummary.length;i++)
    {
      let item=hsnsummary[i]
      if((this.distincthsnlist).indexOf(item.hsn)>=0)
      {
        let index = this.distincthsnlist.indexOf(item.hsn);

        if(this.generatedHSNsummary[index].hsn===item.hsn)
        {
          console.log("Match is Genuine");
          this.generatedHSNsummary[index].quantity=Number(this.generatedHSNsummary[index].quantity)+Number(hsnsummary[i].quantity)
          this.generatedHSNsummary[index].cgst=Number(this.generatedHSNsummary[index].cgst)+Number(hsnsummary[i].cgst)
          this.generatedHSNsummary[index].sgst=Number(this.generatedHSNsummary[index].sgst)+Number(hsnsummary[i].sgst)
          this.generatedHSNsummary[index].igst=Number(this.generatedHSNsummary[index].igst) +Number(hsnsummary[i].igst)
          this.generatedHSNsummary[index].taxableAmount=Number(this.generatedHSNsummary[index].taxableAmount)+Number(hsnsummary[i].taxableAmount)

        }
        else{
          console.log("Some Error Occurred while finding HSN match");
        }
      }
      else{
        this.distincthsnlist.push(hsnsummary[i].hsn);
        let hsnitem: HsnSummaryModel = {
          hsn: hsnsummary[i].hsn,
          unit: hsnsummary[i].unit,
          taxableAmount: Number(hsnsummary[i].taxableAmount),
          taxRate: Number(hsnsummary[i].taxRate),
          quantity: Number(hsnsummary[i].quantity),
          sgst: Number(hsnsummary[i].sgst),
          cgst: Number(hsnsummary[i].cgst),
          igst: Number(hsnsummary[i].igst)
        };


        this.generatedHSNsummary.push(hsnitem);
        
      }
    }
    console.log(this.distincthsnlist);
    console.log(this.generatedHSNsummary);
  }

}
