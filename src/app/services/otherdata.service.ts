import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'
import { environment } from '../../environments/environment';
import { CustomerModel } from '../models/customer.model';
import { ProductDetails } from '../models/product.model';
import { SellerModel } from '../models/seller.model';
import { SessionService } from './session.service';
import { ApiPathExpressServer } from '../apiPaths';

@Injectable({
  providedIn: 'root'
})
export class OtherdataService {
  
  appConfig:any;
  loadedProducts:ProductDetails[]=[];
  loadedSeller:SellerModel[]=[];
  loadedCustomers:CustomerModel[]=[];

  constructor(private http:HttpClient, private sessionService:SessionService) {

  }

  getAppConfig():Observable<any>
  {
    return of(this.sessionService.sessionObject);
  }


  exportSellerData(reqJson: any): Observable<any> {
    return this.http.post(environment.apiurl + "/sellerdetails", reqJson).pipe(catchError(this.handleError));
  }

  getSellerDetails():Observable<any>
  {
    return this.http.get(environment.expressAppApiUrl+ApiPathExpressServer.getAllSellers).pipe(catchError(this.handleError));
  }

  exportProductDetails(reqJson: any): Observable<any> {
    return this.http.post(environment.apiurl + "/productdetails", reqJson).pipe(catchError(this.handleError));
  }
  getProductDetails():Observable<any>
  {
    return this.http.get(environment.expressAppApiUrl+ApiPathExpressServer.getAllProducts).pipe(catchError(this.handleError));
  }
  getCustomerDetails():Observable<any>
  {
    return this.http.get(environment.expressAppApiUrl+ApiPathExpressServer.getAllCustomers).pipe(catchError(this.handleError));
  }
  exportCustomerData(reqJson: any): Observable<any> {
    return this.http.post(environment.apiurl + "/customerdetails", reqJson).pipe(catchError(this.handleError));
  }
  importCustomerData(formData: FormData): Observable<any> {
    return this.http.post(environment.expressAppApiUrl + ApiPathExpressServer.importCustomerDetails, formData).pipe(catchError(this.handleError));
  }
  saveProducts(reqJson: any, index: number): Observable<any> {
    console.log(index);
    return this.http.post(environment.expressAppApiUrl + ApiPathExpressServer.updateProduct, reqJson).pipe(catchError(this.handleError));
  }
  saveCustomer(reqJson: any, index: number): Observable<any> {
    console.log(index);
    return this.http.patch(environment.expressAppApiUrl + ApiPathExpressServer.updateCustomer, reqJson).pipe(catchError(this.handleError));
  }
  addProducttoDb(reqJson: any): Observable<any> {
    return this.http.post(environment.expressAppApiUrl + ApiPathExpressServer.addProduct, reqJson).pipe(catchError(this.handleError));
  }
  addCustomerToDb(reqJson: any): Observable<any> {
    return this.http.post(environment.expressAppApiUrl + ApiPathExpressServer.saveCustomer, reqJson).pipe(catchError(this.handleError));
  }
  insertPaymentDetails(reqJson: any): Observable<any> {
    return this.http.post(environment.expressAppApiUrl + ApiPathExpressServer.savePaymentDetails, reqJson).pipe(catchError(this.handleError));
  }
  updatePaymentDetails(reqJson: any): Observable<any> {
    return this.http.patch(environment.expressAppApiUrl + ApiPathExpressServer.updatePaymentDetails, reqJson).pipe(catchError(this.handleError));
  }
  fetchPaymentDetails():Observable<any>
  {
    return this.http.get(environment.expressAppApiUrl+ApiPathExpressServer.getAllPaymentDetails).pipe(catchError(this.handleError));
  }

  authenticate(request: any): Observable<any> {
    return this.http.post(environment.expressAppApiUrl + ApiPathExpressServer.login, request).pipe(catchError(this.handleError));
  }

  syncData(): Observable<any> {
    return this.http.get(environment.expressAppApiUrl + ApiPathExpressServer.syncData).pipe(catchError(this.handleError));
  }
  handleError(error: HttpErrorResponse){
    alert("Some error occurred while establishing a connection with the server.");
    return throwError(error);
    }
}
