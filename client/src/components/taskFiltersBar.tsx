import type { TaskFilters } from "../api/tasks"
import { categoryLabels, priorityLabels, statusLabels } from "../constants/labels"
import FilterSelect from "./filterSelect"

type TaskFiltersBarProps = {
    filters: TaskFilters,
    onFiltersChange: (filters: TaskFilters) => void
}

const TaskFiltersBar = ({ filters, onFiltersChange }: TaskFiltersBarProps) => {
    return <div className="filters">
        <FilterSelect label="סטטוס" value={filters.status} options={statusLabels}
            onChange={(value) => onFiltersChange({ ...filters, status: value })} />
        <FilterSelect label="עדיפות" value={filters.priority} options={priorityLabels}
            onChange={(value) => onFiltersChange({ ...filters, priority: value })} />
        <FilterSelect label="קטגוריה" value={filters.category} options={categoryLabels}
            onChange={(value) => onFiltersChange({ ...filters, category: value })} />
        <FilterSelect label="מיון" value={filters.sort} options={{
            dueDate: "לפי תאריך יעד",
            priority: "לפי עדיפות"
        }}
            onChange={(value) => onFiltersChange({ ...filters, sort: value })} emptyText="החדשות קודם" />
    </div>
}
export default TaskFiltersBar