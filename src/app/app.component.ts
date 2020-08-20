import { Component } from '@angular/core';
import {AlertController, NavController, Platform} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {OneSignal} from "@ionic-native/onesignal/ngx";
import {Push, PushObject, PushOptions} from "@ionic-native/push/ngx";
import {UserServiceService} from "./services/user-service.service";


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private navCtrl: NavController,
    private oneSignal: OneSignal,
    private  alertCtrl: AlertController,

  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      if(this.platform.is('cordova')){
        this.setupSignalInit();
       // this.pushnInit()
      }

    });
  }

  setupSignalInit(){
    this.oneSignal.startInit('43069341-3a8d-4732-a74f-4c6e2b028e70', '445638191744');

    this.oneSignal.handleNotificationOpened().subscribe( data => {


        let additionalData= data.notification.payload.additionalData;
   // this.showAlert('notification Opend', 'test', additionalData);
    });
    this.oneSignal.handleNotificationReceived().subscribe( data => {
      let msg = data.payload.body;
      let title = data.payload.title;
      let additionalData = data.payload.additionalData;
     // this.showAlert(title, msg, additionalData.task)
    });
    this.oneSignal.endInit();
  }

/*  showAlert(titel,msg,task){
    this.alertCtrl.create({
      header: titel,
      subHeader: msg,
      buttons: [{
        text: `Action:${task}`,
        handler:()=>{
          //navigatetoscreen
        }
      }]
    }).then(alert => alert.present());
  }*/
/*pushnInit(){
  const options: PushOptions = {
    android: {
      senderID:'445638191744',
    },
    ios: {
      alert: 'true',
      badge: true,
      sound: 'false'
    },
    windows: {},
    browser: {
    }
  };

  const pushObject: PushObject = this.push.init(options);


  pushObject.on('notification').subscribe((notification: any) => console.log('Received a notification', notification));

  pushObject.on('registration').subscribe((registration: any) => console.log('Device registered', registration));

  pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));

}*/
}
