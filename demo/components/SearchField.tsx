import { ReactNode, useId } from 'react';

export interface SearchFieldProps {
  /** What is being searched, said in the words of the page it stands on. */
  readonly label: string;
  readonly value: string;
  readonly onChange: (query: string) => void;
  /** What the search left, said under the field where there is something to say. */
  readonly children?: ReactNode;
}

/**
 * A field that sifts what is under it as it is typed in.
 *
 * There is no button to press: the list answers each keystroke, so a reader who
 * has typed enough has already been answered. The two rules a reader cannot
 * guess are written beside the field — that a word is found inside longer words,
 * and that quoting it asks for the word whole.
 */
export function SearchField({ label, value, onChange, children }: SearchFieldProps) {
  const field = useId();

  return (
    <div className="search">
      <label className="search__label" htmlFor={field}>
        {label}
      </label>
      <input
        id={field}
        className="search__field"
        type="search"
        value={value}
        autoComplete="off"
        spellCheck={false}
        aria-describedby={`${field}-law`}
        onChange={(event) => onChange(event.target.value)}
      />
      <p className="search__law" id={`${field}-law`}>
        A word is found inside longer words. Quote it to ask for the word whole.
      </p>
      {children !== undefined && children !== false && <p className="search__found">{children}</p>}
    </div>
  );
}
