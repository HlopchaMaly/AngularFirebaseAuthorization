import { Component, OnInit } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
import { LoginComponent } from '../../modal/login/login.component';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  isLogIn: boolean;
  buttonText = 'LogIn';
  iconName = 'sign-in';

  constructor(private authService: AuthService, private modalService: ModalService,
    private commonService: CommonService, private router: Router) {
    this.authService.getCurrentAuthState.subscribe((val: boolean) => {
      this.isLogIn = val;
      if (val) {
        this.buttonText = 'LogOut';
        this.iconName = 'sign-out';
      } else {
        this.buttonText = 'LogIn';
        this.iconName = 'sign-in';
      }
    });
  }

  ngOnInit() {
  }

  showModal() {
    this.modalService.init(LoginComponent, {}, {});
  }

  goToHomePage() {
    this.router.navigate(['/home']);
  }

  onHeaderButtonClick() {
    if (this.isLogIn) {
      this.goToHomePage();
    } else {
      this.showModal();
    }
  }

  // Используя CommonService при клике по "гамбургеру" управляем сворачиванием/разварачиванием
  // навбара из UiHomeComponent путем вызова метода UiHomeComponent.toggleNav().
  onBurgerClick() {
    this.commonService.notifyOther({ option: 'onBurgerClick' });
  }

}
