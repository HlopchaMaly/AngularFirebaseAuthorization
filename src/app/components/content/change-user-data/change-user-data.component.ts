import { ConfirmActionDeleteComponent } from './../../modal/confirm-action-delete/confirm-action-delete.component';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { ModalService } from 'src/app/services/modal.service';
import { ConfirmActionChangeEmailComponent } from '../../modal/confirm-action-change-email/confirm-action-change-email.component';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-change-user-data',
  templateUrl: './change-user-data.component.html',
  styleUrls: ['./change-user-data.component.scss']
})
export class ChangeUserDataComponent implements OnInit, OnDestroy {

  // Обращение к соответствующим шаблонным переменным.
  @ViewChild('emailInput')
  emailInput: ElementRef;

  @ViewChild('nameInput')
  nameInput: ElementRef;

  user: User;
  private userSubscriber: Subscription;
  private formSubscriber: Subscription;
  private errorSubscriber: Subscription;
  private querySubscriber: Subscription;

  changeDataForm: FormGroup;
  public email: FormControl;
  public userName: FormControl;
  public photo: FormControl;

  fireEmailError = '';
  firePasswordError = '';

  enableEmailErrMsg = true;
  enableDeleteErrMsg = true;

  selectedFiles: FileList;

  inputFileText = 'File';

  constructor(private modalService: ModalService, private formBuilder: FormBuilder,
    private userService: UserService, private store: Store<User>, private route: ActivatedRoute) {
      this.generateFireAuthErrMsg();
  }

  private createFormControls(): void {
    this.email = new FormControl('', [
      Validators.required,
      Validators.email
    ]);
    this.userName = new FormControl('', [
      Validators.required,
      Validators.maxLength(30),
      // 2 - 22 симвлола, без кириллицы, начало с английской.
      Validators.pattern('[a-zA-Z][a-zA-Z0-9-_/.]{1,20}$')
    ]);
    this.photo = new FormControl('', [
      Validators.required,
     // Начало (http://www.|https://www.|http://|https://), окончание (.jpg|.png|.svg).
        Validators.pattern('^(http://www\.|https://www\.|http://|https://)([\\S])+(\.jpg|\.png|\.svg)$')
    ]);
  }

  private createForm(): void {
    this.changeDataForm = new FormGroup({
      email: this.email,
      userName: this.userName,
      photo: this.photo
    });
  }
  ngOnInit() {
    this.createFormControls();
    this.createForm();

    // Наблюдаем пользователя в store.
    this.userSubscriber = this.store.select('userPage').subscribe(({ user }) => {
      this.user = user;
    });

    // Ловим параметр строки запроса, для фокусировки на соответсвующем инпуте. Т.е. если
    // нажата шестеренка напротив имени в user-info.component - фокус на инпут, изменяющий
    // имя. С почтой аналогично.
    this.querySubscriber = this.route.queryParams.subscribe(params => {
      switch (params.inputName) {
        case 'emailInput': {
           this.emailInput.nativeElement.focus();
           break;
        }
        case 'nameInput': {
           this.nameInput.nativeElement.focus();
           break;
        }
        default: {
           break;
        }
     }
    });

    this.formSubscriber = this.changeDataForm.valueChanges.subscribe(data => {
      this.clearFireErrorMsg();
    });
  }

  clearFireErrorMsg() {
      this.fireEmailError = '';
      this.firePasswordError = '';
  }

  onValueChange(data?: any) {
    this.firePasswordError = '';
    this.fireEmailError = '';
  }

  // Вызов модального окна-подтверждения при изменении почты (confirm-action-change-email.component).
  onChangeEmail() {
    const newEmail = this.changeDataForm.controls['email'].value;
    this.modalService.init(ConfirmActionChangeEmailComponent, {email: newEmail}, {});
    this.clearFireErrorMsg();
  }

  onChangeName() {
    // Берем данные из инпута.
    this.user.name = this.changeDataForm.controls['userName'].value;
    // Меняем имя в профиле.
    this.userService.changeName(this.user);
    this.changeDataForm.controls['userName'].reset();
  }

  onChangePhotoUrl() {
    this.user.photo = this.changeDataForm.controls['photo'].value;
    this.userService.changePhotoUrl(this.user);
    this.changeDataForm.controls['photo'].reset();
  }

  // Метод обнаружения файлов в инпуте файл.
  detectFiles(event: { target: { files: FileList; }; }) {
    this.selectedFiles = event.target.files;
    console.log('Файл загружен локально');
    this.inputFileText = this.selectedFiles.item(0).name;
  }

  onUploadPhoto() {
    this.userService.changePhoto(this.user, this.selectedFiles);
    // Меняем "плейсхолдер" в инпуте файл;
    this.inputFileText = 'File';
    // Сбрасываем значение для "деактивации" кнопки инпута файл.
    this.selectedFiles = null;
  }

  // Вызов модального окна-подтверждения при удалении пользователя (confirm-action-delete.component).
  onDelete() {
    this.modalService.init(ConfirmActionDeleteComponent, {user: this.user}, {});
    this.clearFireErrorMsg();
    this.enableDeleteErrMsg = true;
    this.enableEmailErrMsg = false;
  }

  // Отображение ошибки "адресПочтыУжеЗанят" при изменении почты.
  generateFireAuthErrMsg() {
    const invalidPasswordFirebaseMsg = 'The password is invalid or the user does not have a password.';
    const existEmailFirebaseMsg = 'The email address is already in use by another account.';
    const invalidEmailFormatFirebaseMsg = 'The email address is badly formatted.';

    const invalidEmailMsg = 'The email address is already exist';
    const invalidPasswordMsg = 'The password is invalid.';
    const invalidEmailFormatMsg = 'The email is badly formatted.';

    this.errorSubscriber = this.userService.err.subscribe((errMsg: string) => {
      switch (errMsg) {
        case invalidPasswordFirebaseMsg: {
          this.firePasswordError = invalidPasswordMsg;
          break;
        }
        case existEmailFirebaseMsg: {
          this.fireEmailError = invalidEmailMsg;
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

  onFocus() {
    this.clearFireErrorMsg();
    this.enableDeleteErrMsg = false;
    this.enableEmailErrMsg = true;
  }

  ngOnDestroy() {
    this.userSubscriber.unsubscribe();
    this.formSubscriber.unsubscribe();
    this.errorSubscriber.unsubscribe();
    this.querySubscriber.unsubscribe();
  }
}

