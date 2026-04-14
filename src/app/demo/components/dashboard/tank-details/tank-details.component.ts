import { RecordService } from './../services/record.service';
import { slideInAnimation } from './../../../animations/animation1';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';
import { TableRowSelectEvent } from 'primeng/table';
import { Subscription, interval, switchMap } from 'rxjs';
import { PusherService } from '../services/pusher.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { InteractionService } from 'src/app/demo/services/interaction.service';
import * as Utility from '../../../utilities/utility';
import { UIChart } from 'primeng/chart';
import { PdfService } from 'src/app/demo/services/pdf.service';
import { LocalStorageService } from '../../auth/services/local-storage.service';
import { SilentRefreshService } from 'src/app/demo/services/silent-refresh.service';

@Component({
  selector: 'app-tank-details',
  templateUrl: './tank-details.component.html',
  styleUrls: ['./tank-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [ MessageService ]
})
export class TankDetailsComponent implements OnInit, OnDestroy {

    records: any[]=[];
    t1:Subscription;
    d:string = new Date().toLocaleString();
    stationId:any;
    tankId:any;
    user_details:any;
    tankDetailsData:any;

    @ViewChild('line') line!: UIChart;

    data: any;

    options: any;
    output_volumes: Array<any> = [];
    ajusted_records: Array<any> = [];
    dayNotifications: any[] = [];
    dayNotificationTotal = 0;
    dayOutputTotal = 0;
    notificationTimezone = 'Africa/Douala';
    notificationDateKey = '';
    private silentRefreshSubscription: Subscription | null = null;

    constructor(
        private messageService: MessageService,
        private cookieService: CookieService,
        private router: Router,
        private route: ActivatedRoute,
        private interactionService: InteractionService,
        private recordService: RecordService,
        private ref: ChangeDetectorRef,
        private pusherService: PusherService,
        private localStorageService: LocalStorageService,
        private pdfService: PdfService,
        private silentRefreshService: SilentRefreshService
        ) { }

    ngOnInit() {
        // this.user = JSON.parse(this.cookieService.get('User'));
        // this.stationId = this.user['station'];
        this.user_details = this.localStorageService.getUserDetails();
        this.stationId = this.localStorageService.getServiceStationId();
        //;
        this.tankId = this.route.snapshot.paramMap.get('id');
        this.notificationTimezone = this.resolveStationTimezone();
        this.notificationDateKey = this.getLocalDateKey();
        this.getTankDetailsData();
        //;
        this.subscribeToChannelSocket();
        this.t1=interval(1000).subscribe(n => this.getStringDate());
        this.silentRefreshSubscription = this.silentRefreshService.create(300000).subscribe(() => {
            this.getTankDetailsData(false);
        });
        this.getSubscribeData();

    }

    showNotificationMessage(){
        if(this.tankDetailsData?.lastNotification != null){
            if(this.tankDetailsData?.lastNotification && this.tankDetailsData?.listLastRecord?.length){
                let summary = 'Cuve: '+this.tankDetailsData?.tank.sensor_reference+' '+this.tankDetailsData?.lastNotification?.type_notification?.wording;
                let message = "";

                if(this.tankDetailsData?.lastNotification?.type_notification?.code == "jo-co-re"){
                    message = " Il reste : "+this.tankDetailsData?.lastNotification?.remaining_day+" jours de consommation.";
                }else{
                    message = " % occupation de cuve: "+this.tankDetailsData?.lastNotification?.percent+" % ";
                }
                this.messageService.add({ severity: 'info', summary: summary, detail: message });
            }

        }

    }

    private getRecordMoment(record: any): number {
        const createdAt = record?.created_at ? new Date(record.created_at).getTime() : 0;
        const updatedAt = record?.updated_at ? new Date(record.updated_at).getTime() : 0;
        return Math.max(createdAt, updatedAt);
    }

    private getSortedRecords(records: any[] = []): any[] {
        return [...records].sort((a, b) => this.getRecordMoment(b) - this.getRecordMoment(a));
    }

    private getLatestRecord() {
        return this.tankDetailsData?.listLastRecord?.length ? this.tankDetailsData.listLastRecord[0] : null;
    }

    private getPreviousRecord() {
        return this.tankDetailsData?.listLastRecord?.length > 1 ? this.tankDetailsData.listLastRecord[1] : null;
    }

    private parseMetric(value: any): number | null {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        const parsed = Number(value);
        return Number.isNaN(parsed) ? null : parsed;
    }

    private getFuelVolume(record: any): number | null {
        return this.parseMetric(record?.fuel_volume ?? record?.volume);
    }

    private formatFuelVolume(value: number): string {
        return value.toFixed(5);
    }

    getFuelVolumeDisplay(record: any): string {
        const fuelVolume = this.getFuelVolume(record);
        return fuelVolume === null ? '---' : this.formatFuelVolume(fuelVolume);
    }

    private getWaterHeight(record: any): number | null {
        return this.parseMetric(record?.water_height);
    }

    private getWaterVolumeMetric(record: any): number | null {
        return this.parseMetric(record?.water_volume);
    }

    private getRoundedMetricOrNull(value: any): number | null {
        const parsed = this.parseMetric(value);
        return parsed === null ? null : this.getRoundValue(parsed);
    }

    initGraphData(){
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        let v:any[]=[];
        let v15:any[]=[];
        let t:any[]=[];
        let d:any[]=[];
        let l:any[]=[];
        let wv:any[]=[];
        let time:any[]=[];

        if(this.tankDetailsData?.listLastRecord?.length > 0){
            let listRecord = this.tankDetailsData?.listLastRecord;

            for (let i = (listRecord.length-1); i >=0; i--) {
                const record = listRecord[i];
                time.push(this.getToLocalDateTime(record?.updated_at))
                d.push(this.getRoundValue(record?.density));
                l.push(this.getRoundValue(record?.liquid_height));
                v.push(this.getFuelVolume(record));
                v15.push(this.getRoundValue(record?.volume_at_fift));
                t.push(this.getRoundValue(record?.liquid_temperature));
                wv.push(this.getRoundedMetricOrNull(this.getWaterVolumeMetric(record)));
            }

            this.data = {
                labels: time,
                datasets: [
                    {
                        label: 'Niveau(cm)',
                        data: l,
                        fill: false,
                        tension: 0.4,
                        borderColor: documentStyle.getPropertyValue('--blue-500')
                    },
                    {
                        label: 'Volume carburant (litres)',
                        data: v,
                        fill: false,
                        tension: 0.4,
                        borderColor: documentStyle.getPropertyValue('--teal-500')
                    },
                    {
                        label: 'Volume eau (litres)',
                        data: wv,
                        fill: false,
                        tension: 0.4,
                        borderColor: documentStyle.getPropertyValue('--cyan-500')
                    },
                    {
                        label: 'Density',
                        data: d,
                        fill: false,
                        borderColor: documentStyle.getPropertyValue('--orange-500'),
                        tension: 0.4,
                    },
                    {
                        label: 'Temperature',
                        data: t,
                        fill: false,
                        borderColor: documentStyle.getPropertyValue('--indigo-500'),
                        tension: 0.4,
                    },
                    {
                        label: 'Volume à 15C',
                        data: v15,
                        fill: false,
                        borderColor: documentStyle.getPropertyValue('--red-500'),
                        tension: 0.4,
                    }

                ]
            };

            this.options = {
                maintainAspectRatio: false,
                aspectRatio: 0.6,
                plugins: {
                    legend: {
                        labels: {
                            color: textColor
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: textColorSecondary
                        },
                        grid: {
                            color: surfaceBorder
                        }
                    },
                    y: {
                        ticks: {
                            color: textColorSecondary
                        },
                        grid: {
                            color: surfaceBorder
                        }
                    }
                }
            };

        }
        this.line?.refresh();


    }

    generateTankDataDetailsImage(){
        let a = document.createElement('a');
        a.href = this.line.getBase64Image();
        a.download = 'Graphe '+this.tankDetailsData?.tank?.sensor_reference+'.png';
        a.click();
        ("j'exporte les graphes: ");
    }

    generateTankDataDetailsPdf(){
        let usefullData = {
            user_details: this.user_details,
            tank: this.tankDetailsData?.tank,
            period: Utility.toLocalDate(this.records[0]?.updated_at),
            listRecords: this.ajusted_records
        };
        this.pdfService.generateTankDataPdf(usefullData);
    }

    /* if(value > 0){
        return ''+value;
    }else{
        return '---';
    } */

    getLevel(){
        const latestRecord = this.getLatestRecord();
        if(latestRecord){
            return ''+Math.round(latestRecord.liquid_height*100)/100;
        }
        return '---';
    }

    getListDayRecord(){
        if(this.tankDetailsData?.listLastRecord?.length > 0){

            return this.tankDetailsData.listLastRecord;
        }
        return [];
    }



    getVolumeAtT(){
        const latestRecord = this.getLatestRecord();
        const fuelVolume = this.getFuelVolume(latestRecord);
        if(latestRecord && fuelVolume !== null){
            return this.formatFuelVolume(fuelVolume) + ' / ' + latestRecord.total_volume;
        }
        return '---';
    }

    getOutputVolume() {
        return this.getRoundValue(this.dayOutputTotal);
    }

    getPercentOccupation(){
        const latestRecord = this.getLatestRecord();
        if(latestRecord){
            let percent = Math.round(latestRecord.volume*10000/latestRecord.total_volume)/100;
            return ''+ percent;
        }
        return '---';
    }

    getSeverityPercent(){
        let s= parseFloat(this.getPercentOccupation());
        if(s < 20){
            return 'danger';
        }else{
            return 'info';
        }
    }

    getVolumeToDepote(){
        const latestRecord = this.getLatestRecord();
        if(latestRecord){
            let v = Math.round((latestRecord.total_volume - latestRecord.volume)*1000)/1000;
            return ''+ v + ' litres';
        }
        return '---';
    }

    getVolumeAtT15(){
        const latestRecord = this.getLatestRecord();
        if(latestRecord){
            return ''+Math.round(latestRecord.volume_at_fift*100)/100;
        }
        return '---';
    }

    getLiquidTemp(){
        const latestRecord = this.getLatestRecord();
        if(latestRecord){
            let value = latestRecord.liquid_temperature;
            if(value > 0){
                return ''+value;
            }else{
                return 31.8;
            }
        }
        return 31.8;
    }

    getEnvTemp(){
        const latestRecord = this.getLatestRecord();
        if(latestRecord){
            let value = latestRecord.env_temperature;
            if(value > 0){
                return ''+value;
            }else{
                return 38;
            }
        }
        return 38;
    }

    getDensity(){
        const latestRecord = this.getLatestRecord();
        if(latestRecord){
            let value = Math.round(latestRecord.density*100)/100;
            if(value > 0){
                return ''+value;
            }else{
                return '---';
            }
        }
        return '---';
    }

    getRmDay(){
        if(this.tankDetailsData?.lastNotification){
            return ''+ Math.round( this.tankDetailsData?.lastNotification?.remaining_day*100)/100;
        }
        return '---';
    }

    getSeverityRmDay(){
        let rmd=Math.round( this.tankDetailsData?.lastNotification?.remaining_day*100)/100;
        if(rmd <= 5){
            return 'danger';
        }else{
            return 'info';
        }
    }

    getLastIncomeDateRecord(){
        const latestRecord = this.getLatestRecord();
        if(latestRecord){
            return ''+Utility.toLocalDateTime(latestRecord.updated_at);
        }
        return '---';
    }

    getWaterLevel() {
        return this.getWaterLevelValue(this.getLatestRecord());
    }

    getWaterLevelValue(record: any) {
        const waterHeight = this.getWaterHeight(record);

        if (waterHeight === null) {
            return '---';
        }

        return '' + this.getRoundValue(waterHeight);
    }

    getWaterVolume() {
        return this.getWaterVolumeValue(this.getLatestRecord());
    }

    getWaterVolumeValue(record: any) {
        const waterVolume = this.getWaterVolumeMetric(record);

        if (waterVolume === null) {
            return '---';
        }

        return '' + this.getRoundValue(waterVolume);
    }

    getToLocalDateTime(date1:string){
        return Utility.toLocalDateTime(date1);
    }

    private resolveStationTimezone(): string {
        const fallback = 'Africa/Douala';
        const stationList = Array.isArray(this.user_details?.service_stations) ? this.user_details.service_stations : [];
        const currentStation = stationList.find((station: any) => Number(station?.id) === Number(this.stationId)) ?? null;

        const candidates = [
            this.user_details?.timezone,
            this.user_details?.time_zone,
            currentStation?.timezone,
            currentStation?.time_zone
        ].filter((value: any) => typeof value === 'string' && value.trim().length > 0);

        for (const candidate of candidates) {
            const timezone = String(candidate).trim();
            try {
                // Validate timezone identifier before using it.
                Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
                return timezone;
            } catch {
                // Ignore invalid identifiers and keep searching.
            }
        }

        return fallback;
    }

    private getLocalDateKey(date: Date = new Date(), timezone: string = this.notificationTimezone): string {
        try {
            const parts = new Intl.DateTimeFormat('en-CA', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).formatToParts(date);

            const year = parts.find((part) => part.type === 'year')?.value;
            const month = parts.find((part) => part.type === 'month')?.value;
            const day = parts.find((part) => part.type === 'day')?.value;
            if (year && month && day) {
                return `${year}-${month}-${day}`;
            }
        } catch {
            // Fallback to local timezone if Intl timezone formatting fails.
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private getRecordDateKey(record: any, timezone: string = this.notificationTimezone): string | null {
        const candidate = record?.updated_at ?? record?.created_at ?? null;
        if (!candidate) {
            return null;
        }

        const timestamp = new Date(candidate);
        if (Number.isNaN(timestamp.getTime())) {
            return null;
        }

        return this.getLocalDateKey(timestamp, timezone);
    }

    private computeOutputSumFromRecords(records: any[]): number {
        if (!Array.isArray(records) || records.length < 2) {
            return 0;
        }

        const sorted = this.getSortedRecords(records);
        let total = 0;

        for (let i = 0; i < sorted.length - 1; i++) {
            const latestVolume = this.getFuelVolume(sorted[i]);
            const previousVolume = this.getFuelVolume(sorted[i + 1]);

            if (latestVolume !== null && previousVolume !== null && latestVolume <= previousVolume) {
                total += (previousVolume - latestVolume);
            }
        }

        return this.getRoundValue(total);
    }

    private computeDayOutputFromCurrentRecords(dayKey: string): number {
        const sourceRecords = Array.isArray(this.records) ? this.records : [];
        const sameDayRecords = sourceRecords.filter((record: any) => this.getRecordDateKey(record) === dayKey);
        return this.computeOutputSumFromRecords(sameDayRecords);
    }

    private refreshDayOutputTotal(): void {
        if (!this.tankId) {
            this.dayOutputTotal = 0;
            return;
        }

        const dayKey = this.getLocalDateKey();
        const payload = {
            tankId: Number(this.tankId),
            dateStart: dayKey
        };

        this.recordService.getListRecordsForOneDay(payload).subscribe({
            next: (response: any) => {
                const dayRecords = Array.isArray(response) ? response : [];
                this.dayOutputTotal = this.computeOutputSumFromRecords(dayRecords);
            },
            error: () => {
                this.dayOutputTotal = this.computeDayOutputFromCurrentRecords(dayKey);
            }
        });
    }

    private refreshDayNotifications(): void {
        if (!this.tankId) {
            this.dayNotifications = [];
            this.dayNotificationTotal = 0;
            return;
        }

        const date = this.getLocalDateKey();
        this.recordService.getTankDayNotifications(Number(this.tankId), date, this.notificationTimezone).subscribe({
            next: (response: any) => {
                const payload = response?.data ?? [];
                this.dayNotifications = Array.isArray(payload)
                    ? payload.sort((a: any, b: any) => this.getNotificationTimestamp(b) - this.getNotificationTimestamp(a))
                    : [];
                this.dayNotificationTotal = Number(response?.total ?? this.dayNotifications.length) || 0;
                this.notificationDateKey = date;
            },
            error: () => {
                // Keep graceful fallback when endpoint fails.
                const fallback = this.getFallbackNotifications();
                this.dayNotifications = fallback;
                this.dayNotificationTotal = fallback.length;
                this.notificationDateKey = date;
            }
        });
    }

    private getNotificationTimestamp(notification: any): number {
        const candidate = notification?.event_time ?? notification?.updated_at ?? notification?.created_at ?? null;
        if (!candidate) {
            return 0;
        }

        const parsed = new Date(candidate).getTime();
        return Number.isNaN(parsed) ? 0 : parsed;
    }

    private isSameLocalDay(timestamp: number, now: Date = new Date()): boolean {
        if (!timestamp) {
            return false;
        }

        const date = new Date(timestamp);
        return date.getFullYear() === now.getFullYear()
            && date.getMonth() === now.getMonth()
            && date.getDate() === now.getDate();
    }

    getTodayNotifications(): any[] {
        return this.dayNotifications;
    }

    private getFallbackNotifications(): any[] {
        const now = new Date();
        let list = this.tankDetailsData?.listLastNotifications ?? [];
        if (!Array.isArray(list)) {
            list = [];
        }

        if (!list.length && this.tankDetailsData?.lastNotification) {
            list = [this.tankDetailsData.lastNotification];
        }

        const filtered = list.filter((notification: any) => this.isSameLocalDay(this.getNotificationTimestamp(notification), now));

        return filtered.sort((a: any, b: any) => this.getNotificationTimestamp(b) - this.getNotificationTimestamp(a));
    }

    private getLatestTodayNotification(): any | null {
        return this.getTodayNotifications()[0] ?? null;
    }

    private getNotificationTypeCode(notification: any): string | null {
        return notification?.type_notification_code
            ?? notification?.type_notification?.code
            ?? notification?.type_code
            ?? notification?.code
            ?? null;
    }

    getNotificationDescription(notification: any): string {
        if (!notification) {
            return '---';
        }

        const typeCode = this.getNotificationTypeCode(notification);
        if (typeCode === 'jo-co-re' && notification?.remaining_day !== null && notification?.remaining_day !== undefined) {
            return 'Jours restants: ' + notification.remaining_day;
        }

        if (notification?.percent !== null && notification?.percent !== undefined) {
            return 'Occupation: ' + notification.percent + '%';
        }

        if (notification?.volume !== null && notification?.volume !== undefined) {
            return 'Volume: ' + this.getRoundValue(notification.volume) + ' L';
        }

        return notification?.message ?? '---';
    }

    getNotificationType(notification: any): string {
        return notification?.type_notification_wording
            ?? notification?.type_notification?.wording
            ?? notification?.type_notification?.name
            ?? notification?.notification_type?.wording
            ?? notification?.notification_type?.name
            ?? notification?.type_wording
            ?? notification?.wording
            ?? this.getNotificationTypeCode(notification)
            ?? 'Notification';
    }

    getNotificationEventTime(notification: any): string {
        return notification?.event_time ?? notification?.updated_at ?? notification?.created_at ?? '';
    }

    getNotificationSeverity(notification: any): string {
        const code = (this.getNotificationTypeCode(notification) || '').toLowerCase();

        if (!code) {
            return 'info';
        }

        if (code.includes('cri') || code.includes('critical')) {
            return 'danger';
        }

        if (code.includes('de-en-co') || code.includes('depotage') || code.includes('warn') || code.includes('jo-co-re')) {
            return 'warning';
        }

        if (code.includes('fi-de') || code.includes('ok') || code.includes('recovered')) {
            return 'success';
        }

        return 'info';
    }

    getNotiMessage(){
        const latest = this.getLatestTodayNotification();
        if (!latest) {
            return null;
        }

        const timestamp = this.getNotificationTimestamp(latest);
        if (!timestamp) {
            return null;
        }

        const maxDisplayDurationMs = 5 * 60 * 1000;
        const elapsed = Date.now() - timestamp;

        if (elapsed > maxDisplayDurationMs) {
            return null;
        }

        return this.getNotificationType(latest) + " le " + Utility.toLocalDateTime(latest?.updated_at ?? latest?.created_at);
    }

    getNameProduct(){
        let nameProduct = "";
        if(this.tankDetailsData?.product?.code){
            let n = this.tankDetailsData?.product?.code;
            switch (n) {
                case "ESSENCE":
                    nameProduct = "super";
                    break;
                case "GASOIL":
                    nameProduct = "gasoil";
                    break;
                case "PETROLE":
                    nameProduct = "petrol";
                    break;

                default:
                    nameProduct = "Pétrole";
                    break;
            }
        }
        return nameProduct;
    }

    getSensorReference(){
        let ref = "";
        if(this.tankDetailsData?.tank?.sensor_reference){
            ref = this.tankDetailsData?.tank?.sensor_reference;
        }
        return ref;

    }

    getTheCorrectImage(){

        let nameProduct = this.getNameProduct()==""?'gasoil':this.getNameProduct();
        let routeImage = "../../../../assets/demo/images/"+nameProduct+"/p00.svg";
        if(this.tankDetailsData?.listLastRecord?.length > 0 && this.tankDetailsData.listLastRecord[0]?.total_volume > 0){
            let percent = (this.tankDetailsData.listLastRecord[0].volume*100)/this.tankDetailsData.listLastRecord[0].total_volume;
            if(percent < 10){
                routeImage = "../../../../assets/demo/images/"+nameProduct+"/p00.svg";
            }else if(percent >= 10 && percent < 20){
                routeImage = "../../../../assets/demo/images/"+nameProduct+"/p10.svg";
            }else if(percent >= 20 && percent < 30){
                routeImage = "../../../../assets/demo/images/"+nameProduct+"/p20.svg";
            }else if(percent >= 30 && percent < 40){
                routeImage = "../../../../assets/demo/images/"+nameProduct+"/p30.svg";
            }else if(percent >= 40 && percent < 50){
                routeImage = "../../../../assets/demo/images/"+nameProduct+"/p40.svg";
            }else if(percent >= 50 && percent < 60){
                routeImage = "../../../../assets/demo/images/"+nameProduct+"/p50.svg";
            }else if(percent >= 60 && percent < 70){
                routeImage = "../../../../assets/demo/images/"+nameProduct+"/p60.svg";
            }else if(percent >= 70 && percent < 80){
                routeImage = "../../../../assets/demo/images/"+nameProduct+"/p70.svg";
            }else if(percent >= 80 && percent < 90){
                routeImage = "../../../../assets/demo/images/"+nameProduct+"/p80.svg";
            }else if(percent >= 90 && percent < 100){
                routeImage = "../../../../assets/demo/images/"+nameProduct+"/p90.svg";
            }else if(percent >= 100 ){
                routeImage = "../../../../assets/demo/images/"+nameProduct+"/p100.svg";
            }

        }
        return routeImage;
    }

    getOnlineStatuSensor(){

        if(this.tankDetailsData?.listLastRecord?.length > 0){
            return true;
        }

        return false;
    }

    getTotalNotification(){
        return this.dayNotificationTotal;
    }

    getSeverityNoti(){
        let numNoti = this.getTotalNotification();
        if(numNoti == 0){
            return 'info';
        }else{
            return 'danger';
        }
    }

    getDepMessage(){
        if(this.tankDetailsData?.lastNotification != null &&
            (this.tankDetailsData?.lastNotification?.type_notification?.code == 'de-de' ||
            this.tankDetailsData?.lastNotification?.type_notification?.code == 'de-en-co' ||
            this.tankDetailsData?.lastNotification?.type_notification?.code == 'fi-de'
            )){
                return this.tankDetailsData?.lastNotification?.type_notification?.wording;
        }
        return null;
    }



    subscribeToChannelSocket(){
        this.pusherService.echo1.listen('record_channel.tank'+this.tankId,'Recorded',(e: any)=>{
            //(e);
            this.getTankDetailsData();
        });
    }

    onRowSelect(event: TableRowSelectEvent, op: OverlayPanel) {
        this.messageService.add({ severity: 'info', summary: 'Product Selected', detail: event.data.name });
        op.hide();
    }

    getStringDate(){
        this.d = new Date().toLocaleString();
        const currentDayKey = this.getLocalDateKey();
        if (currentDayKey !== this.notificationDateKey) {
            this.refreshDayNotifications();
            this.refreshDayOutputTotal();
        }
        //;
    }

    backToDashboard(){
        this.interactionService.addNewDataToShare({
            from:"tank-details",
            to:"layout-top-bar",
            for:"set-menu-tank-to-dashboard"
            //tankData:tankData
        });
        this.router.navigate(['/pages/dashboard']);
    }

    output_volume = { id: 0, volume: 0 };
    getOutputVolumes(records: Array<any>) {
        let i = 0;
        let last_volume: number | null;
        let new_volume: number | null;
        records = this.records;
        this.output_volumes = [];
        // ;

        if (records.length > 0) {
            records.forEach(record => {
                if (i < (records.length - 1)) {
                    i = i+1;
                    // ("Record "+[i]+":", records[i]);
                }
                new_volume = this.getFuelVolume(record);
                last_volume = this.getFuelVolume(records[i]);
                // this.output_volume = { id: record.id, volume: last_volume - new_volume };
                // this.output_volumes.push(this.output_volume);

                if (new_volume !== null && last_volume !== null && new_volume <= last_volume) {
                    this.output_volume = { id: record.id, volume: last_volume - new_volume };
                    this.output_volumes.push(this.output_volume);
                }
            });
        }

    }

    ajustedRecords() {
        this.ajusted_records = this.records.map(record => {
            const output_volume = this.output_volumes.find(item => item.id === record.id);
            return {
                id: record.id,
                battery_level: record.battery_level,
                density: record.density,
                depotage: record.depotage,
                env_temperature: record.env_temperature,
                level: record.level,
                liquid_height: record.liquid_height,
                liquid_temperature: record.liquid_temperature,
                water_level: record.water_level,
                water_height: record.water_height ?? null,
                water_volume: record.water_volume ?? null,
                sensor_reference: record.sensor_reference,
                tank_id: record.tank_id,
                total_volume: record.total_volume,
                raw_volume: record.volume,
                volume: this.getFuelVolume(record),
                fuel_volume: this.getFuelVolume(record),
                volume_at_fift: record.volume_at_fift,
                output_volume: output_volume ? output_volume.volume : null,  // Get volume from output_volumes
                created_at: record.created_at,
                updated_at: record.updated_at,
                deleted_at: record.deleted_at
            };
        });
        // ;
    }

    getTankDetailsData(showNotification = true){
        this.recordService.getTankDetailsData(this.tankId).subscribe((res)=>{
            if(res && res.length > 0){
                this.tankDetailsData = res[0];
                this.tankDetailsData.listLastRecord = this.getSortedRecords(this.tankDetailsData.listLastRecord);
                this.records = this.tankDetailsData.listLastRecord;
                this.refreshDayNotifications();
                this.refreshDayOutputTotal();
                this.getOutputVolumes(this.records);
                this.ajustedRecords();
                if (showNotification) {
                    this.showNotificationMessage();
                }
                this.initGraphData();
                //this.ref.detectChanges();
            } else {
                this.dayOutputTotal = 0;
            }

        });
    }

    getSubscribeData(){
        /* "from":"app-topbar",
        "for":"tank-details",
        "action":"refresh the page",
        "data":$event.value */
        this.interactionService.dataToShare$.subscribe((dataToShare)=>{

            if(dataToShare['from'] == "app-topbar" &&
                dataToShare['for'] == "tank-details" &&
                dataToShare['action'] == "refresh the page" ){
                let shareData = dataToShare["data"];
                //;
                this.tankId = shareData.id;
                this.getTankDetailsData();
                this.pusherService.echo1.leaveChannel('record_channel.tank'+this.tankId);
                this.subscribeToChannelSocket();
           }
        });
    }

    getRoundValue(num:number){
        return Math.round(num*100)/100;
    }

    ngOnDestroy() {
        this.pusherService.echo1.leaveChannel('record_channel.tank'+this.tankId);
        this.t1.unsubscribe();
        if (this.silentRefreshSubscription) {
            this.silentRefreshSubscription.unsubscribe();
            this.silentRefreshSubscription = null;
        }
    }


}
