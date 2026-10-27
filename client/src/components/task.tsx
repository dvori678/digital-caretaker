import useAuth from "../context/useAuth"
import type { TaskType } from "../types/taskType"
import { categoryLabels, priorityLabels, statusLabels } from "../constants/labels"

const Task = ({ task }: { task: TaskType }) => {
    const { user } = useAuth()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const isOverdue = !!task.dueDate && task.status !== "done" && new Date(task.dueDate) < today
    return (<>
        <h3>{task.title}</h3>
        <p>{task.description}</p>
        <p>מיקום: {task.location}</p>
        <div className="badges">
            <span className="badge">{categoryLabels[task.category]}</span>
            <span className={`badge priority-${task.priority}`}>{priorityLabels[task.priority]}</span>
            <span className={`badge status-${task.status}`}>{statusLabels[task.status]}</span>
        </div>
        {task.dueDate && <p className={isOverdue ? "overdue" : undefined}>
            תאריך יעד {isOverdue && "⚠️"}: {new Date(task.dueDate).toLocaleDateString("he-IL")}</p>}
        {task.caretakerNote && <p>הערת אב הבית: {task.caretakerNote}</p>}
        {user?.role === "caretaker" && <p>שולח הבקשה: {task.createdBy.name}</p>}
    </>)
}
export default Task