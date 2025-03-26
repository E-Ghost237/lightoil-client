import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InteractionService {

    private dataToShareSource = new Subject<any>();


    constructor() { }
    dataToShare$ = this.dataToShareSource.asObservable();

    addNewDataToShare(data:any){
      this.dataToShareSource.next(data);
    }
}
