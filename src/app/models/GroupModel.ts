import {User} from './UserModel';
import {Invoice} from './InvoiceModel';

/**
 * @classdesc Class representing a group
 */
export class Group {
    id: string;
    name: string;
    typ: string;
    member: User[] = [];
    date: Date;
    bildLink: string;
    invoices: Invoice[] = [];
    kategorien: string[];

    constructor( kategorien: string[], name?: string, typ?: string, member?: User[], link?: string, id?: string) {
        this.kategorien = kategorien;
        this.id = id;
        this.name = name;
        this.typ = typ;
        this.date = new Date();
        this.bildLink = link;

        if (member !== undefined) {
            this.member = member;
        }
    }
}
