import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {NavController} from '@ionic/angular';
import {AuthenticateService} from '../../services/authentication.service';
import {PushnService} from '../../services/pushn.service';
import {AchievementsService} from '../../achievements.service';


@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})

/**
 * @description Constructor for Login-Page
 * Injects all Services and Modules
 */
export class LoginPage implements OnInit {
    constructor(
        private push: PushnService,
        private navCtrl: NavController,
        private authService: AuthenticateService,
        private formBuilder: FormBuilder,
        private achieve: AchievementsService
    ) {
    }

    VALIDATIONS_FORM: FormGroup;
    errorMessage = '';
    successMessage = '';

    /**
     * @description Error messages for email and password validation
     */
  VALIDATION_MESSAGES = {
    email: [
      { type: 'required', message: 'Email ist erforderlich.' },
      { type: 'pattern', message: 'Bitte gebe eine gültige Email ein.' }
    ],
    password: [
      { type: 'required', message: 'Passwort ist erforderlich.' },
      { type: 'minlength', message: 'Passwort muss min. 5 Zeichen lang sein.' }
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
            password: new FormControl('', Validators.compose([
                Validators.minLength(5),
                Validators.required
            ])),
        });
    }

    /**
     * Sets a success-message if an account was successfully created and user was forwarded to login-page
     */
    ionViewDidEnter() {
        if (this.authService.created) {
            this.successMessage = this.authService.successMessage;
            this.errorMessage = '';
        }
    }


    /**
     * @description Method to sign in a user
     * @param value contains the username and password
     * Method calls the login-method of the authentication service and forwards the user to
     * the group-list page on successful login
     */
    loginUser(value) {
        this.authService.loginUser(value)
            .then(res => {
                console.log(res);
                this.push.refreshExternalID();
                this.errorMessage = '';
                this.navCtrl.navigateForward('/group-list');
            }, err => {
                this.errorMessage = err.message;
            });
    }

    /**
     * Navigates to register page
     */
    goToRegisterPage() {
        this.navCtrl.navigateForward('/register');
    }

    /**
     * @description Method provides Google-Login.
     * Method calls the google-login method of the authentication-service and forwards the user to
     * the group-list page on successful login.
     */
    doGoogleLogin() {
        console.log('test');
        this.authService.doGoogleLogin()
            .then(res => {
                console.log(res);
                this.navCtrl.navigateForward('/group-list');
            }, err => {
                console.log(err);
            });
    }
}
