
export interface IUser {
    _id:string;
    fullname:string;
    email:string;
    password:string;
}

export interface IAuthToken {
    id:string;
    userId:string;
    token:string;
    createdAt:Date
}