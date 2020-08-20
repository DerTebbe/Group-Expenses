import {User} from './UserModel';

/**
 * @classdesc Class which represents a subInvoice
 */

export class subInvoice {
    public id: string;
    public userDerBezahlenMuss: User;
    public userDerBezahltHat: User;
    public betrag: number;


    public constructor(userDerBezahlenMuss: User, userDerBezahltHat: User, betrag: number) {
        this.userDerBezahlenMuss = userDerBezahlenMuss;
        this.userDerBezahltHat = userDerBezahltHat;
        this.betrag = betrag;
    }
}
