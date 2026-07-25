import { RecordService } from 'src/app/demo/components/dashboard/services/record.service';
import { Component,OnInit } from '@angular/core';
import { variables } from '../variables';


import { AuthService } from '../../../auth/services/auth.service';
import { QuartService } from '../../services/quart.service';
import { StationService } from '../../services/station.service';
import { DepotageService } from '../../services/depotage.service';
import { PdfService } from 'src/app/demo/services/pdf.service';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-hbt-dumpings',
  templateUrl: './hbt-dumpings.component.html',
  styleUrls: ['./hbt-dumpings.component.scss'],
  providers: [MessageService]
})
export class HbtDumpingsComponent implements OnInit {

    date: Date;
    maxDate: Date | undefined;
    rangeDates: Date[] | undefined;
    selectedTank:any;
    rangeDatesDep: Date[] | undefined;
    selectedTankDep:any;
    rangeDatesRap: Date[] | undefined;
    selectedTankRap:any;
    listTanks:any[]=[];
    listQuarter: variables[];
    selectedQuart:any;
    dataOutputs!:any;
    dataInputs!:any;
    dataReport!:any;
    user_details!:any;
    stationTimezone = 'Africa/Douala';


    constructor(
        private authService: AuthService,
        private quartService: QuartService,
        private stationService: StationService,
        private recordService: RecordService,
        private depotageService: DepotageService,
        private messageService: MessageService,
        private pdfService: PdfService
        ){}


    activeIndex: number = 0;

    ngOnInit() {
        this.maxDate = new Date();
        this.user_details = this.authService.getUserData();
        this.stationTimezone = this.resolveStationTimezone();

        this.getListQuartWorking();
        this.getListTanks();
    }

    private resolveStationTimezone(): string {
        const fallback = 'Africa/Douala';
        const stationList = Array.isArray(this.user_details?.service_stations) ? this.user_details.service_stations : [];
        const currentStation = stationList.find((station: any) => Number(station?.id) === Number(this.user_details?.service_station_id)) ?? null;

        const candidates = [
            this.user_details?.timezone,
            this.user_details?.time_zone,
            currentStation?.timezone,
            currentStation?.time_zone
        ];

        for (const candidate of candidates) {
            if (typeof candidate !== 'string') {
                continue;
            }

            const timezone = candidate.trim();
            if (!timezone) {
                continue;
            }

            try {
                Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
                return timezone;
            } catch {
                // Ignore invalid timezone values and continue searching.
            }
        }

        return fallback;
    }

    hasOutputRows(): boolean {
        if (Array.isArray(this.dataOutputs?.listDayRecord)) {
            return this.dataOutputs.listDayRecord.length > 0;
        }

        if (Array.isArray(this.dataOutputs?.periodRecord)) {
            return this.dataOutputs.periodRecord.length > 0;
        }

        return false;
    }

    getListTanks(){
        this.stationService.getServiceStationListTanks(this.user_details?.service_station_id).subscribe((res)=>{
            this.listTanks = res;
            if(res.length > 0){
                this.selectedTank = this.listTanks[0];
                this.selectedTankDep = this.listTanks[0];
                this.selectedTankRap = this.listTanks[0];
            }
            //;
        });
        //;
    }

    getListQuartWorking(){
        this.quartService.getListQuarts(this.user_details?.service_station_id).subscribe((res)=>{
            this.listQuarter = res;
            //;
        });
    }

    onDropDownChangeQuart(event:any){
        this.getOutputsOnPeriod();

        //this.getPeriodRecords();
    }

    onDropDownChangeTank(event:any){
        this.getOutputsOnPeriod();

        //this.getPeriodRecords();
    }

    onDateSelect(event:any){
        this.getOutputsOnPeriod();

        //this.getPeriodRecords();
    }

    getOutputsOnPeriod(){
        let usefullData:any = {};
        if(this.selectedTank){
            if(this.rangeDates?.length == 2 && this.rangeDates[1] == null){
                if (this.selectedQuart) {
                    usefullData = {
                        tankId : this.selectedTank.id,
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
                        tankId : this.selectedTank.id,
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

                this.recordService.getOutPutsOnPeriod(usefullData).subscribe((res)=>{
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

                });
            }else if(this.rangeDates?.length == 2 && this.rangeDates[1] != null){
                if (this.selectedQuart) {
                    usefullData = {
                        tankId : this.selectedTank.id,
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
                        tankId : this.selectedTank.id,
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

                this.recordService.getOutPutsOnPeriod(usefullData).subscribe((res)=>{
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

                });
            }else{
                this.dataOutputs = {};
            }
        }else{
            this.dataOutputs = {};
        }

    }

    generateTankOutputPdf(){
        let usefullData = {
            user_details: this.user_details,
            tank: this.selectedTank,
            dataOuptuts: this.dataOutputs,
            timezone: this.stationTimezone
        };
        this.pdfService.generateTankOutputsPdf(usefullData);
    }

    //depotage

    onDateSelectDep(event:any){
        this.getInputsOnPeriod();

    }

    onDropDownChangeTankDep(event:any){
        this.getInputsOnPeriod();

    }

    getInputsOnPeriod(){
        let usefullData:any = {};
        if(this.selectedTankDep){
            if(this.rangeDatesDep?.length == 2 && this.rangeDatesDep[1] == null){
                usefullData = {
                    tankId : this.selectedTankDep.id,
                    dateStart: this.rangeDatesDep[0].getFullYear()+'-'+
                        ((this.rangeDatesDep[0].getMonth()+1) <= 9 ? '0'+(this.rangeDatesDep[0].getMonth()+1) : (this.rangeDatesDep[0].getMonth()+1)) +'-'+
                        (this.rangeDatesDep[0].getDate() <= 9 ? '0'+this.rangeDatesDep[0].getDate() : this.rangeDatesDep[0].getDate()),
                    dateEnd: this.rangeDatesDep[0].getFullYear()+'-'+
                        ((this.rangeDatesDep[0].getMonth()+1) <= 9 ? '0'+(this.rangeDatesDep[0].getMonth()+1) : (this.rangeDatesDep[0].getMonth()+1)) +'-'+
                        (this.rangeDatesDep[0].getDate() <= 9 ? '0'+this.rangeDatesDep[0].getDate() : this.rangeDatesDep[0].getDate())
                }

            }else if(this.rangeDatesDep?.length == 2 && this.rangeDatesDep[1] != null){
                usefullData = {
                    tankId : this.selectedTankDep.id,
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

        if(usefullData?.tankId){
            this.depotageService.getInputsOnPeriod(usefullData).subscribe((res)=>{
                this.dataInputs = res;
                if(this.dataInputs?.periodInputs?.length <= 0){
                    this.messageService.add({
                            severity: 'error',
                            summary: "Informations",
                            detail: "Aucun dépotage dans la période"
                        });
                }else{
                    this.messageService.add({ severity: 'info', summary: "Informations", detail: "Depotages chargés" });
                }


            });
        }
    }

    generateTankInputPdf(){
        let usefullData = {
            user_details: this.user_details,
            tank: this.selectedTankDep,
            dataInputs: this.dataInputs
        };
        this.pdfService.generateTankInputsPdf(usefullData);
    }

    // rapports
    onDateSelectRap(event:any){
        this.getReportOnPeriod();

        //this.getPeriodRecords();
    }

    onDropDownChangeTankRap(event:any){
        this.getReportOnPeriod();

        //this.getPeriodRecords();
    }

    getReportOnPeriod(){
        let usefullData:any = {};
        if(this.selectedTankRap){
            if(this.rangeDatesRap?.length == 2 && this.rangeDatesRap[1] == null){
                usefullData = {
                    tankId : this.selectedTankRap.id,
                    dateStart: this.rangeDatesRap[0].getFullYear()+'-'+
                        ((this.rangeDatesRap[0].getMonth()+1) <= 9 ? '0'+(this.rangeDatesRap[0].getMonth()+1) : (this.rangeDatesRap[0].getMonth()+1)) +'-'+
                        (this.rangeDatesRap[0].getDate() <= 9 ? '0'+this.rangeDatesRap[0].getDate() : this.rangeDatesRap[0].getDate()),
                    dateEnd: this.rangeDatesRap[0].getFullYear()+'-'+
                        ((this.rangeDatesRap[0].getMonth()+1) <= 9 ? '0'+(this.rangeDatesRap[0].getMonth()+1) : (this.rangeDatesRap[0].getMonth()+1)) +'-'+
                        (this.rangeDatesRap[0].getDate() <= 9 ? '0'+this.rangeDatesRap[0].getDate() : this.rangeDatesRap[0].getDate())
                }

            }else if(this.rangeDatesRap?.length == 2 && this.rangeDatesRap[1] != null){
                usefullData = {
                    tankId : this.selectedTankRap.id,
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

        if(usefullData?.tankId){
            this.recordService.getReportOnPeriod(usefullData).subscribe((res)=>{
                this.dataReport = res;
                if(this.dataReport?.listDayRecord?.length <= 0){
                    this.messageService.add({
                            severity: 'error',
                            summary: "Informations",
                            detail: "Aucun rapport dans la période"
                        });
                }else{
                    this.messageService.add({ severity: 'info', summary: "Informations", detail: "Rapports chargés" });
                }

            });
        }
    }

    generateTankReportPdf(){
        let usefullData = {
            user_details: this.user_details,
            tank: this.selectedTankRap,
            dataReports: this.dataReport
        };
        this.pdfService.generateTankReportsPdf(usefullData);
    }




}
