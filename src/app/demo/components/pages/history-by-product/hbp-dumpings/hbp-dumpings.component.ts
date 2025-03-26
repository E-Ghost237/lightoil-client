import { RecordService } from 'src/app/demo/components/dashboard/services/record.service';
import { Component,OnInit } from '@angular/core';



import { AuthService } from '../../../auth/services/auth.service';
import { QuartService } from '../../services/quart.service';
import { StationService } from '../../services/station.service';
import { DepotageService } from '../../services/depotage.service';
import { variables } from '../../history-by-tank/variables';
import { ProductService } from '../../services/product.service';
import { MessageService } from 'primeng/api';
import { PdfService } from 'src/app/demo/services/pdf.service';

@Component({
  selector: 'app-hbp-dumpings',
  templateUrl: './hbp-dumpings.component.html',
  styleUrls: ['./hbp-dumpings.component.scss'],
  providers: [MessageService]
})
export class HbpDumpingsComponent {
  date: Date;
    maxDate: Date | undefined;
    rangeDates: Date[] | undefined;
    rangeDatesDep: Date[] | undefined;
    selectedStationProductDep:any;

    rangeDatesRap: Date[] | undefined;
    selectedStationProductRap:any;

    listStationProducts:any[]=[];
    selectedStationProduct:any;

    listQuarter: variables[];
    selectedQuart:any;
    dataOutputs!:any;
    dataInputs!:any;
    dataReport!:any;

    user_details!:any;


    constructor(
        private authService: AuthService,
        private quartService: QuartService,
        private stationService: StationService,
        private recordService: RecordService,
        private depotageService: DepotageService,
        private messageService: MessageService,
        private productService: ProductService,
        private pdfService: PdfService
        ){}


    activeIndex: number = 0;

    ngOnInit() {
        this.maxDate = new Date();
        this.user_details = this.authService.getUserData();
        //console.log("station id: ", this.user);
        this.getListQuartWorking();
        this.getListProducts();
    }

    getListProducts(){
      this.productService.getListStationProductsByStationId(this.user_details?.service_station_id).subscribe((res)=>{
        if(res.status == true){
          this.listStationProducts = res.listStationProducts;
          if(res.listStationProducts > 0){
            this.selectedStationProduct = this.listStationProducts[0];
            this.selectedStationProductDep = this.listStationProducts[0];
            this.selectedStationProductRap = this.listStationProducts[0];
          }
        }
        //console.log("list tank: ", this.listTanks);
      });
      //console.log("user is: ", this.user);
    }

    getListQuartWorking(){
        this.quartService.getListQuarts(this.user_details?.service_station_id).subscribe((res)=>{
            this.listQuarter = res;
            //console.log("list quarts: ", res);
        });
    }

    onDropDownChangeQuart(event:any){
        this.getOutputsOnPeriod();
        console.log("show event: ", this.selectedQuart);
        //this.getPeriodRecords();
    }

    onDropDownChangeTank(event:any){
        this.getOutputsOnPeriod();
        console.log("show event: ", this.selectedStationProduct);
        //this.getPeriodRecords();
    }

    onDateSelect(event:any){
        this.getOutputsOnPeriod();
        console.log("show event: ", this.rangeDates);
        //this.getPeriodRecords();
    }

    getOutputsOnPeriod(){
        let usefullData:any = {};
        if(this.selectedStationProduct){
            if(this.rangeDates?.length == 2 && this.rangeDates[1] == null){
                if (this.selectedQuart) {
                    usefullData = {
                        stationProductId : this.selectedStationProduct.id,
                        timeStart: this.selectedQuart.time_start,
                        timeClose: this.selectedQuart.time_close,
                        dateStart: this.rangeDates[0].getFullYear()+'-'+
                            ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                            (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate()),
                        dateEnd: this.rangeDates[0].getFullYear()+'-'+
                            ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                            (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate())
                    }
                } else {
                    usefullData = {
                        stationProductId : this.selectedStationProduct.id,
                        timeStart: null,
                        timeClose: null,
                        dateStart: this.rangeDates[0].getFullYear()+'-'+
                            ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                            (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate()),
                        dateEnd: this.rangeDates[0].getFullYear()+'-'+
                            ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                            (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate())
                    }
                }

                this.recordService.getOutPutsOnPeriodByStationProductId(usefullData).subscribe((res)=>{
                    this.dataOutputs = res;
                    if(this.dataOutputs?.periodRecord?.length <= 0){
                        this.messageService.add({ 
                                severity: 'error', 
                                summary: "Informations", 
                                detail: "Aucune sortie dans la période" 
                            });
                    }else{
                        this.messageService.add({ severity: 'info', summary: "Informations", detail: "Sorties chargées" }); 
                    }
                    //console.log("usefull data js: ", usefullData);
                    console.log("usefull data dumping product: ", res);
                });
            }else if(this.rangeDates?.length == 2 && this.rangeDates[1] != null){
                if (this.selectedQuart) {
                    usefullData = {
                        stationProductId : this.selectedStationProduct.id,
                        timeStart: this.selectedQuart.time_start,
                        timeClose: this.selectedQuart.time_close,
                        dateStart: this.rangeDates[0].getFullYear()+'-'+
                            ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                            (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate()),
                        dateEnd: this.rangeDates[1].getFullYear()+'-'+
                            ((this.rangeDates[1].getMonth()+1) <= 9 ? '0'+(this.rangeDates[1].getMonth()+1) : (this.rangeDates[1].getMonth()+1)) +'-'+
                            (this.rangeDates[1].getDate() <= 9 ? '0'+this.rangeDates[1].getDate() : this.rangeDates[1].getDate())
                    }
                } else {
                    usefullData = {
                        stationProductId : this.selectedStationProduct.id,
                        timeStart: null,
                        timeClose: null,
                        dateStart: this.rangeDates[0].getFullYear()+'-'+
                            ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                            (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate()),
                        dateEnd: this.rangeDates[1].getFullYear()+'-'+
                            ((this.rangeDates[1].getMonth()+1) <= 9 ? '0'+(this.rangeDates[1].getMonth()+1) : (this.rangeDates[1].getMonth()+1)) +'-'+
                            (this.rangeDates[1].getDate() <= 9 ? '0'+this.rangeDates[1].getDate() : this.rangeDates[1].getDate())
                    }
                }

                this.recordService.getOutPutsOnPeriodByStationProductId(usefullData).subscribe((res)=>{
                    this.dataOutputs = res;
                    if(this.dataOutputs?.periodRecord?.length <= 0){
                        this.messageService.add({ 
                                severity: 'error', 
                                summary: "Informations", 
                                detail: "Aucune sortie dans la période" 
                            });
                    }else{
                        this.messageService.add({ severity: 'info', summary: "Informations", detail: "Sorties chargées" }); 
                    }
                    //console.log("usefull data js: ", usefullData);
                    console.log("usefull data dumping product: ", res);
                });
            }else{
                this.dataOutputs = {};
            }
        }else{
            this.dataOutputs = {};
        }

    }

    generateTankProductOutputPdf(){
        let usefullData = {
            user_details: this.user_details,
            stationProduct: this.selectedStationProduct,
            dataOuptuts: this.dataOutputs
        };
        this.pdfService.generateTankProductOutputsPdf(usefullData);
    }

    //depotage

    onDateSelectDep(event:any){
        this.getInputsOnPeriod();
        console.log("show event dep: ", this.rangeDatesDep);
        //this.getPeriodRecords();
    }

    onDropDownChangeStationProductDep(event:any){
        this.getInputsOnPeriod();
        console.log("show event dep: ", this.selectedStationProductDep);
        //this.getPeriodRecords();
    }

    getInputsOnPeriod(){
        let usefullData:any = {};
        if(this.selectedStationProductDep){
            if(this.rangeDatesDep?.length == 2 && this.rangeDatesDep[1] == null){
                usefullData = {
                  stationProductId : this.selectedStationProductDep.id,
                    dateStart: this.rangeDatesDep[0].getFullYear()+'-'+
                        ((this.rangeDatesDep[0].getMonth()+1) <= 9 ? '0'+(this.rangeDatesDep[0].getMonth()+1) : (this.rangeDatesDep[0].getMonth()+1)) +'-'+
                        (this.rangeDatesDep[0].getDate() <= 9 ? '0'+this.rangeDatesDep[0].getDate() : this.rangeDatesDep[0].getDate()),
                    dateEnd: this.rangeDatesDep[0].getFullYear()+'-'+
                        ((this.rangeDatesDep[0].getMonth()+1) <= 9 ? '0'+(this.rangeDatesDep[0].getMonth()+1) : (this.rangeDatesDep[0].getMonth()+1)) +'-'+
                        (this.rangeDatesDep[0].getDate() <= 9 ? '0'+this.rangeDatesDep[0].getDate() : this.rangeDatesDep[0].getDate())
                }

            }else if(this.rangeDatesDep?.length == 2 && this.rangeDatesDep[1] != null){
                usefullData = {
                  stationProductId : this.selectedStationProductDep.id,
                    dateStart: this.rangeDatesDep[0].getFullYear()+'-'+
                        ((this.rangeDatesDep[0].getMonth()+1) <= 9 ? '0'+(this.rangeDatesDep[0].getMonth()+1) : (this.rangeDatesDep[0].getMonth()+1)) +'-'+
                        (this.rangeDatesDep[0].getDate() <= 9 ? '0'+this.rangeDatesDep[0].getDate() : this.rangeDatesDep[0].getDate()),
                    dateEnd: this.rangeDatesDep[1].getFullYear()+'-'+
                        ((this.rangeDatesDep[1].getMonth()+1) <= 9 ? '0'+(this.rangeDatesDep[1].getMonth()+1) : (this.rangeDatesDep[1].getMonth()+1)) +'-'+
                        (this.rangeDatesDep[1].getDate() <= 9 ? '0'+this.rangeDatesDep[1].getDate() : this.rangeDatesDep[1].getDate())
                }
            }else{
                this.dataInputs={};
            }
        }else{
            this.dataInputs={};
        }

        if(usefullData?.stationProductId){
          this.depotageService.getInputsOnPeriodByStationProductId(usefullData).subscribe((res)=>{
            if(res.status == true){
                this.dataInputs = res.data;
                if(this.dataInputs?.periodInputs?.length > 0){
                    this.messageService.add({ severity: 'info', summary: "Informations", detail: "Depotages chargés" }); 
                }else{
                    this.messageService.add({ 
                        severity: 'error', 
                        summary: "Informations", 
                        detail: "Aucun dépotage dans la période" 
                    });
                }
              console.log("usefull Data depotage: ", this.dataInputs);
            }else{
                this.messageService.add({ 
                    severity: 'error', 
                    summary: "Informations", 
                    detail: "Aucun dépotage dans la période" 
                });
            }
          });
        }
    }

    generateTankProductInputPdf(){
        let usefullData = {
            user_details: this.user_details,
            stationProduct: this.selectedStationProductDep,
            dataInputs: this.dataInputs
        };
        this.pdfService.generateTankProductInputsPdf(usefullData);
    }

    // rapports
    onDateSelectRap(event:any){
        this.getReportOnPeriod();
        console.log("show event rap: ", this.rangeDatesRap);
        //this.getPeriodRecords();
    }

    onDropDownChangeStationProductRap(event:any){
        this.getReportOnPeriod();
        console.log("show event rap dumping product: ", this.selectedStationProductRap);
        //this.getPeriodRecords();
    }

    getReportOnPeriod(){
        let usefullData:any = {};
        if(this.selectedStationProductRap){
            if(this.rangeDatesRap?.length == 2 && this.rangeDatesRap[1] == null){
                usefullData = {
                    stationProductId : this.selectedStationProductRap.id,
                    dateStart: this.rangeDatesRap[0].getFullYear()+'-'+
                        ((this.rangeDatesRap[0].getMonth()+1) <= 9 ? '0'+(this.rangeDatesRap[0].getMonth()+1) : (this.rangeDatesRap[0].getMonth()+1)) +'-'+
                        (this.rangeDatesRap[0].getDate() <= 9 ? '0'+this.rangeDatesRap[0].getDate() : this.rangeDatesRap[0].getDate()),
                    dateEnd: this.rangeDatesRap[0].getFullYear()+'-'+
                        ((this.rangeDatesRap[0].getMonth()+1) <= 9 ? '0'+(this.rangeDatesRap[0].getMonth()+1) : (this.rangeDatesRap[0].getMonth()+1)) +'-'+
                        (this.rangeDatesRap[0].getDate() <= 9 ? '0'+this.rangeDatesRap[0].getDate() : this.rangeDatesRap[0].getDate())
                }

            }else if(this.rangeDatesRap?.length == 2 && this.rangeDatesRap[1] != null){
                usefullData = {
                    stationProductId : this.selectedStationProductRap.id,
                    dateStart: this.rangeDatesRap[0].getFullYear()+'-'+
                        ((this.rangeDatesRap[0].getMonth()+1) <= 9 ? '0'+(this.rangeDatesRap[0].getMonth()+1) : (this.rangeDatesRap[0].getMonth()+1)) +'-'+
                        (this.rangeDatesRap[0].getDate() <= 9 ? '0'+this.rangeDatesRap[0].getDate() : this.rangeDatesRap[0].getDate()),
                    dateEnd: this.rangeDatesRap[1].getFullYear()+'-'+
                        ((this.rangeDatesRap[1].getMonth()+1) <= 9 ? '0'+(this.rangeDatesRap[1].getMonth()+1) : (this.rangeDatesRap[1].getMonth()+1)) +'-'+
                        (this.rangeDatesRap[1].getDate() <= 9 ? '0'+this.rangeDatesRap[1].getDate() : this.rangeDatesRap[1].getDate())
                }
            }else{
                this.dataReport={};
            }
        }else{
            this.dataReport={};
        }

        if(usefullData?.stationProductId){
          this.recordService.getReportOnPeriodStationProductId(usefullData).subscribe((res)=>{
              if(res.listDayRecord.length > 0){
                    this.dataReport = res;
                    this.messageService.add({ severity: 'info', summary: "Informations", detail: "Rapports chargés" }); 
                }else{
                    this.dataReport={};
                    this.messageService.add({ 
                        severity: 'error', 
                        summary: "Informations", 
                        detail: "Aucun rapport dans la période" 
                    });
                }
              console.log("usefull Data report: ", this.dataReport);
          });
        }
    }

    generateTankProductReportPdf(){
        let usefullData = {
            user_details: this.user_details,
            stationProduct: this.selectedStationProductRap,
            dataReports: this.dataReport
        };
        this.pdfService.generateTankProductReportsPdf(usefullData);
    }
}
