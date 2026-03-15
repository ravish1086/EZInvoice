import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { UserService } from '../services/user.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiPathExpressServer } from '../apiPaths';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule]
})
export class RegisterUserComponent implements OnInit {
  registerForm!: FormGroup;
	submitting = false;
	successMessage = '';
	errorMessage = '';

	constructor(private fb: FormBuilder,  private userService:UserService,
        private router:Router,
         private messageService:MessageService) { }

	ngOnInit(): void {
		this.registerForm = this.fb.group({
			companyName: ['', [Validators.required, Validators.maxLength(100)]],
			companyGSTIN: ['', [Validators.maxLength(20)]],
			pan: ['', [Validators.maxLength(20)]],
			ownerName: ['', [Validators.required, Validators.maxLength(80)]],
			city: ['', Validators.maxLength(50)],
			pin: ['', [Validators.pattern('^[0-9]{6}$')]],
			mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
			state: ['', Validators.maxLength(50)],
			stateCode: ['', Validators.maxLength(5)],
			email: ['', [Validators.email]],
			country: ['India'],
			houseNo: [''],
			landMark: [''],
			area: ['']
		});
	}

	get f() { return this.registerForm.controls; }

	isInvalid(name: string) {
		const c = this.registerForm.get(name);
		return c && c.invalid && (c.touched || c.dirty);
	}

	onSubmit(): void {
		this.successMessage = this.errorMessage = '';
		if (this.registerForm.invalid) {
			this.registerForm.markAllAsTouched();
			return;
		}
		this.submitting = true;
		const payload = this.registerForm.value;
		const url = ApiPathExpressServer.addUser; // '/users/addUser'

		this.userService.registerUser(payload).subscribe({
			next: (res) => {
				this.successMessage = 'User registered successfully.';
				this.submitting = false;
                
                this.messageService.add({severity:'success', summary: 'Registration Successful', detail: 'User has been registered successfully.'});

                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 1000);
			},
			error: (err) => {
				this.errorMessage = (err && err.error && err.error.message) ? err.error.message : 'Failed to register user. Please try again.';
                this.messageService.add({severity:'error', summary: 'Registration Failed', detail: this.errorMessage}); 
				this.submitting = false;
			}
		});
	}
}
