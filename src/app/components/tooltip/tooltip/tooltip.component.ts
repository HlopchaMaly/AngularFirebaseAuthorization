import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnInit {

  // "принимаем" положение элемента, при наведении на который должен
  // появлятся тултип.
  @Input()
  topValueChild: number;
  @Input()
  leftValueChild: number;

  // Используем шаблонную переменную для получения начального положения тултипа.
  @ViewChild('tooltip')
  tooltip: ElementRef;

  // Переменные для хранения конечного положения тултипа.
  topValue: string;
  leftValue: string;

  constructor() { }

  ngOnInit() {
    // Рассчитываем необходимое положение тултипа. Числа 10 и 7 выбраны путем визуального
    // анализа положения вызванного тултипа).
    const temp = this.tooltip.nativeElement as HTMLElement;
    this.leftValue = (this.leftValueChild - temp.getBoundingClientRect().width - 10).toString();
    this.topValue = (this.topValueChild - 7).toString();
  }

}
