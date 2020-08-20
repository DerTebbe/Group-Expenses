import {Component, OnDestroy} from '@angular/core';
import {subInvoice} from "../../models/subInvoice";
import {User} from "../../models/UserModel";
import {UserBilanz} from "../../models/UserBilanz";
import {InvoiceService} from "../../services/invoice.service";
import {ActivatedRoute, Router} from "@angular/router";
import {UserServiceService} from "../../services/user-service.service";
import {Invoice} from "../../models/InvoiceModel";
import {AlertController, PopoverController} from "@ionic/angular";
import {TitleSubInvoice} from "../../models/TitleSubInvoice";
import {Observable, Subscription} from "rxjs";
import {PushnService} from "../../services/pushn.service";
import {PopoverComponent} from "../../components/popover/popover.component";
import {AchievementsService} from "../../achievements.service";

@Component({
    selector: 'app-personal-balances',
    templateUrl: './personal-balances.page.html',
    styleUrls: ['./personal-balances.page.scss'],
})

/**
 * @classdesc Class which represents the balance-page, which contains all subInvoices of a group
 */

export class PersonalBalancesPage implements OnDestroy {

    loggedInUser: User;
    groupID: string;
    invoices: Invoice[];
    invoicesUserMustPay: TitleSubInvoice[] = [];
    invoicesUserHasPaid: TitleSubInvoice[] = [];
    summarizedSubInvoicesUserMustPay: UserBilanz[] = [];
    summarizedSubInvoicesUserHasPaid: UserBilanz[] = [];
    subscribtions: Subscription[] = [];
    view: boolean = true;
    isRegistered: boolean;
    showLoading: boolean = true;


    constructor(private invoiceservice: InvoiceService, private router: Router, private route: ActivatedRoute, private userservice: UserServiceService, private alertCtrl: AlertController,
                private push: PushnService, private popoverController: PopoverController,private points:AchievementsService) {
        this.groupID = this.route.snapshot.paramMap.get('groupID');
        this.isRegistered = false;
        this.userservice.getUser().then((value1) => {
            this.userservice.findbyId(value1.uid).subscribe((user) => {
                this.loggedInUser = user;
                this.loggedInUser.picture = user.picture ? user.picture : '../../../assets/img/avatar.png';
                this.updateSubInvoices();
            })
        });
        setTimeout(() => {
            if (this.showLoading) {
                this.alert("Das Laden deiner Rechnungen dauert ungewöhnlich lange. Prüfe deine Netzwerkverbindung.")
            }
        }, 10000)
    }

    /**
     * @description Updates all subInvoices of a group
     */

    updateSubInvoices() {
        this.invoiceservice.findAll(this.groupID).then((value) => {
            this.invoices = value;
            this.showLoading = false;
            this.getHasPaidInvoices();
            this.getMustPayInvoices();
            this.getSummarizedSubInvoices();
            if (!this.isRegistered) {
                this.isRegistered = true;
                this.subscribeToSubInvoices();
            }
        });
    }

    /**
     * @description Reminds a user about a not paid subinvoice
     * @param cash
     * @param userRem
     * @param userMustPay UID of user who has to pay
     * @param userMustName
     * @param invTitel
     * @param subinvoice
     */
    async remindOfSubInvoice(subinvoice:subInvoice, invTitel:string) {
        const alert = await this.alertCtrl.create({

            message: 'Wie möchten Sie ' + [subinvoice.userDerBezahlenMuss.name] + ' kontaktieren?',
            buttons: [
                {
                    text: 'Push-Nachricht',
                    handler: () => {
                        this.push.pRemeberToPay(subinvoice, invTitel);
                    }
                },
                {
                    text: 'Whatsapp und Co.',
                    handler: (ev) => {
                        this.showPopover(ev, subinvoice,invTitel)
                    }
                }
            ]
        });
        await alert.present();
    }



    async showPopover(ev, subinvoice, invTitel) {
        const popover = await this.popoverController.create({
            component: PopoverComponent,
            event: ev,
            translucent: true,
            componentProps: {subinvoice: subinvoice, head:invTitel},



        });
        return await popover.present();
    }

    /**
     * @description Filters the subinvoices of the logged in user
     */

    getHasPaidInvoices() {
        this.invoicesUserHasPaid = [];
        for (let invoice of this.invoices) {
            for (let subinvoice of invoice.subInvoices) {
                if (subinvoice.userDerBezahltHat.id == this.loggedInUser.id) {
                    this.invoicesUserHasPaid.push(new TitleSubInvoice(invoice.titel, subinvoice));
                }
            }
        }
    }

    /**
     * @description Filters the subinvoices of the logged in user
     */

    getMustPayInvoices() {
        this.invoicesUserMustPay = [];
        for (let invoice of this.invoices) {
            for (let subinvoice of invoice.subInvoices) {
                if (subinvoice.userDerBezahlenMuss.id == this.loggedInUser.id) {
                    this.invoicesUserMustPay.push(new TitleSubInvoice(invoice.titel, subinvoice));
                }
            }
        }
    }

    /**
     * @description Calculates the sum of all subinvoices per user
     */

    getSummarizedSubInvoices() {
        let zwischenspeicher: UserBilanz[] = [];

        for (let subInvoice of this.invoicesUserMustPay) {
            if (!PersonalBalancesPage.checkForUser(zwischenspeicher, subInvoice.subInvoice.userDerBezahltHat)) {
                let gesamt: number = 0;
                for (let subinvoice1 of this.invoicesUserMustPay) {
                    if (subInvoice.subInvoice.userDerBezahltHat.id == subinvoice1.subInvoice.userDerBezahltHat.id) {
                        gesamt += subinvoice1.subInvoice.betrag;
                    }
                }
                zwischenspeicher.push(new UserBilanz(subInvoice.subInvoice.userDerBezahltHat, gesamt))
            }
        }

        this.summarizedSubInvoicesUserMustPay = zwischenspeicher;
        zwischenspeicher = [];

        for (let subInvoice of this.invoicesUserHasPaid) {
            if (!PersonalBalancesPage.checkForUser(zwischenspeicher, subInvoice.subInvoice.userDerBezahlenMuss)) {
                let gesamt: number = 0;
                for (let subinvoice1 of this.invoicesUserHasPaid) {
                    if (subInvoice.subInvoice.userDerBezahlenMuss.id == subinvoice1.subInvoice.userDerBezahlenMuss.id) {
                        gesamt += subinvoice1.subInvoice.betrag;
                    }
                }
                zwischenspeicher.push(new UserBilanz(subInvoice.subInvoice.userDerBezahlenMuss, gesamt))
            }
        }
        this.summarizedSubInvoicesUserHasPaid = zwischenspeicher;
    }

    /**
     * @description Checks, if subinvoice of a user has already been calculated
     * @param bilanz Balances, which contains all calculated subinvoices
     * @param user User who is checked for
     */

    static checkForUser(bilanz: UserBilanz[], user: User): boolean {
        let check: boolean = false;
        for (let bzw of bilanz) {
            if (user.id == bzw.user.id) {
                check = true;
            }
        }
        return check;
    }

    /**
     * @description Alert-window which confirms the delete-request
     * @param subinvoice Subinvoice which shall be deleted
     * @param userHasPayed User who is informed about that
     * @param invTitel
     */

    async pay(subinvoice: subInvoice, userHasPayed: string, invTitel: string) {
        const alert = await this.alertCtrl.create({

            message: 'Möchten Sie die Teilrechnung bezahlen?',
            buttons: [
                {
                    text: 'Nein',
                    handler: () => {
                    }
                },
                {
                    text: 'Ja',
                    handler: () => {
                        this.paySubInvoice(subinvoice, userHasPayed, invTitel);

                    }
                }
            ]
        });
        await alert.present();
    }

    /**
     * @description Alert-window, which confirms the delete-all-subinvoices-request
     * @param user User, which subinvoices the logged in user wants to pay
     * @param invoice
     */

    async payAll(invoice: UserBilanz) {
        const alert = await this.alertCtrl.create({

            message: 'Möchten Sie ALLE Teilrechnungen bezahlen?',
            buttons: [
                {
                    text: 'Nein',
                    handler: () => {
                    }
                },
                {
                    text: 'Ja',
                    handler: () => {
                        this.payAllSubInvoices(invoice);
                    }
                }
            ]
        });
        await alert.present();
    }

    /**
     * @description Deletes the specific subinvoice
     * @param subInvoice Subinvoice that shall be deleted.
     * @param userHasPayed
     * @param invTitel
     */

    async paySubInvoice(subInvoice: subInvoice, userHasPayed: string, invTitel: string) {
        for (let invoice of this.invoices) {
            for (let subinvoice of invoice.subInvoices) {
                if (subinvoice.id == subInvoice.id) {
                    this.push.pGotCash(subInvoice.betrag, this.loggedInUser.name, userHasPayed, invTitel);
                    this.push.payedCash(subInvoice.userDerBezahltHat.name);
                    await this.invoiceservice.deleteSubInvoice(this.groupID, invoice.id, subinvoice.id)
                }
            }
        }
    }

    /**
     * @description Deletes all subinvoices of a specific user
     * @param bilanz User, whose subinvoices shall be deleted.
     */

    async payAllSubInvoices(bilanz: UserBilanz) {
        this.userservice.getUser().then(async (value) => {
            let loggedInUser: string = value.uid;
            this.push.payAll(bilanz.user.id);
            for (let invoice of this.invoices) {
                for (let subinvoice of invoice.subInvoices) {
                    this.push.payedCash(bilanz.user.name);
                    this.points.getPoints(loggedInUser);
                    if (bilanz.user.id == subinvoice.userDerBezahltHat.id && loggedInUser == subinvoice.userDerBezahlenMuss.id) {
                        await this.invoiceservice.deleteSubInvoice(this.groupID, invoice.id, subinvoice.id)
                    }
                }
            }
        })

    }

    /**
     * @description Observes all subinvoices of a group
     */

    subscribeToSubInvoices(): void {
        const subs: Observable<{}>[] = this.invoiceservice.subscribeToSubInvoices(this.groupID, this.invoices);
        for (let sub of subs) {
            this.subscribtions.push(sub.subscribe(() => {
                this.updateSubInvoices();
            }))
        }
    }

    /**
     * @description Ends the observing of all subinvoices
     */

    unsubscribeToSubInvoices() {
        for (let sub of this.subscribtions) {
            sub.unsubscribe();
        }
        this.isRegistered = false;
    }

    /**
     * @description Opens alert-window to give an explanation of subinvoices
     */

    async alertHelp() {
        const alert = await this.alertCtrl.create({
            header: 'Hilfe:',
            message: '<p>Deine Teilrechnungen können auf zwei Weisen angezeigt werden: </p>' +
                '<p>Entweder detailliert pro Person und Rechnung, </p>' +
                '<p>oder: </p>' +
                '<p>aufsummiert anhand der Ein- und Ausgaben pro Person.</p>',
            buttons: [{
                text: 'OK'
            }]
        });
        await alert.present();
    }

    /**
     * @description Opens alert-window with a specific message
     * @param message Message that shall be displayed
     */

    async alert(message: string) {
        const alert = await this.alertCtrl.create({
            message: message,
            buttons: [{
                text: 'OK'
            }]
        });
        await alert.present();
    }


    /**
     * @description Changes the view between summarized and single subinvoices
     */

    changeView() {
        this.view = !this.view;
    }

    /**
     * @description Navigates to invoice-list
     */

    openInvoiceList() {
        this.router.navigate(['invoice-list', {groupID: this.groupID}])
    }

    /**
     * @description Navigates to group-detail
     */

    openGroupDetail() {
        this.router.navigate(['group-detail', {groupID: this.groupID}])
    }

    /**
     * @description Navigates to statistics
     */

    statsPage() {
        this.router.navigate(['statistics', this.groupID]);
    }

    /**
     * @description Navigates to group-list
     */

    groupHome() {
        this.router.navigate(['group-list']);
    }

    /**
     * @description Navigates to invoice-detail
     */

    createInvoice() {
        this.router.navigate(['invoice-detail', {groupID: this.groupID}])
    }

    /**
     * @description Updates subinvoices when page is opened
     */

    ionViewWillEnter() {
        this.unsubscribeToSubInvoices();
        this.updateSubInvoices();
    }

    /**
     * @description Ends observing of all subinvoices when page is closed
     */

    ngOnDestroy(): void {
        this.unsubscribeToSubInvoices()
    }
}
