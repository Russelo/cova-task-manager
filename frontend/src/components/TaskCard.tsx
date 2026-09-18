import type { Task } from '../lib/tasks'

const STATUS_LABEL: Record<Task['status'], string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
}

const STATUS_CLASSES: Record<Task['status'], string> = {
  TODO: 'bg-red-100 text-red-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-800',
  DONE: 'bg-green-100 text-green-800',
}

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <div className="flex items-center gap-5 rounded-xl border border-neutral-200 bg-white p-4.5">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className={
            'truncate text-[15px] font-semibold' +
            (task.status === 'DONE' ? ' text-neutral-400 line-through' : ' text-neutral-900')
          }
        >
          {task.title}
        </span>
        {task.description && (
          <span className="truncate text-[13px] text-neutral-500">{task.description}</span>
        )}
      </div>
      <span
        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_CLASSES[task.status]}`}
      >
        {STATUS_LABEL[task.status]}
      </span>
      <div className="flex shrink-0 gap-1.5">
        <button
          type="button"
          aria-label="Edit task"
          onClick={() => onEdit(task)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50"
        >
          ✎
        </button>
        <button
          type="button"
          aria-label="Delete task"
          onClick={() => onDelete(task)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-white text-red-600 hover:bg-red-50"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
