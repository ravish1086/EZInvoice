import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiPathExpressServer, ApiPathsJsonServer } from '../apiPaths';
import { GenerateInvoice } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly baseUrl: string;
  private readonly apiPaths = environment.backendEnabled ? ApiPathExpressServer : ApiPathsJsonServer;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.backendEnabled 
      ? environment.expressAppApiUrl 
      : environment.apiurl;
  }

  /**
   * Generate a new invoice
   * @param invoiceData The invoice data to create
   * @returns Observable of the created invoice
   */
  generateInvoice(invoiceData: GenerateInvoice): Observable<GenerateInvoice> {
    const url = this.buildUrl(ApiPathExpressServer.createInvoice);
    return this.http.post<GenerateInvoice>(url, invoiceData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing invoice
   * @param invoiceId The ID of the invoice to update
   * @param invoiceData The updated invoice data
   * @returns Observable of the updated invoice
   */
  updateInvoice(invoiceId: string, invoiceData: Partial<GenerateInvoice>): Observable<GenerateInvoice> {
    const url = this.buildUrl(ApiPathExpressServer.updateInvoice);
    return this.http.patch<GenerateInvoice>(url, { id: invoiceId, ...invoiceData }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get invoice details by invoice number
   * @param invoiceNumber The invoice number to retrieve
   * @returns Observable of the invoice details
   */
  getInvoiceDetails(invoiceNumber: string): Observable<GenerateInvoice> {
    const url = this.buildUrl(ApiPathExpressServer.getInvoiceById);
    return this.http.get<GenerateInvoice>(`${url}?invoiceId=${invoiceNumber}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get the last invoice number
   * @returns Observable of the last invoice number
   */
  getLastInvoiceNumber(): Observable<number> {
    const url = this.buildUrl(ApiPathExpressServer.getLastInvoiceNumber);
    return this.http.get<{ lastInvoiceNumber: number }>(url).pipe(
      map(response => response.lastInvoiceNumber),
      catchError(this.handleError)
    );
  }

  /**
   * Get all invoice details
   * @returns Observable array of all invoices
   */
  getAllInvoicesDetails(): Observable<GenerateInvoice[]> {
    const url = this.buildUrl(ApiPathExpressServer.getAllInvoices);
    return this.http.get<GenerateInvoice[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Set the last invoice number
   * @param lastInvoiceNumber The new last invoice number
   * @returns Observable of the response
   */
  setLastInvoiceNumber(lastInvoiceNumber: number): Observable<any> {
    const url = this.buildUrl(ApiPathExpressServer.setLastInvoiceNumber);
    return this.http.post(url, { lastInvoiceNumber }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get total value of invoices and received amount
   * @returns Observable of the totals
   */
  getTotalValueOfInvoiceAndReceivedAmount(): Observable<{ totalInvoiceValue: number; totalReceivedAmount: number }> {
    const url = this.buildUrl(ApiPathExpressServer.getTotalValueOfInvoiceAndReceivedAmount);
    return this.http.get<{ totalInvoiceValue: number; totalReceivedAmount: number }>(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete an invoice by ID
   * @param invoiceId The ID of the invoice to delete
   * @returns Observable of the deletion response
   */
  deleteInvoice(invoiceId: string): Observable<any> {
    const url = this.buildUrl(ApiPathExpressServer.deleteInvoice);
    return this.http.delete(`${url}?id=${invoiceId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Build the complete URL for API calls
   * @param endpoint The API endpoint
   * @returns Complete URL string
   */
  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  /**
   * Handle HTTP errors
   * @param error The HTTP error response
   * @returns Observable with error details
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error('HTTP Error:', errorMessage);
    
    // You can also show user-friendly error messages here
    // For now, we'll throw the error for the component to handle
    return throwError(() => new Error(errorMessage));
  }
}