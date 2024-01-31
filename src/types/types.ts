
export interface IUser {
    _id:string;
    fullname:string;
    email:string;
    password:string;
}

export interface IAuthToken {
    _id:string;
    userId:string;
    token:string;
    createdAt:Date
}

export interface IProduct {
    _id:string;
    sku:string;
    productName:string;
    description:string;
    quantity:number;
    images:string[];
    thumbnail:string;
}