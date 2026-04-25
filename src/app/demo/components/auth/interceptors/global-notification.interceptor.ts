import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastLocalizationService } from '../services/toast-localization.service';

@Injectable()
export class GlobalNotificationInterceptor implements HttpInterceptor {
  constructor(
    private messageService: MessageService,
    private router: Router,
    private toastLocalizationService: ToastLocalizationService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.shouldHandle(req)) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      tap({
        next: (event: HttpEvent<any>) => {
          if (!(event instanceof HttpResponse)) {
            return;
          }
          this.notifySuccess(req, event);
        },
        error: (error: unknown) => {
          this.notifyError(req, error);
        }
      })
    );
  }

  private shouldHandle(req: HttpRequest<any>): boolean {
    const url = String(req?.url || '');
    if (!url.startsWith(environment.apiUrl)) {
      return false;
    }

    // Eviter les notifications sur les appels de fichiers statiques/ressources.
    return !url.includes('/assets/');
  }

  private notifySuccess(req: HttpRequest<any>, response: HttpResponse<any>): void {
    const method = String(req.method || 'GET').toUpperCase();
    const body = response.body ?? {};
    const responseMessage = this.toastLocalizationService.localizeText(String(body?.message ?? '').trim());
    const isBusinessFailure = body?.success === false;
    const signature = `${method}|${this.router.url}|${req.urlWithParams}|${isBusinessFailure ? 'warn' : 'ok'}`;

    if (!this.toastLocalizationService.canEmit(signature)) {
      return;
    }

    if (isBusinessFailure) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Action non aboutie',
        detail: responseMessage || "L'opération n'a pas pu être finalisée.",
        life: 4500
      });
      return;
    }

    if (!this.shouldEmitSuccessToast(req, method, responseMessage)) {
      return;
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Opération réussie',
      detail: responseMessage || "L'opération a été réalisée avec succès.",
      life: 3000
    });
  }

  private notifyError(req: HttpRequest<any>, error: unknown): void {
    const httpError = error as HttpErrorResponse;
    const status = Number(httpError?.status || 0);
    const backendMessage = this.toastLocalizationService.localizeText(
      String(httpError?.error?.message ?? httpError?.message ?? '').trim()
    );
    const signature = `ERR|${status}|${this.router.url}|${backendMessage || req.urlWithParams}`;
    if (!this.toastLocalizationService.canEmit(signature, 2500)) {
      return;
    }

    if (status === 401) {
      this.messageService.add({
        severity: 'error',
        summary: 'Non autorisé',
        detail: backendMessage || "Votre session a expiré ou vous n'avez pas les droits nécessaires.",
        life: 7000
      });

      const token = this.safeJsonParse(localStorage.getItem('token'));
      if (token?.access_token) {
        this.router.navigateByUrl('/auth/access');
      } else {
        this.router.navigateByUrl('/auth/login');
      }
      return;
    }

    if (status === 403) {
      this.messageService.add({
        severity: 'error',
        summary: 'Accès refusé',
        detail: backendMessage || "Vous n'êtes pas autorisé à effectuer cette action.",
        life: 6500
      });
      return;
    }

    if (status === 404) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ressource introuvable',
        detail: backendMessage || "La ressource demandée n'existe pas.",
        life: 5500
      });
      return;
    }

    if (status === 422) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation échouée',
        detail: backendMessage || 'Certaines données sont invalides. Merci de corriger les champs.',
        life: 6500
      });
      return;
    }

    if (status >= 500) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur serveur',
        detail: backendMessage || 'Le serveur a rencontré une erreur. Veuillez réessayer.',
        life: 7000
      });
      return;
    }

    if (status === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur réseau',
        detail: 'Impossible de contacter le serveur. Vérifiez votre connexion internet.',
        life: 7000
      });
      return;
    }

    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: backendMessage || 'Une erreur est survenue pendant le traitement de votre demande.',
      life: 6000
    });
  }

  private safeJsonParse(raw: string | null): any {
    try {
      return JSON.parse(raw || 'null');
    } catch {
      return null;
    }
  }

  private shouldEmitSuccessToast(req: HttpRequest<any>, method: string, responseMessage: string): boolean {
    if (req.headers.get('X-Silent-Toast') === 'true') {
      return false;
    }

    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return false;
    }

    const normalizedMessage = responseMessage.toLowerCase();
    const isReadLikeSuccess = normalizedMessage.includes('loaded successfully')
      || normalizedMessage.includes('chargement réussi')
      || normalizedMessage.includes('données ont été chargées')
      || normalizedMessage.includes('chargé avec succès')
      || normalizedMessage.includes('chargés avec succès')
      || normalizedMessage.includes('chargée avec succès')
      || normalizedMessage.includes('chargées avec succès');

    return !isReadLikeSuccess;
  }
}
