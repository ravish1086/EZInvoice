export interface B2BModel {
    gstin: string;
    name: string;
    invoiceNumber: string;
    invoiceDate: string;
    invoiceValue: number;
    placeOfSupply: string;
    reverseCharge: string;
    applicableTaxRate: string;
    invoiceType: string;
    eCommerceGstin: string;
    taxRate: number;
    taxableValue: number;
    cessAmount: number;
    
}

export interface B2CModel {
    type: string;
    placeofsupply: string;
    rate: number;
    applicabletaxrate: string;
    taxablevalue: number;
    cessamount: string;
    ecomGstin: string;
}
