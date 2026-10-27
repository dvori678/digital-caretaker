import { request } from "./request"

export const loginRequest=(email: string,password:string)=> 
request("/api/login",{ method: "POST", body: JSON.stringify({ email,password }) })

