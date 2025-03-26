import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription, interval } from 'rxjs';
import { InteractionService } from 'src/app/demo/services/interaction.service';
import * as Utility from '../../../utilities/utility';
import { UIChart } from 'primeng/chart';
import { AuthService } from '../../auth/services/auth.service';
import { FlowMeterSensorService } from '../../pages/services/flow-meter-sensor.service';

@Component({
  selector: 'app-flow-meter-details',
  templateUrl: './flow-meter-details.component.html',
  styleUrls: ['./flow-meter-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [ MessageService ]
})
export class FlowMeterDetailsComponent {

  flowSensorId: number;
  volume: any = "indéterminée";

  records: any[]=[];
  d:string = new Date().toLocaleString();
  t1:Subscription;
  stationId:any;
  flowMeterId:any;
  user_details:any;
  flowMeterDetailsData:any;
  @ViewChild('line') line!: UIChart;
  data: any;
  options: any;
  shareData: any;

  constructor(
    private interactionService: InteractionService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private flowSensorService: FlowMeterSensorService
    ) {

  }

  ngOnInit() {
    this.user_details = this.authService.getUserData();
    this.stationId = this.user_details?.service_station_id;
    console.log("flow meter init function: ");
    this.flowMeterId = this.route.snapshot.paramMap.get('id');
    this.flowSensorId = this.flowMeterId;
    this.t1=interval(1000).subscribe(n => this.getStringDate());
    
    this.getFlowMeterDetailsData();
    this.getLastHourVolume();
    this.getSubscribeData();
  }

  initGraphData(){
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    let d:any[]=[];
    let dc:any[]=[];
    let time:any[]=[];

    if(this.flowMeterDetailsData?.data?.length > 0){
        let listRecord = this.flowMeterDetailsData?.data;

        for (let i = (listRecord.length-1); i >=0; i--) {
            const record = listRecord[i];
            time.push(this.getToLocalDateTime(record?.hourFlowSensor))
            d.push(this.getRoundValue(record?.instant_flow));
            dc.push(this.getRoundValue(record?.cumulative_flow));
        }

        this.data = {
            labels: time,
            datasets: [
              {
                  label: 'Debit instantanee(litres/seconde)',
                  data: d,
                  fill: false,
                  tension: 0.4,
                  borderColor: documentStyle.getPropertyValue('--blue-500')
              },
              {
                label: 'Debit cumulatif(metre cube/seconde)',
                data: dc,
                fill: false,
                tension: 0.4,
                borderColor: documentStyle.getPropertyValue('--red-500')
            },
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

  getStringDate(){
    this.d = new Date().toLocaleString();
  }

  backToDashboard(){
    this.interactionService.addNewDataToShare({
      from:"flow-meter-details",
      to:"layout-top-bar",
      for:"set-menu-tank-to-dashboard"
      //tankData:tankData
    });
    this.router.navigate(['/pages/dashboard']);
  }

  getSubscribeData(){
    /* "from":"app-topbar",
    "for":"tank-details",
    "action":"refresh the page",
    "data":$event.value */
    this.interactionService.dataToShare$.subscribe((dataToShare)=>{
      if(dataToShare['from'] == "app-topbar" &&
        dataToShare['for'] == "flow-meter-details" &&
        dataToShare['action'] == "refresh the page" ){
        this.shareData = dataToShare["data"];
        //console.log("i try to share this data: ", shareData);
        this.flowMeterId = this.shareData.id;
      }

      /* from:"tank-list-by-type",
      to:"flow-meter-details",
      for:"show-flow-meter-details",
      flowMeterId:flowMeterId,
      flowMeterData:flowMeterData */
      /* if(dataToShare['from'] == "tank-list-by-type" &&
        dataToShare['for'] == "show-flow-meter-details" &&
        dataToShare['to'] == "flow-meter-details" ){

        this.shareData = dataToShare["flowMeterData"];
        this.flowMeterId = dataToShare["flowMeterId"];
        console.log("get in flow meter details: ", this.shareData);
        
      } */
    });
  }

  getRoundValue(num:number){
    return Math.round(num*100)/100;
  }

  getToLocalDateTime(date1:string){
    return Utility.toLocalDateTime(date1);
  }

  getFlowMeterDetailsData(){
    //TODO get flow meter data
    this.flowSensorService.getDaylyFlowSensorRecord(this.flowSensorId).subscribe((res)=>{
      console.log("res dayly flow sensor: ",res.data[0]);
      this.shareData = res.data[0];
      this.records = this.shareData.listLastRecord;
      this.flowMeterDetailsData = {data: this.records};
      this.initGraphData();
    }); 
  }

  getTheCorrectImage(){
    return "../../../../../assets/demo/images/debimetreXl-removebg.png";
  }

  getOnlineStatuSensor(){
    //TODO get flow meter data 
    if(this.shareData?.listLastRecord?.length > 0){
      return true;
    }

    return false;
  }

  getSensorReference(){
    //TODO get flow meter data
    return this.shareData?.tank?.sensor_reference ?? "Undefined"; 
  }

  getNameProduct(){
    //TODO get flow meter data 
    return this.shareData?.product.code;
  }

  generateFlowMeterDataDetailsPdf(){
    //TODO get flow meter data 
    this.messageService.add({ 
      severity: 'info', 
      summary: 'Fonctionnalite indisponible', 
      detail: "Veuillez excuser l'indisponibilite de la fonctionnalite" 
    });
  }

  generateFlowMeterDataDetailsImage(){
    //TODO get flow meter data 
    let a = document.createElement('a');
    a.href = this.line.getBase64Image();
    a.download = 'Graphe '+'d\' evolution du debit'+'.png';
    a.click();
    
  }

  getLastHourVolume(){
    this.flowSensorService.getLastHourVolumeFlowSensor(this.stationId, this.flowSensorId).subscribe((res)=>{
      console.log("from sensor service: ", res);
      if(res.status == "success"){
        this.volume = res.volume;
      }else{
        this.volume = res.msg;
      }
    });
  }

  getInstantFlow(){
    //console.log("instant flow details: ", this.shareData?.listLastRecord[0]);
    if(this.shareData?.listLastRecord?.length > 0){
      return ''+(Math.round(this.shareData.listLastRecord[0].instant_flow*100)/100);
    }else{
      return '0';
    }
  }

  getLastIncomeDateRecordFlow(){
    if(this.shareData?.listLastRecord?.length > 0){
      return ''+Utility.toLocalDateTime(this.shareData.listLastRecord[0].updated_at);
    }else{
      return 'Pas de derniere donnee';
    }
  }

  getCumulativeFlow(){
    if(this.shareData?.listLastRecord?.length > 0){
      return ''+Math.round(this.shareData.listLastRecord[0].cumulative_flow*100)/100;
    }else{
      return '0';
    }
  }

  getUnitMeasurement(){
    if(this.shareData?.listLastRecord?.length > 0){
      return ''+this.shareData.listLastRecord[0].unit_measurement_flow;
    }else{
      return 'Indisponible';
    }
  }

  
}
