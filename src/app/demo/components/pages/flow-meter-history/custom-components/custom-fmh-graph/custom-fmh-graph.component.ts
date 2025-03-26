import { Component, ViewChild } from '@angular/core';
import { UIChart } from 'primeng/chart';
import { InteractionService } from 'src/app/demo/services/interaction.service';
import * as Utility from '../../../../../utilities/utility';

@Component({
  selector: 'app-custom-fmh-graph',
  templateUrl: './custom-fmh-graph.component.html',
  styleUrls: ['./custom-fmh-graph.component.scss']
})
export class CustomFmhGraphComponent {
  @ViewChild('graph1') graph1!:UIChart;

  //@Input()
  listRecord:any={};

  //@Input()
  flowMeter:any={};

  //@Input()
  period:string="";

  flowMeterDetailsData:any;

  data: any;

  options: any;

  constructor(
    private interactionService: InteractionService
  ){

  }

  ngOnInit(){
      this.initData(this.listRecord?.speed, 
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

  initData(speed:any[], listDate:any[]){

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.data = {
      labels: this.computeTheListDateToRightGmt(listDate),
      datasets: [
        {
            label: 'Débit',
            data: speed,
            fill: false,
            borderColor: documentStyle.getPropertyValue('--blue-800'),
            tension: 0.4
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
    /* from: "fmh-graph",
      for: "custom-fmh-graph",
    action: "reinitialize the graph",
    listRecord: this.listRecords,
    selectedTank: this.selectedTank,
    period: this.period */
    this.interactionService.dataToShare$.subscribe((msg)=>{
      //console.log("j'ai recu le msg de graphe: ", msg);
      if(msg.from == "fmh-graph" &&
        msg.for == "custom-fmh-graph" &&
        msg.action == "reinitialize the graph"){
          console.log("j'ai recu le msg de graphe");
          this.listRecord = msg.listRecord;
          this.flowMeter = msg.selectedflowMeter;
          this.period = msg.period;
          this.initData(this.listRecord?.speed, 
            this.listRecord?.listDate);
      }else if(msg.from == "fmh-graph" &&
              msg.for == "custom-fmh-graph" &&
              msg.action == "empty the graph"){
        /* from: "hbt-graph",
        for: "custom-hbt-graph",
        action: "empty the graph" */
        this.listRecord = {};
        console.log("je vide le graphe");
      }else if(msg.from == "fmh-graph" &&
              msg.for == "custom-fmh-graph" &&
              msg.action == "export the graph"){
        /* from: "hbt-graph",
        for: "custom-hbt-graph",
        action: "export the graph" */
        let a = document.createElement('a');
        a.href = this.graph1.getBase64Image();
        a.download = 'Graphe '+this.flowMeter?.sensor_reference+'.png';
        a.click();
        console.log("j'exporte les graphes: ");
      }
    });
  }
}
