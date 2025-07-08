import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { InteractionService } from 'src/app/demo/services/interaction.service';
import { PdfService } from 'src/app/demo/services/pdf.service';
import { AuthService } from '../../../auth/services/auth.service';
import { RecordService } from '../../../dashboard/services/record.service';
import { GunService } from '../../services/gun.service';
import { IndexService } from '../../services/index.service';
import { ProductService } from '../../services/product.service';
import { PumpService } from '../../services/pump.service';
import { QuartService } from '../../services/quart.service';
import { StationService } from '../../services/station.service';
import * as Utility from '../../../../utilities/utility';

@Component({
  selector: 'app-pump-reconciliation',
  templateUrl: './pump-reconciliation.component.html',
  styleUrls: ['./pump-reconciliation.component.scss'],
  providers: [MessageService]
})
export class PumpReconciliationComponent {

  maxDate: Date | undefined;
  rangeDates: Date[] | undefined;

  selectedProduct:any=null;
  listProducts:any[]=[];

  selectedQuartWorking:any=null;
  listQuartWorkings:any[]=[];

  activeExport = true;

  user_details:any;
  station: any;
  period:string;
  listReconciliations: any[]=[];

  constructor(
    private router: Router,
    private interactionService: InteractionService,
    private productService: ProductService,
    private authService: AuthService,
    private indexService: IndexService,
    private pumpService: PumpService,
    private gunService: GunService,
    private quartService: QuartService,
    private stationService: StationService,
    private messageService: MessageService,
    private recordService: RecordService,
    private pdfService: PdfService
    ){}


  ngOnInit(){
    this.user_details = this.authService.getUserData();
    this.getServiceStation();
    ;
    this.getListProduct();
    this.getListQuartByStationId();
    this.getInteractionMsg();
  }

  backToDshboard(){
    this.router.navigate(['/pages/dashboard']);
    //(this.listCuve);
  }

  getServiceStation(){
    this.stationService.getServiceStation(this.user_details.service_station_id).subscribe((res)=>{
      ;
      this.station = res;
    });
  }

  onDateSelect(event: any){
    ;
    this.getPeriodReconciliation();
  }

  onDropDownProductChange(event:any){
    ;
    this.getPeriodReconciliation();
  }

  onDropDownQuartWorkingChange(event: any){
    ;
    this.getPeriodReconciliation();
  }

  getListQuartByStationId(){
    this.quartService.getListQuarts(this.user_details.service_station_id).subscribe((res)=>{
      ;
      if(res.length > 0){
        this.listQuartWorkings = res;
      }else{
        this.messageService.add(
          {
            severity: 'error',
            summary: "Informations",
            detail: "Aucun quart de travail trouvé"
          }
        );
      }
    });
  }

  getListProduct(){
    let listPro:any[]=[];
    this.productService.getListStationProductsByStationId(this.user_details.service_station_id).subscribe((res)=>{
      if(res.status && res?.listStationProducts.length > 0){
        res?.listStationProducts.forEach((stationProduct: any) => {
          listPro.push(stationProduct.product);
        });
        ;
        this.listProducts = listPro;
      }else{
        this.messageService.add(
          {
            severity: 'error',
            summary: "Informations",
            detail: "Aucun produit disponible"
          }
        );
      }
    });
  }

  getPeriodReconciliation(){
    this.sendEmptyListReconciliationsByInteractionMsg();
    let usefullData:any = {};
    if(this.selectedProduct && this.selectedQuartWorking){
      if(this.rangeDates?.length == 2 && this.rangeDates[1] == null){
        usefullData = {
          stationId: this.user_details.service_station_id,
          quartWorkingId: this.selectedQuartWorking.id,
          productId: this.selectedProduct.id,
          dateStart: this.rangeDates[0].getFullYear()+'-'+
                      ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                      (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate())
        };
        this.period = "Date : "+Utility.toLocalDate(this.rangeDates[0].toDateString());

        this.indexService.getListReconciliationByPeriod(usefullData).subscribe((res)=>{
          //;
          ;
          if(res.status == true){
            if(res.data['allTankByDay'].length > 0){
              this.activeExport = false;
            }else{
              this.activeExport = true;
            }
            this.messageService.add({
              severity: 'success',
              summary: "Informations",
              detail: "Chargement des données de la période réussi"
            });
            this.listReconciliations = res.data;
            this.sendListReconciliationByInteractionMsg(res.data);
          }else{
            this.activeExport = true;
            this.messageService.add({
              severity: 'error',
              summary: "Informations",
              detail: "Aucune données disponible dans la période"
            });
          }

        });


      }else if(this.rangeDates?.length == 2 && this.rangeDates[1] != null){
        usefullData = {
          stationId: this.user_details.service_station_id,
          quartWorkingId: this.selectedQuartWorking.id,
          productId: this.selectedProduct.id,
          dateStart: this.rangeDates[0].getFullYear()+'-'+
                      ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                      (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate()),
          dateEnd: this.rangeDates[1].getFullYear()+'-'+
                      ((this.rangeDates[1].getMonth()+1) <= 9 ? '0'+(this.rangeDates[1].getMonth()+1) : (this.rangeDates[1].getMonth()+1)) +'-'+
                      (this.rangeDates[1].getDate() <= 9 ? '0'+this.rangeDates[1].getDate() : this.rangeDates[1].getDate())
        };
        this.period = "Periode du "+Utility.toLocalDate(this.rangeDates[0].toDateString())+" au "+Utility.toLocalDate(this.rangeDates[1].toDateString());

        this.indexService.getListReconciliationByPeriod(usefullData).subscribe((res)=>{
          //;
          ;
          if(res.status == true){
            this.messageService.add({
              severity: 'success',
              summary: "Informations",
              detail: "Chargement des données de la période réussi"
            });
            if(res.data['allTankByDay'].length > 0){
              this.activeExport = false;
            }else{
              this.activeExport = true;
            }
            this.listReconciliations = res.data;
            this.sendListReconciliationByInteractionMsg(res.data);
          }else{
            this.activeExport = true;
            this.messageService.add({
              severity: 'error',
              summary: "Informations",
              detail: "Aucune données disponible dans la période"
            });
          }
        });

      }else{
        this.listReconciliations=[];
      }
    }
  }

  sendListReconciliationByInteractionMsg(listReconciliations:any){
    this.interactionService.addNewDataToShare({
      from: 'pump-reconciliation',
      for: 'table-reconciliation',
      action: 'charge-list-reconciliations-in-table',
      data: listReconciliations
    });
  }

  sendEmptyListReconciliationsByInteractionMsg(){
    this.interactionService.addNewDataToShare({
      from: 'pump-reconciliation',
      for: 'table-reconciliation',
      action: 'empty-list-reconciliation-in-table'
    });
  }

  getInteractionMsg(){
    /* from: 'table-index',
    for: 'pump-index',
    action: 'recharge-list-indices-in-table' */
    this.interactionService.dataToShare$.subscribe((msg)=>{
      if(msg.from == "table-reconciliation" &&
      msg.for == "pump-reconciliation" &&
      msg.action == "recharge-list-reconciliation-in-table"
      ){
        this.getPeriodReconciliation();
      }
    });
  }



  generateProductReconciliationIndicesPdf(){
    let usefullData = {
      user_details: this.user_details,
      station: this.station,
      data: this.listReconciliations,
      quartWorking: this.selectedQuartWorking,
      dateStart: this.rangeDates[0].getFullYear()+'-'+
                      ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                      (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate()),
      dateEnd: this.rangeDates[1].getFullYear()+'-'+
                  ((this.rangeDates[1].getMonth()+1) <= 9 ? '0'+(this.rangeDates[1].getMonth()+1) : (this.rangeDates[1].getMonth()+1)) +'-'+
                  (this.rangeDates[1].getDate() <= 9 ? '0'+this.rangeDates[1].getDate() : this.rangeDates[1].getDate())
    };
    this.pdfService.generateReconciliationsPdf(usefullData);
  }


}
