import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  isUserInSystem = false;
  sessionObject:any = null
  constructor() { }

  getToken() {
    return localStorage.getItem('Bearer')  
  }
}
