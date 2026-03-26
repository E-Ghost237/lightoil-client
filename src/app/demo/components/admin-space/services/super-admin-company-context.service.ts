import { Injectable } from '@angular/core';

interface SuperAdminCompanyContext {
  companyId: number | null;
  companyName: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class SuperAdminCompanyContextService {
  private readonly storageKey = 'super_admin_company_context';
  private snapshot: SuperAdminCompanyContext = { companyId: null, companyName: null };
  private hydrated = false;

  hydrate(): void {
    if (this.hydrated) {
      return;
    }

    this.hydrated = true;

    const persisted = this.readContext();
    if (persisted?.companyId) {
      this.snapshot = persisted;
      return;
    }

    const userDetails = this.readUserDetails();
    const fallbackCompanyId = Number(userDetails?.company?.id ?? userDetails?.company_id ?? 0) || null;
    const fallbackCompanyName = String(userDetails?.company?.name ?? '').trim() || null;

    if (!fallbackCompanyId) {
      return;
    }

    this.snapshot = {
      companyId: fallbackCompanyId,
      companyName: fallbackCompanyName
    };

    this.persistContext();
  }

  hasCompanyContext(): boolean {
    this.hydrate();
    return Number(this.snapshot.companyId ?? 0) > 0;
  }

  getCompanyId(): number | null {
    this.hydrate();
    return this.snapshot.companyId;
  }

  getCompanyName(): string | null {
    this.hydrate();
    return this.snapshot.companyName;
  }

  setCompanyContext(companyId: number | null, companyName: string | null = null): void {
    this.hydrate();

    const normalizedCompanyId = Number(companyId ?? 0) || null;
    const normalizedCompanyName = String(companyName ?? '').trim() || null;

    this.snapshot = {
      companyId: normalizedCompanyId,
      companyName: normalizedCompanyName
    };

    this.persistContext();
  }

  clearCompanyContext(): void {
    this.snapshot = { companyId: null, companyName: null };
    this.hydrated = true;
    localStorage.removeItem(this.storageKey);
  }

  updateCompanyNameFromList(companies: any[]): void {
    this.hydrate();
    const companyId = Number(this.snapshot.companyId ?? 0) || null;
    if (!companyId || !Array.isArray(companies) || !companies.length) {
      return;
    }

    const matched = companies.find((company: any) => Number(company?.id ?? 0) === companyId);
    if (!matched) {
      return;
    }

    const resolvedName = String(matched?.name ?? '').trim() || null;
    if (resolvedName === this.snapshot.companyName) {
      return;
    }

    this.snapshot = {
      companyId,
      companyName: resolvedName
    };

    this.persistContext();
  }

  private persistContext(): void {
    const companyId = Number(this.snapshot.companyId ?? 0) || null;

    if (!companyId) {
      localStorage.removeItem(this.storageKey);
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify({
      companyId,
      companyName: this.snapshot.companyName || null
    }));
  }

  private readContext(): SuperAdminCompanyContext | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      const companyId = Number(parsed?.companyId ?? parsed?.company_id ?? 0) || null;
      const companyName = String(parsed?.companyName ?? parsed?.company_name ?? '').trim() || null;

      if (!companyId) {
        return null;
      }

      return { companyId, companyName };
    } catch {
      return null;
    }
  }

  private readUserDetails(): any | null {
    try {
      return JSON.parse(localStorage.getItem('user_details') || 'null');
    } catch {
      return null;
    }
  }
}
