import { Injectable, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { ModalService } from './modal.service';
import { UserService } from './user.service';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

// Сервис изпользуется для:
// 1. Регистрации нового пользователя.
// 2. Авторизации уже существующего пользователя.
// 3. Выхода из аккаунта.

export class AuthService {

  readonly defaultPathToPhoto: string = '/assets/images/noPhoto.png';

  public currentAuthState: boolean;
  getCurrentAuthState: EventEmitter<boolean> = new EventEmitter();
  public err: EventEmitter<string> = new EventEmitter();
  public userState: Observable<User>;

  constructor(private afAuth: AngularFireAuth, private modalService: ModalService,
    private userService: UserService, private router: Router) {

    // Следим за состоянием firebase.User и firebase.User.emailVerified. После ввода
    // логина и пароля в форме авторизации, если введенные данные верны и адрес почты подтвержден
    // произойдет перенаправление по маршруту /ui-home/user-info.
    this.afAuth.authState.subscribe((fireUser) => {
      if (fireUser && fireUser.emailVerified) {
        this.currentAuthState = true;
        this.getCurrentAuthState.emit(this.currentAuthState);
        this.userService.loadUser(fireUser.uid);
        this.router.navigate(['/ui-home']);
      } else {
        this.currentAuthState = false;
        this.getCurrentAuthState.emit(this.currentAuthState);
      }
    });
  }

  // Регистрация email/password.
  // При создании нового пользователя firebase запускается облачная функция-триггер (taskmanager/functions).
  // Если адрес электронной почты не будет подтвержден в течении часа пользователь будет удален
  // как из realtime db, так и из аккаунтов firebase.auth.
  emailSignUp(email: string, password: string, userName: string) {

    // Устанавливаем тип сохранения состояния аутентификации.
    // Состояние сбрасывается на "неавторизован" при закрытии вкладки. При перезагрузке страницы остается текущим.
    this.afAuth.auth.setPersistence('session').then(() => {
      this.afAuth.auth
        .createUserWithEmailAndPassword(email, password)
        .then(
          (currentUser) => {
            const user = new User(currentUser.user.uid, userName, email, this.defaultPathToPhoto, '');
            // Добавляем пользователя в realtime db firebase. Добавляем пользователя в store.
            this.userService.addUser(user);
            // Обновляем профиль пользователя firebase (добавляем имя и дефолтное фото).
            currentUser.user.updateProfile({
              displayName: userName,
              photoURL: this.defaultPathToPhoto
            }).then(() => {
              // Отправляем сообщение для подтверждения адреса почты пользователю.
              currentUser.user.sendEmailVerification().then(() => {
                // Закрываем модальное окно LoginComponent.
                this.modalService.destroy();
              });
              // Выходим из аккаунта.
              this.afAuth.auth.signOut();
              alert('Check your email and follow the link.\nThe link will be active for hours.');
            });
          }
        )
        .catch(error => this.handleError(error));
    });
  }

  // Авторизация email/password.
  emailLogin(email: string, password: string) {
    this.afAuth.auth.signOut();
    this.afAuth.auth.setPersistence('session').then(() => {
      this.afAuth.auth
        .signInWithEmailAndPassword(email, password)
        .then((currentUser) => {
          this.modalService.destroy();
          if (currentUser.user.emailVerified) {
            console.log('Вход в аккаунт');
          } else {
            alert('Email is not verified. Please check your mail and go to the link inside the letter.');
          }
        })
        .catch(error => this.handleError(error));
    });
  }

  // Выход из аки.
  logout() {
    this.afAuth.auth
      .signOut()
      .then((success) => {
        console.log('Выход из аккаунта');
      })
      .catch(error => this.handleError(error));
  }

  private handleError(error: Error) {
    this.err.emit(error.message);
    console.log(error.message);
  }
}
