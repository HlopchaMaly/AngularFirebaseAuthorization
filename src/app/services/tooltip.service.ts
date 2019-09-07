import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TooltipService {

  constructor() { }

  private subject = new Subject<any>();

  generateTooltipEvent(isTooltipVisible: boolean, event?: MouseEvent){
    if(event){
      const element = event.target as HTMLElement;
      this.subject.next({visibility: isTooltipVisible, elementParams: element.getBoundingClientRect()});

    }else{
      this.subject.next({visibility: isTooltipVisible});
    }
  }

  receiveTooltipEvent() : Observable<any> {
    return this.subject.asObservable();
  }


}
