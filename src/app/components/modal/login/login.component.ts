import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
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
  private errorSubscriber: Subscription;

  needCreateAccount = false;
  currentVisibleState = 'unvisible';

  myError = '';

  actionType = 'Login';
  phraseForToggle = 'Don\'t have an account?';

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private modalService: ModalService) {
    this.generateAuthorisationErr();
   }

  loginForm: FormGroup;

  formErrors = {
    email: '',
    password: '',
    userName: ''
  };

  validationMessages = {
    email: {
      'required': 'Required field',
      'email': 'Incorrect email format'
    },
    password: {
      'required': 'Required field',
      'minlength': 'At least 6 characters'
    },
    userName: {
      'required': 'Required field',
      'pattern': 'Incorrect name format'
    }
  };

  ngOnInit() {
    this.buildForm();
    this.loginForm.controls['userName'].clearValidators();
    this.loginForm.controls['userName'].disable();
  }

  buildForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
      ,
      userName: ['', [
        Validators.required,
        // 2-20 символов, без кириллицы, первый символ буква, допускаются тире, слешь, подчеркивание, точка
        Validators.pattern('^[a-zA-Z][a-zA-Z0-9-_/.]{1,20}$')
      ]]
    });

    this.formSubscriber = this.loginForm.valueChanges.subscribe(data => this.onValueChange(data));
    this.onValueChange();
  }

  onValueChange(data?: any) {
    if (!this.loginForm) {
      return;
    }
    const form = this.loginForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        this.formErrors[field] = '';
        const control = form.get(field);

        if (control && control.dirty && !control.valid) {
          const message = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += message[key] + ' ';
            }
          }
        }
      }
    }
  }

  // Переключение типа формы авторизация/регистрация.
  toggleData() {
    if (this.currentVisibleState === 'unvisible') {
      this.currentVisibleState = 'visible';
      this.actionType = 'Sign up';
      this.phraseForToggle = 'Back to login';
      this.needCreateAccount = true;
      this.loginForm.reset();
      this.loginForm.controls['userName'].setValidators([Validators.required, Validators.maxLength(30)]);
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

  // Метод для вывода в форму сообщений об ошибках авторизации firebase.
  generateAuthorisationErr() {
    // Сообщения об ошибках, выдаваемое firebase.
    const invalidPasswordFirebaseMsg = 'The password is invalid or the user does not have a password.';
    const invalidEmailFirebaseMsg = 'There is no user record corresponding to this identifier. The user may have been deleted.';
    const existEmailFirebaseMsg = 'The email address is already in use by another account.';

    // Сообщения об ошибках, выводимое в форму.
    const invalidPasswordMsg = 'The password is invalid';
    const invalidEmailMsg = 'The email is invalid';
    const existEmailMsg = 'The email address is already exist';

    this.errorSubscriber = this.authService.err.subscribe((errMsg: string) => {
      switch (errMsg) {
        case invalidPasswordFirebaseMsg: {
          this.formErrors.password = invalidPasswordMsg;
          break;
        }
        case invalidEmailFirebaseMsg: {
          this.formErrors.email = invalidEmailMsg;
          break;
        }
        case existEmailFirebaseMsg: {
          this.formErrors.email = existEmailMsg;
          break;
        }
        default: {
          break;
        }
      }
    });
  }

  ngOnDestroy() {
    this.formSubscriber.unsubscribe();
    this.errorSubscriber.unsubscribe();
  }

}
