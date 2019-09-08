import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { timer } from 'rxjs';

admin.initializeApp(functions.config().firebase);

// Cloud Function. Применяется для удаления аккаунта вновь зарегистрированного пользователя, 
// если email, указанный при регистрации не был подтвержден в течение часа.

export const deleteNoVerificatedUserTrigger = functions.auth.user().onCreate((user) => {
    const oneMinute: number = 60000;
    const countdown = timer(oneMinute);
    
    countdown.toPromise().then(() => {
        admin.auth().getUser(user.uid).then(currentUser => {
            if (!currentUser.emailVerified) {
                admin.auth().deleteUser(user.uid).catch();
                const dbPath: string = "/users/" + user.uid;
                admin.database().ref(dbPath).remove().catch();
            }
        }).catch();
    }).catch();
});
