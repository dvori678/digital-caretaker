import type { Category } from "./category"
import type { Priority } from "./priority"
import type { Status } from "./status"

export type TaskType ={
        _id:string,
        title: string,
        description: string,
        location: string,
        category: Category,
        priority: Priority,
        status: Status,
        dueDate?: string,
        caretakerNote?: string,
        createdBy: {_id:string,name:string}
}
