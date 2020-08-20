import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, DocumentChangeAction} from '@angular/fire/firestore';
import {AngularFireAuth} from '@angular/fire/auth';
import * as firebase from 'firebase';
import {User} from '../models/UserModel';
import {Observable} from 'rxjs';
import {Group} from '../models/GroupModel';
import {map} from 'rxjs/operators';


@Injectable({
    providedIn: 'root'
})

/**
 * @classdesc Class with methods for User
 */
export class UserServiceService {

    usersCollection: AngularFirestoreCollection<User>;
    user: firebase.User;

    /**
     * @description Constructor for UserService
     * @param fireStore
     * @param auth
     */
    constructor(private fireStore: AngularFirestore, private auth: AngularFireAuth) {
        this.usersCollection = fireStore.collection<User>('users');
        this.auth.authState.subscribe(loguser => {
            if (loguser) {
                this.user = loguser;
            } else {
                this.user = null;
            }
        });
    }
     getCurrenUser() {
        return firebase.auth().currentUser;
     }

    /**
     * @description gets User from Firestore
     */
    getUser(): Promise<any> {
        return new Promise<any>((resolve) => {
            this.auth.authState.subscribe(loguser => {
                if (loguser) {
                    resolve(loguser);
                } else {
                    this.user = null;
                }
            });
        });
    }

    /**
     * @description Searching for a User in Firestore
     * @param id contains the UID of the user
     */
    findbyId(id: string): Observable<User> {
        return this.usersCollection.doc(id).get().pipe(
            map(a => {
                const data = a.data();
                data.id = a.id;
                return {...data} as User;
            })
        );
    }

    /**
     * @description Searching for a User in Firestore
     * @param name contains the name of User
     */
    findbyName(name: string): Observable<User[]> {
        return this.fireStore.collection('users', ref => ref.where('name', '==', name)).snapshotChanges().pipe(
            map(action => action.map(a => {
                const data = a.payload.doc.data();
                const id = a.payload.doc.id;
                return {id, ...data} as User;
            }))
        );
    }

    /**
     * @description Prepares objects of to persist in Firebase
     * @param user contains the user-object to prepare
     */
    private copyAndPrepare(user: User): User {
        const copy = {...user};
        delete copy.id;
        copy.picture = copy.picture || null;
        copy.name = copy.name || null;
        return copy;
    }


    /**
     * @description updates an existing User
     * @param user contains the new data
     */
    update(user: User) {
        return new Promise<any>((resolve, reject) => {
            this.usersCollection.doc(this.getCurrenUser().uid).update(this.copyAndPrepare(user)).then(res => {
                resolve(res);
            }, err => reject(err));
        });

    }

    /**
     * @description deletes User in Firebase
     * @param email
     * @param password
     */
    deleteUser(email, password) {
        return new Promise<any>((resolve, reject) => {
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(
                    res => {
                        this.usersCollection.doc(this.getCurrenUser().uid).delete();
                        firebase.auth().currentUser.delete();
                        resolve(res);
                    },
                    err => reject(err));
        });
    }

    /**
     * @description changes existing Email in Firebase
     * @param email
     * @param password
     * @param newemail Email which new setted
     */
    changeEmail(email, password, newemail) {
        return new Promise<any>((resolve, reject) => {
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(
                    res => {
                        firebase.auth().currentUser.updateEmail(newemail);
                        resolve(res);
                    },
                    err => reject(err));
        });
    }

    /**
     * @description changes existing password in Firebase
     * @param email
     * @param password
     * @param newpassword Password which new setted
     */
    changePassword(email, password, newpassword) {
        return new Promise<any>((resolve, reject) => {
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(
                    res => {
                        firebase.auth().currentUser.updatePassword(newpassword);
                        resolve(res);
                    },
                    err => reject(err));
        });
    }

    /**
     * @description changes existing Username in Firebase
     * @param user contains the new data
     */
    changeUsername(user: User) {
        return new Promise<any>((resolve, reject) => {
            this.update(user).then(
                res => {
                    this.updateProfile(user);
                    resolve();
                }, err => reject(err));
        });
    }

    /**
     * @description updates existing Profile in Firebase. display name and photo will be set and stored in firebase
     * @param us contains the logged in user
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


    checkUsername(name: string): Observable<{}[]> {
       return this.fireStore.collection('users', ref => ref.where('name', '==', name )).valueChanges();
    }

}
