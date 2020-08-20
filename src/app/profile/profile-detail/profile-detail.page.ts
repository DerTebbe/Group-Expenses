import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UserServiceService} from '../../services/user-service.service';
import {ActionSheetController, AlertController} from '@ionic/angular';
import {AngularFirestore} from '@angular/fire/firestore';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthenticateService} from '../../services/authentication.service';
import {ImagesService} from '../../services/images.service';
import {User} from '../../models/UserModel';
import * as firebase from 'firebase';
import {Subscription} from 'rxjs';
import {AchievementsService} from '../../achievements.service';
import {GroupService} from '../../services/group.service';


@Component({
    selector: 'app-profile-detail',
    templateUrl: './profile-detail.page.html',
    styleUrls: ['./profile-detail.page.scss'],
})

export class ProfileDetailPage implements OnInit, OnDestroy {
    userData: User = new User();
    user = this.userservice.getCurrenUser();
    isEditMode = false;
    isChangePW = false;
    image;
    credits = 0;
    lvlp: number;
    lvl: number;
    lvldec: number;
    lvlname: any;
    maxP = 100;
    zahl: number;
    UID: string;
    public add = false;
    tempuser: string;
    subscriptions: Subscription[] = [];
    photo =document.getElementsByClassName('photo') as HTMLCollectionOf<HTMLElement>;
    star1 =document.getElementsByClassName('star1') as HTMLCollectionOf<HTMLElement>;
    star2 =document.getElementsByClassName('star2') as HTMLCollectionOf<HTMLElement>;
    star3 =document.getElementsByClassName('star3') as HTMLCollectionOf<HTMLElement>;
    star4 =document.getElementsByClassName('star4') as HTMLCollectionOf<HTMLElement>;

    /**
     * @description Constructor for profile-detail page
     * @param alert
     * @param route
     * @param userservice
     * @param groupservice
     * @param fireStore
     * @param formBuilder
     * @param alertCtrl
     * @param authService
     * @param actionSheetController
     * @param imageService
     * @param points
     *
     * Injects all required services and modules
     * Gets the user from cloud-firestore by its id
     */
    constructor(private alert: AlertController,
                private route: ActivatedRoute,
                private userservice: UserServiceService,
                private groupservice: GroupService,
                private fireStore: AngularFirestore,
                private formBuilder: FormBuilder,
                private alertCtrl: AlertController,
                private authService: AuthenticateService,
                private actionSheetController: ActionSheetController,
                private imageService: ImagesService,
                private points: AchievementsService,
    ) {

        this.subscriptions.push(this.userservice.findbyId(this.route.snapshot.paramMap.get('userid')).subscribe(value => {
            this.userData = value;
            if (this.userData.picture === null) {
                this.userData.picture = '../../../assets/img/avatar.png';
            }
        }));

        this.UID = this.route.snapshot.paramMap.get('userid');
        this.points.readPoints(this.UID).then((value) => {
            this.credits = value;
            this.modulus();
        });

        this.userservice.updateProfile(this.userData);
    }

    VALIDATIONS_FORM: FormGroup;
    errorMessage = '';
    successMessage = '';


    /**
     * @description Error messages for email, username and password validation
     */
    VALIDATION_MESSAGES = {
        email: [
            {type: 'required', message: 'Email ist erforderlich.'},
            {type: 'pattern', message: 'Bitte geben Sie eine gültige Email-Adresse ein.'}
        ],
        password: [
            {type: 'required', message: 'Passwort ist erforderlich.'},
            {type: 'minlength', message: 'Passwort muss min. 6 Zeichen lang sein.'}
        ],
        username: [
            {type: 'required', message: 'Benutzername ist erforderlich.'},
            {type: 'minlength', message: 'Benutzername muss min. 3 Zeichen lang sein.'}
        ]
    };

    /**
     * @description Creates a new form and validator
     */
    ngOnInit() {
        this.VALIDATIONS_FORM = this.formBuilder.group({
            email: new FormControl('', Validators.compose([
                Validators.required,
                Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
            ])),
            password: new FormControl(''),
            confirmPW: new FormControl(''),
            oldPW: new FormControl(''),
            username: new FormControl('', Validators.compose([
                Validators.minLength(3),
                Validators.required])),
        });

        if (this.route.snapshot.paramMap.get('id')) {
            this.isEditMode = true;
            this.VALIDATIONS_FORM.controls.username.enable();
            this.VALIDATIONS_FORM.controls.email.enable();
        } else {
            this.VALIDATIONS_FORM.controls.username.disable();
            this.VALIDATIONS_FORM.controls.email.disable();
        }

    }

    /**
     * @description Method to toggle between view and edit mode
     * disables the validators in view mode
     */
    toggleEditMode() {
        if (this.isEditMode) {
            this.isEditMode = false;
            this.userData.name = this.tempuser;
            this.VALIDATIONS_FORM.controls.username.disable();
            this.VALIDATIONS_FORM.controls.email.disable();
        } else {
            this.isEditMode = true;
            this.tempuser = this.VALIDATIONS_FORM.controls.username.value;
            this.VALIDATIONS_FORM.controls.username.enable();
            this.VALIDATIONS_FORM.controls.email.enable();
        }
        this.errorMessage = '';
        if (this.isChangePW == true) {
            this.isChangePW = false;
        }
    }

    /**
     * @description Method to set the users level
     */
    setLvL() {

        switch (this.lvldec) {
            case 0:
                this.lvl = 1;
                this.lvlname = 'ein Sparfuchs.';
                this.photo[0].style.border = '6px solid rgba(186, 186, 186, .3) ';
                this.star1[0].style.color = ' rgba(255,255,0)';
                break;
            case 1:
                this.lvl = 2;
                this.lvlname = 'der Expensive Boss.';
                this.photo[0].style.border = '6px solid rgba(102, 102, 102, .5)';
                this.star1[0].style.color = ' rgba(255,255,0)';
                this.star2[0].style.color = ' rgba(255,255,0)';
                break;
            case 2:
                this.lvl = 3;
                this.lvlname = 'der Expensive Master.';
                this.photo[0].style.border = '6px solid rgba(000, 000, 000, .7)';
                this.star1[0].style.color = ' rgba(255,255,0)';
                this.star2[0].style.color = ' rgba(255,255,0)';
                this.star3[0].style.color = ' rgba(255,255,0)';
                break;
            case 3:
                this.lvl = 4;
                this.lvlname = 'der Prinz von bel air.';
                this.photo[0].style.border = '6px solid rgba(255, 255, 255, )';
                this.star1[0].style.color = ' rgba(255,255,0)';
                this.star2[0].style.color = ' rgba(255,255,0)';
                this.star3[0].style.color = ' rgba(255,255,0)';
                break;

        }
    }

    /**
     * @description Method to calculate the users level based on his points
     */
    modulus() {
        if (this.credits >= this.maxP) {
            if(this.credits % 100 === 0) {
                this.zahl = this.credits/100;
                this.lvlp = 0;
                this.credits = 0;
            } else {
                this.lvlp = 0;
                for (this.zahl = -1; this.credits >= this.maxP; this.zahl++) {
                    //this.credits = this.credits % this.maxP;
                    this.credits -= 100;
                }
               this.zahl += 1;
                this.lvlp = this.credits / this.maxP;
            }
        } else {
            console.log(this.credits);
            this.lvlp = this.credits / this.maxP;
            this.lvlp.toFixed(1);
            this.zahl = 0;
        }
        this.lvldec = this.zahl;
        this.setLvL();
    }


    /**
     * @description Method to activate the password validator if the user wants to change his password
     */
    editPW() {
        if (this.isChangePW) {
            this.VALIDATIONS_FORM.controls.password.setValidators([Validators.compose([
                Validators.minLength(6),
                Validators.required
            ])]);
        } else {
            this.VALIDATIONS_FORM.controls.password.clearValidators();
        }
    }


    ionViewWillEnter() {
        this.userservice.getUser().then(value => {
            this.user = value;
        });
        //this.user = this.userservice.getCurrenUser();
        //this.userData = this.authService.user;
    }

    /**
     * Resets the page for next usage on leave
     */
    ionViewDidLeave() {
        this.isEditMode = false;
        this.VALIDATIONS_FORM.controls.username.disable();
        this.VALIDATIONS_FORM.controls.email.disable();
        this.errorMessage = '';
        this.successMessage = '';
        this.isChangePW = false;
    }

    /**
     * @description Method will be called if the user saves his changes
     * @param value contains username, email and password from the validations-form
     * Checks if a username is already in use.
     * If the user wants to change his email or password, he needs to confirm it with his current password. This
     * is required by firebase.
     */
    toggleSave(value) {


        if (!this.isChangePW) {
            this.subscriptions.push(this.userservice.checkUsername(value.username).subscribe(items => {
                if (items.length > 0 && value.username !== this.tempuser) {
                    this.errorMessage = 'Benutzername ist bereits vergeben.';
                } else {
                    this.errorMessage = '';
                    this.userData.name = value.username;
                    this.userservice.changeUsername(this.userData).then(res => {
                        if (value.email !== this.user.email) {
                            this.confirmWithPW('Bitte geben Sie Ihr Passwort ein, um die Änderungen zu bestätigen.').then(confirm => {
                                if (confirm) {
                                    this.userservice.changeEmail(this.user.email, confirm, value.email).then(res => {
                                        this.isEditMode = false;
                                        this.errorMessage = '';
                                        this.VALIDATIONS_FORM.controls.username.disable();
                                        this.VALIDATIONS_FORM.controls.email.disable();
                                        this.successMessage = 'Änderungen gespeichert!';
                                    }, err => {
                                        this.errorMessage = err;
                                    });
                                }
                            });
                        } else {
                            this.successMessage = 'Änderungen gespeichert!';
                            this.isEditMode = false;
                            this.VALIDATIONS_FORM.controls.username.disable();
                            this.VALIDATIONS_FORM.controls.email.disable();
                        }
                    });
                }
            }));
        }

        if (this.isChangePW) {
            if (value.password !== value.confirmPW) {
                this.errorMessage = 'Passwörter stimmen nicht überein.';
            } else {
                this.userservice.changePassword(this.user.email, value.oldPW, value.password).then(res => {
                    this.isChangePW = false;
                    this.isEditMode = false;
                    this.errorMessage = '';
                    this.successMessage = 'Passwort geändert!';
                    this.VALIDATIONS_FORM.controls.username.disable();
                    this.VALIDATIONS_FORM.controls.email.disable();
                }, err => {
                    this.errorMessage = err;
                });
            }
        }

    }

    /**
     * @description Method to delete a users account
     * An account can only be deleted if he is not member of any groups
     * a password confirmation is required to delete an account
     */
    toggleDelete() {
        this.groupservice.showUserGroups().then((value) => {
           this.subscriptions.push(value.subscribe(
                group => {
                    if (group.length != 0) {
                        this.alertWindow('Profil kann nicht gelöscht werden, Sie sind noch Mitglied in ' + group.length + ' Gruppen!');
                        return;
                    }
                    this.confirmWithPW('Möchten Sie Ihr Konto wirklich löschen?').then(confirm => {
                        if (confirm) {
                            this.userservice.deleteUser(this.user.email, confirm).then(res => {
                                console.log('account deleted');
                            }, err => {
                                this.errorMessage = 'Bitte geben Sie das richtige Passwort ein!';
                            });
                        }
                    });
                }));
        });
    }


    /**
     * @description Method to sign out a user
     */
    signOut() {
        this.authService.logoutUser();
    }

    /**
     * @description Method opens a modal for password confirmation
     * @param message depending on the situation the modal is used for, the message can be vary
     */
    async confirmWithPW(message) {
        let confirmTrue: (password: string) => void;
        const promise = new Promise<string>(resolve => {
            confirmTrue = resolve;
        });
        const alert = await this.alertCtrl.create({
            header: 'Bestätigen',
            message,
            inputs: [
                {
                    name: 'password',
                    placeholder: 'Passwort',
                    type: 'password'
                }
            ],
            buttons: [
                {
                    text: 'Abbrechen',
                    role: 'cancel',
                    handler: data => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Bestätigen',
                    handler: data => {
                        confirmTrue(data.password);
                    }
                }
            ]
        });
        await alert.present();
        return promise;
    }

    /**
     * @description Method to open a popup to choose between the different image upload options
     * The user can delete an image. This will remove the corresponding link from his profile.
     * The user can take a picture with his camera
     * The user can choose an image from his gallery
     * The user can cancel this action
     */
    async presentActionSheet() {
        const actionSheet = await this.actionSheetController.create({
            header: 'Profilfoto',
            buttons: [{
                text: 'Löschen',
                role: 'destructive',
                icon: 'trash',
                handler: () => {
                    this.userData.picture = null;
                    this.authService.updateProfile(this.userData);
                    this.authService.update(this.userData, firebase.auth().currentUser.uid);
                    console.log('Delete clicked');
                }
            }, {
                text: 'Foto aufnehmen',
                icon: 'camera',
                handler: () => {
                    this.imageService.uploadTakenPicture('profilePicture', firebase.auth().currentUser.uid,
                        'ProfilePictures', 'profile', this.userData, null, null).then(res => {
                        console.log(res);
                        this.isEditMode = false;
                    });
                    console.log('take clicked');
                }
            }, {
                text: 'Foto auswählen',
                icon: 'share',
                handler: () => {
                    this.imageService.getImages('profilePicture', firebase.auth().currentUser.uid,
                        'ProfilePictures', 'profile', this.userData, null, null);
                    console.log('choose clicked');
                    this.isEditMode = false;
                }
            }, {
                text: 'Abbrechen',
                icon: 'close',
                role: 'cancel',
                handler: () => {
                    console.log('Cancel clicked');
                }
            }]
        });
        await actionSheet.present();
    }

    /**
     * @description Method to show an alert window with a message
     * @param message the message to be shown on the window
     */
    async alertWindow(message: string) {
        const alert = await this.alertCtrl.create({
            message,
            buttons: [{
                text: 'OK'
            }]
        });
        await alert.present();
    }


    ngOnDestroy() {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        });
    }


}
