import {User} from "./UserModel";

/**
 * @classdesc Class which represents the sum that a user has to pay to another user (considering all subInvoices of a user)
 */

export class UserBilanz {
    user: User;
    bilanz: number;

    public constructor(user: User, bilanz: number) {
        this.user = user;
        this.bilanz = bilanz;
    }
}
