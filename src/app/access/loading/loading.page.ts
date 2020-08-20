import {Component, NgZone, OnInit} from '@angular/core';
import * as firebase from 'firebase';
import {NavController} from '@ionic/angular';
import {AuthenticateService} from '../../services/authentication.service';
import {User} from '../../models/UserModel';


@Component({
  selector: 'app-loading',
  templateUrl: './loading.page.html',
  styleUrls: ['./loading.page.scss'],
})
export class LoadingPage implements OnInit {

  constructor(private navCtrl: NavController, private afs: AuthenticateService,  private ngZone: NgZone,) { }

  ngOnInit() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const defaultImg = '../../../assets/img/avatar.png';
        if (user.photoURL == null) {
          console.log(user);
          this.afs.user = new User(null, user.displayName, defaultImg);
        } else {
          this.afs.user = new User(null, user.displayName, user.photoURL);
        }
        this.afs.updateProfile(this.afs.user);
        this.ngZone.run( () =>  this.navCtrl.navigateRoot('group-list'));
       // this.navCtrl.navigateRoot('group-list'); // to the page where user navigates after login
        console.log('user signed in');
      } else {
        this.ngZone.run( () =>  this.navCtrl.navigateRoot('login'));
      //  this.navCtrl.navigateRoot('login');
        console.log('not signed in');
      }
    });
  }

}
