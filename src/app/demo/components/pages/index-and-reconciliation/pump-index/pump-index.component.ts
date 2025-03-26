import { Component } from '@angular/core';
import * as Utility from '../../../../utilities/utility';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PdfService } from 'src/app/demo/services/pdf.service';
import { AuthService } from '../../../auth/services/auth.service';
import { RecordService } from '../../../dashboard/services/record.service';
import { StationService } from '../../services/station.service';
import { InteractionService } from 'src/app/demo/services/interaction.service';
import { ProductService } from '../../services/product.service';
import { IndexService } from '../../services/index.service';
import { PumpService } from '../../services/pump.service';
import { GunService } from '../../services/gun.service';
import { QuartService } from '../../services/quart.service';

@Component({
  selector: 'app-pump-index',
  templateUrl: './pump-index.component.html',
  styleUrls: ['./pump-index.component.scss'],
  providers: [MessageService]
})
export class PumpIndexComponent {

  maxDate: Date | undefined;
  rangeDates: Date[] | undefined;

  selectedProduct:any=null;
  listProducts:any[]=[];

  selectedPump:any=null;
  listPumps:any[]=[];

  selectedGun:any=null;
  listGuns:any[]=[];

  selectedQuartWorking:any=null;
  listQuartWorkings:any[]=[];

  toggleDialogBox = false; 
  activeExport = true;

  user_details:any;
  station: any;
  period:string;

  listIndices:any[]=[];

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
    console.log("user data is: ", this.user_details);
    this.getListProduct();
    this.getListPumps();
    this.getListQaurtByStationId();
    this.getInteractionMsg();
  }

  backToDshboard(){
    this.router.navigate(['/pages/dashboard']);
    //console.log(this.listCuve);
  }

  

  getServiceStation(){
    this.stationService.getServiceStation(this.user_details.service_station_id).subscribe((res)=>{
      console.log("station details pump index: ", res);
      this.station = res;
    });
  }

  onDateSelect(event: any){
    this.getPeriodIndex();
  }

  onDropDownPumpChange(event:any){
    console.log("show event pump: ", event.value);
    this.getPeriodIndexByPumpId();
    this.getListGuns();
  }

  onDropDownGunChange(event: any){
    console.log("show event gun: ", event.value);
    this.getPeriodIndex();
  }

  onDropDownQuartWorkingChange(event: any){
    console.log("show event: ", event.value);
    this.getPeriodIndex();
  }

  getPeriodIndexByPumpId(){
    this.sendEmptyListIndicesByInteractionMsg();
    let usefullData:any = {};
    if(this.selectedPump && this.selectedPump != null){
      if(this.rangeDates?.length == 2 && this.rangeDates[1] == null){
          usefullData = {
            stationId: this.user_details.service_station_id,
            pumpId: this.selectedPump.id,
            //gunId: this.selectedGun.id,
            dateStart: this.rangeDates[0].getFullYear()+'-'+
                        ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                        (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate())
          };
          this.period = "Date : "+Utility.toLocalDate(this.rangeDates[0].toDateString());
          //console.log("usefullData: ",usefullData);

          this.indexService.getListIndicesByPumpId(usefullData).subscribe((res)=>{
              this.listIndices = res;
              //console.log("res indices: ", res);
              if(this.listIndices?.length > 0){
                this.sendListIndicesByInteractionMsg(this.listIndices);
                this.messageService.add({ severity: 'info', summary: "Informations", detail: "Données chargées" });
              }else{
                this.messageService.add({ 
                  severity: 'error', 
                  summary: "Informations", 
                  detail: "Aucune données disponible dans la période" 
                });
              }
              console.log("res day indices: ",res);
          });
      }else if(this.rangeDates?.length == 2 && this.rangeDates[1] != null){
          usefullData = {
            stationId: this.user_details.service_station_id,
            pumpId: this.selectedPump.id,
            //gunId: this.selectedGun.id,
            dateStart: this.rangeDates[0].getFullYear()+'-'+
                        ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                        (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate()),
            dateEnd: this.rangeDates[1].getFullYear()+'-'+
                        ((this.rangeDates[1].getMonth()+1) <= 9 ? '0'+(this.rangeDates[1].getMonth()+1) : (this.rangeDates[1].getMonth()+1)) +'-'+
                        (this.rangeDates[1].getDate() <= 9 ? '0'+this.rangeDates[1].getDate() : this.rangeDates[1].getDate())
          };
          this.period = "Periode du "+Utility.toLocalDate(this.rangeDates[0].toDateString())+" au "+Utility.toLocalDate(this.rangeDates[1].toDateString());
          //console.log("usefullData: ",usefullData);
          this.indexService.getListIndicesByPumpId(usefullData).subscribe((res)=>{
              this.listIndices = res;
              console.log("je lance la echerche pump id");
              if(this.listIndices?.length > 0){
                this.sendListIndicesByInteractionMsg(this.listIndices);
                this.messageService.add({ severity: 'info', summary: "Informations", detail: "Données chargées" });
              }else{
                this.messageService.add({ 
                  severity: 'error', 
                  summary: "Informations", 
                  detail: "Aucune données disponible dans la période" 
                });
              }
              console.log("res period indices pump: ",res);
          });
      }else{
          this.listIndices=[];
      }
    }
    if(this.listIndices.length>0){
      this.activeExport = false;
    }else{
      this.activeExport = true;
    }
  }

  getPeriodIndex(){
    this.sendEmptyListIndicesByInteractionMsg();
    let usefullData:any = {};
    if(this.selectedGun && this.selectedQuartWorking){
      if(this.rangeDates?.length == 2 && this.rangeDates[1] == null){
          usefullData = {
            stationId: this.user_details.service_station_id,
            quartWorkingId: this.selectedQuartWorking.id,
            gunId: this.selectedGun.id,
            dateStart: this.rangeDates[0].getFullYear()+'-'+
                        ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                        (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate())
          };
          this.period = "Date : "+Utility.toLocalDate(this.rangeDates[0].toDateString());
          //console.log("usefullData: ",usefullData);

          this.indexService.getListIndicesByPeriodAndGunIdAndQuartId(usefullData).subscribe((res)=>{
              this.listIndices = res;
              //console.log("res indices: ", res);
              if(this.listIndices?.length > 0){
                this.sendListIndicesByInteractionMsg(this.listIndices);
                this.messageService.add({ severity: 'info', summary: "Informations", detail: "Données chargées" });
              }else{
                this.messageService.add({ 
                  severity: 'error', 
                  summary: "Informations", 
                  detail: "Aucune données disponible dans la période" 
                });
              }
              console.log("res day indices: ",res);
          });
      }else if(this.rangeDates?.length == 2 && this.rangeDates[1] != null){
          usefullData = {
            stationId: this.user_details.service_station_id,
            quartWorkingId: this.selectedQuartWorking.id,
            gunId: this.selectedGun.id,
            dateStart: this.rangeDates[0].getFullYear()+'-'+
                        ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                        (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate()),
            dateEnd: this.rangeDates[1].getFullYear()+'-'+
                        ((this.rangeDates[1].getMonth()+1) <= 9 ? '0'+(this.rangeDates[1].getMonth()+1) : (this.rangeDates[1].getMonth()+1)) +'-'+
                        (this.rangeDates[1].getDate() <= 9 ? '0'+this.rangeDates[1].getDate() : this.rangeDates[1].getDate())
          };
          this.period = "Periode du "+Utility.toLocalDate(this.rangeDates[0].toDateString())+" au "+Utility.toLocalDate(this.rangeDates[1].toDateString());
          //console.log("usefullData: ",usefullData);
          this.indexService.getListIndicesByPeriodAndGunIdAndQuartId(usefullData).subscribe((res)=>{
              this.listIndices = res;
              //console.log("res indices: ", res);
              if(this.listIndices?.length > 0){
                this.sendListIndicesByInteractionMsg(this.listIndices);
                this.messageService.add({ severity: 'info', summary: "Informations", detail: "Données chargées" });
              }else{
                this.messageService.add({ 
                  severity: 'error', 
                  summary: "Informations", 
                  detail: "Aucune données disponible dans la période" 
                });
              }
              console.log("res period indices: ",res);
          });
      }else{
          this.listIndices=[];
      }
    }else if(this.selectedGun && !this.selectedQuartWorking){
      if(this.rangeDates?.length == 2 && this.rangeDates[1] == null){
        usefullData = {
          stationId: this.user_details.service_station_id,
          //quartWorkingId: this.selectedQuartWorking.id,
          gunId: this.selectedGun.id,
          dateStart: this.rangeDates[0].getFullYear()+'-'+
                      ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                      (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate())
        };
        this.period = "Date : "+Utility.toLocalDate(this.rangeDates[0].toDateString());
        //console.log("usefullData: ",usefullData);

        this.indexService.getListIndicesByPeriodAndGunId(usefullData).subscribe((res)=>{
          this.listIndices = res;
          //console.log("res indices: ", res);
          if(this.listIndices?.length > 0){
            this.sendListIndicesByInteractionMsg(this.listIndices);
            this.messageService.add({ severity: 'info', summary: "Informations", detail: "Données chargées" });
          }else{
            this.messageService.add({ 
              severity: 'error', 
              summary: "Informations", 
              detail: "Aucune données disponible dans la période" 
            });
          }
          console.log("res day indices: ",res);
        });
      }else if(this.rangeDates?.length == 2 && this.rangeDates[1] != null){
        usefullData = {
          stationId: this.user_details.service_station_id,
          //quartWorkingId: this.selectedQuartWorking.id,
          gunId: this.selectedGun.id,
          dateStart: this.rangeDates[0].getFullYear()+'-'+
                      ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                      (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate()),
          dateEnd: this.rangeDates[1].getFullYear()+'-'+
                      ((this.rangeDates[1].getMonth()+1) <= 9 ? '0'+(this.rangeDates[1].getMonth()+1) : (this.rangeDates[1].getMonth()+1)) +'-'+
                      (this.rangeDates[1].getDate() <= 9 ? '0'+this.rangeDates[1].getDate() : this.rangeDates[1].getDate())
        };
        this.period = "Periode du "+Utility.toLocalDate(this.rangeDates[0].toDateString())+" au "+Utility.toLocalDate(this.rangeDates[1].toDateString());
        //console.log("usefullData: ",usefullData);
        this.indexService.getListIndicesByPeriodAndGunId(usefullData).subscribe((res)=>{
            this.listIndices = res;
            //console.log("res indices: ", res);
            if(this.listIndices?.length > 0){
              this.sendListIndicesByInteractionMsg(this.listIndices);
              this.messageService.add({ severity: 'info', summary: "Informations", detail: "Données chargées" });
            }else{
              this.messageService.add({ 
                severity: 'error', 
                summary: "Informations", 
                detail: "Aucune données disponible dans la période" 
              });
            }
            console.log("res period indices: ",res);
        });
      }else{
        this.listIndices=[];
      }
    }else if(!this.selectedGun && this.selectedQuartWorking){
      if(this.rangeDates?.length == 2 && this.rangeDates[1] == null){
        usefullData = {
          stationId: this.user_details.service_station_id,
          quartWorkingId: this.selectedQuartWorking.id,
          //gunId: this.selectedGun.id,
          dateStart: this.rangeDates[0].getFullYear()+'-'+
                      ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                      (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate())
        };
        this.period = "Date : "+Utility.toLocalDate(this.rangeDates[0].toDateString());
        //console.log("usefullData: ",usefullData);

        this.indexService.getListIndicesByPeriodAndQuartId(usefullData).subscribe((res)=>{
          this.listIndices = res;
          //console.log("res indices: ", res);
          if(this.listIndices?.length > 0){
            this.sendListIndicesByInteractionMsg(this.listIndices);
            this.messageService.add({ severity: 'info', summary: "Informations", detail: "Données chargées" });
          }else{
            this.messageService.add({ 
              severity: 'error', 
              summary: "Informations", 
              detail: "Aucune données disponible dans la période" 
            });
          }
          console.log("res day indices: ",res);
        });
      }else if(this.rangeDates?.length == 2 && this.rangeDates[1] != null){
        usefullData = {
          stationId: this.user_details.service_station_id,
          quartWorkingId: this.selectedQuartWorking.id,
          //gunId: this.selectedGun.id,
          dateStart: this.rangeDates[0].getFullYear()+'-'+
                      ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                      (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate()),
          dateEnd: this.rangeDates[1].getFullYear()+'-'+
                      ((this.rangeDates[1].getMonth()+1) <= 9 ? '0'+(this.rangeDates[1].getMonth()+1) : (this.rangeDates[1].getMonth()+1)) +'-'+
                      (this.rangeDates[1].getDate() <= 9 ? '0'+this.rangeDates[1].getDate() : this.rangeDates[1].getDate())
        };
        this.period = "Periode du "+Utility.toLocalDate(this.rangeDates[0].toDateString())+" au "+Utility.toLocalDate(this.rangeDates[1].toDateString());
        //console.log("usefullData: ",usefullData);

        this.indexService.getListIndicesByPeriodAndQuartId(usefullData).subscribe((res)=>{
          this.listIndices = res;
          //console.log("res indices: ", res);
          if(this.listIndices?.length > 0){
            this.sendListIndicesByInteractionMsg(this.listIndices);
            this.messageService.add({ severity: 'info', summary: "Informations", detail: "Données chargées" });
          }else{
            this.messageService.add({ 
              severity: 'error', 
              summary: "Informations", 
              detail: "Aucune données disponible dans la période" 
            });
          }
          console.log("res period indices: ",res);
        });
      }else{
        this.listIndices=[];
      }
    }else if(!this.selectedGun && !this.selectedQuartWorking){
      if(this.rangeDates?.length == 2 && this.rangeDates[1] == null){
        usefullData = {
          stationId: this.user_details.service_station_id,
          //quartWorkingId: this.selectedQuartWorking.id,
          //gunId: this.selectedGun.id,
          dateStart: this.rangeDates[0].getFullYear()+'-'+
                      ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                      (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate())
        };
        this.period = "Date : "+Utility.toLocalDate(this.rangeDates[0].toDateString());
        //console.log("usefullData: ",usefullData);

        this.indexService.getListIndicesByPeriod(usefullData).subscribe((res)=>{
          this.listIndices = res;
          //console.log("res indices: ", res);
          if(this.listIndices?.length > 0){
            this.sendListIndicesByInteractionMsg(this.listIndices);
            this.messageService.add({ severity: 'info', summary: "Informations", detail: "Données chargées" });
          }else{
            this.messageService.add({ 
              severity: 'error', 
              summary: "Informations", 
              detail: "Aucune données disponible dans la période" 
            });
          }
          console.log("res day indices: ",res);
        });
      }else if(this.rangeDates?.length == 2 && this.rangeDates[1] != null){
        usefullData = {
          stationId: this.user_details.service_station_id,
          //quartWorkingId: this.selectedQuartWorking.id,
          //gunId: this.selectedGun.id,
          dateStart: this.rangeDates[0].getFullYear()+'-'+
                      ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                      (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate()),
          dateEnd: this.rangeDates[1].getFullYear()+'-'+
                      ((this.rangeDates[1].getMonth()+1) <= 9 ? '0'+(this.rangeDates[1].getMonth()+1) : (this.rangeDates[1].getMonth()+1)) +'-'+
                      (this.rangeDates[1].getDate() <= 9 ? '0'+this.rangeDates[1].getDate() : this.rangeDates[1].getDate())
        };
        this.period = "Periode du "+Utility.toLocalDate(this.rangeDates[0].toDateString())+" au "+Utility.toLocalDate(this.rangeDates[1].toDateString());
        //console.log("usefullData: ",usefullData);
        
        this.indexService.getListIndicesByPeriod(usefullData).subscribe((res)=>{
          this.listIndices = res;
          //console.log("res indices: ", res);
          if(this.listIndices?.length > 0){
            this.sendListIndicesByInteractionMsg(this.listIndices);
            this.messageService.add({ severity: 'info', summary: "Informations", detail: "Données chargées" });
          }else{
            this.messageService.add({ 
              severity: 'error', 
              summary: "Informations", 
              detail: "Aucune données disponible dans la période" 
            });
          }
          console.log("res period indices: ",res);
        });
      }else{
        this.listIndices=[];
      }
    }else{
        this.listIndices=[];
    }
    if(this.listIndices.length>0){
      this.activeExport = false;
    }else{
      this.activeExport = true;
    }

  }

  addNewIndex(){
    console.log("j'ajoute un index");
    this.interactionService.addNewDataToShare({
      from: "pump-index",
      for: "custom-table-index",
      action: "toggle de index dialog box",
      data: !this.toggleDialogBox
    });
  }

  getListQaurtByStationId(){
    this.quartService.getListQuarts(this.user_details.service_station_id).subscribe((res)=>{
      console.log("list quart: ", res);
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
        console.log("list product:", listPro); 
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

  getListPumps(){
    let listPumps:any[]=[];
    //console.log("station id : ", this.user_details.service_station_id);
    this.pumpService.getListPumpsByStationId(this.user_details.service_station_id).subscribe((res)=>{
      if(res.status && res?.data.length > 0){
        this.listPumps = res?.data;
        //this.selectedPump = this.listPumps[0];
        this.getListGuns();
        console.log("list pump:", listPumps); 
      }else{
        this.messageService.add(
          { 
            severity: 'error', 
            summary: "Informations", 
            detail: "Aucune pompe enregistrée" 
          }
        );
      }
    });
  }

  getListGuns(){
    if(this.selectedPump && this.selectedPump != null){
      this.gunService.getListGunsByPumpId(this.selectedPump.id).subscribe((res)=>{
        console.log("liste des pistolets: ", res);
        if(res.status && res?.data.length > 0){
          this.listGuns = res?.data;
          //this.selectedGun = this.listGuns[0];
          console.log("list gun:", this.listGuns); 
          this.messageService.add(
            { 
              severity: 'success', 
              summary: "Informations", 
              detail: "Pistolet disponible." 
            }
          );
        }else{
          this.listGuns = [];
          //this.selectedGun = null;
          this.messageService.add(
            { 
              severity: 'error', 
              summary: "Informations", 
              detail: "Aucun pistolet disponible pour cette pompe." 
            }
          );
        }
      });
    }
  }

  sendListIndicesByInteractionMsg(listIndices:any){
    this.interactionService.addNewDataToShare({
      from: 'pump-index',
      for: 'table-index',
      action: 'charge-list-indices-in-table',
      data: listIndices
    });
  }

  sendEmptyListIndicesByInteractionMsg(){
    this.interactionService.addNewDataToShare({
      from: 'pump-index',
      for: 'table-index',
      action: 'empty-list-indices-in-table'
    });
  }

  generatePumpIndicesPdf(){
    let usefullData = {
        user_details: this.user_details,
        station: this.station,
        data: this.listIndices,
        dateStart: this.rangeDates[0].getFullYear()+'-'+
                        ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                        (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate()),
        dateEnd: this.rangeDates[1].getFullYear()+'-'+
                    ((this.rangeDates[1].getMonth()+1) <= 9 ? '0'+(this.rangeDates[1].getMonth()+1) : (this.rangeDates[1].getMonth()+1)) +'-'+
                    (this.rangeDates[1].getDate() <= 9 ? '0'+this.rangeDates[1].getDate() : this.rangeDates[1].getDate())
    };
    this.pdfService.generatePumpIndicesPdf(usefullData);
  }

  getInteractionMsg(){
    /* from: 'table-index',
    for: 'pump-index',
    action: 'recharge-list-indices-in-table' */
    this.interactionService.dataToShare$.subscribe((msg)=>{
      if(msg.from == "table-index" &&
      msg.for == "pump-index" && 
      msg.action == "recharge-list-indices-in-table"
      ){
        this.getPeriodIndex();
      }
    });  
  }



}
