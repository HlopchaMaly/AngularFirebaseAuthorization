import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-confirm-action-change-email',
  templateUrl: './confirm-action-change-email.component.html',
  styleUrls: ['./confirm-action-change-email.component.scss']
})
export class ConfirmActionChangeEmailComponent implements OnInit, OnDestroy {

  @Input() email: string;
  passwordForm: FormGroup;
  subscriber: Subscription;



  constructor(private modalService: ModalService, private userService: UserService) {
    this.passwordForm = new FormGroup({
      'password': new FormControl('', [
        Validators.required,
        Validators.minLength(6)
      ])
    });


  }

  formErrors = {
    password: ''
  };

  validationMessages = {
    password: {
      'required': 'Required field',
      'minlength': 'At least 6 characters'
    }
  };

  ngOnInit() {
    this.subscriber = this.passwordForm.valueChanges.subscribe(data => this.onValueChange(data));
    this.onValueChange();
  }

  // Ошибки валидации формы.
  onValueChange(data?: any) {
    if (!this.passwordForm) {
      return;
    }
    const form = this.passwordForm;
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

  closeModal() {
    this.modalService.destroy();
  }

  onSubmit(formData: { valid: any; }) {
    if (formData.valid) {
      const password = this.passwordForm.controls['password'].value;
      this.userService.changeEmail(password, this.email);
      this.closeModal();
    }
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe();
  }


}
