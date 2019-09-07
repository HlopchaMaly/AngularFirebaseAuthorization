import { ConfirmActionDeleteComponent } from './../../modal/confirm-action-delete/confirm-action-delete.component';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
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

  selectedFiles: FileList;

  inputFileText = 'File';

  constructor(private modalService: ModalService, private formBuilder: FormBuilder,
    private userService: UserService, private store: Store<User>, private route: ActivatedRoute) {
      this.generateAuthorisationErr();
  }

  formErrors = {
    email: '',
    userName: '',
    photo: ''
  };

  validationMessages = {
    email: {
      'required': '',
      'email': 'Incorrect email format'
    },
    userName: {
      'required': '',
      'pattern': 'Incorrect name format'
    },
    photo: {
      'required': '',
      'pattern': 'Incorrect url path'
    }
  };

  ngOnInit() {

    this.buildForm();

    this.userSubscriber = this.store.select('userPage').subscribe(({ user }) => {
      this.user = user;
    });
    this.querySubscriber = this.route.queryParams.subscribe(params => {
      
      switch(params.inputName) { 
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
    })
  }

  buildForm() {
    this.changeDataForm = this.formBuilder.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      userName: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z][a-zA-Z0-9-_/.]{1,20}$')
      ]],
      photo: ['', [
        Validators.required,
        Validators.pattern('^(http://www\.|https://www\.|http://|https://)([\\S])+(\.jpg|\.png|\.svg)$')
      ]],

    });

    this.formSubscriber = this.changeDataForm.valueChanges.subscribe(data => this.onValueChange(data));
    this.onValueChange();
  }

  onValueChange(data?: any) {
    if (!this.changeDataForm) {
      return;
    }
    const form = this.changeDataForm;
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

  onChangeEmail() {
    const newEmail = this.changeDataForm.controls['email'].value;
    this.modalService.init(ConfirmActionChangeEmailComponent, {email: newEmail}, {});
  }
  
  onChangeName() {
    // Берем данные из инпута.
    this.user.name = this.changeDataForm.controls['userName'].value;
    // Меняем имя в профиле,
    this.userService.changeName(this.user);
    this.changeDataForm.controls['userName'].reset();
    console.log('Имя изменено');
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

  onDelete() {
    this.modalService.init(ConfirmActionDeleteComponent, {user: this.user}, {});
  }

  generateAuthorisationErr() {
    const existEmailFirebaseMsg = 'The email address is already in use by another account.';
    const invalidEmailMsg = 'This email already exists';

    this.errorSubscriber = this.userService.err.subscribe((errMsg: string) => {
      if(errMsg === existEmailFirebaseMsg) {
        this.formErrors.email = invalidEmailMsg;
      }
    });
  }

  ngOnDestroy() {
    this.userSubscriber.unsubscribe();
    this.formSubscriber.unsubscribe();
    this.errorSubscriber.unsubscribe();
    this.querySubscriber.unsubscribe();
  }
}

