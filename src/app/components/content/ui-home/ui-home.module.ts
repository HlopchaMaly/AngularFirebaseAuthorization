import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiHomeComponent } from './ui-home.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { UserInfoComponent } from '../user-info/user-info.component';
import { GuardService } from 'src/app/services/guard.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: UiHomeComponent,
        canActivate: [GuardService],
        canDeactivate: [GuardService],
        children: [
          {
            path: '',
            redirectTo: 'user-info',
            pathMatch: 'full'
          },
          {
            path: 'user-info',
            component: UserInfoComponent
          },
          {
            path: 'change-user-data',
            loadChildren: '../change-user-data/change-user-data.module#ChangeUserDataModule'
          },
          {
            path: 'tasks-home',
            loadChildren: '../tasks-home/tasks-home.module#TasksHomeModule'
          }
        ]
      }
    ]),
    AngularFontAwesomeModule
  ],
  declarations: [
    UiHomeComponent,
    UserInfoComponent
  ]
})
export class UiHomeModule { }
