import { useEffect, useRef, useState } from "react";

export function HobbiesTooltip({
  hobbies,
  id,
}: {
  hobbies: string[];
  id: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <span
      ref={containerRef}
      className={`hobbies-tooltip-container${open ? " is-open" : ""}`}
    >
      <button
        ref={buttonRef}
        type="button"
        className="tag tag--muted hobbies-more"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        aria-label={`Show ${hobbies.length} more hobbies`}
        title={hobbies.join(", ")}
        onClick={() => setOpen((visible) => !visible)}
      >
        +{hobbies.length}
      </button>
      {open && (
        <span id={id} className="hobbies-tooltip" role="tooltip">
          {hobbies.map((hobby) => (
            <span className="tag" key={hobby}>
              {hobby}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
