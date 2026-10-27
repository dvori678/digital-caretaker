import { useQuery } from "@tanstack/react-query"
import Task from "../components/task"
import { getTasks, type TaskFilters } from "../api/tasks"
import type { TaskType } from "../types/taskType"
import { useState } from "react"
import useDebounce from "../hooks/useDebounce"
import TaskFiltersBar from "../components/taskFiltersBar"
import { Link } from "react-router"
import TaskSummary from "../components/taskSummary"

const TasksPage = () => {
    const [filters, setFilters] = useState<TaskFilters>({ category: "", priority: "", status: "", sort: "" })
    const [searchText, setSearchText] = useState("")
    const debouncedSearch = useDebounce(searchText, 500)
    const query = { ...filters, search: debouncedSearch }
    const { data, isLoading, error } = useQuery({
        queryKey: ["tasks", query],
        queryFn: () => getTasks(query),
    })
    return (<>
        <TaskSummary />
        <TaskFiltersBar filters={filters} onFiltersChange={setFilters} />
        <label>
            חיפוש
            <input placeholder="חיפוש לפי כותרת, תיאור או מיקום..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </label>
        {isLoading && <p>טוען בקשות...</p>}
        {error && <p className="error">שגיאה: {error.message}</p>}
        {data && (data.length === 0 ? <p>אין בקשות להצגה</p> :
            <ul>
                {data.map((task: TaskType) => (
                    <li key={task._id} className={`card-${task.priority} card-${task.status}`}>
                        <Link to={`/tasks/${task._id}`}>
                            <Task task={task} />
                        </Link>
                    </li>
                ))}
            </ul>)}
    </>)
}
export default TasksPage
