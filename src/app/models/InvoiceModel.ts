import {User} from './UserModel';
import {subInvoice} from './subInvoice';

/**
 * @classdesc Class which represents an invoice
 */

export class Invoice {
    public id: string;
    public titel: string;
    public betrag: number;
    public datum: Date = new Date();
    public zahler: User;
    public beschreibung: string = " ";
    public isIncome: boolean;
    public kategorie: string;
    public groupMembers: User[] = [];
    public subInvoices: subInvoice[] = [];
    public bildLink: string;

    public constructor(id?: string, titel?: string, betrag?: number, zahler?: User, datum?: Date, beschreibung?: string, isIncome?: boolean, kategorie?: string, members?: User[], bildlink?: string) {
        this.id = id;
        this.titel = titel;
        this.betrag = betrag;
        this.zahler = zahler;
        if (datum !== undefined){
            this.datum = datum;
        }
        if (beschreibung !== undefined){
            this.beschreibung = beschreibung;
        }
        this.isIncome = isIncome;
        this.kategorie = kategorie;

        if (members !== undefined) {
            this.groupMembers = members;
        }
        if (bildlink !== undefined){
            this.bildLink = bildlink;
        }
        this.updateSubInvoices();
    }

    /**
     * @description Calculates and created all subInvoices of an invoice
     */

    updateSubInvoices() {
        this.subInvoices = [];
        let persoenlicherBetrag: number = this.betrag / this.groupMembers.length;

        if (this.isIncome) {
            for (let user of this.groupMembers) {
                if (user.id != this.zahler.id) {
                    this.subInvoices.push(new subInvoice(this.zahler, user, persoenlicherBetrag));
                }
            }
        }else {
            for (let user of this.groupMembers) {
                if (user.id != this.zahler.id) {
                    this.subInvoices.push(new subInvoice(user, this.zahler, persoenlicherBetrag));
                }
            }
        }
    }
}
