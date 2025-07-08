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
        private pdfService: PdfService
        ) { }

    ngOnInit() {
        // this.user = JSON.parse(this.cookieService.get('User'));
        // this.stationId = this.user['station'];
        this.user_details = this.localStorageService.getUserDetails();
        this.stationId = this.localStorageService.getServiceStationId();
        //;
        this.tankId = this.route.snapshot.paramMap.get('id');
        this.getTankDetailsData();
        //;
        this.subscribeToChannelSocket();
        this.t1=interval(1000).subscribe(n => this.getStringDate());
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
        let time:any[]=[];

        if(this.tankDetailsData?.listLastRecord?.length > 0){
            let listRecord = this.tankDetailsData?.listLastRecord;

            for (let i = (listRecord.length-1); i >=0; i--) {
                const record = listRecord[i];
                time.push(this.getToLocalDateTime(record?.updated_at))
                d.push(this.getRoundValue(record?.density));
                l.push(this.getRoundValue(record?.liquid_height));
                v.push(this.getRoundValue(record?.volume));
                v15.push(this.getRoundValue(record?.volume_at_fift));
                t.push(this.getRoundValue(record?.liquid_temperature));
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
                        label: 'Volume (litres)',
                        data: v,
                        fill: false,
                        tension: 0.4,
                        borderColor: documentStyle.getPropertyValue('--teal-500')
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
        if(this.tankDetailsData?.listLastRecord?.length > 0){
            return ''+Math.round(this.tankDetailsData.listLastRecord[0].liquid_height*100)/100;
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
        if(this.tankDetailsData?.listLastRecord?.length > 0){
            return ''+ (Math.round(this.tankDetailsData.listLastRecord[0].volume*100)/100) +' / '+this.tankDetailsData.listLastRecord[0].total_volume;
        }
        return '---';
    }

    getOutputVolume() {
        let last_volume: number;
        let new_volume: number;
        let output_volume: number;
        let records = this.tankDetailsData.listLastRecord;
        // ;

        if (records.length > 0) {
            new_volume = records[0].volume;
            last_volume = records[1].volume;

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

    getPercentOccupation(){
        if(this.tankDetailsData?.listLastRecord?.length > 0){
            let percent = Math.round(this.tankDetailsData.listLastRecord[0].volume*10000/this.tankDetailsData.listLastRecord[0].total_volume)/100;
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
        if(this.tankDetailsData?.listLastRecord?.length > 0){
            let v = Math.round((this.tankDetailsData.listLastRecord[0].total_volume - this.tankDetailsData.listLastRecord[0].volume)*1000)/1000;
            return ''+ v + ' litres';
        }
        return '---';
    }

    getVolumeAtT15(){
        if(this.tankDetailsData?.listLastRecord?.length > 0){
            return ''+Math.round(this.tankDetailsData.listLastRecord[0].volume_at_fift*100)/100;
        }
        return '---';
    }

    getLiquidTemp(){
        if(this.tankDetailsData?.listLastRecord?.length > 0){
            let value = this.tankDetailsData.listLastRecord[0].liquid_temperature;
            if(value > 0){
                return ''+value;
            }else{
                return 31.8;
            }
        }
        return 31.8;
    }

    getEnvTemp(){
        if(this.tankDetailsData?.listLastRecord?.length > 0){
            let value = this.tankDetailsData.listLastRecord[0].env_temperature;
            if(value > 0){
                return ''+value;
            }else{
                return 38;
            }
        }
        return 38;
    }

    getDensity(){
        if(this.tankDetailsData?.listLastRecord?.length > 0){
            let value = Math.round( this.tankDetailsData.listLastRecord[0].density*100)/100;
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
        if(this.tankDetailsData?.listLastRecord?.length > 0){
            return ''+Utility.toLocalDateTime(this.tankDetailsData.listLastRecord[0].updated_at);
        }
        return '---';
    }

    getToLocalDateTime(date1:string){
        return Utility.toLocalDateTime(date1);
    }

    getNotiMessage(){
        if(this.tankDetailsData?.lastNotification != null ){
            return this.tankDetailsData?.lastNotification?.type_notification?.wording+" le "+
                    Utility.toLocalDateTime(this.tankDetailsData?.lastNotification?.updated_at);
        }
        return null;
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
        let numNoti = 0;
        if(this.tankDetailsData?.listLastNotifications?.length > 0){
            numNoti = this.tankDetailsData?.listLastNotifications?.length;
        }
        return numNoti;
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
        let last_volume: number;
        let new_volume: number;
        records = this.tankDetailsData.listLastRecord;
        // ;

        if (records.length > 0) {
            records.forEach(record => {
                if (i < (records.length - 1)) {
                    i = i+1;
                    // ("Record "+[i]+":", records[i]);
                }
                new_volume = record.volume;
                last_volume = records[i].volume;
                // this.output_volume = { id: record.id, volume: last_volume - new_volume };
                // this.output_volumes.push(this.output_volume);

                if (new_volume <= last_volume) {
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
                sensor_reference: record.sensor_reference,
                tank_id: record.tank_id,
                total_volume: record.total_volume,
                volume: record.volume,
                volume_at_fift: record.volume_at_fift,
                output_volume: output_volume ? output_volume.volume : null,  // Get volume from output_volumes
                created_at: record.created_at,
                updated_at: record.updated_at,
                deleted_at: record.deleted_at
            };
        });
        // ;
    }

    getTankDetailsData(){
        this.recordService.getTankDetailsData(this.tankId).subscribe((res)=>{
            if(res && res.length > 0){
                this.tankDetailsData = res[0];
                this.records = this.tankDetailsData.listLastRecord;
                this.getOutputVolumes(this.records);
                this.ajustedRecords();
                this.showNotificationMessage();
                this.initGraphData();
                //this.ref.detectChanges();
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
    }


}
