import { z } from "zod"
import { useNavigate, useParams } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { categoryLabels, priorityLabels, statusLabels } from "../constants/labels"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createTask, deleteTask, getTaskById, updateTask, type TaskUpdate } from "../api/tasks"
import useAuth from "../context/useAuth"
import FormField from "../components/formField"

const taskSchema = z.object({
    title: z.string().trim().min(2, "יש להזין כותרת (לפחות 2 תווים)").max(60, "הכותרת ארוכה מדי"),
    description: z.string().trim().min(5, "יש לתאר את הבקשה (לפחות 5 תווים)").max(500, "התיאור ארוך מדי"),
    location: z.string().trim().min(2, "יש להזין מיקום").max(50, "המיקום ארוך מדי"),
    category: z.enum(["electricity", "plumbing", "furniture", "cleaning", "event-setup", "other"], { message: "יש לבחור קטגוריה" }),
    priority: z.enum(["low", "medium", "urgent"], { message: "יש לבחור עדיפות" }),
    dueDate: z.string().optional(),
    status: z.enum(["new", "in_progress", "done"]).optional(),
    caretakerNote: z.string().max(300, "הערה ארוכה מדי").optional()
})
type TaskFormData = z.infer<typeof taskSchema>
const TaskFormPage = () => {
    const { id } = useParams()
    const isEdit = id !== undefined
    const { user } = useAuth()
    const isCaretaker = user?.role === "caretaker"
    const { data: task, isLoading: isTaskLoading, error: taskError } = useQuery({
        queryKey: ["tasks", id],
        queryFn: () => getTaskById(id!),
        enabled: isEdit,
    })
    const isLocked = !isCaretaker && isEdit && task?.status !== "new"
    const taskFormValues = task ? {
        title: task.title,
        description: task.description,
        location: task.location,
        category: task.category,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
        status: task.status,
        caretakerNote: task.caretakerNote
    } : undefined
    const { register, handleSubmit, formState: { errors } } =
        useForm<TaskFormData>({
            resolver: zodResolver(taskSchema), mode: "onChange",
            defaultValues: { priority: "medium" },
            values: taskFormValues
        })
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: (formData: TaskUpdate) => isEdit ? updateTask(id!, formData) : createTask(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] })
            navigate("/tasks")
        },
    })
    const { mutate: mutateDelete, isPending: isPendingDelete, error: errorDelete } = useMutation({
        mutationFn: () => deleteTask(id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] })
            navigate("/tasks")
        },
    })
    const onSubmit = (data: TaskFormData) => mutate(data)
    const handleDelete = () => {
        if (window.confirm("למחוק את הבקשה?")) mutateDelete()
    }
    if (isTaskLoading) return <p>טוען בקשה...</p>
    if (taskError) return <p className="error">שגיאה: {taskError.message}</p>
    return (<form onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isLocked}>
            <FormField id="title" label="כותרת" error={errors.title?.message}>
                <input {...register("title")} id="title" />
            </FormField>
            <FormField id="description" label="תיאור" error={errors.description?.message}>
                <textarea {...register("description")} id="description" />
            </FormField>
            <FormField id="location" label="מיקום" error={errors.location?.message}>
                <input {...register("location")} id="location" />
            </FormField>
            <FormField id="category" label="קטגוריה" error={errors.category?.message}>
                <select {...register("category")} id="category">
                    <option value="">בחירת קטגוריה</option>
                    {Object.entries(categoryLabels).map(([key, text]) => (
                        <option key={key} value={key}>{text}</option>
                    ))}
                </select>
            </FormField>
            <FormField id="priority" label="עדיפות" error={errors.priority?.message}>
                <select {...register("priority")} id="priority">
                    <option value="">בחירת עדיפות</option>
                    {Object.entries(priorityLabels).map(([key, text]) => (
                        <option key={key} value={key}>{text}</option>
                    ))}
                </select>
            </FormField>
            <FormField id="dueDate" label="תאריך יעד" error={errors.dueDate?.message}>
                <input type="date" {...register("dueDate")} id="dueDate" />
            </FormField>

            {isEdit && isCaretaker && <>
                <FormField id="status" label="סטטוס">
                    <select {...register("status")} id="status">
                        {Object.entries(statusLabels).map(([key, text]) => (
                            <option key={key} value={key}>{text}</option>
                        ))}
                    </select>
                </FormField>
                <FormField id="caretakerNote" label="הערת אב הבית" error={errors.caretakerNote?.message}>
                    <textarea {...register("caretakerNote")} id="caretakerNote" />
                </FormField>
            </>
            }
        </fieldset>
        <div className="form-actions">
            {error && <p className="error">{error.message}</p>}
            {isLocked ? <p className="error">אי אפשר לערוך בקשה שכבר התחילו לטפל בה</p> : <button disabled={isPending}>{isPending ? "שומר..." : isEdit ? "עדכון בקשה" : "יצירת בקשה"}</button>}
            {isEdit && !isLocked && <button type="button" onClick={handleDelete} disabled={isPendingDelete}>{isPendingDelete ? "מוחק..." : "מחיקה"}</button>}
            {errorDelete && <p className="error">{errorDelete.message}</p>}
        </div>
    </form>)
}
export default TaskFormPage