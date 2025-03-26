import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { InteractionService } from 'src/app/demo/services/interaction.service';

@Component({
  selector: 'app-tank-list-by-type',
  templateUrl: './tank-list-by-type.component.html',
  styleUrls: ['./tank-list-by-type.component.scss']
})
export class TankListByTypeComponent {

  @Input() listTank:any;
  constructor(
    private interactionService: InteractionService,
    private router: Router,
    ) {

  }

  ngOnInit() {
    console.log("list tank by type: ", this.listTank);
  }

  goToTankInfo(tankId:number, tankData:any){
    this.interactionService.addNewDataToShare({
      from:"tank-list-by-type",
      to:"tank-details",
      for:"show-tank-details",
      tankId:tankId,
      tankData:tankData
    });
    this.interactionService.addNewDataToShare({
      from:"tank-list",
      to:"layout-top-bar",
      for:"update-menu-tank",
      tankId:tankId,
      type: "Sonde"
      //tankData:tankData
    });
    this.router.navigate(['/pages/dashboard/tank-details',tankId]);
    console.log("je pars au specific tank data: ",tankData);
  }

  goToFlowMeterInfo(flowMeterId:number, flowMeterData:any){
    this.interactionService.addNewDataToShare({
      from:"tank-list-by-type",
      to:"flow-meter-details",
      for:"show-flow-meter-details",
      flowMeterId:flowMeterId,
      flowMeterData:flowMeterData
    });
    this.interactionService.addNewDataToShare({
        from:"tank-list-by-type",
        to:"layout-top-bar",
        for:"update-menu-tank",
        flowMeterId:flowMeterId,
        type: "Debimetre"
    });
    this.router.navigate(['/pages/dashboard/flow-meter-details',flowMeterId]);
    console.log("je pars au specific flow meter data: ",flowMeterData);
  }

  
}
