import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../../auth/services/auth.service';
import { StationService } from '../../services/station.service';
import { RecordService } from '../../../dashboard/services/record.service';
import * as Utility from '../../../../utilities/utility';
import { MessageService } from 'primeng/api';
import { PdfService } from 'src/app/demo/services/pdf.service';


@Component({
  selector: 'app-hbt-tank',
  templateUrl: './hbt-tank.component.html',
  styleUrls: ['./hbt-tank.component.scss'],
  providers: [MessageService]
})
export class HbtTankComponent {
    date: Date;
    maxDate: Date | undefined;
    rangeDates: Date[] | undefined;

    Tableau: boolean = false;
    user_details!:any;
    period:string = "";
    notificationTimezone = 'Africa/Douala';

    selectedTank:any;
    listTanks:any[]=[];
    listRecords:any[]=[];

 constructor(
    private router: Router,
    private authService: AuthService,
    private stationService: StationService,
    private messageService: MessageService,
    private recordService: RecordService,
    private pdfService: PdfService
    ){}



  ngOnInit(){
    this.maxDate = new Date();
    this.user_details = this.authService.getUserData();
    this.notificationTimezone = this.resolveStationTimezone();
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
    ].filter((value: any) => typeof value === 'string' && value.trim().length > 0);

    for (const candidate of candidates) {
      const timezone = String(candidate).trim();
      try {
        Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
        return timezone;
      } catch {
        // Ignore invalid timezone identifiers and continue.
      }
    }

    return fallback;
  }

  private getLocalDateKey(date: Date, timezone: string = this.notificationTimezone): string {
    try {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(date);

      const year = parts.find((part) => part.type === 'year')?.value;
      const month = parts.find((part) => part.type === 'month')?.value;
      const day = parts.find((part) => part.type === 'day')?.value;
      if (year && month && day) {
        return `${year}-${month}-${day}`;
      }
    } catch {
      // Fall back to local timezone if Intl formatting fails.
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getRecordMoment(record: any): number {
    const createdAt = record?.created_at ? new Date(record.created_at).getTime() : 0;
    const updatedAt = record?.updated_at ? new Date(record.updated_at).getTime() : 0;
    return Math.max(createdAt, updatedAt);
  }

  private getRecordDateKey(record: any, timezone: string = this.notificationTimezone): string | null {
    const candidate = record?.updated_at ?? record?.created_at ?? null;
    if (!candidate) {
      return null;
    }

    const timestamp = new Date(candidate);
    if (Number.isNaN(timestamp.getTime())) {
      return null;
    }

    return this.getLocalDateKey(timestamp, timezone);
  }

  private getStrictDayRecords(records: any[], dayKey: string): any[] {
    const source = Array.isArray(records) ? records : [];
    return source
      .filter((record: any) => this.getRecordDateKey(record) === dayKey)
      .sort((a: any, b: any) => this.getRecordMoment(b) - this.getRecordMoment(a));
  }

  private getStrictPeriodRecords(records: any[], startDayKey: string, endDayKey: string): any[] {
    const source = Array.isArray(records) ? records : [];
    return source
      .filter((record: any) => {
        const recordDayKey = this.getRecordDateKey(record);
        return !!recordDayKey && recordDayKey >= startDayKey && recordDayKey <= endDayKey;
      })
      .sort((a: any, b: any) => this.getRecordMoment(b) - this.getRecordMoment(a));
  }


  getListTanks(){
    this.stationService.getServiceStationListTanks(this.user_details?.service_station_id).subscribe((res)=>{
        this.listTanks = res;
        if(res.length > 0){
            this.selectedTank = this.listTanks[0]
        }

    });

  }

  getPeriodRecords(){
    let usefullData:any = {};
    if(this.selectedTank){
        if(this.rangeDates?.length == 2 && this.rangeDates[1] == null){
            usefullData = {
                tankId: this.selectedTank.id,
                dateStart: this.rangeDates[0].getFullYear()+'-'+
                            ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                            (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate())
            };
            this.period = "Date : "+Utility.toLocalDate(this.rangeDates[0].toDateString());


            this.recordService.getListRecordsForOneDay(usefullData).subscribe((res)=>{
                this.listRecords = this.getStrictDayRecords(
                  Array.isArray(res) ? res : [],
                  usefullData.dateStart
                );
                if(this.listRecords?.length > 0){
                  this.messageService.add({ severity: 'info', summary: "Informations", detail: "Données chargées" });
                }else{
                  this.messageService.add({
                    severity: 'error',
                    summary: "Informations",
                    detail: "Aucune données disponible dans la période"
                  });
                }

            });
        }else if(this.rangeDates?.length == 2 && this.rangeDates[1] != null){
            usefullData = {
                tankId: this.selectedTank.id,
                dateStart: this.rangeDates[0].getFullYear()+'-'+
                            ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                            (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate()),
                dateEnd: this.rangeDates[1].getFullYear()+'-'+
                            ((this.rangeDates[1].getMonth()+1) <= 9 ? '0'+(this.rangeDates[1].getMonth()+1) : (this.rangeDates[1].getMonth()+1)) +'-'+
                            (this.rangeDates[1].getDate() <= 9 ? '0'+this.rangeDates[1].getDate() : this.rangeDates[1].getDate())
            };
            this.period = "Periode du "+Utility.toLocalDate(this.rangeDates[0].toDateString())+" au "+Utility.toLocalDate(this.rangeDates[1].toDateString());


            this.recordService.getListRecordsForPeriod(usefullData).subscribe((res)=>{
                this.listRecords = this.getStrictPeriodRecords(
                  Array.isArray(res) ? res : [],
                  usefullData.dateStart,
                  usefullData.dateEnd
                );
                if(this.listRecords?.length > 0){
                  this.messageService.add({ severity: 'info', summary: "Informations", detail: "Données chargées" });
                }else{
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

  generateTankDataPdf(){
    let usefullData = {
      user_details: this.user_details,
      tank: this.selectedTank,
      period: this.period,
      listRecords: this.listRecords
    };
    this.pdfService.generateTankDataPdf(usefullData);
  }


}
