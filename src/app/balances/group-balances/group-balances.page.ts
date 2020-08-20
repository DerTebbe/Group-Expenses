import {Component} from '@angular/core';
import {Group} from "../../models/GroupModel";
import {UserBilanz} from "../../models/UserBilanz";
import {InvoiceService} from "../../services/invoice.service";
import {GroupService} from "../../services/group.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'app-group-balances',
    templateUrl: './group-balances.page.html',
    styleUrls: ['./group-balances.page.scss'],
})
export class GroupBalancesPage {

    group: Group;
    groupBalances: UserBilanz[] = [];
    averageSum: number;
    gesamt: number;

    constructor(private invoiceservice: InvoiceService,
                private groupservice: GroupService,
                private route: ActivatedRoute,
                private router: Router) {
        this.groupservice.find(this.route.snapshot.paramMap.get('groupID')).subscribe((value) => {
            this.group = value;
            this.updateGroupBalances();
        });
    }

    async updateGroupBalances() {
        this.group.invoices = await this.invoiceservice.findAll(this.group.id);
        this.groupBalances = [];
        for (let user of this.group.member) {
            this.groupBalances.push(new UserBilanz(user, 0))
        }

        let gesamt: number = 0;
        for (let invoice of this.group.invoices) {
            gesamt += invoice.betrag;
            for (let user of this.group.member) {
                if (invoice.zahler.name == user.name) {
                    if (invoice.isIncome) {
                        for (let gb of this.groupBalances) {
                            if (gb.user.name == user.name) {
                                gb.bilanz -= invoice.betrag;
                            }
                        }
                    }else {
                        for (let gb of this.groupBalances) {
                            if (gb.user.name == user.name) {
                                gb.bilanz += invoice.betrag;
                            }
                        }
                    }
                }
            }
        }
        console.log(this.groupBalances);
        this.gesamt = gesamt;
        this.averageSum = gesamt / this.group.member.length;

        for (let gb of this.groupBalances) {
            gb.bilanz = (this.averageSum - gb.bilanz);
        }
    }

    openPersonalBalances() {
        this.router.navigate(['personal-balances', {groupID: this.group.id}])
    }

    openInvoiceList() {
        this.router.navigate(['invoice-list', {id: this.group.id}])
    }

    openGroupDetail() {
        this.router.navigate(['group-detail'])
    }

    statsPage() {
        this.router.navigate(['statistics', this.group.id]);
    }

    groupHome() {
        this.router.navigate(['group-list']);
    }
}
