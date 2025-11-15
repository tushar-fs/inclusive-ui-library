import { useState, useRef, useCallback, useEffect } from 'react'

export default function Dropdown({ label, options, onSelect }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const triggerRef = useRef(null)
  const listRef = useRef(null)
  const optionRefs = useRef([])

  // aria-controls needs a unique ID so the trigger button can say "I control
  // that specific <ul> over there." Generating a random one so multiple
  // dropdowns on the same page don't collide.
  const menuId = useRef(
    `dropdown-menu-${Math.random().toString(36).slice(2, 9)}`
  )

  const open = useCallback(() => {
    setIsOpen(true)
    setActiveIndex(0) // highlight first item by default
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setActiveIndex(-1)
    // Always return focus to the button that opened the menu.
    // Same principle as the modal — the user shouldn't lose their place.
    triggerRef.current?.focus()
  }, [])

  const selectOption = useCallback(
    (option) => {
      onSelect?.(option)
      close()
    },
    [onSelect, close],
  )

  // Keyboard handling on the TRIGGER button (before the menu is open).
  // The WAI-ARIA "Menu Button" pattern says Enter, Space, and ArrowDown
  // should all open the menu. ArrowUp opens it with the LAST item focused.
  const handleTriggerKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
        case 'ArrowDown':
          e.preventDefault() // prevent page scroll on Space/Arrow
          open()
          break
        case 'ArrowUp':
          e.preventDefault()
          setIsOpen(true)
          setActiveIndex(options.length - 1)
          break
        default:
          break
      }
    },
    [open, options.length],
  )

  // Keyboard handling INSIDE the open menu.
  // This is where the ArrowUp/ArrowDown navigation lives.
  // I used modular arithmetic so the highlight wraps around — going "down"
  // past the last item takes you back to the first, and vice versa.
  const handleMenuKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex((prev) => (prev + 1) % options.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex(
            (prev) => (prev - 1 + options.length) % options.length,
          )
          break
        case 'Home':
          e.preventDefault()
          setActiveIndex(0)
          break
        case 'End':
          e.preventDefault()
          setActiveIndex(options.length - 1)
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (activeIndex >= 0) selectOption(options[activeIndex])
          break
        case 'Escape':
          e.preventDefault()
          close()
          break
        case 'Tab':
          // If the user presses Tab, just close the menu and let the browser
          // move focus naturally — don't trap them.
          close()
          break
        default:
          break
      }
    },
    [options, activeIndex, selectOption, close],
  )

  // Whenever activeIndex changes, move real DOM focus to that <li>.
  // This is what makes screen readers announce each item as the user arrows
  // through the list. Without this, the highlight would be purely visual
  // and a blind user wouldn't know which item is "active".
  useEffect(() => {
    if (isOpen && activeIndex >= 0 && optionRefs.current[activeIndex]) {
      optionRefs.current[activeIndex].focus()
    }
  }, [isOpen, activeIndex])

  // Close when clicking anywhere outside the dropdown.
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        listRef.current &&
        !listRef.current.contains(e.target)
      ) {
        close()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, close])

  return (
    <div className="relative inline-block">
      {/*
        TRIGGER BUTTON
        - aria-haspopup="true" → tells assistive tech "this button opens a menu"
        - aria-expanded         → "true" when open, "false" when closed
        - aria-controls         → points to the ID of the <ul> menu
      */}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={menuId.current}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleTriggerKeyDown}
        className="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        {label}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/*
        THE MENU LIST
        - role="menu"     → tells screen readers "this is a menu"
        - Each child has role="menuitem"
        - tabIndex roving: only the active item has tabIndex=0, all
          others have -1. This way ArrowUp/Down moves a single "roving"
          tab stop through the list (I learned this is called the
          "roving tabindex" pattern).
      */}
      {isOpen && (
        <ul
          ref={listRef}
          id={menuId.current}
          role="menu"
          aria-label={label}
          onKeyDown={handleMenuKeyDown}
          className="absolute left-0 z-40 mt-1 w-52 rounded border border-gray-200 bg-white shadow-md py-1"
        >
          {options.map((option, index) => (
            <li
              key={option.id}
              ref={(el) => {
                optionRefs.current[index] = el
              }}
              role="menuitem"
              tabIndex={activeIndex === index ? 0 : -1}
              onClick={() => selectOption(option)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`
                cursor-pointer px-3 py-2 text-sm outline-none
                ${
                  activeIndex === index
                    ? 'bg-blue-50 text-blue-800 ring-2 ring-inset ring-blue-500'
                    : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
