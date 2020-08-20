import {Component, OnDestroy, OnInit} from '@angular/core';
import {Invoice} from '../../models/InvoiceModel';
import {ActivatedRoute} from '@angular/router';
import {ActionSheetController, AlertController, IonInput, ModalController, NavController} from '@ionic/angular';
import {InvoiceService} from '../../services/invoice.service';
import {Router} from '@angular/router';
import {UserServiceService} from '../../services/user-service.service';
import {GroupService} from '../../services/group.service';
import {Group} from '../../models/GroupModel';
import {User} from "../../models/UserModel";
import {InvoicePickerPage} from "../invoice-picker/invoice-picker.page";
import {ImagesService} from '../../services/images.service';

@Component({
    selector: 'app-invoice-detail',
    templateUrl: './invoice-detail.page.html',
    styleUrls: ['./invoice-detail.page.scss'],
})
export class InvoiceDetailPage implements OnInit, OnDestroy {

    invoice = new Invoice();
    subCats;
    isEditMode = false;
    pageTitle: string;
    kategorien: string [] = [];
    groupid: string;
    group: Group = new Group([]);
    subGroups;
    saveInvoice: boolean = false;
    errors: Map<string, string> = new Map<string, string>();
    invoiceID: string;
    showLoading: boolean = true;
    einkommenAbfrage: string;
    sub1;

    /**
     * @description Constuctor for InvoiceDetailPage
     * @param userservice
     * @param navCtrl
     * @param route
     * @param invoiceService
     * @param router
     * @param groupService
     * @param alertCtrl
     * @param modalController
     * @param actionSheetController
     * @param imageService
     */

    constructor(private userservice: UserServiceService,
                private navCtrl: NavController,
                private route: ActivatedRoute,
                private invoiceService: InvoiceService,
                private router: Router,
                private groupService: GroupService,
                private alertCtrl: AlertController,
                private modalController: ModalController,
                private actionSheetController: ActionSheetController,
                private imageService: ImagesService) {

        this.invoiceID = this.route.snapshot.paramMap.get('invoiceID');
        this.groupid = this.route.snapshot.paramMap.get('groupID');
        this.invoice.zahler = new User();

        if (this.invoiceID) {
            this.pageTitle = 'Rechnung bearbeiten';
            this.isEditMode = true;
            this.invoiceService.findById(this.groupid, this.invoiceID).then((value) => {
                this.invoice = value;
                this.einkommenAbfrage = this.invoice.isIncome == true ? 'Einkommen' : 'Ausgabe';
                this.showLoading = false;
                this.invoice.bildLink = this.invoice.bildLink? this.invoice.bildLink : '../../../assets/img/receipt.jpg';
            });
        } else {
            this.showLoading = false;
            this.pageTitle = 'Rechnung erstellen';
            this.invoice.bildLink = this.invoice.bildLink? this.invoice.bildLink : '../../../assets/img/receipt.jpg';
            this.isEditMode = false;
            this.invoice.isIncome = false;
        }
    }
    
    ngOnInit() {
        this.subCats = this.invoiceService.findAllCategories().subscribe(
            categories => {
                // @ts-ignore
                this.kategorien = categories[0].Kategorien;
                console.log(this.kategorien);
            });

        setTimeout(() => {
            if (this.showLoading) {
                this.alert("Das Laden deiner Rechnung dauert ungewöhnlich lange. Prüfe deine Netzwerkverbindung.")
            }
        },10000)
    }

    ionViewWillEnter() {
        this.groupid = this.route.snapshot.paramMap.get('groupID');
        this.subGroups = this.groupService.find(this.groupid).subscribe(
            groups => {
                this.group = groups;
            }
        );
    }

    /**
     * @description Alert Window to add Category.
     * A Category can be selected or you can create an own Categorie
     * @param selectedValue A Value which is selected from the Selector
     */

    async presentPrompt(selectedValue: any) {
        if (selectedValue.value !== 'own') {
            return;
        }
        const alert = await this.alertCtrl.create({
            header: 'Kategorie hinzufügen',
            inputs: [
                {
                    name: 'Kategorie',
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
                        if (data.Kategorie !== '') {
                            this.group.kategorien.push(data);
                            this.invoice.kategorie = data.Kategorie;
                            this.groupService.update(this.group, false);
                        }
                    }
                }
            ]
        });
        alert.present();
    }

    /**
     * @description Handles creation of Invoices
     */

    save() {
        this.errors.clear();
        if (!this.invoice.titel) {
            this.errors.set("titel", "Titel darf nicht leer sein")
        }
        if (!this.invoice.betrag){
            this.errors.set("betrag", "Betrag darf nicht leer sein")
        }
        if (!this.invoice.kategorie) {
            this.errors.set("kategorie", "Kategorie darf nicht leer sein")
        }
        if (this.errors.size === 0){
            if (this.isEditMode) {
                this.invoiceService.update(this.groupid, this.invoice);
                this.navCtrl.pop();
            } else {
                this.userservice.getUser().then(value => {
                     this.sub1 = this.userservice.findbyId(value.uid).subscribe(item => {
                        item.picture = item.picture ? item.picture : '../../../assets/img/avatar.png';
                        this.invoice.zahler = item;
                            this.invoice.isIncome = this.einkommenAbfrage == "Einkommen";
                            this.invoice.groupMembers = this.group.member;
                            this.invoice.updateSubInvoices();
                            this.invoiceService.persist(this.groupid, this.invoice);
                            if (this.saveInvoice) {
                                this.invoiceService.persistSavedInvoice(this.groupid, this.invoice);
                            }
                          this.navCtrl.pop();
                    });

                });
            }
        }
    }


    /**
     * @description Alert Window to delete an Invoice
     */
    async delete() {
        const alert = await this.alertCtrl.create({

            message: 'Möchtest Du den Eintrag wirklich löschen?',
            buttons: [
                {
                    text: 'Nein',
                    handler: () => {
                    }
                },
                {
                    text: 'Ja',
                    handler: () => {
                        const check = this.invoiceService.delete(this.groupid, this.invoice);
                        if (check) {
                            this.alert('Rechnung erfolgreich gelöscht!');
                            this.navCtrl.pop();
                        } else {
                            this.alert('Rechnung kann nicht gelöscht werden, da noch offene Beträge beglichen werden müssen.')
                        }
                    }
                }
            ]
        });
        await alert.present();
    }

    /**
     * @description Alert Window with a Message about created Invoice
     * @param message which should be displayed
     */

    async alert(message: string) {
        const alert = await this.alertCtrl.create({
            message,
            buttons: [{
                text: 'OK'
            }]
        });
        await alert.present();
    }

    /**
     * @description ModalController for the InvoicePickerPage
     * You can use an Invoice which you have marked as 'merken'
     */

    async openInvoicePicker() {
        const modal = await this.modalController.create({
            component: InvoicePickerPage,
            componentProps: {
                groupID: this.groupid
            }
        });
        modal.onDidDismiss().then((data) => {
            if (data.data) {
                this.invoice.titel = data.data.titel;
                this.invoice.beschreibung = data.data.beschreibung;
                this.invoice.betrag = data.data.betrag;
                this.invoice.kategorie = data.data.kategorie;
                this.einkommenAbfrage = data.data.istEinkommen == true? 'Einkommen' : 'Ausgabe';
            }
        });
        return await modal.present()
    }

    /**
     * @description Navigates to invoiceList page
     */
    invoiceList() {
        this.router.navigate(['invoice-list']);
    }

    /**
     * @description Navigates to groupList page
     */
    groupList() {
        this.router.navigate(['group-list']);
    }

    /**
     * @description Navigates to groupBalances page
     */
    balances() {
        this.router.navigate(['group-balances']);
    }

    /**
     * @description Alert Window to take a photo, search a photo or delete a photo for the invoices
     */
    async presentActionSheet() {
        this.group.id = this.groupid;
        const actionSheet = await this.actionSheetController.create({
            header: 'Rechnung',
            buttons: [{
                text: 'Löschen',
                role: 'destructive',
                icon: 'trash',
                handler: () => {
                    this.invoice.bildLink = null;
                    this.invoiceService.update(this.groupid, this.invoice);
                }
            }, {
                text: 'Foto aufnehmen',
                icon: 'camera',
                handler: () => {
                    this.imageService.uploadTakenPicture('receiptPicture', this.invoiceID,
                        'ReceiptPictures', 'receipt', null, this.group, this.invoice).then(res => {
                    });
                    console.log('take clicked');
                }
            }, {
                text: 'Foto auswählen',
                icon: 'share',
                handler: () => {
                    this.imageService.getImages('receiptPicture', this.invoiceID,
                        'ReceiptPictures', 'receipt', null, this.group, this.invoice);
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
     * @description Alert Window for a Description about the 'Merken' Button
     */

    async alertHelp () {
        const alert = await this.alertCtrl.create({
            header: 'Hilfe:',
            message: '<p style="text-align: center">Wiederkehrende Rechnungen, wie bspw. Miete, können gespeichert werden.</p>' +
                '<p style="text-align: center">Wenn Du also die gleiche Rechnung wieder anlegen willst, musst Du nicht alle Informationen nochmal neu eingeben.</p>',
            buttons: [{
                text: 'OK'
            }]
        });
        await alert.present();
    }

    ngOnDestroy(): void {
        if(this.sub1 !== undefined) {
            this.sub1.unsubscribe();
        }
        this.subCats.unsubscribe();
        this.subGroups.unsubscribe();
    }
}
