import { Injectable } from '@angular/core';
import { Message, MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ToastLocalizationService {
  private installed = false;
  private readonly throttleMap = new Map<string, number>();

  constructor(private messageService: MessageService) {}

  installGlobalFrenchPatch(): void {
    if (this.installed) {
      return;
    }

    const service = this.messageService as any;
    const originalAdd = service.add.bind(this.messageService);
    const originalAddAll = service.addAll.bind(this.messageService);

    service.add = (message: Message) => {
      const localized = this.localizeMessage(message);
      const signature = this.buildMessageSignature(localized);
      if (!this.canEmit(signature, 1500)) {
        return;
      }
      originalAdd(localized);
    };

    service.addAll = (messages: Message[]) => {
      const localizedMessages = Array.isArray(messages)
        ? messages.map((message) => this.localizeMessage(message))
        : [];
      const filtered = localizedMessages.filter((msg) => this.canEmit(this.buildMessageSignature(msg), 1500));
      if (!filtered.length) {
        return;
      }
      originalAddAll(filtered);
    };

    this.installed = true;
  }

  localizeMessage(message: Message): Message {
    const severity = String(message?.severity || 'info').toLowerCase();
    const summary = this.localizeText(String(message?.summary || '').trim()) || this.defaultSummary(severity);
    const detail = this.localizeText(String(message?.detail || '').trim()) || this.defaultDetail(severity);

    // Unifier l’affichage via le toast global (évite les variations de clés selon les pages).
    return {
      ...message,
      key: undefined,
      severity,
      summary,
      detail
    };
  }

  canEmit(signature: string, ttlMs = 1200): boolean {
    const now = Date.now();
    const last = this.throttleMap.get(signature) || 0;
    if (now - last < ttlMs) {
      return false;
    }

    this.throttleMap.set(signature, now);

    // Nettoyage opportuniste pour éviter d’accumuler indéfiniment des clés.
    if (this.throttleMap.size > 400) {
      this.pruneThrottleMap(now, ttlMs * 4);
    }

    return true;
  }

  localizeText(text: string): string {
    if (!text) {
      return '';
    }

    let value = text;

    const replacements: Array<{ pattern: RegExp; replace: string }> = [
      { pattern: /All points of sale of company loaded successfully\.?/gi, replace: "Tous les points de vente de l'entreprise ont été chargés avec succès." },
      { pattern: /All products of each sale point of company loaded successfully\.?/gi, replace: "Tous les produits des points de vente de l'entreprise ont été chargés avec succès." },
      { pattern: /All products loaded successfully\.?/gi, replace: 'Tous les produits ont été chargés avec succès.' },
      { pattern: /All stations loaded successfully\.?/gi, replace: 'Toutes les stations ont été chargées avec succès.' },
      { pattern: /All users loaded successfully\.?/gi, replace: 'Tous les utilisateurs ont été chargés avec succès.' },
      { pattern: /All regions loaded successfully\.?/gi, replace: 'Toutes les régions ont été chargées avec succès.' },
      { pattern: /All towns loaded successfully\.?/gi, replace: 'Toutes les villes ont été chargées avec succès.' },
      { pattern: /Companies loaded successfully\.?/gi, replace: 'Les entreprises ont été chargées avec succès.' },
      { pattern: /Super admin dashboard overview loaded successfully\.?/gi, replace: "La vue d'ensemble du tableau de bord super administrateur a été chargée avec succès." },
      { pattern: /Super admin dashboard stations map loaded successfully\.?/gi, replace: 'La carte des stations du tableau de bord super administrateur a été chargée avec succès.' },
      { pattern: /Payment confirmed\.?/gi, replace: 'Paiement confirmé.' },
      { pattern: /Reminder sent\.?/gi, replace: 'Rappel envoyé.' },
      { pattern: /\bSuccess\b/gi, replace: 'Succès' },
      { pattern: /\bSuccessful\b/gi, replace: 'Réussi' },
      { pattern: /\bError\b/gi, replace: 'Erreur' },
      { pattern: /\bWarning\b/gi, replace: 'Avertissement' },
      { pattern: /\bInfo\b/gi, replace: 'Information' },
      { pattern: /\bLogin failed\b/gi, replace: 'Échec de connexion' },
      { pattern: /\bUpdate password failed\b/gi, replace: 'La mise à jour du mot de passe a échoué' },
      { pattern: /\bInvalid form\b/gi, replace: 'Formulaire invalide' },
      { pattern: /\bError Message\b/gi, replace: "Message d'erreur" },
      { pattern: /\bInfo\. Message\b/gi, replace: "Message d'information" },
      { pattern: /\bFailed to load\b/gi, replace: 'Échec du chargement' },
      { pattern: /\bCould not load\b/gi, replace: 'Impossible de charger' },
      { pattern: /\bloaded successfully\b/gi, replace: 'chargé avec succès' },
      { pattern: /\bsuccessfully\b/gi, replace: 'avec succès' },
      { pattern: /\boverview\b/gi, replace: "vue d'ensemble" },
      { pattern: /\bdashboard\b/gi, replace: 'tableau de bord' },
      { pattern: /\bmap\b/gi, replace: 'carte' },
      { pattern: /\btowns\b/gi, replace: 'villes' },
      { pattern: /\bregions\b/gi, replace: 'régions' },
      { pattern: /\bcompanies\b/gi, replace: 'entreprises' },
      { pattern: /\bpoints of sale\b/gi, replace: 'points de vente' },
      { pattern: /\bsale point\b/gi, replace: 'point de vente' },
      { pattern: /\bproducts\b/gi, replace: 'produits' },
      { pattern: /\bproduct\b/gi, replace: 'produit' },
      { pattern: /\bcompany\b/gi, replace: 'entreprise' },
      { pattern: /\busers\b/gi, replace: 'utilisateurs' },
      { pattern: /\buser\b/gi, replace: 'utilisateur' },
      { pattern: /\bstations\b/gi, replace: 'stations' },
      { pattern: /\bstation\b/gi, replace: 'station' },
      { pattern: /\bcreated successfully\b/gi, replace: 'créé avec succès' },
      { pattern: /\bupdated successfully\b/gi, replace: 'mis à jour avec succès' },
      { pattern: /\bdeleted successfully\b/gi, replace: 'supprimé avec succès' },
      { pattern: /\bUser created successfully\b/gi, replace: 'Utilisateur créé avec succès' },
      { pattern: /\bPlease fill in all fields\./gi, replace: 'Veuillez renseigner tous les champs.' },
      { pattern: /\bPlease review the required fields\./gi, replace: 'Veuillez vérifier les champs obligatoires.' },
      { pattern: /\bPlease fill price of product field\./gi, replace: 'Veuillez renseigner le prix du produit.' },
      { pattern: /\bSometing wrong\. Please try again later\./gi, replace: 'Une erreur est survenue. Veuillez réessayer plus tard.' },
      { pattern: /\bUnauthorized\b/gi, replace: 'Non autorisé' },
      { pattern: /\bAccess denied\b/gi, replace: 'Accès refusé' },
      { pattern: /\bForbidden\b/gi, replace: 'Accès interdit' },
      { pattern: /\bNot found\b/gi, replace: 'Introuvable' },
      { pattern: /\bServer error\b/gi, replace: 'Erreur serveur' }
    ];

    replacements.forEach(({ pattern, replace }) => {
      value = value.replace(pattern, replace);
    });

    return value;
  }

  private defaultSummary(severity: string): string {
    if (severity === 'success') {
      return 'Succès';
    }
    if (severity === 'warn' || severity === 'warning') {
      return 'Avertissement';
    }
    if (severity === 'error') {
      return 'Erreur';
    }
    return 'Information';
  }

  private defaultDetail(severity: string): string {
    if (severity === 'success') {
      return 'Opération effectuée avec succès.';
    }
    if (severity === 'warn' || severity === 'warning') {
      return 'Veuillez vérifier les informations saisies.';
    }
    if (severity === 'error') {
      return 'Une erreur est survenue.';
    }
    return 'Information disponible.';
  }

  private pruneThrottleMap(now: number, maxAgeMs: number): void {
    Array.from(this.throttleMap.entries()).forEach(([key, timestamp]) => {
      if (now - timestamp > maxAgeMs) {
        this.throttleMap.delete(key);
      }
    });
  }

  private buildMessageSignature(message: Message): string {
    const severity = String(message?.severity || 'info').trim().toLowerCase();
    const summary = String(message?.summary || '').trim();
    const detail = String(message?.detail || '').trim();
    return `${severity}|${summary}|${detail}`;
  }
}
