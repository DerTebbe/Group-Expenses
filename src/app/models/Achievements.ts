import {User} from './UserModel';

export class Achievements{
public user:User;
public id: string;
public points: string;

public constructor(user:User, id ? : string ,points ?: string){
    this.user=user;
    this.id= id;
    this.points = points;
}
}

