import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AuthenticateService } from './services/authentication.service';
import {environment} from '../environments/environment';

import * as firebase from 'firebase/app';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AngularFireModule} from '@angular/fire';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {Camera} from '@ionic-native/camera/ngx';
import {ImagesService} from './services/images.service';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';


import {LocalNotifications} from "@ionic-native/local-notifications/ngx";
import {OneSignal} from "@ionic-native/onesignal/ngx";
import {Push} from "@ionic-native/push/ngx";
import{SocialSharing} from "@ionic-native/social-sharing/ngx";
import {HttpClientModule} from '@angular/common/http';
import {InvoicePickerPage} from "./invoice/invoice-picker/invoice-picker.page";
import {PopoverComponent} from "./components/popover/popover.component";
import {Screenshot} from "@ionic-native/screenshot/ngx";




firebase.initializeApp(environment.firebase);

@NgModule({
  declarations: [AppComponent, InvoicePickerPage,PopoverComponent],
  entryComponents: [InvoicePickerPage,PopoverComponent],
  imports: [
      AngularFireModule.initializeApp(environment.firebase),
      AngularFirestoreModule,
      AngularFireAuthModule,
      BrowserModule,
      IonicModule.forRoot(),
      AppRoutingModule,
      AngularFireAuthModule,
      FormsModule,
      ReactiveFormsModule,
      AngularFirestoreModule,
      AngularFireStorageModule,
      HttpClientModule,
      Ng2GoogleChartsModule,
      AngularFirestoreModule.enablePersistence()


  ],
  providers: [
    StatusBar,
    SplashScreen,
    AuthenticateService,
    ImagesService,
    ImagePicker,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
      Camera,
      LocalNotifications,
      OneSignal,
      Push,
      SocialSharing,
      Screenshot,


  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
