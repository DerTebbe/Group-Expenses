import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {NavController} from '@ionic/angular';
import {AuthenticateService} from '../../services/authentication.service';
import {PushnService} from "../../services/pushn.service";
import {AchievementsService} from "../../achievements.service";



@Component({
    selector: 'app-register',
    templateUrl: './register.page.html',
    styleUrls: ['./register.page.scss'],
})


export class RegisterPage implements OnInit {
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
      { type: 'minlength', message: 'Passwort muss min. 6 Zeichen lang sein.' }
    ]
  };

    /**
     * @description Constructor for Login-Page
     * Injects all Services and Modules
     */
  constructor(
      private navCtrl: NavController,
      private authService: AuthenticateService,
      private formBuilder: FormBuilder,
      private push: PushnService,
      private points: AchievementsService
  ) {}

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
                Validators.minLength(6),
                Validators.required
            ])),
            confirmPW: new FormControl('')
        });
    }

    /**
     * @description Method to register a new user
     * @param value contains username, password and confirm-password from the validations-form
     * Method calls the register-method of the authentication-service and forwards the user to the login-page if an
     * account was successfully created.
     */
  tryRegister(value) {
    if (value.password !== value.confirmPW) {
      console.log('pass not same');
      this.errorMessage = 'Passwords do not match.';
    } else {
    this.authService.registerUser(value)
        .then(res => {
            console.log(value);
          console.log(res);
          this.errorMessage = '';
          this.successMessage = 'Konto wurde erstellt. Bitte logge dich ein';
          this.navCtrl.navigateForward('/login');
        }, err => {
          console.log(err);
          this.errorMessage = err.message;
          this.successMessage = '';
        });
    }
  }

    goLoginPage() {
        this.navCtrl.navigateBack('');
    }

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
