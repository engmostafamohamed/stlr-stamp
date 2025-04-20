export interface IUser {
    id?: string;
    name: string;
    email: string;
    phoneNumber:string
    password?: string;
    role: "user" | "admin" | "customer" | "merchant" | "branch_manager";
    createdAt?: Date;
    updatedAt?: Date;
}

