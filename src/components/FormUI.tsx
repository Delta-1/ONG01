import { useId } from "react";
import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";
export const inputClass =
  "w-full rounded-xl border border-forest-200 bg-white px-4 py-3 text-base text-forest-900 outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 disabled:bg-forest-50";
export function Field({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-forest-800"
      >
        {label}
        {props.required && " *"}
      </label>
      <input {...props} id={id} className={inputClass} />
      {hint && <p className="mt-1 text-xs text-forest-500">{hint}</p>}
    </div>
  );
}
export function TextField({
  label,
  hint,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
}) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-forest-800"
      >
        {label}
        {props.required && " *"}
      </label>
      <textarea rows={4} {...props} id={id} className={inputClass} />
      {hint && <p className="mt-1 text-xs text-forest-500">{hint}</p>}
    </div>
  );
}
export function Message({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <p
      role={error ? "alert" : "status"}
      className={`rounded-xl border p-4 text-sm ${error ? "border-red-200 bg-red-50 text-red-800" : "border-forest-200 bg-forest-50 text-forest-800"}`}
    >
      {children}
    </p>
  );
}
