import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { loginRequest } from "../api/auth"
import useAuth from "../context/useAuth"
import { useMutation } from "@tanstack/react-query"
import FormField from "./formField"

const loginSchema = z.object({
    email: z.email("כתובת אימייל אינה תקינה"),
    password: z.string().min(6, "סיסמה חייבת להכיל לפחות 6 תווים")
})
type LoginFormData = z.infer<typeof loginSchema>
const LoginForm = () => {
    const { register, handleSubmit, formState: { errors, isValid } } =
        useForm<LoginFormData>({
            resolver: zodResolver(loginSchema), mode: "onChange",
            defaultValues: { email: "", password: "" },
        })
    const { login } = useAuth()
    const { mutate, isPending, error } = useMutation({
        mutationFn: (data: LoginFormData) =>
            loginRequest(data.email, data.password),
        onSuccess: (result) => {
            login({
                token: result.token,
                name: result.user.name,
                role: result.user.role
            })
        },
    })
    const onLogin = (data: LoginFormData) => mutate(data)
    return (<form className="mx-auto mt-5 w-full max-w-[400px]" onSubmit={handleSubmit(onLogin)}>
        <FormField id="email" label="מייל" error={errors.email?.message}>
            <input {...register("email")} id="email" type="email" />
        </FormField>
        <FormField id="password" label="סיסמה" error={errors.password?.message}>
            <input {...register("password")} id="password" type="password" />
        </FormField>
        <div><button disabled={!isValid || isPending}>{isPending ? "מתחבר..." : "התחברות"}</button></div>
        {error && <p className="error">{error.message}</p>}
    </form>)
}
export default LoginForm


