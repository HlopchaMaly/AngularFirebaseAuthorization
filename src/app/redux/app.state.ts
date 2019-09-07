import { User } from '../models/user.model';

export interface AppState {
    userPage: {
        user: User
    };
}
