import { useState } from 'react'
import Modal from './components/Modal'
import Dropdown from './components/Dropdown'

const fruitOptions = [
  { id: 'apple', label: 'Apple' },
  { id: 'banana', label: 'Banana' },
  { id: 'cherry', label: 'Cherry' },
  { id: 'dragonfruit', label: 'Dragonfruit' },
  { id: 'elderberry', label: 'Elderberry' },
]

// Tiny helper so I don't repeat the <kbd> styling everywhere
function Kbd({ children }) {
  return (
    <kbd className="rounded bg-gray-100 border border-gray-300 px-1 py-0.5 text-xs font-mono text-gray-700">
      {children}
    </kbd>
  )
}

// Renders a fenced code block with a grey background, like you'd see in a README
function CodeBlock({ children }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded bg-gray-900 p-4 text-xs leading-relaxed text-gray-300 font-mono">
      <code>{children}</code>
    </pre>
  )
}

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFruit, setSelectedFruit] = useState(null)

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Skip‑to‑content link — hidden until focused.
          This is the first thing a keyboard user hits when they press Tab,
          and it lets them jump straight past the header. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded focus:bg-blue-600 focus:px-3 focus:py-1.5 focus:text-sm focus:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Skip to main content
      </a>

      {/* ── Header ─────────────────────────────────────── */}
      <header className="border-b border-gray-200 px-6 py-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-lg font-bold text-gray-900">
            Accessibility Deep-Dive
          </h1>
          <p className="text-sm text-gray-500">
            A hands-on exploration of WCAG &amp; Section 508 in React
          </p>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────── */}
      <main id="main" className="mx-auto max-w-3xl px-6 py-10">

        {/* Intro */}
        <section aria-labelledby="intro-heading" className="mb-12">
          <h2 id="intro-heading" className="text-2xl font-bold text-gray-900">
            What is this?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            I built two common UI components — a <strong>Modal</strong> and
            a <strong>Dropdown Menu</strong> — completely from scratch, without
            pulling in any component library like Material UI or Radix. The
            whole point was to understand what actually goes into making a
            component accessible: focus management, ARIA attributes, keyboard
            navigation, screen-reader announcements, and so on.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Below I've documented what I built, the key code patterns that
            make each component work, and what you can try in the browser to
            test it yourself.
          </p>
        </section>

        <hr className="mb-12 border-gray-200" />

        {/* ────────────── MODAL SECTION ────────────── */}
        <section aria-labelledby="modal-heading" className="mb-14">
          <h2 id="modal-heading" className="text-xl font-bold text-gray-900">
            1. Accessible Modal
          </h2>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            A dialog that traps focus, closes on Escape, and returns focus to
            the trigger when dismissed. This follows
            the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline underline-offset-2 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:rounded">WAI-ARIA
            Dialog (Modal) pattern</a>.
          </p>

          {/* Live demo */}
          <div className="mt-6 rounded border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-400">
              Live Demo
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Open Modal
            </button>
          </div>

          {/* What to try */}
          <h3 className="mt-6 text-sm font-semibold text-gray-900">
            Try it yourself
          </h3>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>Click the button above (or press <Kbd>Enter</Kbd> while it's focused) to open the modal.</li>
            <li>Press <Kbd>Tab</Kbd> repeatedly — focus loops between the close button, Cancel, and Confirm. You can't tab out to the page behind it.</li>
            <li>Press <Kbd>Shift</Kbd>+<Kbd>Tab</Kbd> — it wraps backwards the same way.</li>
            <li>Press <Kbd>Esc</Kbd> — the modal closes and focus goes back to the "Open Modal" button.</li>
            <li>Try clicking the dark backdrop area — that also closes it.</li>
          </ul>

          {/* How it works */}
          <h3 className="mt-6 text-sm font-semibold text-gray-900">
            How I implemented it
          </h3>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            <strong>Focus trapping</strong> — When the modal mounts, I query all focusable
            elements inside it (buttons, links, inputs, etc.). On every <Kbd>Tab</Kbd> keypress
            I check: if the user is on the last focusable element, I <code className="text-xs bg-gray-100 px-1 rounded">preventDefault()</code> and
            manually move focus to the first one. <Kbd>Shift</Kbd>+<Kbd>Tab</Kbd> on the first
            element does the reverse.
          </p>
          <CodeBlock>{`// The core focus-trap logic (simplified)
const first = focusableElements[0];
const last  = focusableElements[focusableElements.length - 1];

if (e.key === 'Tab') {
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();      // wrap backwards
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();     // wrap forwards
  }
}`}</CodeBlock>

          <p className="mt-4 text-sm text-gray-600 leading-relaxed">
            <strong>Focus restoration</strong> — Before opening, I save <code className="text-xs bg-gray-100 px-1 rounded">document.activeElement</code>.
            In the effect's cleanup I call <code className="text-xs bg-gray-100 px-1 rounded">.focus()</code> on it. This means
            the user's keyboard position is exactly where they left it.
          </p>
          <CodeBlock>{`useEffect(() => {
  if (!isOpen) return;

  const previouslyFocused = document.activeElement;
  // ... move focus into the modal ...

  return () => {
    // Modal is closing — give focus back
    previouslyFocused.focus();
  };
}, [isOpen]);`}</CodeBlock>

          <p className="mt-4 text-sm text-gray-600 leading-relaxed">
            <strong>ARIA attributes</strong> — The dialog container
            has <code className="text-xs bg-gray-100 px-1 rounded">role="dialog"</code>, <code className="text-xs bg-gray-100 px-1 rounded">aria-modal="true"</code>,
            and <code className="text-xs bg-gray-100 px-1 rounded">aria-labelledby</code> pointing to
            the <code className="text-xs bg-gray-100 px-1 rounded">&lt;h2&gt;</code> title via a
            matching <code className="text-xs bg-gray-100 px-1 rounded">id</code>.  The close button
            has <code className="text-xs bg-gray-100 px-1 rounded">aria-label="Close dialog"</code> since
            it only contains an icon.
          </p>
        </section>

        <hr className="mb-12 border-gray-200" />

        {/* ────────────── DROPDOWN SECTION ────────────── */}
        <section aria-labelledby="dropdown-heading" className="mb-14">
          <h2 id="dropdown-heading" className="text-xl font-bold text-gray-900">
            2. Accessible Dropdown Menu
          </h2>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            A keyboard-navigable menu that follows
            the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline underline-offset-2 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:rounded">WAI-ARIA
            Menu Button pattern</a>. The biggest challenge was getting the "roving
            tabindex" right.
          </p>

          {/* Live demo */}
          <div className="mt-6 rounded border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-400">
              Live Demo
            </p>
            <Dropdown
              label="Pick a fruit"
              options={fruitOptions}
              onSelect={(opt) => setSelectedFruit(opt)}
            />
            {selectedFruit && (
              <p className="mt-3 text-sm text-gray-600" role="status" aria-live="polite">
                You picked: <strong className="text-gray-900">{selectedFruit.label}</strong>
              </p>
            )}
          </div>

          {/* What to try */}
          <h3 className="mt-6 text-sm font-semibold text-gray-900">
            Try it yourself
          </h3>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>Focus the button and press <Kbd>Enter</Kbd>, <Kbd>Space</Kbd>, or <Kbd>↓</Kbd> to open the menu.</li>
            <li>Use <Kbd>↑</Kbd> and <Kbd>↓</Kbd> to move between items — notice the blue focus ring moves with you.</li>
            <li>Press <Kbd>Home</Kbd> or <Kbd>End</Kbd> to jump to the first or last item.</li>
            <li>Press <Kbd>Enter</Kbd> or <Kbd>Space</Kbd> to select the highlighted item.</li>
            <li>Press <Kbd>Esc</Kbd> to close without selecting — focus returns to the button.</li>
          </ul>

          {/* How it works */}
          <h3 className="mt-6 text-sm font-semibold text-gray-900">
            How I implemented it
          </h3>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            <strong>Roving tabindex</strong> — Only the currently active menu item
            has <code className="text-xs bg-gray-100 px-1 rounded">tabIndex=0</code>; every
            other item has <code className="text-xs bg-gray-100 px-1 rounded">tabIndex=-1</code>.
            When the user presses Arrow Down, I increment <code className="text-xs bg-gray-100 px-1 rounded">activeIndex</code> and
            call <code className="text-xs bg-gray-100 px-1 rounded">.focus()</code> on the
            new item. This is what makes screen readers announce each item as
            you arrow through.
          </p>
          <CodeBlock>{`// Roving tabindex: only the "active" item is tabbable
{options.map((option, i) => (
  <li
    role="menuitem"
    tabIndex={activeIndex === i ? 0 : -1}
    // ...
  >
    {option.label}
  </li>
))}`}</CodeBlock>

          <p className="mt-4 text-sm text-gray-600 leading-relaxed">
            <strong>Cyclic wrapping</strong> — I used modular arithmetic so
            pressing <Kbd>↓</Kbd> on the last item wraps to the first, and <Kbd>↑</Kbd> on
            the first wraps to the last:
          </p>
          <CodeBlock>{`// ArrowDown wraps to the top
setActiveIndex((prev) => (prev + 1) % options.length);

// ArrowUp wraps to the bottom
setActiveIndex((prev) => (prev - 1 + options.length) % options.length);`}</CodeBlock>

          <p className="mt-4 text-sm text-gray-600 leading-relaxed">
            <strong>ARIA attributes</strong> — The trigger
            has <code className="text-xs bg-gray-100 px-1 rounded">aria-haspopup="true"</code> and
            toggles <code className="text-xs bg-gray-100 px-1 rounded">aria-expanded</code>.
            The list itself is <code className="text-xs bg-gray-100 px-1 rounded">role="menu"</code> and
            each item is <code className="text-xs bg-gray-100 px-1 rounded">role="menuitem"</code>.
          </p>

          <p className="mt-4 text-sm text-gray-600 leading-relaxed">
            <strong>Focus ring</strong> — The active item gets a visible <code className="text-xs bg-gray-100 px-1 rounded">ring-2 ring-blue-500</code> border
            via Tailwind, so sighted keyboard users can always see where they
            are. This satisfies WCAG 2.4.7 (Focus Visible).
          </p>
        </section>

        <hr className="mb-12 border-gray-200" />

        {/* ────────────── WHAT I LEARNED ────────────── */}
        <section aria-labelledby="learnings-heading" className="mb-14">
          <h2 id="learnings-heading" className="text-xl font-bold text-gray-900">
            What I Learned
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-600 leading-relaxed">
            <li>
              <strong className="text-gray-900">ARIA is a contract, not magic.</strong> Adding <code className="text-xs bg-gray-100 px-1 rounded">role="dialog"</code> doesn't
              make something behave like a dialog — you still need to implement
              focus trapping, Escape handling, and focus restoration yourself.
              ARIA just tells assistive technology what the element <em>is</em>.
            </li>
            <li>
              <strong className="text-gray-900">Focus management is the hard part.</strong> The
              actual keyboard handling code isn't complicated, but figuring out
              <em> when</em> to move focus, <em>where</em> to move it, and
              how to restore it — that requires understanding the user's mental
              model.
            </li>
            <li>
              <strong className="text-gray-900">Native HTML does a lot for free.</strong> A
              regular <code className="text-xs bg-gray-100 px-1 rounded">&lt;button&gt;</code> is
              already focusable, responds to Enter and Space, and has
              an implicit role. Using semantic elements means less ARIA, less
              JavaScript, and fewer bugs.
            </li>
            <li>
              <strong className="text-gray-900">You can test a lot with just a keyboard.</strong> Putting
              your mouse away and trying to use the page with only Tab, Enter,
              Space, Arrows, and Escape reveals problems instantly. I found most
              of my bugs this way before ever opening a screen reader.
            </li>
          </ul>
        </section>

        {/* ────────────── RESOURCES ────────────── */}
        <section aria-labelledby="resources-heading" className="mb-10">
          <h2 id="resources-heading" className="text-xl font-bold text-gray-900">
            Resources I Used
          </h2>
          <ul className="mt-4 list-disc pl-5 space-y-1.5 text-sm text-gray-600">
            <li>
              <a href="https://www.w3.org/WAI/ARIA/apg/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline underline-offset-2 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:rounded">
                WAI-ARIA Authoring Practices Guide (APG)
              </a> — the go-to reference for every pattern I implemented.
            </li>
            <li>
              <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline underline-offset-2 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:rounded">
                WCAG 2.1 Quick Reference
              </a> — for checking specific success criteria (like 2.4.7 Focus Visible).
            </li>
            <li>
              <a href="https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline underline-offset-2 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:rounded">
                MDN ARIA Documentation
              </a> — the clearest explanation of individual ARIA roles and properties.
            </li>
            <li>
              <a href="https://www.section508.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline underline-offset-2 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:rounded">
                Section508.gov
              </a> — for understanding the legal compliance requirements.
            </li>
          </ul>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        Built from scratch with React, Vite, and Tailwind CSS — no UI library dependencies.
      </footer>

      {/* ── Modal Instance ─────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Dialog"
      >
        <p>
          This modal traps focus. Try pressing <Kbd>Tab</Kbd> — you'll cycle
          between the X button, Cancel, and Confirm without ever reaching the
          page behind. Press <Kbd>Esc</Kbd> to close and focus will return to
          the "Open Modal" button.
        </p>
      </Modal>
    </div>
  )
}
