import {subInvoice} from "./subInvoice";

/**
 * @classdesc Class which represents a subInvoice with the title of his invoice
 */

export class TitleSubInvoice {
    public title: string;
    public subInvoice: subInvoice;

    constructor(title: string, subinvoice: subInvoice) {
        this.title = title;
        this.subInvoice = subinvoice;
    }
}
