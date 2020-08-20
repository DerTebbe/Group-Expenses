import {Injectable} from '@angular/core';
import {ELocalNotificationTriggerUnit, LocalNotifications} from "@ionic-native/local-notifications/ngx";
import {AlertController, Platform} from "@ionic/angular";
import {Router} from "@angular/router";
import {Push} from '@ionic-native/push/ngx';
import {HttpClient} from "@angular/common/http";
import {OneSignal} from "@ionic-native/onesignal/ngx";
import {UserServiceService} from "./user-service.service";
import {AngularFirestore} from "@angular/fire/firestore";
import {AchievementsService} from "../achievements.service";
import {subInvoice} from "../models/subInvoice";
import {User} from "../models/UserModel";


@Injectable({
    providedIn: 'root'
})
export class PushnService {
    // static SIGNAL_URL = 'https://onesignal.com/api/v1/notifications';
    private UID: string;
    private user: User;


    constructor(private points: AchievementsService,
                private userservice: UserServiceService, private onesignal: OneSignal,
                private fireStore: AngularFirestore, private https: HttpClient,
                private localnotification: LocalNotifications, private plt: Platform,
                private router: Router, private alertCtrl: AlertController, private push: Push,
    ) {
        /**
         * Get UID send Local Notifications
         */
        this.userservice.getUser().then((value) => {
            this.UID = value.uid;
            this.userservice.findbyId(value.uid).subscribe((value) => {
                this.user = value;
            });
            this.plt.ready().then(() => {
                this.localnotification.on('click').subscribe(res => {
                    let msg = res.data ? res.data.mydata : '';

                });
                this.localnotification.on('trigger').subscribe(res => {
                    let msg = res.data ? res.data.mydata : '';
                    // this.showAlert(res.title, res.text, msg);

                });
            });
        });
    }

    /**
     *
     * @param id of logged in User
     * Set the Firebase UID as External id in OneSignal
     */
    try(id) {
        this.onesignal.setExternalUserId(id);
        /*return new Promise<any>((resolve, reject) => {
            this.userservice.getUser().then((valueid) => {
                this.onesignal.setExternalUserId(valueid.uid);
            }).then(valueid => {
                return valueid
            })

            //console.log(userId);
            //return this.UID= userId;

        })*/
    }

    /**
     * During Login refresh External ID for getting Notifications
     * Same Device but another acoout = another UID
     */
    refreshExternalID() {
        this.userservice.getUser().then((valueid) => {
            this.onesignal.setExternalUserId(valueid.uid);
        });
    }

    /**
     *
     * @param uid of the logged in User
     * Welcome-Points user get after registered on the application
     */
    registerWelcome(uid:string) {
        this.localnotification.schedule({
            id: 1,
            title: 'Herzlich Willkommen',
            text: 'Du erhälst 20 Expensive Points und kannst durch aktive Nutzung ' +
                  'der App weitere Sammeln und Level aufsteigen. " +' +
                ' "Finde heraus wo es weitere Punkte zu holen gibt!    ',
            trigger: {in: 1, unit: ELocalNotificationTriggerUnit.SECOND},
            icon: 'src/assets/notifications/ic_stat_onesignal_default.png'
        });
        this.points.welcomePoints(uid);

    }

    /**
     * Points User get for adding a Group
     */
    addToGroup() {
        this.localnotification.schedule({
            id: 1,
            title: 'Neue Gruppe',
            text: 'Du hast eine Gruppe erstellt und erhältst 5 Expensive Points',
            trigger: {in: 1, unit: ELocalNotificationTriggerUnit.SECOND},
            icon: 'src/assets/notifications/ic_stat_onesignal_default.png'
        });
        this.points.getPoints(this.UID);
    }
    /**
     * Points User get for adding a Invoice
     */
    newInvoice() {
        this.localnotification.schedule({
            id: 1,
            title: 'Neue Rechnung',
            text: 'Du hast eine Rechnung angelegt und erhältst 5 Expensive Points',
            trigger: {in: 1, unit: ELocalNotificationTriggerUnit.SECOND},
            icon: 'src/assets/notifications/ic_stat_onesignal_default.png'
        });
        this.points.getPoints(this.UID);
    }

    /**
     * Points User get for paying a Invoice
     */
    payedCash(user: string) {
        this.localnotification.schedule({
            id: 1,
            title: 'Du hast bezahlt!',
            text: 'Du hast ' + user + ' bezahlt .' + ' Du erhältst 5 Expensive Points',
            trigger: {in: 1, unit: ELocalNotificationTriggerUnit.SECOND},
            // data:{page:  this.router.navigate(['group-list'])
            foreground: true,
            icon: 'src/assets/notifications/ic_stat_onesignal_default.png'
        });
        this.points.getPoints(this.UID);
    }

    /*    showAlert(header, sub, msg) {
            this.alertCtrl.create({
                header: header,
                subHeader: sub,
                message: msg,
                buttons: ['ok']
            }).then(alert => alert.present())
        }*/

    /**
     * OneSignal Post req. with the Authorization KEY
     * @param invoice : subInvoice - The subinvoice that should be remined to pay
     * @param invTitel of The ivoice
     */
    pRemeberToPay(invoice:subInvoice, invTitel: string) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", 'https://onesignal.com/api/v1/notifications', true);

        const D = {
            "app_id": "43069341-3a8d-4732-a74f-4c6e2b028e70",
            "include_external_user_ids": [invoice.userDerBezahlenMuss.id],
            "headings": {"en": "Erinnerung"},
            "contents": {"en": [invoice.userDerBezahltHat.name] + " erinnert dich daran die Rechnung " + [invTitel] + " in Höhe von " + [invoice.betrag.toFixed(2)] + " € zu bezahlen"},
            "data": {"foo": "bar"},
        };
        const payload = JSON.stringify(D);

        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "Basic YjY3NGZlMDUtY2M5NS00MjdlLThkZjEtYjkzNTQzMDBiNmY5");

        xhr.onreadystatechange = function () {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            }
        };
        xhr.send(payload);
    }

    /**
     *OneSignal Post req. with the Authorization KEY
     * @param cash the amout of an subinvoice is payed
     * @param sendUser the user send the money
     * @param userGotPayed der user der Bezahlt wird -> target
     * @param invTitel title of the invoice
     */
    pGotCash(cash: number, sendUser: string, userGotPayed: string, invTitel: string) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", 'https://onesignal.com/api/v1/notifications', true);

        const D = {
            "app_id": "43069341-3a8d-4732-a74f-4c6e2b028e70",
            "include_external_user_ids": [userGotPayed],
            "headings": {"en": "Zahltag!"},
            "contents": {"en": "Die Rechnung " + [invTitel] + " wurde beglichen. Dir wurde von " + [sendUser] + " " + [cash.toFixed(2)] + " € gesendet."},
            "data": {"foo": "bar"},
        };
        const payload = JSON.stringify(D);

        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "Basic YjY3NGZlMDUtY2M5NS00MjdlLThkZjEtYjkzNTQzMDBiNmY5");

        xhr.onreadystatechange = function () {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            }
        };
        xhr.send(payload);
    }

    /**
     * OneSignal Post req. with the Authorization KEY
     * @param groupName name of group User is added to
     * @param uid target of the Notification
     */
    pAddToGroup(groupName: string, uid: string) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", 'https://onesignal.com/api/v1/notifications', true);

        const D = {
            "app_id": "43069341-3a8d-4732-a74f-4c6e2b028e70",
            "include_external_user_ids": [uid],
            "headings": {"en": "Neue Gruppe: " + [groupName]},
            "contents": {"en": "Du wurdest zu der Gruppe " + [groupName] + " hinzugefügt."},
            "data": {"foo": "bar"},
        };
        const payload = JSON.stringify(D);

        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "Basic YjY3NGZlMDUtY2M5NS00MjdlLThkZjEtYjkzNTQzMDBiNmY5");

        xhr.onreadystatechange = function () {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            }
        };
        xhr.send(payload);
    }

    payAll(userid : string ) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", 'https://onesignal.com/api/v1/notifications', true);

        const D = {
            "app_id": "43069341-3a8d-4732-a74f-4c6e2b028e70",
            "include_external_user_ids": [userid],
            "headings": {"en": "Zahltag! "},
            "contents": {"en": [this.user.name] + " hat dir alle offenen Rechnungen bezahlt"},
            "data": {"foo": "bar"},
        };
        const payload = JSON.stringify(D);

        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "Basic YjY3NGZlMDUtY2M5NS00MjdlLThkZjEtYjkzNTQzMDBiNmY5");

        xhr.onreadystatechange = function () {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            }
        };
        xhr.send(payload);
    }

    registerWelc(valueid: string) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", 'https://onesignal.com/api/v1/notifications', true);

        const D = {
            "app_id": "43069341-3a8d-4732-a74f-4c6e2b028e70",
            "include_external_user_ids": [valueid],
            "headings": {"en": "Herzlich Willkommen!"},
            "contents": {
                "en": "Du erhälst 20 Expensive Points und kannst durch aktive Nutzung der App weitere Sammeln und Level aufsteigen. " +
                    "Finde heraus wo es weitere Punkte zu holen gibt!    "
            },
            "data": {"foo": "bar"},
            /*  "android_background_layout": {
                  "image": "src/assets/img/notific.jpg",
                  "headings_color": "#0ff0b2",
                  "contents_color": "#0ff0b2"
              },
              "small_icon": {"image": "src/assets/img/money.jpg"}*/
        };
        const payload = JSON.stringify(D);

        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "Basic YjY3NGZlMDUtY2M5NS00MjdlLThkZjEtYjkzNTQzMDBiNmY5");

        xhr.onreadystatechange = function () {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            }
        };
        xhr.send(payload);
    }

}
