import { Component, Input, ViewChild } from '@angular/core';
import * as Utility from '../../../../../utilities/utility';
import { UIChart } from 'primeng/chart';
import { InteractionService } from 'src/app/demo/services/interaction.service';

@Component({
  selector: 'app-reconciliation-details-graph',
  templateUrl: './reconciliation-details-graph.component.html',
  styleUrls: ['./reconciliation-details-graph.component.scss']
})
export class ReconciliationDetailsGraphComponent {
  @ViewChild('graph1') graph1!:UIChart;

  @Input()
  listRecord:any={};

  @Input()
  sensorReference:any={};

  /* @Input()
  period:string=""; */

  tankDetailsData:any;

  data: any;

  options: any;

  constructor(
    private interactionService: InteractionService
  ){

  }

  ngOnInit(){
    this.initData(this.listRecord?.volume, 
      this.listRecord?.listDate);
  }

  computeTheListDateToRightGmt(listDate:any[]){
    let computeListDate:any[]=[];
    for (let i = 0; i < listDate?.length; i++) {
      computeListDate[i] = Utility.toLocalDateTime(listDate[i]);
    }
    return computeListDate;
  }

  initData(volume:any[], listDate:any[]){
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

  
}
