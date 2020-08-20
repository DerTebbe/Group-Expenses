import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Invoice} from '../../models/InvoiceModel';
import {ActivatedRoute, Router} from '@angular/router';
import {IonSearchbar, AlertController, IonSelect, NavController} from '@ionic/angular';
import {InvoiceService} from '../../services/invoice.service';
import {Group} from '../../models/GroupModel';
import {GroupService} from '../../services/group.service';
import {Subscription} from "rxjs";
import {PushnService} from "../../services/pushn.service";
import {SocialSharing} from "@ionic-native/social-sharing/ngx";
import {LocalNotifications} from "@ionic-native/local-notifications/ngx";
import {UserServiceService} from '../../services/user-service.service';

@Component({
    selector: 'app-invoice-list',
    templateUrl: './invoice-list.page.html',
    styleUrls: ['./invoice-list.page.scss'],
})
export class InvoiceListPage implements OnDestroy {

    invoices: Invoice[] = [];
    filteredInvoice: Invoice[];
    group: Group;
    searchQuery = '';
    isSearch = false;
    groupId: string;
    subInvoice: Subscription;
    showLoading: boolean = true;
    categories = [];
    contains: boolean;
    filtered: boolean;
    sortierart: number = 5;

    @ViewChild(IonSearchbar)
    public searchbar: IonSearchbar;

    @ViewChild('filterSelect')
    public filterSelect: IonSelect;

    /**
     * @description Constructor for InvoiceListPage
     * @param userservice
     * @param groupservice
     * @param router
     * @param alertCtrl
     * @param invoiceService
     * @param route
     * @param localnotifications
     * @param social
     * @param navCtrl
     */
    constructor(private userservice: UserServiceService, private groupservice: GroupService, private router: Router, public alertCtrl: AlertController,
                private invoiceService: InvoiceService,
                private route: ActivatedRoute, private localnotifications: PushnService, private social: SocialSharing, private navCtrl: NavController,) {
        this.groupId = this.route.snapshot.paramMap.get('groupID');

    }

    /**
     * @description Navigates to invoiceDetail page to create a new Invoice
     */
    createInvoice(): void {
        this.router.navigate(['invoice-detail', {groupID: this.groupId}]);

    }

    /**
     * @description Navigates to invoiceDetail page to edit an Invoice
     * @param id used to edit Invoice
     */
    editInvoice(id: string) {
        this.router.navigate(['invoice-detail', {groupID: this.groupId, invoiceID: id}]);
    }

    /**
     * @description Alert Window for deleting an Invoice
     * @param invoice represent a Invoice which should be delete
     */
    async deleteInvoice(invoice) {
        const alert = await this.alertCtrl.create({

            message: 'Möchstest Du den Eintrag wirklich löschen?',
            buttons: [
                {
                    text: 'Nein',
                    handler: () => {
                    }
                },
                {
                    text: 'Ja',
                    handler: () => {
                        let check = this.invoiceService.delete(this.groupId, invoice);
                        if (check) {
                            this.alert("Rechnung erfolgreich gelöscht!");
                        } else {
                            this.alert("Rechnung kann nicht gelöscht werden, da noch offene Beträge beglichen werden müssen.")
                        }
                    }
                }
            ]
        });
        await alert.present();
    }

    /**
     * @description Alert Window with a Message about deleted Invoice
     * @param message which should be displayed
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
     * @description Searchs for Invoices on Searchbar
     */
    search(): void {
        this.isSearch = true;
        this.filteredInvoice = this.invoices;
        setTimeout(() => this.searchbar.setFocus(), 50);
    }

    /**
     * @description Closes Searchbar
     */
    exitSearch(): void {
        this.isSearch = false;
        this.clearSearchbar();
    }

    /**
     * @description Clears Searchbar
     */
    clearSearchbar() {
        this.searchQuery = '';
        this.filteredInvoice = this.invoices;
    }

    /**
     * @description searchs for filtered Invoices
     */
    doSearch() {
        this.searchQuery = this.searchbar.value;
        this.filteredInvoice = this.invoices.filter(invoice =>
            (invoice.titel.toLowerCase().indexOf(this.searchQuery.toLowerCase()) > -1));
    }

    /**
     * @description Navigates to invoiceList page
     */
    invoiceList() {
        this.router.navigate(['invoice-list', {groupID: this.groupId}]);
    }

    /**
     * @description Navigates to groupDetail page
     */
    groupList() {
        this.router.navigate(['group-detail', {groupID: this.groupId}]);
    }

    /**
     * @description Navigates to personalBalances page
     */
    balances() {
        this.router.navigate(['personal-balances', {groupID: this.groupId}]);
    }

    /**
     * @description Navigates to statistics page
     */
    statsPage() {
        this.router.navigate(['statistics', this.groupId]);
    }

    /**
     * @description Navigates to groupList page
     */
    groupHome() {
        this.router.navigate(['group-list']);
    }

    /**
     * @description A Method that performs cleanup
     */
    ngOnDestroy(): void {
        this.subInvoice.unsubscribe()
    }

    /**
     * @description Method to update the Categories array based on the choosen Categories
     * @param data contains an array of all selected categories from the template
     */
    selectCat(data) {
        this.filteredInvoice = [];
        for (const entry of this.categories) {
            entry.checked = false;
        }
        for (const entry of data.detail.value) {
            for (const cat of this.categories) {
                if (cat.kategorie.trim() === entry.trim()) {
                    cat.checked = true;
                }
            }
        }
        for (const invoice of this.invoices) {
            for (const cat of this.categories) {
                if (cat.kategorie.trim() === invoice.kategorie.trim() && cat.checked === true) {
                    this.filteredInvoice.push(invoice);
                }
            }
        }
        this.filterInvoices();
    }

    /**
     * @description Can sort Invoices by Titel, Amount or Date
     */
    filterInvoices() {
        function sortByTitel(a, b) {
            if (a.titel.toLowerCase() < b.titel.toLowerCase()){
                return -1;
            }
            if (a.titel.toLowerCase() > b.titel.toLowerCase()) {
                return 1;
            }
            return 0;
        }

        function sortByBetrag(a, b) {
            if (a.betrag < b.betrag){
                return -1;
            }
            if (a.betrag > b.betrag) {
                return 1;
            }
            return 0;
        }

        function sortByDatum (a, b) {
            if (a.datum < b.datum){
                return -1;
            }
            if (a.datum > b.datum) {
                return 1;
            }
            return 0;
        }

        switch (this.sortierart) {
            case 0:
                this.filteredInvoice = this.filteredInvoice.sort(sortByTitel);
                break;
            case 1:
                this.filteredInvoice = this.filteredInvoice.sort(sortByBetrag);
                break;
            case 2:
                this.filteredInvoice = this.filteredInvoice.sort(sortByDatum);
                break;
            case 3:
                this.filteredInvoice = this.filteredInvoice.sort(sortByTitel);
                this.filteredInvoice = this.filteredInvoice.reverse();
                break;
            case 4:
                this.filteredInvoice = this.filteredInvoice.sort(sortByBetrag);
                this.filteredInvoice = this.filteredInvoice.reverse();
                break;
            case 5:
                this.filteredInvoice = this.filteredInvoice.sort(sortByDatum);
                this.filteredInvoice = this.filteredInvoice.reverse();
        }
    }

    /**
     * @description Opens Filter to select a sort type
     */
    doFilter() {
        this.filterSelect.open();
    }

    shareFB() {
        this.social.shareViaFacebook('test').then(() => {

        }).catch(result => {

        })
    }
    ionViewWillEnter() {
        if (this.subInvoice) {
            this.subInvoice.unsubscribe();
        }
        this.subInvoice = this.invoiceService.subscribeToInvoices(this.groupId).subscribe(() => {
            this.invoiceService.findAll(this.groupId).then((value) => {
                this.invoices = value;
                this.showLoading = false;
                this.invoices.sort(function (a, b) {
                    if (a.datum > b.datum){
                        return -1;
                    }
                    if (a.datum < b.datum) {
                        return 1;
                    }
                    return 0;
                });
                this.filteredInvoice = this.invoices;
                for (const invoice of this.invoices) {
                    this.contains = false;
                    for (const cat of this.categories) {
                        if (cat.kategorie === invoice.kategorie) {
                            this.contains = true;
                        }
                    }
                    if (!this.contains) {
                        this.categories.push({['kategorie']: invoice.kategorie, ['checked']: true});
                    }
                }
            });
        });

        setTimeout(() => {
            if (this.showLoading) {
                this.alert("Das Laden deiner Rechnungen dauert ungewöhnlich lange. Prüfe deine Netzwerkverbindung.")
            }
        },10000)
    }
}



