import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { MessageService } from 'primeng/api';
import { Subscription, firstValueFrom } from 'rxjs';
import { RealtimeRecordUpdatesService } from 'src/app/demo/services/realtime-record-updates.service';
import { SilentRefreshService } from 'src/app/demo/services/silent-refresh.service';
import {
  SuperAdminDashboardFiltersPayload,
  SuperAdminDashboardService
} from '../../services/super-admin-dashboard.service';
import { SuperAdminCompanyContextService } from '../../services/super-admin-company-context.service';

type StationActivityStatus = 'active' | 'inactive';
type StationMonitorStatus = 'online' | 'offline' | 'alert';

interface SuperAdminSummary {
  companiesCount: number;
  stationsCount: number;
  connectedTanksCount: number;
  onlineStationsCount: number;
  offlineStationsCount: number;
  activeAlertsCount: number;
  anomaliesCount: number;
  usersCount: number;
}

interface DashboardStation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  companyId: number | null;
  companyName: string;
  regionId: number | null;
  regionName: string;
  townId: number | null;
  townName: string;
  activityStatus: StationActivityStatus;
  monitorStatus: StationMonitorStatus;
  isEmitting: boolean;
  connectedTanks: number;
  alertsCount: number;
  anomaliesCount: number;
}

interface CompanyStationsRow {
  companyId: number | null;
  companyName: string;
  stationCount: number;
  connectedTanks: number;
  overallStatus: StationActivityStatus;
  stations: Array<{
    id: number;
    name: string;
    townName: string;
    status: StationActivityStatus;
    monitorStatus: StationMonitorStatus;
    isEmitting: boolean;
  }>;
}

interface DashboardUserRow {
  id: number;
  fullName: string;
  email: string;
  status: string;
  roleType: string;
  companyId: number | null;
  companyName: string;
}

@Component({
  selector: 'app-super-admin-dashboard',
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.scss'],
  providers: [MessageService]
})
export class SuperAdminDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('mapViewport', { static: false }) mapViewport?: ElementRef<HTMLElement>;
  @ViewChild('mapCanvas', { static: false }) mapCanvas?: ElementRef<HTMLElement>;

  loadingContext = true;
  loadingDashboard = false;
  isFullScreen = false;
  lastUpdatedAt: Date | null = null;

  readonly statusOptions = [
    { label: 'Tout', value: null },
    { label: 'Actif', value: 'active' },
    { label: 'Inactif', value: 'inactive' }
  ];

  regions: any[] = [];
  towns: any[] = [];
  filteredTowns: any[] = [];
  companies: any[] = [];

  selectedRegionId: number | null = null;
  selectedTownId: number | null = null;
  selectedCompanyId: number | null = null;
  selectedStatus: StationActivityStatus | null = null;

  summary: SuperAdminSummary = {
    companiesCount: 0,
    stationsCount: 0,
    connectedTanksCount: 0,
    onlineStationsCount: 0,
    offlineStationsCount: 0,
    activeAlertsCount: 0,
    anomaliesCount: 0,
    usersCount: 0
  };
  private usersCount = 0;

  stations: DashboardStation[] = [];
  filteredStations: DashboardStation[] = [];
  emittingStations: DashboardStation[] = [];
  companyStationsRows: CompanyStationsRow[] = [];
  usersRows: DashboardUserRow[] = [];
  filteredUsersRows: DashboardUserRow[] = [];
  readonly tableRowsPerPageOptions = [5, 10, 20, 50];
  companyStationsRowsPerPage = 5;
  usersRowsPerPage = 5;
  companyStationsFirst = 0;
  usersFirst = 0;
  private map?: L.Map;
  mapLayers: L.Layer[] = [];
  private animationIntervalIds: ReturnType<typeof setInterval>[] = [];

  mapOptions: L.MapOptions = {
    center: L.latLng({ lat: 5.8, lng: 12.5 }),
    zoom: 6,
    dragging: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    boxZoom: true,
    touchZoom: true,
    keyboard: true,
    inertia: true,
    zoomAnimation: true,
    markerZoomAnimation: true,
    fadeAnimation: true,
    zoomControl: true,
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      })
    ]
  };

  private superAdminEndpointsUnavailable = false;
  private mapBounds: { minLatitude: number; maxLatitude: number; minLongitude: number; maxLongitude: number } | null = null;
  private autoRefreshTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private silentRefreshSubscription: Subscription | null = null;
  private realtimeStationUnsubscribe: (() => void) | null = null;
  private realtimeStationKey = '';
  private realtimeRefreshTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;
  private refreshSequence = 0;

  private readonly fullscreenChangeHandler = (): void => {
    this.isFullScreen = !!document.fullscreenElement;
    setTimeout(() => this.map?.invalidateSize(), 250);
  };

  constructor(
    private superAdminDashboardService: SuperAdminDashboardService,
    private messageService: MessageService,
    private silentRefreshService: SilentRefreshService,
    private realtimeRecordUpdatesService: RealtimeRecordUpdatesService,
    private superAdminCompanyContextService: SuperAdminCompanyContextService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.destroyed = false;
    document.addEventListener('fullscreenchange', this.fullscreenChangeHandler);
    this.superAdminCompanyContextService.hydrate();
    await this.loadFilterOptions();

    if (this.destroyed) {
      return;
    }

    await this.refreshDashboard(false);
    if (this.destroyed) {
      return;
    }

    this.loadingContext = false;
    this.silentRefreshSubscription = this.silentRefreshService.create(300000).subscribe(() => {
      if (this.destroyed) {
        return;
      }

      if (!this.loadingDashboard && !this.loadingContext) {
        void this.refreshDashboard(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.refreshSequence += 1;
    document.removeEventListener('fullscreenchange', this.fullscreenChangeHandler);
    if (this.autoRefreshTimeoutId !== null) {
      clearTimeout(this.autoRefreshTimeoutId);
      this.autoRefreshTimeoutId = null;
    }
    this.clearAnimationIntervals();
    this.destroyLeafletMap();
    if (this.realtimeStationUnsubscribe) {
      this.realtimeStationUnsubscribe();
      this.realtimeStationUnsubscribe = null;
    }
    if (this.realtimeRefreshTimeoutId !== null) {
      clearTimeout(this.realtimeRefreshTimeoutId);
      this.realtimeRefreshTimeoutId = null;
    }
    if (this.silentRefreshSubscription) {
      this.silentRefreshSubscription.unsubscribe();
      this.silentRefreshSubscription = null;
    }
  }

  async refreshDashboard(notifyOnFailure = true): Promise<void> {
    if (this.destroyed) {
      return;
    }

    const refreshToken = ++this.refreshSequence;
    this.loadingDashboard = true;
    const payload = this.buildFiltersPayload();

    try {
      const [overviewRes, stationsRes] = await Promise.all([
        firstValueFrom(this.superAdminDashboardService.getSuperAdminOverview(payload)),
        firstValueFrom(this.superAdminDashboardService.getSuperAdminStationsMap(payload))
      ]);

      if (!this.isRefreshCurrent(refreshToken)) {
        return;
      }

      this.summary = this.normalizeSummary(overviewRes);
      this.stations = this.normalizeStationList(stationsRes);
      this.bindRealtimeStationUpdates(this.stations.map((station) => station.id));
      this.applyStationFiltersAndMap();
      this.lastUpdatedAt = new Date();
    } catch {
      if (!this.isRefreshCurrent(refreshToken)) {
        return;
      }
      await this.loadFallbackDashboard(notifyOnFailure, refreshToken);
    } finally {
      if (this.isRefreshCurrent(refreshToken)) {
        this.loadingDashboard = false;
      }
    }
  }

  onRegionChange(regionId: number | null): void {
    this.selectedRegionId = regionId;
    this.filteredTowns = regionId
      ? this.towns.filter((town) => Number(town.region_id) === Number(regionId))
      : [...this.towns];

    if (this.selectedTownId && !this.filteredTowns.some((town) => Number(town.id) === Number(this.selectedTownId))) {
      this.selectedTownId = null;
    }

    this.queueAutoRefresh();
  }

  onTownChange(townId: number | null): void {
    this.selectedTownId = townId;
    this.queueAutoRefresh();
  }

  onCompanyChange(companyId: number | null): void {
    this.selectedCompanyId = companyId;

    if (companyId) {
      this.superAdminCompanyContextService.setCompanyContext(companyId, this.resolveCompanyName(companyId));
    }

    this.queueAutoRefresh();
  }

  onStatusChange(status: StationActivityStatus | null): void {
    this.selectedStatus = status;
    this.queueAutoRefresh();
  }

  async clearFilters(): Promise<void> {
    this.selectedRegionId = null;
    this.selectedTownId = null;
    this.selectedCompanyId = null;
    this.selectedStatus = null;
    this.filteredTowns = [...this.towns];
    await this.refreshDashboard(false);
  }

  onMapReady(map: L.Map): void {
    if (this.map && this.map !== map) {
      this.destroyLeafletMap();
    }

    this.map = map;
    this.map.dragging.enable();
    this.map.scrollWheelZoom.enable();
    this.map.doubleClickZoom.enable();
    this.map.touchZoom.enable();
    this.map.boxZoom.enable();
    this.map.keyboard.enable();
    setTimeout(() => this.map?.invalidateSize(), 60);
    setTimeout(() => this.fitMapToMarkers(), 0);
  }

  toggleFullScreen(): void {
    const mapContainer = this.mapViewport?.nativeElement;
    if (!mapContainer) {
      return;
    }

    if (!document.fullscreenElement) {
      mapContainer.requestFullscreen();
      return;
    }

    document.exitFullscreen();
  }

  get pagedCompanyStationsRows(): CompanyStationsRow[] {
    return this.companyStationsRows.slice(this.companyStationsFirst, this.companyStationsFirst + this.companyStationsRowsPerPage);
  }

  get pagedUsersRows(): DashboardUserRow[] {
    return this.filteredUsersRows.slice(this.usersFirst, this.usersFirst + this.usersRowsPerPage);
  }

  onCompanyStationsPageChange(event: any): void {
    const first = Number(event?.first ?? 0);
    const rows = this.resolveRowsPerPage(event?.rows, this.companyStationsRowsPerPage);
    this.companyStationsRowsPerPage = rows;
    this.companyStationsFirst = this.clampPaginatorFirst(first, this.companyStationsRows.length, rows);
  }

  onUsersPageChange(event: any): void {
    const first = Number(event?.first ?? 0);
    const rows = this.resolveRowsPerPage(event?.rows, this.usersRowsPerPage);
    this.usersRowsPerPage = rows;
    this.usersFirst = this.clampPaginatorFirst(first, this.filteredUsersRows.length, rows);
  }

  getActivityStatusLabel(status: StationActivityStatus): string {
    return status === 'active' ? 'Actif' : 'Inactif';
  }

  getActivityStatusClass(status: StationActivityStatus): string {
    return status === 'active' ? 'is-active' : 'is-inactive';
  }

  getUserStatusLabel(status: string): string {
    return this.isActiveStatus(status) ? 'Actif' : 'Inactif';
  }

  getUserStatusClass(status: string): string {
    return this.isActiveStatus(status) ? 'is-active' : 'is-inactive';
  }

  private async loadFilterOptions(): Promise<void> {
    try {
      const [regionsRes, townsRes, companiesRes, usersRes] = await Promise.all([
        firstValueFrom(this.superAdminDashboardService.getRegions()),
        firstValueFrom(this.superAdminDashboardService.getTowns()),
        firstValueFrom(this.superAdminDashboardService.getCompanies()),
        firstValueFrom(this.superAdminDashboardService.getUsersContext())
      ]);

      if (this.destroyed) {
        return;
      }

      this.regions = this.extractArray(regionsRes, ['data', 'regions']);
      this.towns = this.extractArray(townsRes, ['data', 'towns']);
      this.filteredTowns = [...this.towns];
      this.companies = this.extractArray(companiesRes, ['data.companies', 'data', 'companies']);
      this.superAdminCompanyContextService.updateCompanyNameFromList(this.companies);

      const contextCompanyId = this.superAdminCompanyContextService.getCompanyId();
      const hasContextInCompanies = !!contextCompanyId && this.companies.some((company: any) => Number(company?.id) === Number(contextCompanyId));

      if (!hasContextInCompanies) {
        const firstCompany = this.companies.find((company: any) => Number(company?.id ?? 0) > 0);
        if (firstCompany) {
          this.superAdminCompanyContextService.setCompanyContext(
            Number(firstCompany.id),
            String(firstCompany?.name ?? '').trim() || null
          );
        }
      }

      this.usersRows = this.normalizeUsers(usersRes);
      this.usersCount = this.usersRows.length;
      this.applyUsersFilter();
    } catch (error: any) {
      if (this.destroyed) {
        return;
      }

      this.messageService.add({
        key: 'tst',
        severity: 'error',
        summary: 'Chargement impossible',
        detail: error?.error?.message || 'Les filtres du dashboard super admin n’ont pas pu être chargés.',
        life: 6000
      });
    }
  }

  private buildFiltersPayload(): SuperAdminDashboardFiltersPayload {
    const payload: SuperAdminDashboardFiltersPayload = {
      region_id: this.selectedRegionId || null,
      town_id: this.selectedTownId || null,
      company_id: this.selectedCompanyId || null,
      status: this.selectedStatus || null
    };

    return payload;
  }

  private normalizeSummary(response: any): SuperAdminSummary {
    const dataPayload = response?.data ?? response ?? {};
    const totals = dataPayload?.totals ?? dataPayload?.summary ?? {};
    const alertsValue = Number(
      totals?.active_alerts_count
      ?? totals?.alerts_count
      ?? totals?.active_alerts_total
      ?? 0
    ) || 0;
    const anomaliesValue = Number(
      totals?.anomalies_count
      ?? totals?.active_anomalies_count
      ?? totals?.anomalies_total
      ?? 0
    ) || 0;

    return {
      companiesCount: Number(
        totals?.companies_total
        ?? totals?.companies_count
        ?? totals?.company_count
        ?? totals?.number_of_companies
        ?? 0
      ) || 0,
      stationsCount: Number(
        totals?.stations_total
        ?? totals?.stations_count
        ?? totals?.sale_points_count
        ?? totals?.number_of_sale_points
        ?? 0
      ) || 0,
      connectedTanksCount: Number(
        totals?.connected_tanks
        ?? totals?.connected_tanks_total
        ?? totals?.connected_tanks_count
        ?? totals?.number_of_connected_tanks
        ?? 0
      ) || 0,
      onlineStationsCount: Number(
        totals?.stations_online
        ?? totals?.stations_enabled
        ?? totals?.online_stations_count
        ?? totals?.stations_online_count
        ?? 0
      ) || 0,
      offlineStationsCount: Number(
        totals?.stations_offline
        ?? totals?.stations_disabled
        ?? totals?.offline_stations_count
        ?? totals?.stations_offline_count
        ?? 0
      ) || 0,
      activeAlertsCount: alertsValue,
      anomaliesCount: anomaliesValue,
      usersCount: Number(totals?.users_total ?? totals?.users_count ?? totals?.total_users_count ?? this.usersCount ?? 0) || 0
    };
  }

  private normalizeStationList(response: any): DashboardStation[] {
    const mapData = response?.data ?? response ?? {};
    const bounds = mapData?.bounds ?? null;
    this.mapBounds = bounds && Number.isFinite(Number(bounds?.min_latitude)) && Number.isFinite(Number(bounds?.max_latitude))
      && Number.isFinite(Number(bounds?.min_longitude)) && Number.isFinite(Number(bounds?.max_longitude))
      ? {
          minLatitude: Number(bounds.min_latitude),
          maxLatitude: Number(bounds.max_latitude),
          minLongitude: Number(bounds.min_longitude),
          maxLongitude: Number(bounds.max_longitude)
        }
      : null;

    const rows = this.extractArray(response, [
      'data.markers',
      'data.stations',
      'data.sale_points',
      'data.service_stations',
      'markers',
      'stations',
      'sale_points',
      'service_stations',
      'data'
    ]);

    return rows
      .map((row: any) => this.normalizeStation(row))
      .filter((row: DashboardStation | null): row is DashboardStation => !!row);
  }

  private normalizeStation(row: any): DashboardStation | null {
    const latitude = Number(row?.latitude ?? row?.lat ?? row?.location?.latitude ?? row?.location?.lat ?? NaN);
    const longitude = Number(row?.longitude ?? row?.lng ?? row?.location?.longitude ?? row?.location?.lng ?? NaN);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    const companyId = Number(row?.company_id ?? row?.company?.id ?? 0) || null;
    const townId = Number(row?.town_id ?? row?.town?.id ?? 0) || null;
    const regionId = Number(row?.region_id ?? row?.region?.id ?? row?.town?.region_id ?? 0) || null;
    const connectedTanks = Number(row?.connected_tanks_count ?? row?.number_of_connected_tanks ?? row?.connected_tanks ?? row?.tanks_count ?? 0) || 0;
    const alertsCount = Number(row?.active_alerts_count ?? row?.alerts_count ?? 0) || 0;
    const anomaliesCount = Number(row?.anomalies_count ?? row?.active_anomalies_count ?? 0) || 0;

    return {
      id: Number(row?.id ?? 0) || 0,
      name: row?.name ?? row?.station_name ?? 'Station',
      latitude,
      longitude,
      companyId,
      companyName: row?.company?.name ?? row?.company_name ?? '-',
      regionId,
      regionName: row?.region?.name ?? row?.town?.region?.name ?? row?.region_name ?? '-',
      townId,
      townName: row?.town?.name ?? row?.town_name ?? '-',
      activityStatus: this.normalizeActivityStatus(row?.status ?? row?.activity_status),
      monitorStatus: this.normalizeMonitorStatus(row, alertsCount),
      isEmitting: this.resolveIsEmitting(row),
      connectedTanks,
      alertsCount,
      anomaliesCount
    };
  }

  private normalizeActivityStatus(status: any): StationActivityStatus {
    const value = String(status ?? '').trim().toLowerCase();
    if (value === 'enabled' || value === 'active' || value === '1' || value === 'true') {
      return 'active';
    }

    return 'inactive';
  }

  private normalizeMonitorStatus(row: any, alertsCount: number): StationMonitorStatus {
    const rawStatus = String(
      row?.monitor_status
      ?? row?.connection_status
      ?? row?.telemetry_status
      ?? row?.station_status
      ?? row?.signal_status
      ?? ''
    ).trim().toLowerCase();

    if (rawStatus.includes('alert') || alertsCount > 0) {
      return 'alert';
    }

    if (rawStatus.includes('online') || rawStatus.includes('connected')) {
      return 'online';
    }

    if (rawStatus.includes('offline') || rawStatus.includes('disconnected')) {
      return 'offline';
    }

    return this.normalizeActivityStatus(row?.status) === 'active' ? 'online' : 'offline';
  }

  private resolveIsEmitting(row: any): boolean {
    const directFlags = [
      row?.is_emitting,
      row?.emits,
      row?.is_transmitting,
      row?.transmitting,
      row?.has_signal
    ];

    if (directFlags.some((flag) => typeof flag === 'boolean')) {
      return directFlags.some((flag) => flag === true);
    }

    const measuredAt = row?.last_measure_at ?? row?.last_measured_at ?? row?.last_signal_at ?? null;
    if (measuredAt) {
      return true;
    }

    const connectivity = String(
      row?.connection_status
      ?? row?.monitor_status
      ?? row?.telemetry_status
      ?? row?.signal_status
      ?? ''
    ).trim().toLowerCase();
    if (connectivity.includes('offline') || connectivity.includes('disconnected')) {
      return false;
    }
    if (connectivity.includes('online') || connectivity.includes('connected')) {
      return true;
    }

    // Backend currently does not always expose an explicit emission flag; enabled stations are considered live by default.
    return this.normalizeActivityStatus(row?.status ?? row?.activity_status) === 'active';
  }

  private applyStationFiltersAndMap(): void {
    const filteredStations = this.stations.filter((station) => {
      if (this.selectedRegionId && Number(station.regionId) !== Number(this.selectedRegionId)) {
        return false;
      }

      if (this.selectedTownId && Number(station.townId) !== Number(this.selectedTownId)) {
        return false;
      }

      if (this.selectedCompanyId && Number(station.companyId) !== Number(this.selectedCompanyId)) {
        return false;
      }

      if (this.selectedStatus && station.activityStatus !== this.selectedStatus) {
        return false;
      }

      return true;
    });

    this.filteredStations = filteredStations;
    this.emittingStations = filteredStations.filter((station) => station.isEmitting);
    this.companyStationsRows = this.buildCompanyStationsRows(filteredStations);
    this.companyStationsFirst = this.clampPaginatorFirst(
      this.companyStationsFirst,
      this.companyStationsRows.length,
      this.companyStationsRowsPerPage
    );
    this.applyUsersFilter();
    this.clearAnimationIntervals();

    const layers: L.Layer[] = [];
    this.filteredStations.forEach((station) => {
      const marker = L.marker([station.latitude, station.longitude], {
        icon: this.getStationIcon(station),
        title: station.name,
        riseOnHover: true
      }).bindPopup(this.buildPopup(station));
      layers.push(marker);

      if (this.shouldAnimateStation(station)) {
        layers.push(this.createAnimatedRipple(marker.getLatLng(), '#ffc107'));
      }
    });

    this.mapLayers = layers;

    this.fitMapToMarkers();
  }

  private fitMapToMarkers(): void {
    if (!this.map) {
      return;
    }

    if (!this.mapLayers.length) {
      if (this.mapBounds) {
        this.map.fitBounds([
          [this.mapBounds.minLatitude, this.mapBounds.minLongitude],
          [this.mapBounds.maxLatitude, this.mapBounds.maxLongitude]
        ], { padding: [24, 24] });
        return;
      }
      this.map.setView([5.8, 12.5], 6);
      return;
    }

    const group = L.featureGroup(this.mapLayers as L.Layer[]);
    this.map.fitBounds(group.getBounds().pad(0.2));
  }

  private destroyLeafletMap(): void {
    if (this.map) {
      try {
        this.map.off();
        this.map.remove();
      } catch {
        // During rapid route transitions, ngx-leaflet and component teardown can overlap.
        // Ignore duplicate destroy errors and continue cleanup.
      } finally {
        this.map = undefined;
      }
    }

    const mapCanvasElement = this.mapCanvas?.nativeElement as any;
    if (mapCanvasElement && mapCanvasElement._leaflet_id) {
      try {
        delete mapCanvasElement._leaflet_id;
      } catch {
        mapCanvasElement._leaflet_id = undefined;
      }
    }
  }

  private getMarkerColor(status: StationMonitorStatus): string {
    if (status === 'online') {
      return '#10b981';
    }

    if (status === 'alert') {
      return '#ef4444';
    }

    return '#6b7280';
  }

  private getStationIcon(station: DashboardStation): L.Icon {
    let iconFile = 'geo-station-pin-black.svg';

    if (station.monitorStatus === 'alert') {
      iconFile = 'geo-station-pin-red.svg';
    } else if (station.monitorStatus === 'online' && station.isEmitting) {
      iconFile = 'geo-station-pin-green.svg';
    } else if (station.activityStatus === 'active') {
      iconFile = 'geo-station-pin-blue.svg';
    }

    return L.icon({
      iconUrl: `assets/img/markers/${iconFile}`,
      iconSize: [38, 95],
      iconAnchor: [18, 64],
      popupAnchor: [-0.3, -27]
    });
  }

  private shouldAnimateStation(station: DashboardStation): boolean {
    return station.activityStatus === 'active' && station.isEmitting && station.monitorStatus !== 'offline';
  }

  private createAnimatedRipple(latLng: L.LatLng, color: string): L.CircleMarker {
    const ripple = L.circleMarker(latLng, {
      color,
      opacity: 0.16,
      weight: 0.16,
      fillColor: color,
      fillOpacity: 0.16,
      radius: 10
    });

    let radius = 10;
    const maxRadius = 38;
    const intervalId = setInterval(() => {
      radius += 9;
      if (radius > maxRadius) {
        radius = 10;
      }
      ripple.setRadius(radius);
    }, 140);
    this.animationIntervalIds.push(intervalId);

    return ripple;
  }

  private clearAnimationIntervals(): void {
    this.animationIntervalIds.forEach((id) => clearInterval(id));
    this.animationIntervalIds = [];
  }

  private buildPopup(station: DashboardStation): string {
    return `
      <div class="popup-card">
        <strong>${station.name}</strong><br />
        <span>Entreprise: ${station.companyName}</span><br />
        <span>Ville: ${station.townName}</span><br />
        <span>Région: ${station.regionName}</span><br />
        <span>Activité: ${station.activityStatus}</span><br />
        <span>Statut: ${station.monitorStatus}</span><br />
        <span>Cuves connectées: ${station.connectedTanks}</span><br />
        <span>Alertes: ${station.alertsCount} | Anomalies: ${station.anomaliesCount}</span>
      </div>
    `;
  }

  private async loadFallbackDashboard(notifyOnFailure: boolean, refreshToken: number): Promise<void> {
    try {
      const [companiesRes, stationsRes, usersRes] = await Promise.all([
        firstValueFrom(this.superAdminDashboardService.getCompanies()),
        firstValueFrom(this.superAdminDashboardService.getAllStations()),
        firstValueFrom(this.superAdminDashboardService.getUsersContext())
      ]);

      if (!this.isRefreshCurrent(refreshToken)) {
        return;
      }

      const companies = this.extractArray(companiesRes, ['data', 'companies']);
      if (!this.companies.length && companies.length) {
        this.companies = companies;
      }

      this.stations = this.normalizeStationList(stationsRes);
      this.bindRealtimeStationUpdates(this.stations.map((station) => station.id));
      this.applyStationFiltersAndMap();

      this.usersRows = this.normalizeUsers(usersRes);
      this.usersCount = this.usersRows.length;
      this.applyUsersFilter();
      this.lastUpdatedAt = new Date();
      const filteredStations = this.filteredStations;

      const stationIds = new Set<number>();
      const companyIds = new Set<number>();
      let connectedTanksCount = 0;
      let onlineCount = 0;
      let offlineCount = 0;
      let alertsCount = 0;
      let anomaliesCount = 0;

      filteredStations.forEach((station) => {
        stationIds.add(station.id);
        if (station.companyId) {
          companyIds.add(station.companyId);
        }
        connectedTanksCount += station.connectedTanks;
        alertsCount += station.alertsCount;
        anomaliesCount += station.anomaliesCount;

        if (station.monitorStatus === 'online') {
          onlineCount += 1;
        } else if (station.monitorStatus === 'offline') {
          offlineCount += 1;
        }
      });

      this.summary = {
        companiesCount: this.selectedCompanyId ? (companyIds.size ? 1 : 0) : (companyIds.size || companies.length),
        stationsCount: stationIds.size,
        connectedTanksCount,
        onlineStationsCount: onlineCount,
        offlineStationsCount: offlineCount,
        activeAlertsCount: alertsCount,
        anomaliesCount,
        usersCount: this.usersCount
      };

      if (!this.superAdminEndpointsUnavailable && notifyOnFailure) {
        this.messageService.add({
          key: 'tst',
          severity: 'warn',
          summary: 'Mode de secours',
          detail: 'Le dashboard super admin utilise des données de secours en attendant vos nouveaux endpoints dédiés.',
          life: 6500
        });
      }
      this.superAdminEndpointsUnavailable = true;
    } catch (error: any) {
      if (!this.isRefreshCurrent(refreshToken)) {
        return;
      }

      this.summary = {
        companiesCount: 0,
        stationsCount: 0,
        connectedTanksCount: 0,
        onlineStationsCount: 0,
        offlineStationsCount: 0,
        activeAlertsCount: 0,
        anomaliesCount: 0,
        usersCount: 0
      };
      this.mapLayers = [];
      this.emittingStations = [];

      this.messageService.add({
        key: 'tst',
        severity: 'error',
        summary: 'Chargement impossible',
        detail: error?.error?.message || 'Aucune donnée n’a pu être chargée pour le dashboard super admin.',
        life: 7000
      });
    }
  }

  private extractArray(response: any, paths: string[]): any[] {
    for (const path of paths) {
      const value = this.resolvePath(response, path);
      if (Array.isArray(value)) {
        return value;
      }
    }
    return [];
  }

  private resolvePath(source: any, path: string): any {
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), source);
  }

  private queueAutoRefresh(delayMs = 280): void {
    if (this.destroyed || this.loadingContext) {
      return;
    }

    if (this.autoRefreshTimeoutId !== null) {
      clearTimeout(this.autoRefreshTimeoutId);
      this.autoRefreshTimeoutId = null;
    }

    this.autoRefreshTimeoutId = setTimeout(() => {
      this.autoRefreshTimeoutId = null;
      if (this.destroyed) {
        return;
      }
      void this.refreshDashboard(false);
    }, delayMs);
  }

  private bindRealtimeStationUpdates(stationIds: Array<number | null | undefined>): void {
    if (this.destroyed) {
      return;
    }
    const normalizedIds = [...new Set(
      stationIds
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id) && id > 0)
    )];
    const key = normalizedIds.slice().sort((a, b) => a - b).join(',');

    if (key === this.realtimeStationKey) {
      return;
    }

    if (this.realtimeStationUnsubscribe) {
      this.realtimeStationUnsubscribe();
      this.realtimeStationUnsubscribe = null;
    }

    this.realtimeStationKey = key;
    if (!normalizedIds.length) {
      return;
    }

    this.realtimeStationUnsubscribe = this.realtimeRecordUpdatesService.subscribeToStationRecorded(
      normalizedIds,
      () => this.scheduleRealtimeDashboardRefresh()
    );
  }

  private scheduleRealtimeDashboardRefresh(delayMs = 350): void {
    if (this.destroyed || this.loadingContext) {
      return;
    }

    if (this.realtimeRefreshTimeoutId !== null) {
      clearTimeout(this.realtimeRefreshTimeoutId);
      this.realtimeRefreshTimeoutId = null;
    }

    this.realtimeRefreshTimeoutId = setTimeout(() => {
      this.realtimeRefreshTimeoutId = null;
      if (this.destroyed) {
        return;
      }

      if (!this.loadingDashboard) {
        void this.refreshDashboard(false);
      }
    }, delayMs);
  }

  private buildCompanyStationsRows(stations: DashboardStation[]): CompanyStationsRow[] {
    const companyMap = new Map<string, CompanyStationsRow>();

    stations.forEach((station) => {
      const key = `${station.companyId ?? 'none'}:${station.companyName}`;
      if (!companyMap.has(key)) {
        companyMap.set(key, {
          companyId: station.companyId,
          companyName: station.companyName || '-',
          stationCount: 0,
          connectedTanks: 0,
          overallStatus: 'inactive',
          stations: []
        });
      }

      const row = companyMap.get(key)!;
      row.stations.push({
        id: station.id,
        name: station.name,
        townName: station.townName,
        status: station.activityStatus,
        monitorStatus: station.monitorStatus,
        isEmitting: station.isEmitting
      });
      row.stationCount += 1;
      row.connectedTanks += station.connectedTanks;
      if (station.activityStatus === 'active') {
        row.overallStatus = 'active';
      }
    });

    return [...companyMap.values()]
      .map((row) => ({
        ...row,
        stations: [...row.stations].sort((a, b) => a.name.localeCompare(b.name))
      }))
      .sort((a, b) => a.companyName.localeCompare(b.companyName));
  }

  private normalizeUsers(response: any): DashboardUserRow[] {
    const users = this.extractArray(response, ['users', 'data.users', 'data']);
    const roles = this.extractArray(response, ['roles', 'data.roles']);
    const userHasRoles = this.extractArray(response, ['user_has_roles', 'data.user_has_roles']);

    const roleNameById = new Map<number, string>();
    roles.forEach((role: any) => {
      const roleId = Number(role?.id ?? 0);
      const roleName = String(role?.name ?? '').trim();
      if (roleId && roleName) {
        roleNameById.set(roleId, roleName);
      }
    });

    const userRoleNamesByUserId = new Map<number, string[]>();
    userHasRoles.forEach((pivot: any) => {
      const userId = Number(pivot?.user_id ?? 0);
      const roleId = Number(pivot?.role_id ?? 0);
      const roleName = roleNameById.get(roleId) ?? String(pivot?.role?.name ?? '').trim();
      if (!userId || !roleName) {
        return;
      }

      if (!userRoleNamesByUserId.has(userId)) {
        userRoleNamesByUserId.set(userId, []);
      }
      userRoleNamesByUserId.get(userId)!.push(roleName);
    });

    return users.map((user: any) => {
      const firstName = user?.first_name ?? '';
      const lastName = user?.last_name ?? '';
      const fullName = `${firstName} ${lastName}`.trim() || user?.name || `Utilisateur #${user?.id ?? '-'}`;
      const userId = Number(user?.id ?? 0) || 0;

      const directRoleNames = Array.isArray(user?.roles)
        ? user.roles
            .map((role: any) => String(role?.name ?? role ?? '').trim())
            .filter((name: string) => !!name)
        : [];
      const pivotRoleNames = userRoleNamesByUserId.get(userId) ?? [];
      const fallbackRoleHints = [
        String(user?.role_type ?? '').trim(),
        String(user?.role?.name ?? '').trim()
      ].filter((name) => !!name);

      const combinedRoleNames = Array.from(
        new Set([...directRoleNames, ...pivotRoleNames, ...fallbackRoleHints])
      );
      const roleType = combinedRoleNames.length ? combinedRoleNames.join(', ') : '-';

      return {
        id: userId,
        fullName,
        email: user?.email ?? '-',
        status: String(user?.status ?? '').trim() || '-',
        roleType,
        companyId: Number(user?.company_id ?? user?.company?.id ?? 0) || null,
        companyName: user?.company?.name ?? '-'
      };
    }).sort((a, b) => a.fullName.localeCompare(b.fullName));
  }

  private applyUsersFilter(): void {
    if (!this.selectedCompanyId) {
      this.filteredUsersRows = [...this.usersRows];
      this.usersFirst = this.clampPaginatorFirst(this.usersFirst, this.filteredUsersRows.length, this.usersRowsPerPage);
      return;
    }

    this.filteredUsersRows = this.usersRows.filter((user) => Number(user.companyId) === Number(this.selectedCompanyId));
    this.usersFirst = this.clampPaginatorFirst(this.usersFirst, this.filteredUsersRows.length, this.usersRowsPerPage);
  }

  private resolveCompanyName(companyId: number | null): string | null {
    if (!companyId) {
      return null;
    }

    const match = this.companies.find((company: any) => Number(company?.id) === Number(companyId));
    const name = String(match?.name ?? '').trim();
    return name.length ? name : null;
  }

  private isRefreshCurrent(refreshToken: number): boolean {
    return !this.destroyed && refreshToken === this.refreshSequence;
  }

  private isActiveStatus(status: string): boolean {
    const value = String(status ?? '').trim().toLowerCase();
    return value === 'active' || value === 'enabled' || value === '1' || value === 'true';
  }

  private resolveRowsPerPage(rows: any, fallback: number): number {
    const parsed = Number(rows);
    const valid = this.tableRowsPerPageOptions.includes(parsed);
    return valid ? parsed : fallback;
  }

  private clampPaginatorFirst(first: number, totalRecords: number, rowsPerPage: number): number {
    if (!totalRecords || totalRecords <= 0) {
      return 0;
    }

    const safeFirst = Number.isFinite(first) ? Math.max(0, Math.floor(first)) : 0;
    const pageSize = rowsPerPage > 0 ? rowsPerPage : 10;
    const maxFirst = Math.floor((totalRecords - 1) / pageSize) * pageSize;
    return Math.min(safeFirst, maxFirst);
  }
}
