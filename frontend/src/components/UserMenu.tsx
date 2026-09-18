import { useEffect, useRef, useState } from 'react'
import type { CurrentUser } from '../lib/users'

interface UserMenuProps {
  user: CurrentUser | null
  onLogout: () => void
}

function initialsOf(user: CurrentUser | null): string {
  if (!user) {
    return '?'
  }
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-cova-teal-light text-[13px] font-semibold text-cova-teal"
      >
        {initialsOf(user)}
      </button>

      {open && (
        <div className="absolute top-11 right-0 z-20 w-56 rounded-[10px] border border-neutral-200 bg-white p-2 shadow-lg">
          {user && (
            <div className="flex flex-col gap-0.5 border-b border-neutral-100 px-2.5 py-2">
              <span className="text-[13px] font-semibold text-neutral-900">
                {user.firstName} {user.lastName}
              </span>
              <span className="truncate text-xs text-neutral-500">{user.email}</span>
            </div>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="mt-1 w-full cursor-pointer rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-red-600 hover:bg-red-50"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
