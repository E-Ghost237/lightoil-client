import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as Utility from '../../../../../utilities/utility';
import { InteractionService } from 'src/app/demo/services/interaction.service';
import { UIChart } from 'primeng/chart';

@Component({
  selector: 'app-hbp-custom-graph',
  templateUrl: './hbp-custom-graph.component.html',
  styleUrls: ['./hbp-custom-graph.component.scss']
})
export class HbpCustomGraphComponent {
  @ViewChild('graph1') graph1!:UIChart;

  //@Input()
  listRecord:any[]=[];

  //@Input()
  stationProduct:any={};

  //@Input()
  period:string="";

  tankDetailsData:any;

  data: any;

  options: any;

  constructor(
    private interactionService: InteractionService
  ){

  }

  ngOnInit(){

    /* "status" => true,
    "temp" => $temp,
    "volume" => $volume,
    "volume15" => $volume15,
    "density" => $density,
    "level" => $level,
    "listDate" => $date, */

    /* this.initData(this.listRecord?.temp,
      this.listRecord?.volume,
      this.listRecord?.volume15,
      this.listRecord?.density, this.listRecord?.level,
      this.listRecord?.listDate); */
      this.initData(this.listRecord);
      this.getInteractionMsg();


  }

  computeTheListDateToRightGmt(listDate:any[]){
    let computeListDate:any[]=[];
    for (let i = 0; i < listDate?.length; i++) {
      computeListDate[i] = Utility.toLocalDateTime(listDate[i]);
    }
    return computeListDate;
  }

  private resolveFuelVolumeSeries(series: any): any[] {
    return series?.fuel_volume ?? series?.volume ?? [];
  }

  initData(listRecord:any[]){

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    const listColors = [
      '--blue-800',
      '--pink-800',
      '--red-800',
      '--green-800',
      '--orange-800',
      '--yellow-800',
      '--black-800',

      '--blue-500',
      '--pink-500',
      '--red-500',
      '--green-500',
      '--orange-500',
      '--yellow-500',
      '--black-500',

      '--blue-300',
      '--pink-300',
      '--red-300',
      '--green-300',
      '--orange-300',
      '--yellow-300',
      '--black-300',

      '--blue-900',
      '--pink-900',
      '--red-900',
      '--green-900',
      '--orange-900',
      '--yellow-900',
      '--black-900'
    ];

    let listDate:any[]=[];
    let datasets:any[]=[];
    let maxDate:number = 0;
    for (let i = 0; i < listRecord.length; i++) {
      if (listRecord[i].data.listDate.length > maxDate) {
        listDate = listRecord[i].data.listDate;
        maxDate = listRecord[i].data.listDate.length;
      }
    }
    for (let i = 0; i < listRecord.length; i++) {
      if (listRecord[i].data.status == true) {
        datasets.push({
          label: 'Volume carburant '+listRecord[i].tank.sensor_reference,
          data: this.resolveFuelVolumeSeries(listRecord[i].data),
          fill: false,
          borderColor: documentStyle.getPropertyValue(listColors[Math.round(Math.random()*(listColors.length-1))]),
          tension: 0.4
        });
        datasets.push({
          label: 'Niveau '+listRecord[i].tank.sensor_reference,
          data: listRecord[i].data.level,
          fill: false,
          borderColor: documentStyle.getPropertyValue(listColors[Math.round(Math.random()*(listColors.length-1))]),
          tension: 0.4
        });
        datasets.push({
          label: 'Density '+listRecord[i].tank.sensor_reference,
          data: listRecord[i].data.density,
          fill: false,
          borderColor: documentStyle.getPropertyValue(listColors[Math.round(Math.random()*(listColors.length-1))]),
          tension: 0.4
        });
      }else {

      }

    }


    this.data = {
      labels: this.computeTheListDateToRightGmt(listDate),
      datasets: datasets
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
                  color: surfaceBorder,
                  drawBorder: false
              }
          },
          y: {
              ticks: {
                  color: textColorSecondary
              },
              grid: {
                  color: surfaceBorder,
                  drawBorder: false
              }
          }
      }
    };

    this.graph1?.refresh();
  }

  getInteractionMsg(){

    this.interactionService.dataToShare$.subscribe((msg)=>{
      //;
      /* from: "hbp-graph",
      for: "hbp-custom-graph",
      action: "reinitialize the graph",
      listRecord: this.listRecords,
      selectedStationProduct: this.selectedStationProduct,
      period: this.period */
      //;
      if(msg.from == "hbp-graph" &&
        msg.for == "hbp-custom-graph" &&
        msg.action == "reinitialize the graph"){
          //("j'ai recu le msg de graphe");
          this.listRecord = msg.listRecord;
          this.stationProduct = msg.selectedStationProduct;
          this.period = msg.period;
          this.initData(this.listRecord);
      }else if(msg.from == "hbp-graph" &&
              msg.for == "hbp-custom-graph" &&
              msg.action == "empty the graph"){

        this.listRecord = [];
        //("je vide le graphe");
      }else if(msg.from == "hbp-graph" &&
              msg.for == "hbp-custom-graph" &&
              msg.action == "export the graph"){
        /* from: "hbp-graph",
          for: "hbp-custom-graph",
          action: "export the graph" */
        let a = document.createElement('a');
        a.href = this.graph1.getBase64Image();
        a.download = 'Graphe '+this.stationProduct?.product?.name+'.png';
        a.click();
        ("j'exporte les graphes: ");
      }
    });
  }


}
