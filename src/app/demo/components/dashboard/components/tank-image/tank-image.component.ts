import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { PusherService } from '../../services/pusher.service';
import { RecordService } from '../../services/record.service';
import * as Utility from '../../../../utilities/utility';
import { FlowMeterSensorService } from '../../../pages/services/flow-meter-sensor.service';
import { AuthService } from '../../../auth/services/auth.service';
import {
    computeTankOutputSumFromRecords,
    DEFAULT_TANK_TIMEZONE,
    getStrictTankDayRecords,
    getTankFuelVolume,
    getTankLocalDateKey,
    getTankRecordDateKey,
    getTankRecordMoment,
    parseTankMetric,
    roundTankMetric,
    sortTankRecordsByMoment
} from '../../utils/tank-output.util';

@Component({
  selector: 'app-tank-image',
  templateUrl: './tank-image.component.html',
  styleUrls: ['./tank-image.component.scss']
})
export class TankImageComponent implements OnChanges {
    @Input() dataFromTankList:any;
    @Input() type:any="vanne de surveillance";
    stationId: number;
    flowSensorId: number;
    user_details: any;
    volume: any = "indéterminée";
    dayOutputTotal = 0;
    notificationTimezone = DEFAULT_TANK_TIMEZONE;


    constructor(
        private cookieService: CookieService,
        private authService: AuthService,
        private router: Router,
        private pusherService: PusherService,
        private recordService: RecordService,
        private flowSensorService: FlowMeterSensorService
        ) {

    }


    ngOnInit(): void {
        if (!this.dataFromTankList) {
            this.refreshContextAndMetrics();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['dataFromTankList'] || changes['type']) {
            this.refreshContextAndMetrics();
        }
    }

    private isFlowMeterType(): boolean {
        return this.type == 'Debimetre' || this.type == 'Débimètre';
    }

    private refreshContextAndMetrics(): void {
        this.user_details = this.user_details ?? this.authService.getUserData();
        this.stationId = this.user_details?.service_station_id;
        this.notificationTimezone = this.resolveStationTimezone();
        this.flowSensorId = Number(this.dataFromTankList?.tank?.id ?? 0);

        if (this.isFlowMeterType()) {
            this.getLastHourVolume();
            return;
        }

        this.refreshDayOutputTotal();
    }

    private getRecordMoment(record: any): number {
        return getTankRecordMoment(record);
    }

    private getSortedRecords(records: any[] = this.dataFromTankList?.listLastRecord ?? []) {
        return sortTankRecordsByMoment(records);
    }

    private getLatestRecord() {
        return this.getSortedRecords()[0] ?? null;
    }

    private getPreviousRecord() {
        return this.getSortedRecords()[1] ?? null;
    }

    private parseMetric(value: any): number | null {
        return parseTankMetric(value);
    }

    private getFuelVolume(record: any): number | null {
        return getTankFuelVolume(record);
    }

    private getFuelVolumeAtFift(record: any): number {
        const normalizedVolumeAtFift = this.parseMetric(record?.fuel_volume_at_fift);
        if (normalizedVolumeAtFift !== null) {
            return normalizedVolumeAtFift;
        }

        const legacyVolumeAtFift = this.parseMetric(record?.volume_at_fift);
        return legacyVolumeAtFift ?? 0;
    }

    private formatFuelVolume(value: number): string {
        return value.toFixed(2);
    }

    private getWaterHeight(record: any): number | null {
        return this.parseMetric(record?.water_height);
    }

    private getWaterVolumeMetric(record: any): number | null {
        return this.parseMetric(record?.water_volume);
    }

    getLevel(){
        const latestRecord = this.getLatestRecord();
        if(latestRecord){
            return ''+Math.round(latestRecord.liquid_height*100)/100;
        }else{
            return '---';
        }
    }

    getVolumeAtT(){
        const latestRecord = this.getLatestRecord();
        const fuelVolume = this.getFuelVolume(latestRecord);
        if(latestRecord && fuelVolume !== null){
            return this.formatFuelVolume(fuelVolume) + ' / ' + latestRecord.total_volume;
        }else{
            return '---';
        }
    }

    getVolumeAtT15(){
        const latestRecord = this.getLatestRecord();
        if(latestRecord){
            return ''+Math.round(this.getFuelVolumeAtFift(latestRecord)*100)/100;
        }else{
            return '---';
        }
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
                Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
                return timezone;
            } catch {
                // Ignore invalid timezone identifiers and continue.
            }
        }

        return fallback || DEFAULT_TANK_TIMEZONE;
    }

    private getLocalDateKey(date: Date = new Date(), timezone: string = this.notificationTimezone): string {
        return getTankLocalDateKey(date, timezone);
    }

    private getRecordDateKey(record: any, timezone: string = this.notificationTimezone): string | null {
        return getTankRecordDateKey(record, timezone);
    }

    private getRoundValue(num: number): number {
        return roundTankMetric(num);
    }

    private computeOutputSumFromRecords(records: any[]): number {
        return computeTankOutputSumFromRecords(records);
    }

    private computeDayOutputFromCurrentRecords(dayKey: string): number {
        const sourceRecords = Array.isArray(this.dataFromTankList?.listLastRecord) ? this.dataFromTankList.listLastRecord : [];
        const sameDayRecords = sourceRecords.filter((record: any) => this.getRecordDateKey(record) === dayKey);
        return this.computeOutputSumFromRecords(sameDayRecords);
    }

    private getStrictDayRecords(records: any[], dayKey: string): any[] {
        return getStrictTankDayRecords(records, dayKey, this.notificationTimezone);
    }

    private refreshDayOutputTotal(): void {
        const tankId = Number(this.dataFromTankList?.tank?.id ?? 0);
        if (!tankId) {
            this.dayOutputTotal = 0;
            return;
        }

        const dayKey = this.getLocalDateKey();
        this.dayOutputTotal = this.computeDayOutputFromCurrentRecords(dayKey);

        this.recordService.getListRecordsForOneDay({
            tankId,
            dateStart: dayKey
        }).subscribe({
            next: (response: any) => {
                const dayRecords = this.getStrictDayRecords(Array.isArray(response) ? response : [], dayKey);
                this.dayOutputTotal = this.computeOutputSumFromRecords(dayRecords);
            },
            error: () => {
                this.dayOutputTotal = this.computeDayOutputFromCurrentRecords(dayKey);
            }
        });
    }

    getOutputVolume() {
        return this.getRoundValue(this.dayOutputTotal);
    }

    getLiquidTemp(){
        const latestRecord = this.getLatestRecord();
        if(latestRecord){
            let value = Math.round(latestRecord.liquid_temperature*100)/100;
            if(value > 0){
                return ''+value;
            }else{
                return 31.8;
            }
        }else{
            return 31.8;
        }
    }

    getEnvTemp(){
        const latestRecord = this.getLatestRecord();
        if(latestRecord){
            let value = Math.round(latestRecord.env_temperature*100)/100;
            if(value > 0){
                return ''+value;
            }else{
                return 38;
            }
        }else{
            return 38;
        }
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
        }else{
            return '---';
        }
    }

    getRmDay(){
        if(this.dataFromTankList?.lastNotification){
            return ''+ Math.round( this.dataFromTankList?.lastNotification.remaining_day*100)/100;
        }else{
            return '---';
        }
    }

    getLastIncomeDateRecord(){
        const latestRecord = this.getLatestRecord();
        if(latestRecord){
            return ''+Utility.toLocalDateTime(latestRecord.updated_at);
        }else{
            return 'Pas de derniere donnee';
        }
    }

    getNotiMessage(){
        if(this.dataFromTankList?.lastNotification != null ){
            let date = new Date(this.dataFromTankList?.lastNotification?.updated_at);
            date.setMinutes(date.getMinutes() + 5);
            if (date.getTime() >= new Date().getTime()) {
                return this.dataFromTankList?.lastNotification?.type_notification?.wording;
            }
        }
        return null;
    }

    getNameProduct(){
        let nameProduct = "";
        if(this.dataFromTankList?.product?.code){
            let n = this.dataFromTankList.product.code;
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
                    nameProduct = "petrol";
                    break;
            }
        }
        return nameProduct;
    }

    getTheCorrectImage(){
        let nameProduct = this.getNameProduct();
        let routeImage = "../../../../assets/demo/images/"+nameProduct+"/p00.svg";
        if(this.type == "Debimetre"){
            routeImage = "../../../../assets/demo/images/debimetreXl-removebg.png";
        }else{
            const latestRecord = this.getLatestRecord();
            if(latestRecord?.total_volume > 0){
                let percent = (latestRecord.volume*100)/latestRecord.total_volume;
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
        }


        return routeImage;
    }

    getWaterLevel() {
        const waterHeight = this.getWaterHeight(this.getLatestRecord());

        if (waterHeight === null) {
            return '---';
        }

        return '' + Math.round(waterHeight * 100) / 100;
    }

    getWaterVolume() {
        const waterVolume = this.getWaterVolumeMetric(this.getLatestRecord());

        if (waterVolume === null) {
            return '---';
        }

        return '' + Math.round(waterVolume * 100) / 100;
    }

    getInstantFlow(){
        const latestRecord = this.getLatestRecord();
        if(latestRecord){
            return ''+Math.round(latestRecord.instant_flow*100)/100;
        }else{
            return '---';
        }
    }

    getLastIncomeDateRecordFlow(){
        const latestRecord = this.getLatestRecord();
        if(latestRecord){
            return ''+Utility.toLocalDateTime(latestRecord.updated_at);
        }else{
            return 'Pas de derniere donnee';
        }
    }

    getCumulativeFlow(){
        const latestRecord = this.getLatestRecord();
        if(latestRecord){
            return ''+Math.round(latestRecord.cumulative_flow*100)/100;
        }else{
            return '---';
        }
    }

    getUnitMeasurement(){
        const latestRecord = this.getLatestRecord();
        if(latestRecord){
            return ''+latestRecord.unit_measurement_flow;
        }else{
            return '---';
        }
    }


    getLastHourVolume(){
        this.flowSensorService.getLastHourVolumeFlowSensor(this.stationId, this.flowSensorId).subscribe((res)=>{

            if(res.status == "success"){
                this.volume = res.volume;
            }else{
                this.volume = res.msg;
            }
        });
    }

    getLastHourQuantity(){
        return this.volume ?? '---';
    }



    ngOnDestroy(): void {

    }
}
