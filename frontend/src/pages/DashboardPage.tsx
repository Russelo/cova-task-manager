import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import Pagination from '../components/Pagination'
import TaskCard from '../components/TaskCard'
import TaskFilters from '../components/TaskFilters'
import TaskFormModal from '../components/TaskFormModal'
import UserMenu from '../components/UserMenu'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { listTasks, type Task, type TaskPage, type TaskStatus } from '../lib/tasks'

interface ModalState {
  open: boolean
  task: Task | null
}

const PAGE_SIZE = 5

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [taskPage, setTaskPage] = useState<TaskPage | null>(null)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [modal, setModal] = useState<ModalState>({ open: false, task: null })
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [status, setStatus] = useState<TaskStatus | undefined>(undefined)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    setPage(0)
  }, [status, search])

  const loadTasks = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await listTasks({
        page,
        size: PAGE_SIZE,
        status,
        search: search || undefined,
      })
      if (result.content.length === 0 && page > 0) {
        setPage(page - 1)
        return
      }
      setTaskPage(result)
    } catch {
      showToast('error', 'Could not load your tasks', 'Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [page, status, search, showToast])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  function handleCreate() {
    setModal({ open: true, task: null })
  }

  function handleEdit(task: Task) {
    setModal({ open: true, task })
  }

  function handleDelete(task: Task) {
    setTaskToDelete(task)
  }

  function handleModalClose() {
    setModal({ open: false, task: null })
  }

  function handleModalSaved(savedTask: Task) {
    const wasCreate = modal.task === null
    setModal({ open: false, task: null })
    showToast(
      'success',
      wasCreate ? 'Task created' : 'Task updated',
      `"${savedTask.title}" was saved.`,
    )
    if (wasCreate && page !== 0) {
      setPage(0)
    } else {
      loadTasks()
    }
  }

  function handleDeleteClose() {
    setTaskToDelete(null)
  }

  function handleDeleted() {
    showToast('success', 'Task deleted', `"${taskToDelete?.title}" was removed.`)
    setTaskToDelete(null)
    loadTasks()
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-cova-teal">
            <div className="h-2.5 w-2.5 rounded-full bg-cova-orange" />
          </div>
          <span className="text-base font-semibold">Cova Task Manager</span>
        </div>
        <UserMenu user={user} onLogout={handleLogout} />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-8 sm:px-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-neutral-900">My tasks</h1>
            {taskPage && (
              <p className="text-sm text-neutral-500">
                {taskPage.totalElements} task{taskPage.totalElements === 1 ? '' : 's'}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="flex h-10.5 cursor-pointer items-center gap-2 rounded-[10px] bg-cova-orange px-5 text-sm font-semibold text-white"
          >
            <span className="text-base leading-none">+</span> New task
          </button>
        </div>

        <TaskFilters
          search={searchInput}
          onSearchChange={setSearchInput}
          status={status}
          onStatusChange={setStatus}
        />

        {isLoading && <p className="text-sm text-neutral-500">Loading tasks…</p>}

        {!isLoading && taskPage && taskPage.content.length === 0 && (
          <p className="text-sm text-neutral-500">
            {status || search ? 'No tasks match your filters.' : 'No tasks yet. Create your first one.'}
          </p>
        )}

        {!isLoading && taskPage && taskPage.content.length > 0 && (
          <div className="flex flex-col gap-3">
            {taskPage.content.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {taskPage && (
          <Pagination
            page={page}
            totalPages={taskPage.totalPages}
            onPrevious={() => setPage((current) => Math.max(0, current - 1))}
            onNext={() => setPage((current) => current + 1)}
          />
        )}
      </main>

      {modal.open && (
        <TaskFormModal task={modal.task} onClose={handleModalClose} onSaved={handleModalSaved} />
      )}

      {taskToDelete && (
        <ConfirmDeleteModal
          task={taskToDelete}
          onClose={handleDeleteClose}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}
