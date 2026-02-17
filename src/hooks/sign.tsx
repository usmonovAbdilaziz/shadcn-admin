import { logIn, signUp } from "@/api/baseApi"
import { LoginStatus, SignUpStatus } from "@/types/sign"
import { useMutation } from "@tanstack/react-query"

export const useLogin=()=>{
    return useMutation({
        mutationKey: ["login"],
        mutationFn: (body:LoginStatus)=>logIn(body),
    })
}
export const useSignUp=()=>{
    return useMutation({
        mutationKey: ["signUp"],
        mutationFn: (body:SignUpStatus)=>signUp(body),
    })
}