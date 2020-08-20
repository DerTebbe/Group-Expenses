import {Injectable} from '@angular/core';
import {Invoice} from '../models/InvoiceModel';
import {AngularFirestore, AngularFirestoreCollection, DocumentChangeAction} from '@angular/fire/firestore';
import {subInvoice} from "../models/subInvoice";
import {User} from "../models/UserModel";
import {Observable} from "rxjs";
import {map} from 'rxjs/operators';
import {UserServiceService} from "./user-service.service";
import {PushnService} from "./pushn.service";
import {AchievementsService} from "../achievements.service";


@Injectable({
    providedIn: 'root',
})

/**
 * @classdesc Class which offers all methods for CRUD operations concerning invoices
 */

export class InvoiceService {
    public catecoriesCollection: AngularFirestoreCollection<string>;
    public invoiceCollection: AngularFirestoreCollection<Invoice>;
    public invoiceList: Observable<Invoice[]>;

    constructor(private afs: AngularFirestore, private userService: UserServiceService, private localnotifications: PushnService, private achievementService: AchievementsService) {
        this.catecoriesCollection = afs.collection<string>('kategorien');
    }

    /**
     * @description Prepares objects of type invoice to be persisted in Firebase cloud firestore
     * @param invoice Invoice object needing to be prepared
     */

    static copyAndPrepare(invoice: Invoice) {
        return {
            titel: invoice.titel,
            betrag: invoice.betrag,
            zahlerID: invoice.zahler.id,
            datum: invoice.datum,
            beschreibung: invoice.beschreibung,
            isIncome: invoice.isIncome,
            kategorie: invoice.kategorie,
            bildLink: invoice.bildLink,
        };
    }

    /**
     * @description Prepares objects of type subInvoice to be persisted in Firebase cloud firestore
     * @param subInvoice subInvoice object needing to be prepared
     */

    static copyAndPrepareSingleSubInvoice(subInvoice: subInvoice) {
        return {
            userDerBezahlenMussID: subInvoice.userDerBezahlenMuss.id,
            userDerBezahltHatID: subInvoice.userDerBezahltHat.id,
            betrag: subInvoice.betrag
        };
    }

    /**
     * @description Searches for all categories in the Firebase cloud firestore
     */

    findAllCategories(): Observable<string[]> {
        const changeActions: Observable<DocumentChangeAction<string>[]> =
            this.catecoriesCollection.snapshotChanges();
        return changeActions.pipe(
            map(actions => actions.map(a => {
                return a.payload.doc.data();
            })));
    }

    /**
     * @description Saves an invoice in the Firebase cloud firestore
     * @param groupID UID of group that created the invoice
     * @param invoice invoice-object needing to be saved
     */

    persist(groupID: string, invoice: Invoice): void {
        let userID: string;
        this.userService.getUser().then((value) => {
            userID = value.uid;
            this.afs.collection<{}>('group/' + groupID + '/invoices').add(
                InvoiceService.copyAndPrepare(invoice)
            ).then((ref) => {
                for (let i = 0; i < invoice.subInvoices.length; i++) {
                    this.afs.collection<{}>('group/' + groupID + '/invoices/' + ref.id + '/subInvoices').add(
                        InvoiceService.copyAndPrepareSingleSubInvoice(invoice.subInvoices[i])
                    ).then(() => {
                        console.log('Hat geklappt!');
                    }).catch((error) => {
                        console.log('Fehlermeldung: ' + error);
                    });
                }
                //this.localnotifications.newInvoice();
                //this.achievementService.getPoints(userID);
            }).catch(error => {
                console.log('Fehlermeldung: ' + error);
            });
        });
    }

    /**
     * @description Updates a modified invoice in the Firebase cloud firestore
     * @param groupID UID of group that updated the invoice
     * @param invoice Invoice needing to be updated
     */

    update(groupID: string, invoice: Invoice): void {
        this.afs.collection<{}>('group/' + groupID + '/invoices').doc(invoice.id).update(
            InvoiceService.copyAndPrepare(invoice)
        ).then(() => {
            console.log('Update läuft!');
        }).catch(error => {
            console.log('Fehlermeldung: ' + error);
        });
    }

    /**
     * @description Searches for all invoices of one specific group
     * @param groupID UID of group whose invoices is searched for
     */

    async findAll(groupID: string) {
        const invoices: Invoice[] = [];
        let temp: Invoice[];
        let groupMembers: User[];

        groupMembers = await this.getGroupMembers(groupID);
        temp = await this.getInvoices(groupID, groupMembers);
        for (const invoice of temp) {
            invoice.subInvoices = await this.getSubInvoices(groupID, invoice.id, groupMembers);
            invoices.push(invoice);
        }
        return invoices;
    }

    /**
     * @description Fetches all members of a group, which are needed for calculating the subInvoices
     * @param groupID UID of group whose invoices is searched for
     */

    getGroupMembers(groupID: string): Promise<User[]> {
        return new Promise<User[]>((resolve) => {
            this.afs.collection('group').doc(groupID).get().subscribe(async (doc) => {
                const userData = doc.data().member;
                let users: User[] = [];
                for (let user of userData) {
                    const zw = await this.getGroupMember(user.id);
                    users.push(zw)
                }
                resolve(users);
            });
        });
    }

    /**
     * @description Fetches a specific user from Firebase cloud firestore
     * @param id --> UID of user who is searched for
     */

    getGroupMember(id: string): Promise<User> {
        return new Promise<User>((resolve) => {
            this.userService.findbyId(id).subscribe((value) => {
                const img = value.picture ? value.picture : '../../../assets/img/avatar.png';
                resolve(new User(value.id, value.name, img))
            });
        });
    }

    /**
     * @description Fetches all invoices from a specific group
     * @param groupID --> UID of group, whose invoices shall be fetched
     * @param groupMembers Members of the group
     */

    getInvoices(groupID: string, groupMembers: User[]): Promise<Invoice[]> {
        const invoices: Invoice[] = [];
        return new Promise<Invoice[]>((resolve) => {
            this.afs.collection('group/' + groupID + '/invoices').get().subscribe((querySnapshot) => {
                querySnapshot.forEach(async (doc) => {
                    let zahler: User;
                    for (let user of groupMembers) {
                        if (user.id == doc.data().zahlerID) {
                            zahler = user;
                        }
                    }
                    invoices.push(new Invoice(
                        doc.id,
                        doc.data().titel,
                        doc.data().betrag,
                        zahler,
                        doc.data().datum.toDate(),
                        doc.data().beschreibung,
                        doc.data().isIncome,
                        doc.data().kategorie,
                        groupMembers,
                        doc.data().bildLink,
                    ));
                });
                resolve(invoices);
            });
        });
    }

    /**
     * @description Fetches all subInvoices from a specific invoice
     * @param groupID UID of group, whose invoices shall be fetched
     * @param invoiceID UID of invoice, whose subInvoices shall be fetched
     * @param groupMembers Members of the group
     */

    getSubInvoices(groupID: string, invoiceID: string, groupMembers: User[]): Promise<subInvoice[]> {
        const subinvoices: subInvoice[] = [];
        return new Promise<subInvoice[]>((resolve) => {
            this.afs.collection('group/' + groupID + '/invoices/' + invoiceID + '/subInvoices').get().subscribe((querySnapshot) => {
                querySnapshot.forEach(async (doc) => {
                    let userDerBezahltHat: User;
                    let userDerBezahlenMuss: User;
                    for (let user of groupMembers) {
                        if (user.id == doc.data().userDerBezahlenMussID) {
                            userDerBezahlenMuss = user;
                        }else if (user.id == doc.data().userDerBezahltHatID) {
                            userDerBezahltHat = user;
                        }
                    }
                    let zw: subInvoice = new subInvoice(
                        userDerBezahlenMuss,
                        userDerBezahltHat,
                        doc.data().betrag
                    );
                    zw.id = doc.id;
                    subinvoices.push(zw);
                });
                resolve(subinvoices);
            });
        });
    }

    /**
     * @description Observes invoice-subcollection of a specific group
     * @param groupID UID of group, whose invoice-subcollection shall be observed
     */

    subscribeToInvoices(groupID: string): Observable<Invoice[]> {
        this.invoiceCollection = this.afs.collection('group/' + groupID + '/invoices');
        this.invoiceList = this.invoiceCollection.valueChanges();
        return this.invoiceList;
        /*const changeActions: Observable<DocumentChangeAction<{}>[]> = this.afs.collection('group/' + groupID + '/invoices').snapshotChanges();
        return changeActions.pipe(
            map(actions => actions.map(() => {
                return new Invoice();
            }))); */
    }

    /**
     * @description Observes subInvoice-subcollection of a specific invoice
     * @param groupID UID of group whose subInvoices shall be observed
     * @param invoices Invoicesof group, whose subInvoice-collection shall be observed.
     */

    subscribeToSubInvoices(groupID: string, invoices: Invoice[]): Observable<{}>[] {
        const subscribtions: Observable<{}>[] = [];
        for (const invoice of invoices) {
            const changeActions: Observable<DocumentChangeAction<{}>[]> = this.afs.collection('group/' + groupID + '/invoices/' + invoice.id + '/subInvoices').snapshotChanges();
            subscribtions.push(changeActions.pipe(
                map(actions => actions.map(() => {
                    return null;
                }))));
        }
        return subscribtions;
    }

    /**
     * @description Fetches a specific invoice from Firebase cloud firestore
     * @param groupID UID of group, where the invoice is saved
     * @param id UID of invoice, who shall be fetched
     */

    findById(groupID: string, id: string): Promise<Invoice> {
        return new Promise<Invoice>((resolve) => {
            this.findAll(groupID).then((value) => {
                for (const invoice of value) {
                    if (invoice.id === id) {
                        resolve(invoice);
                    }
                }
            })
        })
    }

    /**
     * @description Checks if invoice can be safely deleted
     * @param groupID UID of group, where the invoice is saved
     * @param invoice Invoice that shall be deleted
     */

    delete(groupID: string, invoice: Invoice): boolean {
        if (invoice.subInvoices.length !== 0) {
            return false;
        } else {
            this.deleteInvoice(groupID, invoice.id);
            return true;
        }
    }

    /**
     * @description Deletes an invoice from Firebase cloud firestore
     * @param groupID UID of group, where the invoice is saved
     * @param InvoiceID UID of invoice that shall be deleted
     */

    deleteInvoice(groupID: string, InvoiceID: string) {
        this.afs.collection('group/' + groupID + '/invoices').doc(InvoiceID).delete().then(() => {
            console.log('Löschen hat funktioniert!');
        }).catch((error) => {
            console.log('Fehlermeldung: ' + error);
        });
    }

    /**
     * @description Deletes a subInvoice from Firebase cloud firestore
     * @param groupID UID of group, where the invoice is saved
     * @param invoiceID UID of invoice where the subInvoice is saved
     * @param subInvoiceID UID of subInvoice that shall be deleted
     */

    deleteSubInvoice(groupID: string, invoiceID: string, subInvoiceID: string): Promise<any> {
        return new Promise<any>((resolve) => {
            this.afs.collection('group/' + groupID + '/invoices/' + invoiceID + '/subInvoices').doc(subInvoiceID).delete().then(() => {
                console.log('SubInvoice gelöscht!');
                resolve();
            }).catch((error) => {
                console.log('Fehlermeldung: ' + error);
            });
        });
    }

    /**
     * @description Prepares objects of type invoice to be persisted as a periodic invoice in Firebase cloud firestore
     * @param invoice Invoice needing to be prepared
     */

    static copyAndPrepareSavedInvoice(invoice: Invoice): {} {
        return {
            titel: invoice.titel,
            betrag: invoice.betrag,
            istEinkommen: invoice.isIncome,
            beschreibung: invoice.beschreibung,
            kategorie: invoice.kategorie
        }
    }

    /**
     * @description Saves a periodic invoice in Firebase cloud firestore
     * @param groupID UID of group, that created the periodic invoice
     * @param invoice Periodic invoice that shall be saved
     */

    persistSavedInvoice(groupID: string, invoice: Invoice) {
        this.afs.collection<{}>('group/' + groupID + '/savedInvoices').add(
            InvoiceService.copyAndPrepareSavedInvoice(invoice)
        ).then((ref) => {
            console.log("Invoice ist hinterlegt!")
        }).catch(error => {
            console.log('Fehlermeldung: ' + error);
        });
    }

    /**
     * @description Fetches all periodic invoices of a specific group
     * @param groupID UID of group whose periodic invoices shall be fetched
     */

    getSavedInvoice(groupID: string): Observable<Invoice[]> {
        let invoiceCollection: AngularFirestoreCollection<Invoice> = this.afs.collection('group/' + groupID + '/savedInvoices');
        const changeActions: Observable<DocumentChangeAction<Invoice>[]> = invoiceCollection.snapshotChanges();
        return changeActions.pipe(
            map(actions => actions.map(a => {
                const data = a.payload.doc.data();
                return {...data} as Invoice;
            })));
    }

    /**
     * @description Deletes all saved periodic invoices from Firebase cloud firestore
     * @param groupID UID of group whose periodic invoices shall be deleted
     */

    deleteAllSavedInvoices(groupID: string) {
        let collection = this.afs.collection('group/' + groupID + '/savedInvoices');
        collection.get().subscribe((value) => {
            value.forEach((doc) => {
                collection.doc(doc.id).delete().then(() => {
                    console.log('SavedInvoice gelöscht!')
                })
            })
        })
    }

    /**
     * @description Deletes all invoices of a group from Firebase cloud storage
     * @param groupID UID of group whose invoices shall be deleted
     */

    deleteAllInvoices(groupID: string) {
        let collection = this.afs.collection('group/' + groupID + '/invoices');
        collection.get().subscribe((value) => {
            value.forEach((doc) => {
                collection.doc(doc.id).delete().then(() => {
                    console.log('Alle Invoices gelöscht!');
                })
            })
        })
    }
}
