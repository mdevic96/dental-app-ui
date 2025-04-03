import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DentistRoutingModule } from './dentist-routing.module';
import { FullCalendarModule } from '@fullcalendar/angular';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DentistRoutingModule,
    FullCalendarModule
  ]
})
export class DentistModule { }
