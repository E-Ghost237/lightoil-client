import { Component, OnInit } from '@angular/core';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { ToastLocalizationService } from './demo/components/auth/services/toast-localization.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    constructor(
        private primengConfig: PrimeNGConfig,
        private messageService: MessageService,
        private toastLocalizationService: ToastLocalizationService
    ) { }

    ngOnInit() {
        this.primengConfig.ripple = true;
        this.toastLocalizationService.installGlobalFrenchPatch();
        // Force l'instanciation du service au démarrage pour activer la localisation globale.
        void this.messageService;
    }
}
