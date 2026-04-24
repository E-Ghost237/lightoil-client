import { Component, Input } from '@angular/core';
import * as Utility from '../../../../../utilities/utility';

@Component({
  selector: 'app-table-tank',
  templateUrl: './table-tank.component.html',
  styleUrls: ['./table-tank.component.scss']
})
export class TableTankComponent {

    @Input()
    listRecord:any[]=[];

    @Input()
    tank:any={};

    @Input()
    period:string="";

    tankDetailsData:any;

    constructor(){

    }

    ngOnInit(){
        ("");
    }

    getLevel(){
        if(this.tankDetailsData?.listLastRecord?.length > 0){
            return ''+Math.round(this.tankDetailsData.listLastRecord[0].liquid_height*100)/100;
        }
        return '0';
    }

    getListDayRecord(){
        if(this.tankDetailsData?.listLastRecord?.length > 0){
            //;
            return this.tankDetailsData.listLastRecord;
        }
        return [];
    }


  getVolumeAtT(){
      if(this.tankDetailsData?.listLastRecord?.length > 0){
            const record = this.tankDetailsData.listLastRecord[0];
            const fuelVolume = this.parseMetric(record?.fuel_volume ?? record?.volume);
            if (fuelVolume === null) {
                return '---';
            }
            return this.formatFuelVolume(fuelVolume) + ' / ' + record.total_volume;
        }
        return '0';
    }

    getPercentOccupation(){
        if(this.tankDetailsData?.listLastRecord?.length > 0){
            let percent = Math.round(this.tankDetailsData.listLastRecord[0].volume*10000/this.tankDetailsData.listLastRecord[0].total_volume)/100;
            return ''+ percent;
        }
        return '0';
    }

    getSeverityPercent(){
        let s= parseFloat(this.getPercentOccupation());
        if(s < 20){
            return 'danger';
        }else{
            return 'info';
        }
    }

    getVolumeToDepote(){
        if(this.tankDetailsData?.listLastRecord?.length > 0){
            let v = Math.round((this.tankDetailsData.listLastRecord[0].total_volume - this.tankDetailsData.listLastRecord[0].volume)*1000)/1000;
            return ''+ v + ' litres';
        }
        return '0 litre';
    }

    getVolumeAtT15(){
        if(this.tankDetailsData?.listLastRecord?.length > 0){
            return ''+Math.round(this.getFuelVolumeAtFift(this.tankDetailsData.listLastRecord[0])*100)/100;
        }
        return '0';
    }

    getLiquidTemp(){
        if(this.tankDetailsData?.listLastRecord?.length > 0){
            return ''+this.tankDetailsData.listLastRecord[0].liquid_temperature;
        }
        return '0';
    }

    getEnvTemp(){
        if(this.tankDetailsData?.listLastRecord?.length > 0){
            return ''+this.tankDetailsData.listLastRecord[0].env_temperature;
        }
        return '0';
    }

    getDensity(){
        if(this.tankDetailsData?.listLastRecord?.length > 0){
            return ''+Math.round( this.tankDetailsData.listLastRecord[0].density*100)/100;
        }
        return '0';
    }

    getRmDay(){
        if(this.tankDetailsData?.lastNotification){
            return ''+ Math.round( this.tankDetailsData?.lastNotification?.remaining_day*100)/100;
        }
        return '--';
    }

    getSeverityRmDay(){
        let rmd=Math.round( this.tankDetailsData?.lastNotification?.remaining_day*100)/100;
        if(rmd <= 5){
            return 'danger';
        }else{
            return 'info';
        }
    }

    getLastIncomeDateRecord(){
        if(this.tankDetailsData?.listLastRecord?.length > 0){
            return ''+Utility.toLocalDateTime(this.tankDetailsData.listLastRecord[0].updated_at);
        }
        return '0';
    }

    getToLocalDateTime(date1:string){
        return Utility.toLocalDateTime(date1);
    }

    getNameProduct(){
        let nameProduct = "";
        if(this.tankDetailsData?.product?.code){
            let n = this.tankDetailsData?.product?.code;
            switch (n) {
                case "ESSENCE":
                    nameProduct = "super";
                    break;
                case "GASOIL":
                    nameProduct = "gasoil";
                    break;
                case "PETROLE":
                    nameProduct = "petrol";
                    break;

                default:
                    nameProduct = "petrol";
                    break;
            }
        }
        return nameProduct;
    }

    getSensorReference(){
        let ref = "";
        if(this.tankDetailsData?.tank?.sensor_reference){
            ref = this.tankDetailsData?.tank?.sensor_reference;
        }
        return ref;

    }

    getRoundValue(num:number){
        return Math.round(num*100)/100;
    }

    private formatFuelVolume(value: number): string {
        return value.toFixed(2);
    }

    private parseMetric(value: any): number | null {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        const parsed = Number(value);
        return Number.isNaN(parsed) ? null : parsed;
    }

    getFuelVolumeValue(record: any) {
        const fuelVolume = this.parseMetric(record?.fuel_volume ?? record?.volume);

        if (fuelVolume === null) {
            return '---';
        }

        return this.formatFuelVolume(fuelVolume);
    }

    getFuelVolumeAtFiftValue(record: any) {
        return this.getRoundValue(this.getFuelVolumeAtFift(record));
    }

    private getFuelVolumeAtFift(record: any): number {
        const normalizedVolumeAtFift = this.parseMetric(record?.fuel_volume_at_fift);
        if (normalizedVolumeAtFift !== null) {
            return normalizedVolumeAtFift;
        }

        const legacyVolumeAtFift = this.parseMetric(record?.volume_at_fift);
        return legacyVolumeAtFift ?? 0;
    }

    getWaterLevelValue(record: any) {
        const waterHeight = this.parseMetric(record?.water_height);

        if (waterHeight === null) {
            return '---';
        }

        return '' + this.getRoundValue(waterHeight);
    }

    getWaterVolumeValue(record: any) {
        const waterVolume = this.parseMetric(record?.water_volume);

        if (waterVolume === null) {
            return '---';
        }

        return '' + this.getRoundValue(waterVolume);
    }

}
