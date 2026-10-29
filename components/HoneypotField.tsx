/** Name of the hidden honeypot field. Real visitors never see or fill it;
 * most spam bots fill every field they find, and the API then silently
 * drops the submission. */
export const HONEYPOT_FIELD = "website";

/**
 * Off-screen rather than display:none, since some bots skip fields that are
 * hidden outright. Hidden from screen readers and skipped by Tab so no real
 * visitor lands in it.
 */
export function HoneypotField() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
      <label htmlFor={`hp-${HONEYPOT_FIELD}`}>Leave this field empty</label>
      <input
        id={`hp-${HONEYPOT_FIELD}`}
        type="text"
        name={HONEYPOT_FIELD}
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
}

/** Reads the honeypot value from a submitted form. */
export function honeypotValue(form: HTMLFormElement): string {
  const value = new FormData(form).get(HONEYPOT_FIELD);
  return typeof value === "string" ? value : "";
}
