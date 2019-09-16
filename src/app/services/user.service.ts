import { Injectable, EventEmitter } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { Store } from '@ngrx/store';
import { AppState } from '../redux/app.state';
import { User } from '../models/user.model';
import { LoadUser, AddUser, DeleteUser, UpdateUser } from '../redux/user/user.action';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireStorage } from 'angularfire2/storage';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})

// Сервис предназначен для получения/изменения/удаления пользователя и его данных.

export class UserService {

  private dbPath = '/users/';
  private storagePath = '/photo/';

  userRef: AngularFireObject<User> = null;
  subscriber: Subscription;
  public err: EventEmitter<string> = new EventEmitter();
  redirectWithoutGuard: boolean;
  emitter: EventEmitter<boolean> = new EventEmitter();

  constructor(private db: AngularFireDatabase, private afAuth: AngularFireAuth, private afStorage: AngularFireStorage,
    private store: Store<AppState>, private router: Router) {
    this.redirectWithoutGuard = false;
  }

  // Получение пользователя из realtime database firebase. Помщение пользователя в store.
  loadUser(uid: string) {
    this.userRef = this.db.object(this.dbPath + uid);
    this.userRef.valueChanges().subscribe(user => {
      const tempUser = user;
      // При изменении почты из UI, пользователю высылается письмо на email. После перехода
      // по ссылке-подтверждению изменяется значение AngularFireAuth.auth.currentUser.email,
      // но не значение email в RTDB. Проверяем. При необходимости изменяем
      // почту в RTDB.
      if (user.email === this.afAuth.auth.currentUser.email) {
        // Помещаем пользователя в store.
        this.store.dispatch(new LoadUser(user));
      } else {
        tempUser.email = this.afAuth.auth.currentUser.email;
        this.updateUser(tempUser);
      }
    });
  }

  // Добавление пользователя в realtime db firebase. Добавление пользователя в store.
  addUser(user: User) {
    this.userRef = this.db.object(this.dbPath + user.id);
    this.userRef.set(user).then(() => {
      this.store.dispatch(new AddUser(user));
    });
  }

  // Удаление пользователя.
  deleteUser(user: User, password: string) {
    const currentUserEmail = this.afAuth.auth.currentUser.email;
    // Ввиду особенностей параметров безопасности firebase authentication такие действия, как удаление аккаунта, изменение
    // адреса почты, изменение пароля требуют повторной аутентификации пользователя.
    const credentials = firebase.auth.EmailAuthProvider.credential(currentUserEmail, password);
    this.afAuth.auth.currentUser.reauthenticateAndRetrieveDataWithCredential(credentials).then(() => {
      this.deletePhoto(user);
      this.afAuth.auth.currentUser.delete().then(() => {
        this.afAuth.auth.signOut();
        this.redirectWithoutGuard = true;
        this.router.navigate(['/home']);
        this.userRef = this.db.object(this.dbPath + user.id);
        this.userRef.remove().then(() => {
          this.store.dispatch(new DeleteUser(user));
        });
      });
    }).catch(error => this.handleError(error));
  }

  // Обновление данных пользователя.
  updateUser(user: User) {
    this.userRef = this.db.object(this.dbPath + user.id);
    this.userRef.update(user).then(() => {
      this.store.dispatch(new UpdateUser(user));
    });
  }

  // Изменение имени пользователя.
  changeName(user: User) {
    // Обновляем пользователя в базе.
    this.updateUser(user);
    // Обновляем профиль пользователя firebase.
    this.afAuth.auth.currentUser.updateProfile({
      displayName: user.name,
      photoURL: user.photo
    });
  }

  // Изменение фото пользователя (если используется фото из сети).
  changePhotoUrl(user: User) {
    // Удаляем старые фото;
    this.deletePhoto(user).then(() => {
      user.pathToOldPhotoInStorage = '';
      // Обновляем пользователя в базе, store.
      this.updateUser(user);
      // Изменяем данные в аккаунте firebase.
      this.afAuth.auth.currentUser.updateProfile({
        displayName: user.name,
        photoURL: user.photo
      });
      console.log('Фото изменено');
    });
  }

  // Изменение фото пользователя (если фото загружено с ЭВМ пользователя).
  changePhoto(user: User, file: FileList) {
    this.deletePhoto(user).then(() => {
      // Добавляем файл в хранилище firebase.
      const storageRef = this.afStorage.storage.ref();
      const fullPathToUserPhoto = this.storagePath + user.id + '/' + file.item(0).name;
      // Для удаления файла из хранилища в будущем сохраняем путь.
      user.pathToOldPhotoInStorage = fullPathToUserPhoto;
      // Добавляем файл в хранилище.
      storageRef.child(fullPathToUserPhoto).put(file.item(0)).then(() => {
        // Получаем путь доступа к файлу.
        storageRef.child(fullPathToUserPhoto).getDownloadURL().then(url => {
          user.photo = url;
          this.updateUser(user);
          // Меняем путь в профиле firebase.
          this.afAuth.auth.currentUser.updateProfile({
            displayName: user.name,
            photoURL: user.photo
          });
        });
      });
      console.log('Файл загружен в хранилище');
    });
  }

  // Удаление фото.
  deletePhoto(user: User) {
    // Если фото загружалось в хранилище.
    if (user.pathToOldPhotoInStorage !== '') {
      const storageRef = this.afStorage.storage.ref();
      console.log('Файл удален из хранилища');
      // Непосредственно удаляем.
      return storageRef.child(user.pathToOldPhotoInStorage).delete();
    } else {
      console.log('Файл НЕ удален');
      return Promise.resolve();
    }
  }

  // Изменение почты.
  changeEmail(password: string, newEmail: string) {
    const currentUserEmail = this.afAuth.auth.currentUser.email;
    // Производим повторную аутентификацию.
    const credentials = firebase.auth.EmailAuthProvider.credential(currentUserEmail, password);
    this.afAuth.auth.currentUser.reauthenticateAndRetrieveDataWithCredential(credentials).then(() => {
      this.afAuth.auth.currentUser.updateEmail(newEmail).then(() => {
        this.afAuth.auth.currentUser.sendEmailVerification().then(() => {
          this.redirectWithoutGuard = true;
          this.router.navigate(['/home']);
          this.afAuth.auth.signOut();
        });
      }).catch(error => this.handleError(error));
    }).catch(error => this.handleError(error));
  }

  // Сброс пароля.
  sendPasswordReset(email: string) {
    this.afAuth.auth.sendPasswordResetEmail(email).then();
  }

  private handleError(error: Error) {
    this.err.emit(error.message);
    console.log(error.message);
  }
}
