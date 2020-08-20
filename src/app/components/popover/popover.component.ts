import {Component, OnInit} from '@angular/core';
import {SocialSharing} from '@ionic-native/social-sharing/ngx';
import {Invoice} from "../../models/InvoiceModel";
import {InvoiceService} from "../../services/invoice.service";
import {TitleSubInvoice} from "../../models/TitleSubInvoice";
import {UserBilanz} from "../../models/UserBilanz";
import {Subscription} from "rxjs";
import {NavParams} from "@ionic/angular";
import {subInvoice} from "../../models/subInvoice";


@Component({
    selector: 'app-popover',
    templateUrl: './popover.component.html',
    styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit {

    private msg: string = 'Klopf, klopf... ' + [this.navparam.get('subinvoice').userDerBezahlenMuss.name] + ' ? Denkst du daran die Rechnung ' +[this.navparam.get('head')]+' im Wert von ' + [this.navparam.get('subinvoice').betrag.toFixed(2)] + ' € zu bezahlen';

    constructor(private socialSharing: SocialSharing, private navparam: NavParams) {}

    async shareTwitter() {
        this.socialSharing.shareViaTwitter(this.msg)
            .then(() => {

            }).catch((error) => {
        });
    }

    async shareWhatsApp() {
        console.log(this.msg);
         this.socialSharing.shareViaWhatsApp(this.msg)
            .then(() => {
            }).catch((error) => {
        });
    }

    async shareEmail() {
        this.socialSharing.canShareViaEmail().then(() => {
            return this.socialSharing.shareViaEmail(this.msg, 'Eine kleine Erinnerung an dich :)', ['yourTarget@mail.de'])
        }).catch((error) => {
        });
    }

    async shareFacebook() {
        this.socialSharing.shareViaFacebook(this.msg).then(() => {
        }).catch((error) => {
        });
    }

    ngOnInit() {
    }

}
