import type { TaskStatus } from '../lib/tasks'

interface StatusOption {
  value: TaskStatus | undefined
  label: string
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: undefined, label: 'All' },
  { value: 'TODO', label: 'To do' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'DONE', label: 'Done' },
]

interface TaskFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: TaskStatus | undefined
  onStatusChange: (status: TaskStatus | undefined) => void
}

export default function TaskFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search tasks by title…"
        aria-label="Search tasks"
        className="h-10.5 w-full rounded-[10px] border border-neutral-200 bg-white px-3.5 text-sm outline-cova-orange focus:outline-2 sm:max-w-80"
      />
      <div className="flex flex-wrap gap-1 rounded-[10px] border border-neutral-200 bg-white p-1">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => onStatusChange(option.value)}
            className={
              'h-8 cursor-pointer rounded-lg px-3.5 text-[13px] font-semibold' +
              (status === option.value
                ? ' bg-cova-teal text-white'
                : ' text-neutral-500 hover:bg-neutral-50')
            }
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
