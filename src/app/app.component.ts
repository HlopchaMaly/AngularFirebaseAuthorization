import { Component } from '@angular/core';
import { ModalService } from './services/modal.service';
import { TooltipService } from './services/tooltip.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';

  isTooltipVisible: boolean;
  topPosition: number;
  leftPosition: number;

  constructor(private modalService: ModalService, private tooltipService: TooltipService) {
    this.tooltipService.receiveTooltipEvent().subscribe(data => {
      if(data.elementParams){
        this.isTooltipVisible = data.visibility;
        this.topPosition = data.elementParams.top;
        this.leftPosition = data.elementParams.left;
      }else{
        this.isTooltipVisible = data.visibility;
      }
    })
  }

  closeModal() {
    this.modalService.destroy();
  }
}
