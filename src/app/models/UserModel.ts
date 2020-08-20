/**
 * @classdesc Class representing a group
 */
export class User {
    id: string;
    name: string;
    picture: any;

    /**
     * @description Constuctor for UserModel
     * @param id
     * @param name
     * @param picture
     */
    constructor(id?: string, name?: string, picture?: any) {
        this.id = id;
        this.name = name;
        this.picture = picture;
    }
}
