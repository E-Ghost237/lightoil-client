import { Component } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AuthService } from 'src/app/demo/components/auth/services/auth.service';
import { InteractionService } from 'src/app/demo/services/interaction.service';
import { GunService } from '../../../services/gun.service';
import { IndexService } from '../../../services/index.service';
import { ProductService } from '../../../services/product.service';
import { PumpService } from '../../../services/pump.service';
import { QuartService } from '../../../services/quart.service';
import * as Utility from '../../../../../utilities/utility';

@Component({
  selector: 'app-table-reconciliation',
  templateUrl: './table-reconciliation.component.html',
  styleUrls: ['./table-reconciliation.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class TableReconciliationComponent {


  user_details:any;
  stationId: number;

  selectedReconciliation:any=null;
  listReconciliations:any[]=[];
  dialogVisible: boolean = false;
  listDataForGraph: any[]=[];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private productService: ProductService,
    private pumpService: PumpService,
    private gunService: GunService,
    private quartService: QuartService,
    private indexService: IndexService,
    private authService: AuthService,
    private interactionService: InteractionService) {}

  ngOnInit(){
    this.user_details = this.authService.getUserData();
    this.stationId = this.user_details.service_station_id;
   
    this.getInteractionMsg();
    
  }

  showStockGraph(reconciliation: any){
    console.log("data show stock graph",reconciliation['allDayRecords']);
    this.listDataForGraph = this.getDataForGraph(reconciliation['allDayRecords']);
    console.log("data show stock graph",this.getDataForGraph(reconciliation['allDayRecords']));
    this.dialogVisible = true;
  }

  showIndexGraph(reconciliation: any){
    console.log("data show Index graph",reconciliation);
  }

  getDataForGraph(reconciliation:any[]){
    let listData:any[] = [];
    let listVolume:any[] = [];
    let listDate:any[] = [];
    if(reconciliation && reconciliation.length>0){
      let numRecon = reconciliation.length;
      for(let i=0; i<numRecon; i++){
        if(reconciliation[i]['listRecords'].length > 0){
          let numRecord = reconciliation[i]['listRecords'].length;
          listData[i] = {};
          listVolume = [];
          listDate = [];
          for(let j=0; j< numRecord; j++){
            listVolume.push(reconciliation[i]['listRecords'][j].volume);
            listDate.push(reconciliation[i]['listRecords'][j].updated_at);
          }
          listData[i] = {
            'volume' : listVolume,
            'listDate' : listDate,
            'sensorReference' : reconciliation[i]['tank']
          };
        }else{
          listData[i]={
            'volume' : [],
            'listDate' : [],
            'sensorReference' : reconciliation[i]['tank']
          };
        }
      }
      
    }else{
      
    }
    return listData;
  }

  getToLocalDateTime(date1:string){
    return Utility.toLocalDateTime(date1)??"";
  }

  getInteractionMsg(){
    this.interactionService.dataToShare$.subscribe((msg)=>{
      /* from: 'pump-reconciliation',
      for: 'table-reconciliation',
      action: 'charge-list-reconciliations-in-table', 
      from: 'pump-reconciliation',
      for: 'table-reconciliation',
      action: 'charge-list-reconciliations-in-table',
      data: listReconciliations*/
      if(msg.from == "pump-reconciliation" &&
        msg.for == "custom-table-reconciliation" && 
        msg.action == "toggle de reconciliation dialog box"
      ){
        
      }else if(msg.from == "pump-reconciliation" &&
        msg.for == "table-reconciliation" && 
        msg.action == "charge-list-reconciliations-in-table"){
          this.listReconciliations = msg.data['allTankByDay'];
          console.log("msg list reconciliation : ", this.listReconciliations);
        
      }else if(msg.from == "pump-reconciliation" &&
        msg.for == "table-reconciliation" && 
        msg.action == "empty-list-reconciliation-in-table"){
          this.listReconciliations = [];
      }

    });
  }

}
