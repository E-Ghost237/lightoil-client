import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../../auth/services/auth.service';
import { StationService } from '../../services/station.service';
import { RecordService } from '../../../dashboard/services/record.service';
import * as Utility from '../../../../utilities/utility';
import { ProductService } from '../../services/product.service';
import { MessageService } from 'primeng/api';
import { PdfService } from 'src/app/demo/services/pdf.service';

@Component({
  selector: 'app-hbp-tank',
  templateUrl: './hbp-tank.component.html',
  styleUrls: ['./hbp-tank.component.scss'],
  providers: [MessageService]
})
export class HbpTankComponent {
  date: Date;
  maxDate: Date | undefined;
  rangeDates: Date[] | undefined;

  Tableau: boolean = false;
  user_details!:any;
  period:string = "";

  /* selectedTank:any;
  listTanks:any[]=[]; */

  selectedStationProduct:any;
  listStationProducts:any[]=[];

  listRecords:any[]=[];

 constructor(
    private router: Router,
    private cookieService: CookieService,
    private authService: AuthService,
    private stationService: StationService,
    private recordService: RecordService,
    private messageService: MessageService,
    private productService: ProductService,
    private pdfService: PdfService
    ){}



  ngOnInit(){
    this.maxDate = new Date();
    this.user_details = this.authService.getUserData();
    this.getListStationProducts();
    //this.getListTanks();
  }


  /* getListTanks(){
    this.stationService.getServiceStationListTanks(this.user?.station).subscribe((res)=>{
        this.listTanks = res;
        if(res.length > 0){
            this.selectedTank = this.listTanks[0]
        }
        ;
    });
    ;
  }
 */
  getListStationProducts(){
    this.productService.getListStationProductsByStationId(this.user_details?.service_station_id).subscribe((res)=>{
      if (res.status ==true) {
        this.listStationProducts = res.listStationProducts;
        if(this.listStationProducts.length > 0){
          this.selectedStationProduct = this.listStationProducts[0];
        }
      }

    });
    //;
  }

  getPeriodRecords(){
    let usefullData:any = {};
    if(this.selectedStationProduct){
        if(this.rangeDates?.length == 2 && this.rangeDates[1] == null){
            usefullData = {
                stationProductId: this.selectedStationProduct.id,
                dateStart: this.rangeDates[0].getFullYear()+'-'+
                            ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                            (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate())
            };
            this.period = "Date : "+Utility.toLocalDate(this.rangeDates[0].toDateString());


            this.recordService.getListRecordsForOneDayByStationProduct(usefullData).subscribe((res)=>{
              if(res.status == true){
                this.listRecords = res.listRecords;
                if(this.listRecords?.length > 0){
                  this.messageService.add({ severity: 'info', summary: "Informations", detail: "Données chargées" });
                }else{
                  this.messageService.add({
                    severity: 'error',
                    summary: "Informations",
                    detail: "Aucune données disponible dans la période"
                  });
                }
              }else{
                this.listRecords=[];
                this.messageService.add({
                  severity: 'error',
                  summary: "Informations",
                  detail: "Aucune données disponible dans la période"
                });
              }

            });
        }else if(this.rangeDates?.length == 2 && this.rangeDates[1] != null){
            usefullData = {
                stationProductId: this.selectedStationProduct.id,
                dateStart: this.rangeDates[0].getFullYear()+'-'+
                            ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                            (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate()),
                dateEnd: this.rangeDates[1].getFullYear()+'-'+
                            ((this.rangeDates[1].getMonth()+1) <= 9 ? '0'+(this.rangeDates[1].getMonth()+1) : (this.rangeDates[1].getMonth()+1)) +'-'+
                            (this.rangeDates[1].getDate() <= 9 ? '0'+this.rangeDates[1].getDate() : this.rangeDates[1].getDate())
            };
            this.period = "Periode du "+Utility.toLocalDate(this.rangeDates[0].toDateString())+" au "+Utility.toLocalDate(this.rangeDates[1].toDateString());


            this.recordService.getListRecordsForPeriodByStationProduct(usefullData).subscribe((res)=>{
              if(res.status == true){
                this.listRecords = res.listRecords;
                if(this.listRecords?.length > 0){
                  this.messageService.add({ severity: 'info', summary: "Informations", detail: "Données chargées" });
                }else{
                  this.messageService.add({
                    severity: 'error',
                    summary: "Informations",
                    detail: "Aucune données disponible dans la période"
                  });
                }
              }else{
                this.listRecords=[];
                this.messageService.add({
                  severity: 'error',
                  summary: "Informations",
                  detail: "Aucune données disponible dans la période"
                });
              }


            });
        }else{
            this.listRecords=[];
        }
    }else{
        this.listRecords=[];
    }

  }

  backToDshboard(){
    this.router.navigate(['/pages/dashboard']);
    //(this.listCuve);
  }

  onDropDownChange(event:any){

    this.getPeriodRecords();
  }

  onDateSelect(event:any){

    this.getPeriodRecords();
  }

  generateTankProductPdf(){
    let usefullData = {
      user_details: this.user_details,
      stationProduct: this.selectedStationProduct,
      period: this.period,
      listRecords: this.listRecords
    };
    this.pdfService.generateTankProductPdf(usefullData);
  }
}
