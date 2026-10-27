import type { Category } from "../types/category"
import type { Priority } from "../types/priority"
import type { Status } from "../types/status"

export const statusLabels: Record<Status, string> = {
    new: "חדשה",
    in_progress: "בטיפול",
    done: "טופלה"
}
export const priorityLabels: Record<Priority, string> = {
    low: "נמוכה",
    medium: "בינונית",
    urgent: "דחופה"
}
export const categoryLabels: Record<Category, string> = {
    electricity: "חשמל",
    plumbing: "אינסטלציה",
    furniture: "ריהוט",
    cleaning: "ניקיון",
    "event-setup": "הכנה לאירוע",
    other: "אחר"
}
