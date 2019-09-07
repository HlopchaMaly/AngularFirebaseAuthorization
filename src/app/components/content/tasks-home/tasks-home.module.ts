import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TasksHomeComponent } from './tasks-home.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: TasksHomeComponent
      }
    ])
  ],
  declarations: [
    TasksHomeComponent
  ]
})
export class TasksHomeModule { }
