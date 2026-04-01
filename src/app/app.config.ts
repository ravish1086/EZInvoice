import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { JwtInterceptor } from './services/jwt.interceptor';
import {provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    DialogService,
    NgxSpinnerService,
    //configure jwt interceptor
    provideHttpClient(
      withInterceptors([JwtInterceptor])
    ),

    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()),
      providePrimeNG({
            theme: {
                preset: Aura
            }
        })
  ]
};
