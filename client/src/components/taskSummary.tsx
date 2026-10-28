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
        <div className="my-4 flex flex-wrap gap-3">
            {Object.entries(statusLabels).map(([key, text]) => (
                <div key={key} className={`flex min-w-[100px] flex-1 items-center justify-center gap-2 rounded-lg border border-[#e3e7ea] border-t-3 bg-white px-3 py-2 text-[0.95rem] summary-${key}`}>
                    <span className="text-xl font-bold text-primary">{data.filter((task: TaskType) => key === task.status).length}</span>
                    <span>{text}</span>
                </div>
            ))}
        </div>
    )
}
export default TaskSummary