import { UserAction, USER_ACTION } from './user.action';

const initialState = {
    user: {}
};

export function userReducer(state = initialState, action: UserAction) {
    switch (action.type) {
        case USER_ACTION.ADD_USER:
            return {
                ...state,
                user: action.payload
            };

        case USER_ACTION.UPDATE_USER:
            return {
                ...state,
                user: action.payload
            };

        case USER_ACTION.LOAD_USER:
            return {
                ...state,
                user: action.payload
            };
        case USER_ACTION.DELETE_USER:
            return {
                ...state,
                user: {}
            };
        default:
            return state;
    }
}
