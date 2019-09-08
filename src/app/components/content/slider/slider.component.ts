import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})

// Для реализации слайдера использована библиотека ngx-slick.
export class SliderComponent implements OnInit {

  slides = [
    { img: '/assets/images/angular_logo.png' },
    { img: '/assets/images/firebase_logo.png' },
    { img: '/assets/images/ngrx_logo.png' }
  ];

  slideConfig = { 'slidesToShow': 1, 'slidesToScroll': 1, 'dots': true, 'fade': true,
  'infinite': true, 'autoplay': true, 'autoplaySpeed': 5000 };

  constructor() { }

  ngOnInit() {
  }

}
