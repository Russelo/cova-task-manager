import { isAxiosError } from 'axios'
import { useState } from 'react'
import { deleteTask, type Task } from '../lib/tasks'

interface ConfirmDeleteModalProps {
  task: Task
  onClose: () => void
  onDeleted: () => void
}

export default function ConfirmDeleteModal({ task, onClose, onDeleted }: ConfirmDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setIsDeleting(true)
    setError(null)
    try {
      await deleteTask(task.id)
      onDeleted()
    } catch (err) {
      if (isAxiosError(err) && !err.response) {
        setError('Cannot reach the server. Check that the backend is running.')
      } else {
        setError('Could not delete this task. Please try again.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-neutral-900/40 p-4">
      <div className="flex w-full max-w-100 flex-col gap-5 rounded-xl bg-white p-6">
        <h2 className="text-lg font-bold text-neutral-900">Delete task?</h2>
        <p className="text-sm text-neutral-600">
          Are you sure you want to delete <span className="font-semibold">"{task.title}"</span>?
          This can't be undone.
        </p>

        {error && (
          <div className="rounded-lg border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="h-11 flex-1 cursor-pointer rounded-[10px] border border-neutral-200 text-sm font-semibold text-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="h-11 flex-1 cursor-pointer rounded-[10px] bg-red-600 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
