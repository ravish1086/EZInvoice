import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { PrimeNgModule } from './prime-ng/prime-ng.module';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { JwtInterceptor } from './services/jwt.interceptor';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';

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
    provideRouter(routes),
    provideAnimationsAsync(),
      providePrimeNG({
            theme: {
                preset: Aura
            }
        })
  ]
};
