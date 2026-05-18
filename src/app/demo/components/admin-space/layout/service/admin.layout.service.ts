import { Injectable, effect, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';

export interface AdminConfig {
    inputStyle: string;
    colorScheme: string;
    theme: string;
    ripple: boolean;
    menuMode: string;
    scale: number;
}

interface LayoutState {
    staticMenuDesktopInactive: boolean;
    overlayMenuActive: boolean;
    profileSidebarVisible: boolean;
    configSidebarVisible: boolean;
    staticMenuMobileActive: boolean;
    menuHoverActive: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class AdminLayoutService {
    position: string = 'center';

    _config: AdminConfig = {
        ripple: false,
        inputStyle: 'outlined',
        menuMode: 'static',
        colorScheme: 'light',
        theme: 'lara-light-blue',
        scale: 14,
    };

    config = signal<AdminConfig>(this._config);

    state: LayoutState = {
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        profileSidebarVisible: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false,
    };

    private configUpdate = new Subject<AdminConfig>();

    private overlayOpen = new Subject<any>();

    configUpdate$ = this.configUpdate.asObservable();

    overlayOpen$ = this.overlayOpen.asObservable();

    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private authService: AuthService,
        public router: Router
    ) {
        effect(() => {
            const config = this.config();
            if (this.updateStyle(config)) {
                this.changeTheme();
            }
            this.changeScale(config.scale);
            this.onConfigUpdate();
        });
    }

    updateStyle(config: AdminConfig) {
        return (
            config.theme !== this._config.theme ||
            config.colorScheme !== this._config.colorScheme
        );
    }

    onMenuToggle() {
        if (this.isOverlay()) {
            this.state.overlayMenuActive = !this.state.overlayMenuActive;
            if (this.state.overlayMenuActive) {
                this.overlayOpen.next(null);
            }
        }

        if (this.isDesktop()) {
            this.state.staticMenuDesktopInactive =
                !this.state.staticMenuDesktopInactive;
        } else {
            this.state.staticMenuMobileActive =
                !this.state.staticMenuMobileActive;

            if (this.state.staticMenuMobileActive) {
                this.overlayOpen.next(null);
            }
        }
    }

    showProfileSidebar() {
        this.state.profileSidebarVisible = !this.state.profileSidebarVisible;
        if (this.state.profileSidebarVisible) {
            this.overlayOpen.next(null);
        }
    }

    showConfigSidebar() {
        this.state.configSidebarVisible = true;
    }

    isOverlay() {
        return this.config().menuMode === 'overlay';
    }

    isDesktop() {
        return window.innerWidth > 991;
    }

    isMobile() {
        return !this.isDesktop();
    }

    onConfigUpdate() {
        this._config = { ...this.config() };
        this.configUpdate.next(this.config());
    }

    changeTheme() {
        const config = this.config();
        const themeLink = <HTMLLinkElement>document.getElementById('theme-css');
        const themeLinkHref = themeLink.getAttribute('href')!;
        const newHref = themeLinkHref
            .split('/')
            .map((el) =>
                el == this._config.theme
                    ? (el = config.theme)
                    : el == `theme-${this._config.colorScheme}`
                    ? (el = `theme-${config.colorScheme}`)
                    : el
            )
            .join('/');

        this.replaceThemeLink(newHref);
    }
    replaceThemeLink(href: string) {
        const id = 'theme-css';
        let themeLink = <HTMLLinkElement>document.getElementById(id);
        const cloneLinkElement = <HTMLLinkElement>themeLink.cloneNode(true);

        cloneLinkElement.setAttribute('href', href);
        cloneLinkElement.setAttribute('id', id + '-clone');

        themeLink.parentNode!.insertBefore(
            cloneLinkElement,
            themeLink.nextSibling
        );
        cloneLinkElement.addEventListener('load', () => {
            themeLink.remove();
            cloneLinkElement.setAttribute('id', id);
        });
    }

    changeScale(value: number) {
        document.documentElement.style.fontSize = `${value}px`;
    }

    logoutConfirm(position: string) {
        this.position = position;
        this.confirmationService.confirm({
            header: 'Confirmation',
            icon: 'pi pi-info-circle',
            message: 'Êtes-vous sûr(e) de vouloir vous déconnecter ?',
            key: 'logoutConfirm',
            acceptIcon: 'pi pi-check mr-2',
            rejectIcon: 'pi pi-times mr-2',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptButtonStyleClass: 'p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-outlined p-button-sm',
            accept: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Déconnexion en cours...', life: 3000 });
                this.logout();
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'Déconnexion annulée', life: 3000 });
            }
        });
    }

    // Logout user
    logout() {
      this.authService.logout().subscribe(
        (response: any) => {
          this.clearCurrentUser();
          if (response?.success === true) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message, life: 3000 });
          } else {
            this.messageService.add({
              severity: 'warn',
              summary: 'Session fermée',
              detail: response?.message || 'Déconnexion effectuée.',
              life: 3000
            });
          }
          this.redirectToLogin();
        },
        (error) => {
          this.clearCurrentUser();
          this.messageService.add({
            severity: 'warn',
            summary: 'Session fermée',
            detail: error?.error?.message || error?.message || 'Déconnexion locale effectuée.',
            life: 3000
          });
          this.redirectToLogin();
        }
      );
    }

    // Delete athenticated user's data to the Local Storage
    private clearCurrentUser(): void {
      localStorage.removeItem('user_details');
      localStorage.removeItem('token');
      localStorage.removeItem('super_admin_company_context');
    }

    private redirectToLogin(): void {
      this.router.navigateByUrl('/auth/login').finally(() => {
        if (window.location.pathname.startsWith('/admin')) {
          window.location.replace('/auth/login');
        }
      });
    }
}
