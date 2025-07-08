import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as Utility from '../../../../../utilities/utility';
import { InteractionService } from 'src/app/demo/services/interaction.service';
import { UIChart } from 'primeng/chart';

@Component({
  selector: 'app-custom-hbt-graph',
  templateUrl: './custom-hbt-graph.component.html',
  styleUrls: ['./custom-hbt-graph.component.scss']
})
export class CustomHbtGraphComponent {

  @ViewChild('graph1') graph1!:UIChart;

  //@Input()
  listRecord:any={};

  //@Input()
  tank:any={};

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
      this.initData(this.listRecord?.temp,
        this.listRecord?.volume,
        this.listRecord?.volume15,
        this.listRecord?.density,
        this.listRecord?.level,
        this.listRecord?.listDate);
      this.getInteractionMsg();


  }

  computeTheListDateToRightGmt(listDate:any[]){
    let computeListDate:any[]=[];
    for (let i = 0; i < listDate?.length; i++) {
      computeListDate[i] = Utility.toLocalDateTime(listDate[i]);
    }
    return computeListDate;
  }

  initData(temp:any[], volume:any[], volume15:any[], density:any[], level:any[], listDate:any[]){

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.data = {
      labels: this.computeTheListDateToRightGmt(listDate),
      datasets: [
        {
            label: 'Volume',
            data: volume,
            fill: false,
            borderColor: documentStyle.getPropertyValue('--blue-800'),
            tension: 0.4
        },
        {
            label: 'Volume à 15',
            data: volume15,
            fill: false,
            borderColor: documentStyle.getPropertyValue('--pink-800'),
            tension: 0.4
        },
        {
          label: 'Temperature',
          data: temp,
          fill: false,
          borderColor: documentStyle.getPropertyValue('--red-800'),
          tension: 0.4
        },
        {
          label: 'Densite',
          data: density,
          fill: false,
          borderColor: documentStyle.getPropertyValue('--green-800'),
          tension: 0.4
        },
        {
          label: 'Niveau',
          data: level,
          fill: false,
          borderColor: documentStyle.getPropertyValue('--orange-800'),
          tension: 0.4
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
    /* from: "hbt-graph",
    for: "custom-hbt-graph",
    action: "reinitialize the graph",
    listRecord: this.listRecords,
    selectedTank: this.selectedTank,
    period: this.period */
    this.interactionService.dataToShare$.subscribe((msg)=>{
      //;
      if(msg.from == "hbt-graph" &&
        msg.for == "custom-hbt-graph" &&
        msg.action == "reinitialize the graph"){
          ("j'ai recu le msg de graphe");
          this.listRecord = msg.listRecord;
          this.tank = msg.selectedTank;
          this.period = msg.period;
          this.initData(this.listRecord?.temp,
            this.listRecord?.volume,
            this.listRecord?.volume15,
            this.listRecord?.density,
            this.listRecord?.level,
            this.listRecord?.listDate);
      }else if(msg.from == "hbt-graph" &&
              msg.for == "custom-hbt-graph" &&
              msg.action == "empty the graph"){
        /* from: "hbt-graph",
        for: "custom-hbt-graph",
        action: "empty the graph" */
        this.listRecord = {};
        ("je vide le graphe");
      }else if(msg.from == "hbt-graph" &&
              msg.for == "custom-hbt-graph" &&
              msg.action == "export the graph"){
        /* from: "hbt-graph",
        for: "custom-hbt-graph",
        action: "export the graph" */
        let a = document.createElement('a');
        a.href = this.graph1.getBase64Image();
        a.download = 'Graphe '+this.tank?.sensor_reference+'.png';
        a.click();
        ("j'exporte les graphes: ");
      }
    });
  }

}
