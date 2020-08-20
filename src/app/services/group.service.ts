import {Injectable} from '@angular/core';
import {Group} from '../models/GroupModel';
import {Observable, Subscription} from 'rxjs';
import {AngularFirestore, AngularFirestoreCollection, DocumentChangeAction} from '@angular/fire/firestore';
import {map} from 'rxjs/operators';
import {UserServiceService} from './user-service.service';
import {User} from '../models/UserModel';
import {InvoiceService} from "./invoice.service";
import {PushnService} from "./pushn.service";

@Injectable({
    providedIn: 'root'
})


/**
 * @classdesc  Class which offers all methods for CRUD operations concerning groups
 */
export class GroupService {

    public group: Group[];
    public groupCollection: AngularFirestoreCollection<Group>;
    public userGroups: AngularFirestoreCollection<Group>;
    public sub: Subscription;

    /**
     * @desc Prepares objects of type group to be persisted in Firebase cloud firestore
     * @param group Group object needing to be prepared
     */
    static copyAndPrepare(group: Group): Group {
        const copy = {...group};
        delete copy.id;
        copy.id = copy.id || null;
        copy.typ = copy.typ || null;
        // copy.member = copy.member || null;
        copy.date = copy.date || null;
        copy.bildLink = copy.bildLink || null;
        return copy;
    }

    /**
     * @desc Define path of the collection groups should be saved to and inject the objects needed
     * @param push Send push notifications when creating or updating a group
     * @param afs Access Firebase collections
     * @param userservice Fetch user data from Firebase
     * @param invoiceService Fetch invoice data from Firebase
     * @param localnotification Send local notifications when creating a group
     */
    constructor(private push: PushnService, private afs: AngularFirestore, private userservice: UserServiceService, private invoiceService: InvoiceService, private localnotification:PushnService) {
        this.groupCollection = afs.collection<Group>('group');
    }


    /**
     * @desc Saves a group to the Firebase cloud firestore
     * @param group Group object needing to be saved
     */
    persist(group: Group): void {
        this.userservice.getUser().then((value => {
           this.sub = this.userservice.findbyId(value.uid).subscribe(
               doc => {
                   group.member.push(doc);
                   let groupId: string;
                   this.groupCollection.add(GroupService.copyAndPrepare(group)).then(ref => {
                       groupId = ref.id;
                       this.userservice.getUser().then((value => {

                           this.userGroups = this.afs.collection<Group>('users/' + value.uid + '/groups');
                           this.userGroups.doc(groupId).set(GroupService.copyAndPrepare(group));

                       }));
                       for (let i = 0; i < group.member.length ; i++) {
                           this.userGroups = this.afs.collection<Group>('users/' + group.member[i].id + '/groups');
                           this.userGroups.doc(groupId).set(GroupService.copyAndPrepare(group));
                           this.push.pAddToGroup(group.name,group.member[i].id);
                       }
                   });
               }
           );
                this.localnotification.addToGroup();}

        ));

    }

    /**
     * @desc Updates a modified group in the Firebase cloud firestore
     * @param group Group needing to be updated
     * @param memberAdded Indicates if a member was added to the group
     */

    update(group: Group, memberAdded: boolean): void {
        this.groupCollection.doc(group.id).update(GroupService.copyAndPrepare(group));
        if (memberAdded) {
            const user: User = group.member[group.member.length - 1];
            this.push.pAddToGroup(group.name,user.id);
            // Prüfung ob User existiert erfolgt auf group-detail page
            this.userservice.findbyName(user.name).subscribe(item => {
                this.userGroups = this.afs.collection<Group>('users/' + item[0].id + '/groups');
                this.userGroups.doc(group.id).set(GroupService.copyAndPrepare(group));
            });
        }

        for (let i = 0; i < group.member.length ; i++) {
            this.userGroups = this.afs.collection<Group>('users/' + group.member[i].id + '/groups');
            this.userGroups.doc(group.id).update(GroupService.copyAndPrepare(group));
        }
    }

    /**
     * @desc This method is needed besides update() to remove the group from the group subcollection of a user where all groups the usesr belongs to are saved
     * @param userid UID of the user have been removed
     * @param groupid UID of the group from which the user has been removed
     */

    removeMember(userid: string, groupid: string){
        this.userGroups = this.afs.collection<Group>("users/" + userid +"/groups");
        this.userGroups.doc(groupid).delete();
    }


    /**
     * @desc Searches for a group in the Firebase cloud firestore by a given UID
     * @param id UID of the group
     * @return Observable of type 'Group' representing the data fetched from Firebase cloud firestore
     */

    find(id: string): Observable<Group> {
        return this.groupCollection.doc(id).get().pipe(
            map(a => {
                const data = a.data();
                data.date = data.date.toDate();
                data.id = a.id;
                return {...data} as Group;
            })
        );
    }

    /**
     * @desc Deletes a group from Firebase cloud firestore (from /group collection and from all subcollections in users)
     * @param group
     */

    deleteGroup(group: Group) {
        this.invoiceService.deleteAllSavedInvoices(group.id);
        this.invoiceService.deleteAllInvoices(group.id);
        for (let i = 0; i < group.member.length ; i++) {
            this.removeMember(group.member[i].id, group.id)
        }
        this.groupCollection.doc(group.id).delete();
    }

    /**
     * @desc Fetches all the groups of the logged in user
     */

    showUserGroups(): Promise<Observable<Group[]>> {
        return new Promise<Observable<Group[]>>((resolve) => {
            this.userservice.getUser().then((value) => {
                this.userGroups = this.afs.collection<Group>('users/' + value.uid + '/groups');
                const changeActions: Observable<DocumentChangeAction<Group>[]> = this.userGroups.snapshotChanges();
                resolve(changeActions.pipe(
                    map(actions => actions.map(a => {
                        const data = a.payload.doc.data();
                        data.id = a.payload.doc.id;
                        return {...data} as Group;
                    }))));
            });
        });
    }
}

