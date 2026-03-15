import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OtherdataService } from '../services/otherdata.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [FormsModule, ButtonModule, InputGroupAddonModule, InputGroupModule, ReactiveFormsModule]
})
export class LoginComponent {


loginForm!: FormGroup;

constructor(private fb:FormBuilder, private otherDataService:OtherdataService,
   private messageService:MessageService, private router:Router, 
  private sessionService:SessionService, private spinner:NgxSpinnerService){

}


ngOnInit(){
  localStorage.clear();
  this.initForm()
}

initForm(){
    this.loginForm = this.fb.group({
      userId: [null, [Validators.required]],
      password: [null, [Validators.required]]
    })
}

authenticate(){
  if(!this.loginForm){
      this.messageService.add({severity: 'error', summary:'Validation Error', detail: "Please enter valid credentials"})
    return;
  }
  this.spinner.show();
  this.otherDataService.authenticate(this.loginForm.value).subscribe({
    next: (response:any)=>{
      if(response.status){
        localStorage.setItem("Bearer", response.token);
        localStorage.setItem("loggedInUserInfo", JSON.stringify(response.userInfo))
        this.sessionService.isUserInSystem = true;
        this.sessionService.sessionObject = response.userInfo;
      this.router.navigate(['/dashboard/home']);

        // this.syncData();
      }
      else{
        this.messageService.add({severity: 'error', summary:'Authentication Failed', detail: "Invalid Credentials or User Not Registered in system"})
      }
      this.spinner.hide();
    },
    error: ()=>{
      this.spinner.hide();
    }
  });
}

syncData(){
  this.spinner.show();
  this.otherDataService.syncData().subscribe({
    next: (response:any)=>{
      if(response.status){
        this.messageService.add({severity: 'success', summary:'Data Synced', detail: "Data Synced Successfully"})
      }
      else{
        this.messageService.add({severity: 'error', summary:'Data Sync Failed', detail: "Data Sync Failed"})
      }
      this.router.navigate(['/dashboard/home']);

      this.spinner.hide();
    },
    error: ()=>{
      this.spinner.hide();
    }
});
}

navigateToRegister(){
  this.router.navigateByUrl('/registerUser')
}
}
