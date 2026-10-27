import { useQuery } from "@tanstack/react-query"
import { getTasks } from "../api/tasks"
import { statusLabels } from "../constants/labels"
import type { TaskType } from "../types/taskType"

const TaskSummary = () => {
    const { data } = useQuery({
        queryKey: ["tasks", "summary"],
        queryFn: () => getTasks({ category: "", priority: "", sort: "", status: "", search: "" }),
    })
    if (!data) return null
    return (
        <div className="summary">
            {Object.entries(statusLabels).map(([key, text]) => (
                <div key={key} className={`summary-card summary-${key}`}>
                    <span className="summary-count">{data.filter((task: TaskType) => key === task.status).length}</span>
                    <span>{text}</span>
                </div>
            ))}
        </div>
    )
}
export default TaskSummary