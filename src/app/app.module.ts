import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app.routing.module/app.routing.module';

import { SlickModule } from 'ngx-slick';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { StoreModule } from '@ngrx/store';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header-footer/header/header.component';
import { FooterComponent } from './components/header-footer/footer/footer.component';
import { HomeComponent } from './components/content/home/home.component';
import { SliderComponent } from './components/content/slider/slider.component';
import { LoginComponent } from './components/modal/login/login.component';

import { DomService } from './services/dom.service';
import { ModalService } from './services/modal.service';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';

import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { userReducer } from './redux/user/user.reducer';
import { GuardService } from './services/guard.service';
import { CommonService } from './services/common.service';
import {AngularFireFunctionsModule} from 'angularfire2/functions';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { ConfirmActionChangeEmailComponent } from './components/modal/confirm-action-change-email/confirm-action-change-email.component';
import { EmailFormComponent } from './components/modal/email-form/email-form.component';
import { ConfirmActionDeleteComponent } from './components/modal/confirm-action-delete/confirm-action-delete.component';
import { TooltipComponent } from './components/tooltip/tooltip/tooltip.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    SliderComponent,
    LoginComponent,
    ConfirmActionChangeEmailComponent,
    EmailFormComponent,
    ConfirmActionDeleteComponent,
    TooltipComponent
  ],
  imports: [
    BrowserModule,
    SlickModule.forRoot(),
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AngularFontAwesomeModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    StoreModule.forRoot({userPage: userReducer}),
    AngularFireFunctionsModule,
    AngularFireStorageModule
  ],
  providers: [
    DomService,
    ModalService,
    AuthService,
    UserService,
    GuardService,
    CommonService
  ],
  entryComponents: [
    LoginComponent,
    ConfirmActionChangeEmailComponent,
    EmailFormComponent,
    ConfirmActionDeleteComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
