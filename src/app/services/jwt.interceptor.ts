import { inject, Injectable } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

import { Observable } from 'rxjs';
 // Adjust the path as necessary
import { SessionService } from './session.service';

export const JwtInterceptor : HttpInterceptorFn = (request, next) => {
const sessionService = inject(SessionService);
        // Add the JWT token to the request headers if available
        const token = sessionService.getToken();
        if (token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        return next(request);
    }
