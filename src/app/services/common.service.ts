import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

// Сервис изпользуется для вызова метода toggleNav() компонента ui-home.component
// при клике по "гамбургеру" в компоненте header.component т.е. сворачивание-разворачивание навбара
// при разрешении экрана <768px.

export class CommonService {

  private notify = new Subject<any>();
  notifyObservable$ = this.notify.asObservable();

  constructor() {}
  public notifyOther(data: any) {
    if (data) {
      this.notify.next(data);
    }
  }
}
