import {Component, OnInit, ViewChild} from '@angular/core';
import {IonSearchbar, ModalController, NavParams} from "@ionic/angular";
import {Subscription} from "rxjs";
import {Invoice} from "../../models/InvoiceModel";
import {InvoiceService} from "../../services/invoice.service";

@Component({
    selector: 'app-invoice-picker',
    templateUrl: './invoice-picker.page.html',
    styleUrls: ['./invoice-picker.page.scss'],
})
export class InvoicePickerPage implements OnInit {

    invoiveSubscribtion: Subscription;
    invoices: Invoice[] = [];
    filteredInvoices: Invoice[] = [];
    groupID: string;

    @ViewChild(IonSearchbar)
    private searchbar: IonSearchbar;

    /**
     * @description Constructor for InvoicePickerPage
     * @param modalController
     * @param invoiceService
     * @param navParams
     */
    constructor(private modalController: ModalController, private invoiceService: InvoiceService, private navParams: NavParams) {
        this.groupID = this.navParams.get('groupID');
    }

    /**
     * @description Invoices that are marked('merken') are shown
     */
    ngOnInit(): void {
        this.invoiveSubscribtion = this.invoiceService.getSavedInvoice(this.groupID).subscribe(
            invoices => {
                this.invoices = invoices.sort(function (a, b) {
                    if (a.titel < b.titel) {
                        return -1;
                    }
                    if (a.titel > b.titel) {
                        return 1;
                    }
                    return 0;
                });
                this.filteredInvoices = this.invoices;
            });
    }

    /**
     * @description on entering in the site it will be set focus on the searchbar
     */
    ionViewDidEnter() {
        this.searchbar.setFocus();
    }

    /**
     * @description Method to searching Invoices
     * @param event
     */
    doSearch(event) {
        let input: string = event.target.value;
        this.filteredInvoices = this.invoices.filter(invoice => invoice.titel.toLocaleLowerCase().includes(input.toLowerCase()));
    }

    /**
     * @description Clears Searchbar
     */
    clearSearchbar() {
        this.searchbar.value = '';
        this.filteredInvoices = this.invoices;
    }

    /**
     * @description A method that performs cleanup
     */
    ngOnDestroy(): void {
        this.invoiveSubscribtion.unsubscribe();
    }

    /**
     * @description dismisses modalController
     */
    createInvoice() {
        this.modalController.dismiss();
    }
}
