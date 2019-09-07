import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ModalService } from 'src/app/services/modal.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-email-form',
  templateUrl: './email-form.component.html',
  styleUrls: ['./email-form.component.scss']
})
export class EmailFormComponent implements OnInit, OnDestroy {

  emailForm: FormGroup;
  subscriber: Subscription;

  formErrors = {
    email: ''
  };

  validationMessages = {
    email: {
      'required': 'Required field',
      'email': 'Incorrect email format'
    }
  };

  constructor(private modalService: ModalService, private userService: UserService) {
    this.emailForm = new FormGroup({
      'email': new FormControl('', [
        Validators.required,
        Validators.email
      ])
    });
  }

  ngOnInit() {
    this.subscriber = this.emailForm.valueChanges.subscribe(data => this.onValueChange(data));
    this.onValueChange();
  }

  onValueChange(data?: any) {
    if (!this.emailForm) {
      return;
    }

    const form = this.emailForm;

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
      const email = this.emailForm.controls['email'].value;
      this.userService.sendPasswordReset(email);
      this.modalService.destroy();
    }
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe();
  }
}
