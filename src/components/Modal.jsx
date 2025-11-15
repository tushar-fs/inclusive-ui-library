import { useEffect, useRef, useCallback } from 'react'

// These are all the CSS selectors for elements that can receive keyboard focus.
// I had to look this up — browsers only let you Tab to certain elements by default,
// so if we want to "trap" focus inside the modal we need to know exactly which
// elements inside it are focusable.
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export default function Modal({ isOpen, onClose, title, children }) {
  const dialogRef = useRef(null)

  // Every modal needs a unique ID so aria-labelledby can point to the title.
  // Screen readers use this link to announce "dialog: <title>" when the modal opens.
  const titleId = useRef(
    `modal-title-${Math.random().toString(36).slice(2, 9)}`
  )

  const getFocusableElements = useCallback(() => {
    if (!dialogRef.current) return []
    return Array.from(dialogRef.current.querySelectorAll(FOCUSABLE_SELECTORS))
  }, [])

  // FOCUS TRAPPING — this was the trickiest part for me to understand.
  //
  // The idea: when a user presses Tab on the LAST focusable element inside
  // the modal, instead of letting the browser move focus to something behind
  // the modal (which the user can't see), we manually jump focus back to the
  // FIRST element. Shift+Tab on the first element does the reverse.
  //
  // Without this, a keyboard user could accidentally interact with the page
  // behind the overlay, which is really confusing.
  const trapFocus = useCallback(
    (e) => {
      if (e.key !== 'Tab') return

      const focusable = getFocusableElements()
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        // Shift+Tab on first element → wrap to last
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        // Tab on last element → wrap to first
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    [getFocusableElements],
  )

  const handleKeyDown = useCallback(
    (e) => {
      // WCAG says Escape must always close a dialog. This is also just
      // what users expect — every native OS dialog works this way.
      if (e.key === 'Escape') {
        onClose()
        return
      }
      trapFocus(e)
    },
    [onClose, trapFocus],
  )

  useEffect(() => {
    if (!isOpen) return

    // Save which element had focus BEFORE we opened the modal.
    // We'll restore focus to it in the cleanup function below.
    // This is a Section 508 requirement — the user should never "lose their
    // place" on the page after dismissing a dialog.
    const previouslyFocused = document.activeElement

    // Move focus into the modal on the next animation frame (gives React
    // time to actually render the modal DOM first).
    const frame = requestAnimationFrame(() => {
      const focusable = getFocusableElements()
      if (focusable.length > 0) {
        focusable[0].focus()
      } else {
        // If there's nothing focusable inside, focus the dialog container
        // itself — it has tabIndex={-1} so it can receive programmatic focus.
        dialogRef.current?.focus()
      }
    })

    // Lock background scrolling so the user doesn't accidentally scroll
    // content they can't see behind the overlay.
    document.body.style.overflow = 'hidden'

    // Cleanup runs when the modal closes (isOpen flips to false).
    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = ''

      // FOCUS RESTORATION — give focus back to whatever element triggered
      // the modal. Without this, focus would land on <body>, and a keyboard
      // user would have to Tab through the entire page to get back.
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus()
      }
    }
  }, [isOpen, getFocusableElements])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="presentation"
    >
      {/* Dark overlay behind the modal.
          aria-hidden="true" tells screen readers to ignore this div entirely —
          it's purely visual decoration. */}
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
        onClick={onClose}
      />

      {/*
        The actual dialog box. Key ARIA attributes:
        - role="dialog"       → tells assistive tech this is a dialog window
        - aria-modal="true"   → tells screen readers nothing behind this is interactive
        - aria-labelledby     → points to the <h2> so the dialog has an accessible name
        - tabIndex={-1}       → lets us call .focus() on it programmatically even though
                                 it's a <div> (divs aren't focusable by default)
      */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId.current}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md mx-4 rounded-lg bg-white shadow-xl border border-gray-200 outline-none"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h2
            id={titleId.current}
            className="text-lg font-semibold text-gray-900"
          >
            {title}
          </h2>
          {/*
            The X button needs aria-label because it has no visible text —
            without this a screen reader would just say "button" with no context.
          */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 text-sm text-gray-600 leading-relaxed">
          {children}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
