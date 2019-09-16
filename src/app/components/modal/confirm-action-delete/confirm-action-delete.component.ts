import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ModalService } from 'src/app/services/modal.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-confirm-action-delete',
  templateUrl: './confirm-action-delete.component.html',
  styleUrls: ['./confirm-action-delete.component.scss']
})
export class ConfirmActionDeleteComponent implements OnInit, OnDestroy {

  @Input() user: User;
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
      this.userService.deleteUser(this.user, password);
      this.modalService.destroy();
    }
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe();
  }

}
