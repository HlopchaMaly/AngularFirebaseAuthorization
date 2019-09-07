import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnInit {

  @Input()
  topValueChild: number;
  @Input()
  leftValueChild: number;

  @ViewChild('tooltip')
  tooltip: ElementRef;

  topValue: string;
  leftValue: string;

  constructor() { }

  ngOnInit() {
    const temp = this.tooltip.nativeElement as HTMLElement;
    this.leftValue = (this.leftValueChild - temp.getBoundingClientRect().width - 10).toString();
    this.topValue = (this.topValueChild - 7).toString();
  }

}
