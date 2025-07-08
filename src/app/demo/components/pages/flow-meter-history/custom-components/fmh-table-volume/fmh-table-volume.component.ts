import { Component, Input, ViewChild } from '@angular/core';
import * as Utility from '../../../../../utilities/utility';
import { UIChart } from 'primeng/chart';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
  selector: 'app-fmh-table-volume',
  templateUrl: './fmh-table-volume.component.html',
  styleUrls: ['./fmh-table-volume.component.scss']
})
export class FmhTableVolumeComponent {

  @Input()
  listOutputs!:any;

  @Input()
  flowMeter:any={};

  @Input()
  period:string="";

  @ViewChild('line') line!: UIChart;
  @ViewChild('og') overlay!: OverlayPanel;
  data: any;
  options: any;


  constructor(){

  }

  ngOnInit(){
      //;
  }



  getToLocalDateTime(date1:string){
      return Utility.toLocalDateTime(date1)??"";
  }

  getToLocalDate(date1:string){
      return Utility.toLocalDate(date1)??"";
  }

  getToLocalTime(date1:string){
      return Utility.toLocalTime(date1)??"";
  }

  getRoundValue(num:number){
      return Math.round(num*100)/100;
  }

  initGraphData(event){
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    let d:any[]=[];
    let time:any[]=[];

    for (let i = 30; i >=0; i--) {
        time.push(this.getToLocalDateTime("2024-04-25 17:42:12"))
        d.push(this.getRoundValue(Math.random()*90));
    }

    this.data = {
        labels: time,
        datasets: [
          {
              label: 'Speed(litres/seconde)',
              data: d,
              fill: false,
              tension: 0.4,
              borderColor: documentStyle.getPropertyValue('--blue-500')
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


    this.line?.refresh();
    this.overlay.toggle(event);
  }
}
