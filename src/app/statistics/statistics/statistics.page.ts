import {Component, OnDestroy, OnInit} from '@angular/core';
import {InvoiceService} from '../../services/invoice.service';
import {ActivatedRoute} from '@angular/router';
import {Invoice} from '../../models/InvoiceModel';
import {Group} from '../../models/GroupModel';
import {GroupService} from '../../services/group.service';
import {Router} from '@angular/router';
import {AlertController, PopoverController} from '@ionic/angular';
import {PopoverComponent} from '../../components/popover/popover.component';
import {Screenshot} from '@ionic-native/screenshot/ngx';
import {SocialSharing} from '@ionic-native/social-sharing/ngx';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-statistics',
    templateUrl: './statistics.page.html',
    styleUrls: ['./statistics.page.scss'],
})
export class StatisticsPage implements OnDestroy {
    groupId: string;
    invoices: Invoice[] = [];
    ausgaben: [string, number] [] = [];
    einnahmen: [string, number] [] = [];
    inOut: [string, number] [] = [];
    categories = [];
    group: Group = new Group([]);
    memberSize: number;
    totalPaid = 0;
    totalEarned = 0;
    hasOutStats = false;
    hasInStats = false;
    hasOutInStats = false;
    image = '../../../assets/img/avatar.png';
    pieChartDataOut;
    pieChartDataIn;
    pieChartDataOutIn;
    contains: boolean;
    showloading: boolean = true;
    public pic: any;
    public state: boolean = false;
    subscriptions: Subscription[] = [];

    /**
     * @description Constructor for statistics page
     * @param alertCtrl
     * @param invoiceService
     * @param router
     * @param route
     * @param groupService
     * @param popoverController
     *
     * Injects all required services and modules
     * @param screenshot
     * @param socialSharing
     */
    constructor(private alertCtrl: AlertController,
                private invoiceService: InvoiceService,
                public router: Router,
                private route: ActivatedRoute,
                private groupService: GroupService,
                private popoverController: PopoverController,
                private screenshot: Screenshot,
                private socialSharing: SocialSharing) {
    }

    /**
     * @description Helper method to create a data table for google graphs
     * @param typ used to name the table-head
     * @param stat an array of the type of the expense and its corresponding value
     * E.g. ['Bier', 17.3], ['Essen', 4.5]
     */
    private static tableCreator(typ: string, stat: [string, number][]) {
        const table: [any, any][] = [];
        table.push([typ, 'Percent']);
        for (const statElement of stat) {
            table.push(statElement);
        }
        return table;
    }

    /**
     * @description Method to create a pie chart for Expenses
     */
    createAusgabenStat() {

        this.hasOutStats = this.totalPaid > 0;
        this.pieChartDataOut = {
            chartType: 'PieChart',
            dataTable: StatisticsPage.tableCreator('Ausgaben', this.ausgaben),
            options: {
                title: 'Ausgaben',
                width: 400,
                height: 300
            }
        };
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        });
    }

    /**
     * Method to create a pie chart for Earnings
     */
    createEinnahmenStat() {

        this.hasInStats = this.totalEarned > 0;
        this.pieChartDataIn = {
            chartType: 'PieChart',
            dataTable: StatisticsPage.tableCreator('Einnahmen', this.einnahmen),
            options: {
                title: 'Einnahmen',
                width: 400,
                height: 300
            }
        };
    }

    /**
     * Method to create a pie chart to compare Expenses and Earnings
     */
    createOutInStat() {
        this.inOut = [];
        if (this.totalEarned > 0 || this.totalPaid > 0) {
            this.hasOutInStats = true;
        }
        this.inOut.push(['Einnahmen', this.totalEarned]);
        this.inOut.push(['Ausgaben', this.totalPaid]);
        this.pieChartDataOutIn = {
            chartType: 'PieChart',
            dataTable: StatisticsPage.tableCreator('Posten', this.inOut),
            options: {
                title: 'Einnahmen vs. Ausgaben',
                width: 400,
                height: 300
            }
        };
    }

    /**
     * @description on entering the site the charts will be calculated
     * All invoices of a group will be retrieved from the server
     * An array will be filled with all categories for invoices used in this group
     * Earnings and expenses will be added up for further calculation
     */
    ionViewWillEnter() {
        this.groupId = this.route.snapshot.paramMap.get('id');
        this.invoiceService.findAll(this.groupId).then((value) => {
            this.invoices = value;
            this.subscriptions.push(this.groupService.find(this.groupId).subscribe((value) => {
                this.group = value;
                this.memberSize = this.group.member.length;
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
                    if (invoice.isIncome === false) {
                        this.totalPaid += invoice.betrag;
                    } else {
                        this.totalEarned += invoice.betrag;
                    }
                }
                if (this.group.bildLink) {
                    this.image = this.group.bildLink;
                }

                this.getAusgaben();
                this.getEinnahmen();
                this.createAusgabenStat();
                this.createEinnahmenStat();
                this.createOutInStat();

                this.showloading = false;

            }));
        });

        setTimeout(() => {
            if (this.showloading) {
                this.alert('Das Laden deiner Rechnungen dauert ungewöhnlich lange. Prüfe deine Netzwerkverbindung.');
            }
        }, 10000);

    }

    /**
     * @description Method to update the categories array based on the chosen categories
     * @param data contains an array of all selected categories from the template
     *
     */
    selectCat(data) {
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
        this.calcAmounts();
        this.getAusgaben();
        this.getEinnahmen();
        this.createAusgabenStat();
        this.createEinnahmenStat();
        this.createOutInStat();
    }

    /**
     * @description Method to recalculate the charts based on the chosen categories
     * Only categories which are set to checked will be considered for calculation
     */
    private calcAmounts() {
        this.totalPaid = 0;
        this.totalEarned = 0;
        for (const invoice of this.invoices) {
            for (const cat of this.categories) {
                if (cat.kategorie === invoice.kategorie && cat.checked === true) {
                    if (invoice.isIncome === false) {
                        this.totalPaid += invoice.betrag;
                    } else {
                        this.totalEarned += invoice.betrag;
                    }
                }
            }
        }
    }

    /**
     * @description Method to calculate all expenses of a group
     * an array will be initialized with all categories and a value 0
     * then it will iterate over all invoices and add the value to the categorie in the array if it is an expense
     */
    private getAusgaben() {
        this.ausgaben = [];
        this.categories.forEach(cat => {
            if (cat.checked) {
                this.ausgaben.push([cat.kategorie, 0]);
            }
        });
        this.invoices.forEach(inv => {
            if (!inv.isIncome) {
                for (let i = 0; i < this.ausgaben.length; i++) {
                    if (this.ausgaben[i][0] === inv.kategorie) {
                        this.ausgaben[i][1] += inv.betrag;
                    }
                }
            }
        });
    }

    /**
     * @description Method to calculate all earnings of a group
     * an array will be initialized with all categories and a value 0
     * then it will iterate over all invoices and add the value to the categorie in the array if it is an earning
     */
    private getEinnahmen() {
        this.einnahmen = [];
        this.categories.forEach(cat => {
            if (cat.checked) {
                this.einnahmen.push([cat.kategorie, 0]);
            }
        });
        this.invoices.forEach(inv => {
            if (inv.isIncome) {
                for (let i = 0; i < this.einnahmen.length; i++) {
                    if (this.einnahmen[i][0] === inv.kategorie) {
                        this.einnahmen[i][1] += inv.betrag;
                    }
                }
            }
        });
    }

    /**
     * Router navigation methods
     */
    invoiceList() {
        this.router.navigate(['invoice-list', {groupID: this.groupId}]);
    }

    groupList() {
        this.router.navigate(['group-detail', {groupID: this.groupId}]);
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

    stop() {
        let self = this;
        setTimeout(function() {
            self.state = false;
        }, 1000);
    }


    shareWhatsapp() {
        this.stop();
        this.screenshot.URI(100).then(res => {
            this.socialSharing.shareViaWhatsApp('Schau mal was ich hier habe!', res.URI, null)
                .then(() => {
                });
        });
    }

    shareTwitter() {
        this.stop();
        this.screenshot.URI(100).then(res => {
            this.socialSharing.shareViaTwitter('Schau mal was ich hier habe!', res.URI, null)
                .then(() => {
                });
        });
    }

    shareInsta() {
        this.stop();
        this.screenshot.URI(100).then(res => {
            this.socialSharing.shareViaInstagram('Schau mal was ich hier habe!', res.URI)
                .then(() => {
                });
        });
    }

    shareFacebook() {
        this.stop();
        this.screenshot.URI(100).then(res => {
            this.socialSharing.shareViaFacebook('Schau mal was ich hier habe!', res.URI, null)
                .then(() => {
                });
        });
    }

    async alert(message: string) {
        const alert = await this.alertCtrl.create({
            message: message,
            buttons: [{
                text: 'OK'
            }]
        });
        await alert.present();
    }
}
