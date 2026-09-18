import { isAxiosError } from 'axios'
import { useState, type SubmitEvent } from 'react'
import { createTask, updateTask, type Task, type TaskStatus } from '../lib/tasks'

interface TaskFormModalProps {
  task: Task | null
  onClose: () => void
  onSaved: (task: Task) => void
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'To do' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'DONE', label: 'Done' },
]

export default function TaskFormModal({ task, onClose, onSaved }: TaskFormModalProps) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'TODO')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const saved = task
        ? await updateTask(task.id, { title, description, status })
        : await createTask({ title, description, status })
      onSaved(saved)
    } catch (err) {
      if (isAxiosError(err) && !err.response) {
        setError('Cannot reach the server. Check that the backend is running.')
      } else {
        setError('Could not save this task. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-neutral-900/40 p-4">
      <div className="flex w-full max-w-100 flex-col gap-5 rounded-xl bg-white p-6">
        <h2 className="text-lg font-bold text-neutral-900">
          {task ? 'Edit task' : 'New task'}
        </h2>

        {error && (
          <div className="rounded-lg border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-[13px] font-semibold text-neutral-900">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Write Q3 summary report"
              className="h-11 w-full rounded-[10px] border border-neutral-200 px-3.5 text-sm outline-cova-orange focus:outline-2"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-[13px] font-semibold text-neutral-900">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details…"
              className="w-full resize-none rounded-[10px] border border-neutral-200 px-3.5 py-2.5 text-sm outline-cova-orange focus:outline-2"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-neutral-900">Status</span>
            <div className="flex gap-2 rounded-[10px] bg-neutral-100 p-1">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value)}
                  className={
                    'flex-1 cursor-pointer rounded-lg py-2 text-[13px] font-semibold' +
                    (status === option.value
                      ? ' bg-white text-cova-teal shadow-sm'
                      : ' text-neutral-500')
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 flex-1 cursor-pointer rounded-[10px] border border-neutral-200 text-sm font-semibold text-neutral-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 flex-1 cursor-pointer rounded-[10px] bg-cova-orange text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Saving…' : 'Save task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
