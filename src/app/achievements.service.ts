import { Injectable } from '@angular/core';
import * as firebase from "firebase";


@Injectable({
  providedIn: 'root'
})
export class AchievementsService {
    // public  totalcount:any[]=[];
    snapshot: number;
    public credit: any;
    public testpoints = 200;
    public totalcount=[];
    public  foto:string[]=[];

    constructor() {

    }

    /**
     * Google Transactions - for more informations
     * @param userid User get the Points
     * When getPints() - recent ponits get merged with the amount of new points
     */
    getPoints(userid: string) {
        let db = firebase.firestore();
        let increment = firebase.firestore.FieldValue.increment(5);
        let pointsRef = db.collection('/users/' + userid + '/points').doc('credits');
        const batch = db.batch();
        batch.set(pointsRef, {counter: increment}, {merge: true});
        batch.commit();
        console.log();
    }
    /**
     * Google Transactions - for more informations
     * @param userid User get the Points
     * When welcomePoints() - recent ponits get merged with the amount of new points
     */
    welcomePoints(userid: string) {
        let db = firebase.firestore();
        let increment = firebase.firestore.FieldValue.increment(20);
        let pointsRef = db.collection('/users/' + userid + '/points').doc('credits');
        const batch = db.batch();
        batch.set(pointsRef, {counter: increment}, {merge: true});
        batch.commit();
        console.log();
    }

    getLevel(userid: string) {
        let db = firebase.firestore();
        let increment = firebase.firestore.FieldValue.increment(1);
        let pointsRef = db.collection('/users/' + userid + '/level').doc('lvl');
        const batch = db.batch();
        batch.set(pointsRef, {level: increment}, {merge: true});
        batch.commit();
        console.log();
    }

    testPoints(userid: string) {



    }

    /**
     * When getPints() - recent ponits get merged with the amount of new points
     * @param UID id of User which points should be red out of firebase
     * return  the number of points
     */
   readPoints(UID: string): Promise<number> {
       return new Promise<number>((resolve) => {
           firebase.firestore().collection('users/' + UID + '/points').doc('credits').get()
               .then((doc) => {
                   resolve(doc.data().counter);
               })
               .catch(err => console.log(err))
       })
   }

}


