import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { Store } from '@ngrx/store';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { TooltipService } from 'src/app/services/tooltip.service';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit, OnDestroy {

  photo: string;
  userCurrent: User;
  subscriber: Subscription;

  isBtnDisabled: boolean;


  constructor(private tooltipService: TooltipService, private store: Store<User>, private userService: UserService, private authService: AuthService, private router: Router) {
    
  }

  ngOnInit() {
    this.subscriber = this.store.select('userPage').subscribe(({ user }) => {
      this.photo = user.photo;
      this.userCurrent = user ;
      if(this.photo === this.authService.defaultPathToPhoto){
        this.isBtnDisabled = true;
      }else{
        this.isBtnDisabled = false;
      }
    });
  }

  public get user(): Observable<User> {
    return this.store.select('userPage');
  }

  onDelete() {
    // Если установлено дефолтное фото отсутствует необходимость лезть в базу
    if(this.photo === this.authService.defaultPathToPhoto){
      console.log("Foto is not dowload");
    }else{
      this.userService.deletePhoto(this.userCurrent);
      this.photo = this.authService.defaultPathToPhoto;
      this.userCurrent.pathToOldPhotoInStorage = '';
      this.userCurrent.photo = this.photo;
      this.userService.updateUser(this.userCurrent);
    }
    
  }
  // Метод для перехода на компонент с формой изменения данных пользователя.
  goToChangeUserComponent(inputName: String){
    this.toggleTooltip(false);
    // Параметр строки запроса применяется для "фокуса" на соответствующем инпуте после перехода.
    // Т.е. если пользователь тыкнул по шестеренке-fa напротив имени пользователя - 
    // фокус поймает инпут, изменяющий имя. С почтой всё аналогично.
    this.router.navigate(['/ui-home/change-user-data'],{queryParams: {inputName : inputName}});
  }

  toggleTooltip(showTooltip: boolean, event?: MouseEvent){
    this.tooltipService.generateTooltipEvent(showTooltip, event);
  }

  ngOnDestroy(): void {
    this.subscriber.unsubscribe();
  }
}
