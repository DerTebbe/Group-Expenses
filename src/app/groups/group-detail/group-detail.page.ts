import {Component, OnDestroy, OnInit} from '@angular/core';
import {GroupService} from '../../services/group.service';
import {Group} from '../../models/GroupModel';
import {User} from '../../models/UserModel';
import {ActionSheetController, AlertController, IonInput} from '@ionic/angular';
import {UserServiceService} from '../../services/user-service.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ImagesService} from '../../services/images.service';
import {InvoiceService} from '../../services/invoice.service';
import {Subscription} from "rxjs";

@Component({
    selector: 'app-group-detail',
    templateUrl: './group-detail.page.html',
    styleUrls: ['./group-detail.page.scss'],
})
export class GroupDetailPage implements OnInit, OnDestroy {
    group = new Group([]);
    members: User[] = [];
    editMode: boolean = false;
    groupId: string;
    types: string [] = ['Urlaub', 'WG', 'Festival'];
    showloading: boolean = true;
    subs: Subscription[] = [];


    /**
     * @desc Inject all needed objects and fetches the group from Firebase cloud firestore
     * @param router Navigate within the app
     * @param route Get URL parameters
     * @param alertcontroller Show alerts
     * @param userservice Fetch user data from Firebase
     * @param invoiceservice Fetch invoice data from Firebase (for deletion check)
     * @param groupservice Fetch group data from Firebase
     * @param actionSheetController Show action sheet for image upload
     * @param imageService Store images in Firebase
     */
    constructor(private router: Router, private route: ActivatedRoute,
                private alertcontroller: AlertController,
                private userservice: UserServiceService,
                private invoiceservice: InvoiceService,
                private groupservice: GroupService,
                private actionSheetController: ActionSheetController,
                private imageService: ImagesService) {
        this.groupId = this.route.snapshot.paramMap.get('groupID');

        this.subs.push(this.groupservice.find(this.groupId).subscribe(item => {
            this.group = item;
            if (this.group.bildLink === null) {
                this.group.bildLink = '../../../assets/img/avatar.png';
            }
            for (let i = 0; i < this.group.member.length; i++) {
                this.subs.push(this.userservice.findbyId(this.group.member[i].id).subscribe(item => {
                    item.picture = item.picture ? item.picture : '../../../assets/img/avatar.png';
                    this.members.push(item);
                }));
            }
            this.showloading = false;
            this.group.member = this.members;
            if (this.types.indexOf(this.group.typ) === -1) {
                this.types.push(this.group.typ);
            }
        }));
    }

    /**
     * @desc Handles update of the group
     */
    save() {
        this.editMode = false;
        this.groupservice.update(this.group, false);
    }


    /**
     * @desc Handles the removement of a user
     * @param userId UID of the user needed to be removed
     */
    removeMember(userId: string) {
        this.invoiceservice.findAll(this.groupId).then((value) => {
            for (let invoice of value ){
                for (let subinvoice of invoice.subInvoices){
                    if (userId == subinvoice.userDerBezahltHat.id || userId == subinvoice.userDerBezahlenMuss.id){
                        this.alert("Mitglied kann nicht entfernt werden, da es noch an offenen Rechnungen beteiligt ist");
                        return;
                    }
                }
            }
            this.group.member.forEach((item, index) => {
                if (item.id === userId) {
                    this.group.member.splice(index, 1);
                }
            });
            this.groupservice.update(this.group, false);
            this.groupservice.removeMember(userId, this.groupId);
        });
    }

    toggleEdit() {
        this.editMode = this.editMode != true;
    }

    /**
     * @desc Presents alert window when removing a user
     * @param user User object of the user needed to be removed
     */
    async remove(user: User) {
        const alert = await this.alertcontroller.create({
            header: 'Mitglied entfernen',
            message: 'Bist Du sicher, dass Du ' + user.name + ' aus der Gruppe entfernen möchtest?',
            buttons: [
                {
                    text: 'Abbrechen',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {
                    }
                }, {
                    text: 'Entfernen',
                    handler: () => {
                        this.removeMember(user.id);
                    }
                }
            ]
        });
        await alert.present();
    }

    /**
     * @desc Handles the deletion of the group
     */
    deleteGroup() {
        this.invoiceservice.findAll(this.groupId).then((value) => {
            for (let i = 0; i < value.length; i++) {
                if (value[i].subInvoices.length != 0) {
                    this.alert('Die Gruppe kann nicht gelöscht werden, es gibt noch offene Rechnungen!');
                    return;
                }
            }
            this.editMode = false;
            this.groupservice.deleteGroup(this.group);
            this.router.navigate(['group-list']);
        });
    }

    /**
     * @desc Presents an alert window to confirm the deletion of the group
     */
    async deleteWindow(){
        const alert = await this.alertcontroller.create({
            header: 'Löschen',
            message: 'Bist Du sicher, dass Du die Gruppe "' + this.group.name + '" löschen willst?',
            buttons: [
                {
                    text: 'Abbrechen',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {
                    }
                }, {
                    text: 'Löschen',
                    handler: () => {
                        this.deleteGroup();
                    }
                }
            ]
        });
        await alert.present();
    }

    /**
     * @desc Presents an alert window to add members to the group
     */
    async addMember() {
        const alert = await this.alertcontroller.create({
            header: 'Mitglied hinzufügen',
            message: 'Bitte gib den Benutzernamen des neuen Gruppenmitglieds ein',
            inputs: [
                {
                    name: 'newMember',
                    type: 'text',
                    placeholder: 'z.B. maxmuster'
                }
            ],
            buttons: [
                {
                    text: 'Hinzufügen',
                    handler: data => {
                        console.log(data.newMember);
                        let flag: boolean = true;
                        this.subs.push(this.userservice.findbyName(data.newMember).subscribe(item => {
                            console.log(item);
                            if (item.length > 0) {
                                for (let i = 0; i < this.group.member.length; i++) {
                                    if (this.group.member[i].id == item[0].id) {
                                        this.addMessage('Benutzer ist bereits Mitglied deiner Gruppe');
                                        flag = false;
                                    }
                                }
                                if (flag) {
                                    this.group.member.push(item[0]);
                                    this.groupservice.update(this.group, true);
                                    this.addMessage('Benutzer erfolgreich hinzugefügt');
                                    console.log(this.group.member);
                                }
                            } else {
                                this.addMessage('Benutzername existiert nicht. Bitte versuch es mit einem anderen Benutzernamen oder vielleicht hast Du dich vertippt?');
                                console.log('User does not exist');
                            }
                        }));
                    }
                }
            ]
        });
        await alert.present();
    }


    /**
     * @desc Presents alert window with information about the addMember process
     * @param message Message should be displayed
     */
    async addMessage(message) {
        const alert = await this.alertcontroller.create({
            header: 'Rückmeldung',
            message: message,
            buttons: [{
                text: 'OK'
            }]
        });
        await alert.present();
    }

    ngOnInit() {
        setTimeout(() => {
            if (this.showloading) {
                this.alert("Das Laden deiner Gruppe dauert ungewöhnlich lange. Prüfe deine Netzwerkverbindung.")
            }
        },10000)

    }

    ionViewDidEnter() {
        this.members = [];
        for (let i = 0; i < this.group.member.length; i++) {
            this.subs.push(this.userservice.findbyId(this.group.member[i].id).subscribe(item => {
                item.picture = item.picture ? item.picture : '../../../assets/img/avatar.png';
                this.members.push(item);
            }));
        }
        this.group.member = this.members;
    }

    /**
     * @desc Presents alert window to add an own type for the group
     * @param selectedValue Value selected from the selector
     */
    async addType(selectedValue: any) {
        console.log('add');
        if (selectedValue.value !== 'own') {
            return;
        }
        const alert = await this.alertcontroller.create({
            header: 'Typ hinzufügen',
            inputs: [
                {
                    name: 'Typ',
                    placeholder: 'Typ'
                },
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
                    text: 'Hinzufügen',
                    handler: data => {
                        if (data.Typ !== '') {
                            this.types.push(data.Typ);
                            this.group.typ = data.Typ;
                        }
                    }
                }
            ]
        });
        await alert.present();
    }

    /*
    Methods to navigate with the tab bar
     */

    invoiceList() {
        this.router.navigate(['invoice-list', {groupID: this.groupId}]);
    }

    balances() {
        this.router.navigate(['personal-balances', {groupID: this.groupId}]);
    }

    statsPage() {
        this.router.navigate(['statistics', this.groupId]);
    }

    groupHome() {
        this.router.navigate(['group-list']);
    }

    /**
     * @desc Presents an action sheet for adding a picture for the group
     */
    async presentActionSheet() {
        const actionSheet = await this.actionSheetController.create({
            header: 'Gruppenbild',
            buttons: [{
                text: 'Löschen',
                role: 'destructive',
                icon: 'trash',
                handler: () => {
                    this.group.bildLink = null;
                    this.groupservice.update(this.group, false);
                }
            }, {
                text: 'Foto erstellen',
                icon: 'camera',
                handler: () => {
                    this.imageService.uploadTakenPicture('groupPicture', this.groupId,
                        'GroupPictures', 'group', null, this.group, null).then(res => {
                        console.log(res);
                        this.editMode = false;
                    });
                    console.log('take clicked');
                }
            }, {
                text: 'Foto auswählen',
                icon: 'share',
                handler: () => {
                    this.imageService.getImages('groupPicture', this.groupId,
                        'GroupPictures', 'group', null, this.group, null);
                    console.log('choose clicked');
                    this.editMode = false;
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
     * @desc Presents an alert window for several messages
     * @param message Message should be displayed
     */
    async alert(message: string) {
        const alert = await this.alertcontroller.create({
            message,
            buttons: [{
                text: 'OK'
            }]
        });
        await alert.present();
    }

    ngOnDestroy(): void {
        for (let sub of this.subs) {
            if (sub) {
                sub.unsubscribe();
            }
        }
    }
}

