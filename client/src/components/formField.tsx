import type { ReactNode } from "react"

type FormFieldProps = {
    id: string,
    label: string,
    error?: string,
    children: ReactNode
}

const FormField = ({ id, label, error, children }: FormFieldProps) => (
    <div>
        <label htmlFor={id}>{label}</label>
        {children}
        {error && <p className="error">{error}</p>}
    </div>
)
export default FormField