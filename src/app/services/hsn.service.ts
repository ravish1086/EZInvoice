import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiPathExpressServer } from '../apiPaths';


@Injectable({
  providedIn: 'root'
})
export class HsnService {

  constructor(private http: HttpClient) { }

  getAllInvoicesDetails(): Observable<any> {
    return this.http.get(environment.expressAppApiUrl + ApiPathExpressServer.getAllInvoices).pipe(
      catchError(this.handleError)
    );
  }

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
    alert("Some error occurred while establishing a connection with the server.");
    return throwError(() => new Error(errorMessage));
  }
}
