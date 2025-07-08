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

    getLevel(){
        if(this.dataFromTankList?.listLastRecord?.length > 0){
            return ''+Math.round(this.dataFromTankList.listLastRecord[0].liquid_height*100)/100;
        }else{
            return '---';
        }
    }

    getVolumeAtT(){
        if(this.dataFromTankList?.listLastRecord?.length > 0){
            return ''+ Math.round(this.dataFromTankList.listLastRecord[0].volume*100)/100 +' / '+this.dataFromTankList.listLastRecord[0].total_volume;
        }else{
            return '---';
        }
    }

    getVolumeAtT15(){
        if(this.dataFromTankList?.listLastRecord?.length > 0){
            return ''+Math.round(this.dataFromTankList.listLastRecord[0].volume_at_fift*100)/100;
        }else{
            return '---';
        }
    }

    getOutputVolume() {
        let last_volume: number;
        let new_volume: number;
        let output_volume!: number;
        let records = this.dataFromTankList.listLastRecord;
        // ;

        if (records.length > 0) {
            new_volume = records[0]?.volume;
            last_volume = records[1]?.volume;

            if (new_volume <= last_volume) {
                output_volume = last_volume - new_volume;
                // ;
            }
            return Math.round(output_volume*100)/100;
        }
        else {
            return '---';
        }
    }

    getLiquidTemp(){
        if(this.dataFromTankList?.listLastRecord?.length > 0){
            let value = Math.round(this.dataFromTankList.listLastRecord[0].liquid_temperature*100)/100;
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
        if(this.dataFromTankList?.listLastRecord?.length > 0){
            let value = Math.round(this.dataFromTankList.listLastRecord[0].env_temperature*100)/100;
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
        if(this.dataFromTankList?.listLastRecord?.length > 0){
            let value = Math.round( this.dataFromTankList.listLastRecord[0].density*100)/100;
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
        if(this.dataFromTankList?.listLastRecord?.length > 0){
            return ''+Utility.toLocalDateTime(this.dataFromTankList.listLastRecord[0].updated_at);
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
            if(this.dataFromTankList?.listLastRecord?.length > 0 && this.dataFromTankList.listLastRecord[0]?.total_volume > 0){
                let percent = (this.dataFromTankList.listLastRecord[0].volume*100)/this.dataFromTankList.listLastRecord[0].total_volume;
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

    getInstantFlow(){
        if(this.dataFromTankList?.listLastRecord?.length > 0){
            return ''+Math.round(this.dataFromTankList.listLastRecord[0].instant_flow*100)/100;
        }else{
            return '---';
        }
    }

    getLastIncomeDateRecordFlow(){
        if(this.dataFromTankList?.listLastRecord?.length > 0){
            return ''+Utility.toLocalDateTime(this.dataFromTankList.listLastRecord[0].updated_at);
        }else{
            return 'Pas de derniere donnee';
        }
    }

    getCumulativeFlow(){
        if(this.dataFromTankList?.listLastRecord?.length > 0){
            return ''+Math.round(this.dataFromTankList.listLastRecord[0].cumulative_flow*100)/100;
        }else{
            return '---';
        }
    }

    getUnitMeasurement(){
        if(this.dataFromTankList?.listLastRecord?.length > 0){
            return ''+this.dataFromTankList.listLastRecord[0].unit_measurement_flow;
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


