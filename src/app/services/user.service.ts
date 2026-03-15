import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { ApiPathExpressServer } from "../apiPaths";


@Injectable({
  providedIn: 'root'
})
export class UserService {
 
    constructor(private http: HttpClient) {
    }

    registerUser(userData: any): Observable<any> {
        return this.http.post(environment.apiurl + ApiPathExpressServer.addUser, userData);
    }
}
