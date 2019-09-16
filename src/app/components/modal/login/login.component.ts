import { Component, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
import { Subscription } from 'rxjs';
import { EmailFormComponent } from '../email-form/email-form.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    trigger('toggleNameInput', [
      state('visible', style({
        opacity: '1'
      })),
      state('unvisible', style({
        opacity: '0'
      })),
      transition('*=>visible', animate(50)),
      transition('*=>unvisible', animate(50))
    ])
  ]
})
export class LoginComponent implements OnInit, OnDestroy {

  private formSubscriber: Subscription;
  private fireErrorSubscriber: Subscription;

  fireEmailError = '';
  firePasswordError = '';

  needCreateAccount = false;
  currentVisibleState = 'unvisible';

  actionType = 'Login';
  phraseForToggle = 'Don\'t have an account?';



  constructor(private authService: AuthService, private modalService: ModalService) {
    this.generateFireAuthorisationErr();
   }

  public loginForm: FormGroup;
  public email: FormControl;
  public password: FormControl;
  public userName: FormControl;

  private createFormControls(): void {
    this.email = new FormControl('', [Validators.required, Validators.email]);
    this.password = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)] );
    this.userName = new FormControl('', [
      Validators.required,
      // 2 - 22 симвлола, без кириллицы, начало с английской.
      Validators.pattern('[a-zA-Z][a-zA-Z0-9-_/.]{1,20}$')
    ]);
  }

  private createForm(): void {
    this.loginForm = new FormGroup({
      email: this.email,
      password: this.password,
      userName: this.userName
    });
  }

  ngOnInit() {
    this.createFormControls();
    this.createForm();

    // Форма выполняет две функции - авторизации и регистрации. Если необходима форма
    // авторизации делаем инпут "userName" (присутствует только в форме регистрации) неактивным и удаляем валидаторы.
    this.loginForm.controls['userName'].clearValidators();
    this.loginForm.controls['userName'].disable();
    this.formSubscriber = this.loginForm.valueChanges.subscribe(data => {
      this.fireEmailError = '';
      this.firePasswordError = '';
    });
  }

  // Переключение типа формы авторизация/регистрация.
  toggleData() {
    if (this.currentVisibleState === 'unvisible') {
      this.currentVisibleState = 'visible';
      this.actionType = 'Sign up';
      this.phraseForToggle = 'Back to login';
      this.needCreateAccount = true;
      this.loginForm.reset();
      this.loginForm.controls['userName'].setValidators([
        Validators.required,
        Validators.maxLength(30),
        Validators.pattern('[a-zA-Z][a-zA-Z0-9-_/.]{1,20}$')
      ]);
      this.loginForm.controls['userName'].enable();
    } else {
      this.currentVisibleState = 'unvisible';
      this.actionType = 'Login';
      this.phraseForToggle = 'Don\'t have an account?';
      this.needCreateAccount = false;
      this.loginForm.reset();
      this.loginForm.controls['userName'].clearValidators();
      this.loginForm.controls['userName'].disable();
    }
  }

  closeModal() {
    this.modalService.destroy();
  }

  onSubmit(formData) {
    if (formData.valid) {
      if (this.needCreateAccount) {
        this.authService.emailSignUp(this.loginForm.value.email, this.loginForm.value.password, this.loginForm.value.userName);
      } else {
        this.authService.emailLogin(this.loginForm.value.email, this.loginForm.value.password);
      }
    }
  }

  resetPassword() {
    this.modalService.destroy();
    this.modalService.init(EmailFormComponent, {}, {});
  }

  // // Метод для вывода в форму сообщений об ошибках авторизации firebase.
  generateFireAuthorisationErr() {
    // Сообщения об ошибках, выдаваемое firebase.
    const invalidPasswordFirebaseMsg = 'The password is invalid or the user does not have a password.';
    const invalidEmailFirebaseMsg = 'There is no user record corresponding to this identifier. The user may have been deleted.';
    const existEmailFirebaseMsg = 'The email address is already in use by another account.';
    const invalidEmailFormatFirebaseMsg = 'The email address is badly formatted.';

    // Сообщения об ошибках, выводимое в форму.
    const invalidPasswordMsg = 'The password is invalid.';
    const invalidEmailMsg = 'The email is invalid.';
    const existEmailMsg = 'The email address is already exist.';
    const invalidEmailFormatMsg = 'The email is badly formatted.';

    this.fireErrorSubscriber = this.authService.err.subscribe((errMsg: string) => {
      switch (errMsg) {
        case invalidPasswordFirebaseMsg: {
          this.firePasswordError = invalidPasswordMsg;
          break;
        }
        case invalidEmailFirebaseMsg: {
          this.fireEmailError = invalidEmailMsg;
          break;
        }
        case existEmailFirebaseMsg: {
          this.fireEmailError = existEmailMsg;
          break;
        }
        case invalidEmailFormatFirebaseMsg: {
          this.fireEmailError = invalidEmailFormatMsg;
          break;
        }
        default: {
          break;
        }
      }
    });
  }

  ngOnDestroy() {
    this.fireErrorSubscriber.unsubscribe();
    this.formSubscriber.unsubscribe();
  }

}
