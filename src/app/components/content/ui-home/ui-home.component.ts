import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ComponentCanDeactivate } from 'src/app/services/guard.service';
import { AuthService } from 'src/app/services/auth.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonService } from 'src/app/services/common.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-ui-home',
  templateUrl: './ui-home.component.html',
  styleUrls: ['./ui-home.component.scss'],
  animations: [
    trigger('navState', [
      state('showOnBigScreen', style({
        width: '18%'
      })),
      state('showOnSmallScreen', style({
        width: '100%'
      })),
      state('hide', style({
        width: '0'
      })),
      transition('showOnSmallScreen <=> hide', animate(300))
    ])
  ]
})
export class UiHomeComponent implements OnInit, OnDestroy, ComponentCanDeactivate {

  // Переменная состояния анимации.
  state: string;
  private subscription: Subscription;
  private currentWindowWidth: number;
  // Переменная для управленя сокрытием\отображением навбара.
  private readonly maxWindowWidth: number = 768;
  constructor(private authService: AuthService, private commonService: CommonService, private userService: UserService) {
    this.state = 'hide';
  }

  ngOnInit() {

    this.currentWindowWidth = window.innerWidth;

    this.currentWindowWidth <= this.maxWindowWidth ? this.state = 'hide' : this.state = 'showOnBigScreen';

    // Сворачивание-разворачивание навбара при клике по "бургеру" в хеддере.
    this.subscription = this.commonService.notifyObservable$.subscribe((res) => {
      if (res.hasOwnProperty('option') && res.option === 'onBurgerClick') {
        this.toggleNav();
      }
    });


  }

  toggleNav() {
    this.state === 'showOnSmallScreen' ? this.state = 'hide' : this.state = 'showOnSmallScreen';
  }

  closeNav() {
    if (this.currentWindowWidth <= this.maxWindowWidth) {
      this.state = 'hide';
    } else {
      return;
    }
  }

  // Метод работает совместно с GuardService при выходе из аккаунта/UI и 
  // переходе на главную страницу (home.component).
  private goAway(): boolean {
    // userService.redirectWithoutGuard будет иметь значение true при удалении пользователя,
    // изменении адреса почты т.е. те случаи когда необходимо покинуть UI в обязательном порядке.
    if (this.userService.redirectWithoutGuard) {
      this.authService.logout();
      return true;
    } else {
      // При нажатии кнопки LogOut в хедере, при нажатии кнопки "назад" браузера будет открываться
      // конфирм.
      const temp = confirm('Sign out?');
      if (temp) {
        this.authService.logout();
        return true;
      } else {
        return false;
      }
    }
  }

  // Реализация метода интерфейса ComponentCanDeactivate.
  canDeactivate(): boolean | Observable<boolean> {
    return this.goAway();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // Сворачивание навбара при изменении размера окна.
  onResize(event: { target: { innerWidth: number; }; }) {

    this.currentWindowWidth = event.target.innerWidth;

    if (event.target.innerWidth <= this.maxWindowWidth) {
      this.state = 'hide';
    } else if (event.target.innerWidth > this.maxWindowWidth) {
      this.state = 'showOnBigScreen';
    }
  }
}
