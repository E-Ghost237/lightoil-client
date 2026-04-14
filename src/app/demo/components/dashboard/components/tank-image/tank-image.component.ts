import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { PusherService } from '../../services/pusher.service';
import { RecordService } from '../../services/record.service';
import * as Utility from '../../../../utilities/utility';
import { FlowMeterSensorService } from '../../../pages/services/flow-meter-sensor.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-tank-image',
  templateUrl: './tank-image.component.html',
  styleUrls: ['./tank-image.component.scss']
})
export class TankImageComponent {
    @Input() dataFromTankList:any;
    @Input() type:any="vanne de surveillance";
    stationId: number;
    flowSensorId: number;
    user_details: any;
    volume: any = "indéterminée";


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
        //;
        //("date: ", this.getLastIncomeDateRecord());
        this.user_details = this.authService.getUserData();
        this.stationId = this.user_details?.service_station_id;
        this.flowSensorId = this.dataFromTankList.tank.id;
        this.getLastHourVolume();

    }

    private getRecordMoment(record: any): number {
        const createdAt = record?.created_at ? new Date(record.created_at).getTime() : 0;
        const updatedAt = record?.updated_at ? new Date(record.updated_at).getTime() : 0;
        return Math.max(createdAt, updatedAt);
    }

    private getSortedRecords() {
        return [...(this.dataFromTankList?.listLastRecord ?? [])].sort(
            (a, b) => this.getRecordMoment(b) - this.getRecordMoment(a)
        );
    }

    private getLatestRecord() {
        return this.getSortedRecords()[0] ?? null;
    }

    private getPreviousRecord() {
        return this.getSortedRecords()[1] ?? null;
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
            return ''+Math.round(latestRecord.volume_at_fift*100)/100;
        }else{
            return '---';
        }
    }

    getOutputVolume() {
        const latestRecord = this.getLatestRecord();
        const previousRecord = this.getPreviousRecord();
        const latestFuelVolume = this.getFuelVolume(latestRecord);
        const previousFuelVolume = this.getFuelVolume(previousRecord);

        if (latestFuelVolume !== null && previousFuelVolume !== null && latestFuelVolume <= previousFuelVolume) {
            return Math.round((previousFuelVolume - latestFuelVolume) * 100) / 100;
        }

        return '---';
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
