import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Group} from '../../models/GroupModel';
import {GroupService} from '../../services/group.service';
import {AlertController, IonInput, NavController} from '@ionic/angular';
import {UserServiceService} from '../../services/user-service.service';
import {User} from '../../models/UserModel';
import {PushnService} from '../../services/pushn.service';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-group-create',
    templateUrl: './group-create.page.html',
    styleUrls: ['./group-create.page.scss'],
})


export class GroupCreatePage implements OnDestroy {


    /**
     * Inject needed objects
     * @param groupService Store new group in Firebase
     * @param navCtrl Navigate in app
     * @param alertcontroller Show alert windows
     * @param userservice Fetch user data from Firebase
     */
    constructor(private groupService: GroupService, private navCtrl: NavController,
                private alertcontroller: AlertController, private userservice: UserServiceService) {
    }


    group: Group = new Group([]);
    errors: Map<string, string> = new Map<string, string>();
    types: string [] = ['Urlaub', 'WG', 'Festival'];
    sub: Subscription;


    @ViewChild('name')
    private groupNameRef: IonInput;


    /**
     * @desc Handles creation of the group
     */
    save() {
        this.errors.clear();

        if (!this.group.name) {
            this.errors.set('name', 'Gruppenname darf nicht leer sein!');
        }
        if (this.errors.size === 0) {
            this.groupService.persist(this.group);
            this.navCtrl.pop();
        }
    }

    /**
     * @desc Presents alert window to add members to the group
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
                        this.sub = this.userservice.findbyName(data.newMember).subscribe(item => {
                            console.log(item);
                            if (item.length > 0) {
                                for (let i = 0; i < this.group.member.length; i++) {
                                    if (this.group.member[i].id == item[0].id) {
                                        this.addMessage('User ist bereits Mitglied deiner Gruppe');
                                        flag = false;
                                    }
                                }
                                if (flag) {
                                    this.group.member.push(item[0]);
                                    this.addMessage('Benutzer erfolgreich hinzugefügt');
                                    console.log(this.group.member);

                                }
                            } else {
                                this.addMessage('Benutzername existiert nicht. Bitte versuch es mit einem anderen Benutzernamen oder vielleicht hast Du dich vertippt?');
                                console.log('User does not exist');
                            }
                        });

                    }
                }
            ]
        });
        await alert.present();

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
            header: 'Kategorie hinzufügen',
            inputs: [
                {
                    name: 'Typ',
                    placeholder: 'Kategorie'
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
                            console.log(data.Typ);
                            this.types.push(data.Typ);
                            this.group.typ = data.Typ;
                        }
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


    ngOnDestroy(): void {
        if (this.sub !== undefined) {
            this.sub.unsubscribe();
        }
    }
}
