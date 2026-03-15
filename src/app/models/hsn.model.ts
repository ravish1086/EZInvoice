export interface HsnSummaryModel {
    hsn: string;
    quantity: number;
    taxableAmount: number;
    igst: number;
    sgst: number;
    cgst: number;
    taxRate: number;
    unit: string;
}

export interface HSNforGST {
    hsn: string;
    description: string;
    uqc: string;
    quantity: number;
    totalvalue: number;
    taxableValue: number;
    integratedTax: number;
    centraltax: number;
    stateTax: number;
    cess: number;
    rate: number;
}
