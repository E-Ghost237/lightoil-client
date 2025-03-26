import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminPagesComponent } from './admin-pages.component';
import { AdminPagesRoutingModule } from './admin-pages-routing.module';


@NgModule({
  declarations: [
    AdminPagesComponent
  ],
  imports: [
    CommonModule,
    AdminPagesRoutingModule
  ]
})
export class AdminPagesModule { }
