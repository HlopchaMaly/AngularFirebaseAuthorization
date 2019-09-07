import { Action } from '@ngrx/store';
import { User } from 'src/app/models/user.model';


export namespace USER_ACTION {
    export const ADD_USER = 'ADD_USER';
    export const DELETE_USER = 'DELETE_USER';
    export const UPDATE_USER = 'UPDATE_USER';
    export const LOAD_USER = 'LOAD_USER';
}

export class AddUser implements Action {
    readonly type = USER_ACTION.ADD_USER;
    constructor(public payload: User) { }
}

export class UpdateUser implements Action {
    readonly type = USER_ACTION.UPDATE_USER;
    constructor(public payload: User) { }
}

export class LoadUser implements Action {
    readonly type = USER_ACTION.LOAD_USER;
    constructor(public payload: User) { }
}

export class DeleteUser implements Action {
    readonly type = USER_ACTION.DELETE_USER;
    constructor(public payload: User) { }
}

export type UserAction = AddUser | UpdateUser | LoadUser | DeleteUser;

