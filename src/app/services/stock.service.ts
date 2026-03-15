import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'
import { environment } from '../../environments/environment';
import { ApiPathExpressServer } from '../apiPaths';


@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor(private http:HttpClient) {

   }
  updateStock(reqJson: any): Observable<any> {
    return this.http.post(environment.expressAppApiUrl + ApiPathExpressServer.updateProduct, reqJson).pipe(
      catchError(this.handleError)
    );
  }
  addEntry(reqJson: any): Observable<any> {
    return this.http.post(environment.expressAppApiUrl + ApiPathExpressServer.addProduct, reqJson).pipe(
      catchError(this.handleError)
    );
  }
  getAllEntries(): Observable<any> {
    return this.http.get(environment.expressAppApiUrl + ApiPathExpressServer.getAllProducts).pipe(
      catchError(this.handleError)
    );
  }

   handleError(error: HttpErrorResponse){
    alert("Some error occurred while establishing a connection with the server.");
    return throwError(error);
    }
}
