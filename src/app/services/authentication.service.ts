import {Injectable} from '@angular/core';
import * as firebase from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {User} from '../models/UserModel';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {PushnService} from "./pushn.service";
import {AchievementsService} from "../achievements.service";
import {OneSignal} from "@ionic-native/onesignal/ngx";


@Injectable()
export class AuthenticateService {
    public state:boolean= false;

    /**
     * @description Constructor for Authentication-Service
     * @param onesignal
     * @param afAuth
     * @param fireStore
     * @param push
     * Injects all required services and modules
     * A new collection of Users will be connected to the according collection in cloud-firestore
     */
    constructor(private onesignal: OneSignal, public afAuth: AngularFireAuth, private fireStore: AngularFirestore, private push: PushnService) {
        this.usersCollection = fireStore.collection<User>('users');
    }


    userDoc;
    successMessage = '';
    created;
    user: User;
    usersCollection: AngularFirestoreCollection<User>;

    /**
     * @description Method to register a new account
     * @param value passes a username and a password
     * @return returns a promise whether the operation was successful or not
     * If the registration in Firebase-Authentication was successful, a new entry of type
     * User will be created in Cloud-Firestore and named with the corresponding UID.
     */
    registerUser(value): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            firebase.auth().createUserWithEmailAndPassword(value.email, value.password)
                .then(
                    res => {
                        resolve(res);
                        this.persist(AuthenticateService.copyAndPrepare(new User()), res.user.uid);
                        this.successMessage = 'Account created. Please sign in.';
                        this.created = true;
                        this.push.try(res.user.uid);
                        this.push.registerWelcome(res.user.uid);
                    },
                    err => reject(err));
        });
    }

    /**
     * Helper method to prepare a user object to persist it in cloud-firestore
     * @param user contains the user-object to prepare
     */
    private static copyAndPrepare(user: User): User {
        const copy = {...user};
        delete copy.id;
        copy.picture = copy.picture || null;
        copy.name = copy.name || null;
        return copy;
    }

    /**
     * @description Method creates a new entry in cloud-firestore of type User
     * @param user contains a new User with no values set
     * @param id contains the users UID
     * The entry in cloud-firestore will be named with the users UID
     */
    persist(user: User, id: string): void {
        this.usersCollection.doc(id).set(user);
    }

    /**
     * @description Method to update an existing users data
     * @param user contains the new data
     * @param id contains the users UID
     * Updated the entry in cloud-firestore with the corresponding UID
     */
    update(user: User, id: string): void {
        this.usersCollection.doc(id).update(user);
    }

    /**
     * @description Method to log in to an existing account
     * @param value passes a username and a password
     * @return returns a promise whether the operation was successful or not
     * Calls the sign-in method of the firebase authenticator. If the log in was successful,
     * the userdata will be retrieved from cloud-firestore and the user will be saved to the local
     * firebase storage. If the user has no profile pic set yet, a standard picture will be assigned.
     */
  loginUser(value) {
    return new Promise<any>((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(value.email, value.password)
          .then(
              res => {
               // this.userDoc = this.fireStore.doc<User>('users/' + firebase.auth().currentUser.uid);
                console.log(this.userDoc);
                this.push.try(res.user.uid);
                firebase.auth().onAuthStateChanged((user) => {
                    this.findById(firebase.auth().currentUser.uid).subscribe(u => {
                        console.log(u);

                                this.user = u;
                                if (this.user.picture == null) {
                                    this.user.picture = '../../assets/img/avatar.png';
                                }
                                console.log(u);
                                this.updateProfile(this.user);

                            });
                        });
                        resolve(res);
                    },
                    err => reject(err));
        });
    }

    /**
     * @description Method to update the read-only properties of the firebase local storage
     * @param us contains the logged in user
     * the users diplay name and photoURL will be set and stored in the firebase local storage
     */
    updateProfile(us: User) {
        firebase.auth().onAuthStateChanged((user) => {
            if (us.name) {
                user.updateProfile({
                    displayName: us.name,
                });
            }
            if (us.picture) {
                user.updateProfile({
                    photoURL: us.picture,
                });
            }
        });
    }

    /**
     * @description Method to retrieve a user from the users collection based on his UID
     * @param id contains the UID of the user
     * @return an observable with the user data retrieved from cloud-firestore
     */
    findById(id): Observable<User> {

        return this.usersCollection.doc(id).get().pipe(
            map(a => {
                const data = a.data();
                return {...data} as User;
            }));
    }

    /**
     * @description Method to log out a user
     * Calls the sign-out method of firebase authenticator. This removes the user from the firebase local storage.
     */
    logoutUser() {
        return new Promise((resolve, reject) => {
            if (firebase.auth().currentUser) {
                firebase.auth().signOut()
                    .then(() => {
                        console.log('LOG Out');
                        resolve();
                    }).catch((error) => {
                    reject();
                });
            }
        });
    }


    /**
     * @description Method to perform a google login
     * for this the scopes for email and profile will be added.
     */
    doGoogleLogin() {
        return new Promise<any>((resolve, reject) => {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            this.afAuth.auth
                .signInWithPopup(provider)
                .then(res => {
                    resolve(res);
                    this.persist(AuthenticateService.copyAndPrepare(new User()),res.user.uid);
                });
        });
    }
}
