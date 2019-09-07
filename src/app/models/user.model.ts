export class User {
    constructor(
        public id: string,
        public name: string,
        public email: string,
        public photo?: string,
        public pathToOldPhotoInStorage?: string
    ) { }
}

