import { Basket } from "./basket";

export interface User {
    id:number,
    email: string;
    token: string;
    basket?: Basket;
    roles?: string[];
}