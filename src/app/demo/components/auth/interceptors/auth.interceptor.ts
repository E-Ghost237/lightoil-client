import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const auth = inject(AuthService);
    const token = auth.getAccessToken();

    // Pass the original request to the next handle if token does not exist
    if (!token || token === null) {
      return next.handle(req).pipe(
        tap(event => {
          // Log the response for debugging
          // console.log('HTTP Response without token:', event);
        })
      );
    }
    
    // Clone the request to add new headers
    const clonedRequest = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + token)
    });

    // Log the request for debugging
    // console.log('HTTP Request with token:', clonedRequest);

    // Pass the cloned request instead of the original request to the next handle
    return next.handle(clonedRequest).pipe(
      tap(event => {
        // Log the response for debugging
        // console.log('HTTP Response with token:', event);
      })
    );
  }
}
