import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable({
  providedIn: 'root'
})

// Сервис предотвращает переход/уход с маршрута .../ui-home/...
// Т.е. неавторизованный пользователь не может перейти на маршрут .../ui-home/...,
// также нельзя уйти с данного маршрута без выхода из аккаунта firebase.

export class GuardService implements CanActivate, CanDeactivate<ComponentCanDeactivate> {

  constructor(private authService: AuthService) { }

  canActivate() {
    const variable = this.authService.currentAuthState;
    return variable;
  }
  canDeactivate(component: ComponentCanDeactivate): Observable<boolean> | boolean {
    return component.canDeactivate ? component.canDeactivate() : true;
  }
}
