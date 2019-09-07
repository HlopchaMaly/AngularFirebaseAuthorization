import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChangeUserDataComponent } from './change-user-data.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ChangeUserDataComponent
      }
    ]),
    AngularFontAwesomeModule,
    ReactiveFormsModule
  ],
  declarations: [
    ChangeUserDataComponent
  ]
})
export class ChangeUserDataModule { }
