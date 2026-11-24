import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
export const authInterceptor = (req, next) => {
    const token = inject(AuthService).token;
    return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};
