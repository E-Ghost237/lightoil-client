import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { ThemeService } from '../../services/theme.service';
import { FileUpload, FileUploadHandlerEvent } from 'primeng/fileupload';
import { AuthService } from '../../../auth/services/auth.service';

interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss'],
  providers: [MessageService]
})
export class ThemeComponent {

  @ViewChild('uploader') uploader: FileUpload;

  uploadedFiles: any[] = [];
  user_details:any = null;
  uploadImageBase64: any = null;
  urlSetImage: string = environment.apiUrl+"/theme/set-background-image/post";

  constructor(
    private messageService: MessageService,
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.user_details = this.authService.getUserData();
  }



  onSelectedFile(event:any) {

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const image = new Image();
      image.src = e.target.result;
      image.onload = rs => {
        this.uploadImageBase64 = e.target.result;
        //;
      };
    };
    reader.readAsDataURL( event.files[0]);

    this.messageService.add(
      {
        severity: 'info',
        summary: 'Fichier charge',
        detail: 'le fichier est uploade avec succes. Rechargez svp'
      }
    );
  }

  onCustomUpload(event:FileUploadHandlerEvent) {
    let file:any =this.uploadImageBase64;
    let file1:any =event.files[0];
    if(file != null){

      this.themeService.setBackgroundImage(
        {
          background:this.uploadImageBase64,
          stationId: this?.user_details?.service_station_id
        }
      ).subscribe((response)=>{

      });
      this.messageService.add(
        {
          severity: 'info',
          summary: 'Fichier charge',
          detail: 'le fichier est uploade avec succes. Rechargez svp'
        }
      );
    }else{
      this.messageService.add(
        {
          severity: 'warn',
          summary: 'Fichier',
          detail: 'Choississez un fichier svp et reessayez svp'
        }
      );
    }

  }



  backToDshboard(){
    this.router.navigate(['/pages/dashboard']);
  }

}
