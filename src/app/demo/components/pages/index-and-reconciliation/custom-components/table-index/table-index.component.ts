import { Component, Input, booleanAttribute } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import * as Utility from '../../../../../utilities/utility';
import { InteractionService } from 'src/app/demo/services/interaction.service';
import { ProductService } from '../../../services/product.service';
import { AuthService } from 'src/app/demo/components/auth/services/auth.service';
import { IndexService } from '../../../services/index.service';
import { PumpService } from '../../../services/pump.service';
import { GunService } from '../../../services/gun.service';
import { QuartService } from '../../../services/quart.service';

@Component({
  selector: 'app-table-index',
  templateUrl: './table-index.component.html',
  styleUrls: ['./table-index.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class TableIndexComponent {
  
  @Input({ required: true, transform: booleanAttribute }) activeEditAndDeleteButton: boolean = false;
  indexDialog: boolean = false;

  listIndexes!: any[];
  listProducts: any[];
  listPumps: any[];
  listQuarts: any[];
  listGuns: any[];

  index!: any;

  indexForDialog:any={};

  selectedIndexes!: any[] | null;

  submitted: boolean = false;

  user_details:any;
  stationId: number;
  disabledInputIndexStart: boolean = false;
  disabledInputPump: boolean = false;
  disabledInputProduct: boolean = false;
  isEdit: boolean = false;

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
    console.log("user data is: ", this.user_details);
    this.getListProduct();
    this.getListPumps();
    this.getListQuarts();
    this.getInteractionMsg();
    
  }

  getInteractionMsg(){
    this.interactionService.dataToShare$.subscribe((msg)=>{
      /* from: "pump-index",
      for: "custom-table-index",
      action: "toggle de index dialog box",
      data: true */
      if(msg.from == "pump-index" &&
        msg.for == "custom-table-index" && 
        msg.action == "toggle de index dialog box"
      ){
        console.log("interaction data: ", msg.data);
        if(this.listProducts.length > 0 && this.listPumps.length > 0){
          this.indexForDialog = {
            product :  this.listProducts[0],
            pump : this.listPumps[0],
            index_start: 0,
            index_end: 0
          };
        }else{
          this.indexForDialog = {
            index_start: 0,
            index_end: 0
          };
        }
        this.indexDialog = msg.data;
        //this.indexForDialog = {};
        this.submitted = false;
      }else if(msg.from == "pump-index" &&
        msg.for == "table-index" && 
        msg.action == "charge-list-indices-in-table"){
        /* from: 'pump-index',
        for: 'table-index',
        action: 'charge-list-indices-in-table',
        data: listIndices */
        console.log("list from interaction msg: ", msg.data);
        this.listIndexes = msg.data;

      }else if(msg.from == "pump-index" &&
        msg.for == "table-index" && 
        msg.action == "empty-list-indices-in-table"){
        /* from: 'pump-index',
        for: 'table-index',
        action: 'empty-list-indices-in-table' */
        this.listIndexes = [];
      }

    });
  }

  askForRechargeListByInteractionMsg(){
    this.interactionService.addNewDataToShare({
      from: 'table-index',
      for: 'pump-index',
      action: 'recharge-list-indices-in-table'
    });
  }

  getListProduct(){
    let listPro:any[]=[];
    //console.log("station id : ", this.user_details.service_station_id);
    this.productService.getListStationProductsByStationId(this.user_details.service_station_id).subscribe((res)=>{
      //console.log("la res de product est : ", res);
      if(res.status && res?.listStationProducts.length > 0){
        res?.listStationProducts.forEach((stationProduct: any) => {
          //console.log("stationProduct.product:", stationProduct.product); 
          listPro.push(stationProduct.product);
        });
        
        this.listProducts = listPro;
        //console.log("list product:", this.listProducts); 
        this.indexForDialog.product = this.listProducts[0];
        this.indexForDialog.index_start = 25;
        this.indexForDialog.index_end = 58;
        //console.log("this.indexForDialog:", this.indexForDialog); 
      }
    });
  }

  getListPumps(){
    let listPumps:any[]=[];
    //console.log("station id : ", this.user_details.service_station_id);
    this.pumpService.getListPumpsByStationId(this.user_details.service_station_id).subscribe((res)=>{
      if(res.status && res?.data.length > 0){
        this.listPumps = res?.data;
        console.log("list pump:", listPumps); 
      }
    });
  }

  getListGuns(){
    if(this.indexForDialog.pump.id){
      this.gunService.getListGunsByPumpId(this.indexForDialog.pump.id).subscribe((res)=>{
        if(res.status && res?.data.length > 0){
          this.listGuns = res?.data;
          console.log("list guns:", this.listGuns); 
        }
      });
    }
    
  }

  getListQuarts(){
    this.quartService.getListQuarts(this.user_details.service_station_id).subscribe((res)=>{
      if(res?.length > 0){
        this.listQuarts = res;
        console.log("list quart:", this.listQuarts); 
      }
    });
  }

  onDropDownDialogProductChange(event: any){
    this.getLastIndexByThreeId();
  }

  onDropDownDialogPumpChange(event: any){
    this.getListGuns();
    //this.getLastIndexByThreeId();
  }

  onDropDownDialogGunChange(event: any){
    this.getLastIndexByThreeId();
  }

  onDropDownDialogQuartChange(event: any){
    this.getLastIndexByThreeId();
  }

  getLastIndexByThreeId(){
    if(this.indexForDialog.quart && this.indexForDialog.gun){
      if(this.isEdit == true){
        this.disabledInputIndexStart = true;
      }else{
        this.indexService.getLastIndexByQuartIdGunIdStationId(
          this.stationId, this.indexForDialog.quart.id, this.indexForDialog.gun.id).subscribe((res)=>{
            console.log("res form three id: ", res);
            if(res.status == "success"){
              this.indexForDialog.index_start = res.data.index_end;
              this.disabledInputIndexStart = true;
            }else{
              this.disabledInputIndexStart = false;
            }
        });
      }
      
    }
  }

  saveIndex(){
    console.log("je sauvegarde l'index");
    console.log("indexForDialog: ", this.indexForDialog);
    this.submitted = true;
    if (this.indexForDialog.index_start >= 0 && this.indexForDialog.index_end >= this.indexForDialog.index_start) {
      if (this.indexForDialog.id) {
        this.indexForDialog.userId = this.user_details.user.id;
        // TODO save in database
        //console.log("index modifie: ",this.indexForDialog);
        this.indexService.editIndex(this.indexForDialog).subscribe((res)=>{
          console.log("res modifie: ", res);
          if(res.status == true){
            this.messageService.add(
              { 
                severity: 'success', 
                summary: 'Successful', 
                detail: 'Index modifié', 
                life: 3000 
              });
          }else{
            
            this.messageService.add(
              { 
                severity: 'success', 
                summary: 'Successful', 
                detail: 'Echec de la modification de l\'index', 
                life: 3000 
              });
          }
          this.askForRechargeListByInteractionMsg();
        });
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Index modifié', life: 3000 });
      } else {
        // TODO save in database
        this.indexForDialog.dateSave = (new Date()).toLocaleString();
        this.indexForDialog.userId = this.user_details.user.id;
        this.indexForDialog.stationId = this.user_details.service_station_id;
        this.indexService.saveIndex(this.indexForDialog).subscribe((res)=>{
          if(res.status == 'success'){
            this.messageService.add(
              { 
                severity: 'success', 
                summary: 'Successful', 
                detail: 'Index créé', 
                life: 3000 
              });

          }else{
            this.messageService.add(
              { 
                severity: 'error', 
                summary: 'Erreur', 
                detail: 'Echec de creation de l\'index', 
                life: 3000 
              });
          }
          this.askForRechargeListByInteractionMsg();
        });
      }
      this.listIndexes = [];
      this.indexDialog = false;
      this.isEdit = false;
      this.indexForDialog = {};
      
    }else{
      this.messageService.add(
        { 
          severity: 'error', 
          summary: 'Erreur', 
          detail: 'Verifiez la valeur des index', 
          life: 3000 
        });
    }
  }

  editIndex(indexEdit:any){
    this.indexForDialog = { ...indexEdit };
    this.indexForDialog.pump = this.indexForDialog.gun_pump.pump;
    this.indexForDialog.gun = this.indexForDialog.gun_pump;
    this.indexForDialog.quart = this.indexForDialog.quart_working;
    this.indexForDialog.userId = this.user_details.user.id;
    console.log("index edit: ", this.indexForDialog);
    this.indexDialog = true;
    this.isEdit = true;
  }

  deleteIndex(indexDel:any){
    this.confirmationService.confirm({
      message: 'Etes vous certain de vouloir supprimer l\'index du: ' + 
                this.getToLocalDateTime(indexDel.created_at) +" du quart "+
                indexDel.quart_working.time_start +"--"+ 
                indexDel.quart_working.time_close+ '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        indexDel.userId = this.user_details.user.id;
        this.indexService.deleteIndex(indexDel).subscribe((res)=>{
          if(res.status == true){
            this.messageService.add(
              { 
                severity: 'success', 
                summary: 'Successful', 
                detail: 'Index supprimé avec succes', 
                life: 3000 
              });
              this.askForRechargeListByInteractionMsg();
          }else{
            this.messageService.add(
              { 
                severity: 'error', 
                summary: 'Erreur', 
                detail: 'Echec de la suppression de l\'index', 
                life: 3000 
              });
          }

        });
      }
    });
  }

  hideDialog(){
    this.indexDialog = false;
    this.submitted = false;
  }

  getToLocalDateTime(date1:string){
    return Utility.toLocalDateTime(date1)??"";
  }

}
