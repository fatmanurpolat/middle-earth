import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
}

/** Eye / eye-off icon for the visibility toggle. */
function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      {!open && <path d="M3 3l18 18" />}
    </svg>
  );
}

/**
 * Password input with a show/hide toggle. Reused by the login/register door
 * and the change-password form.
 */
export default function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  hint,
}: PasswordFieldProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="block font-display text-sm uppercase tracking-[0.16em] text-gold/90"
      >
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          value={value}
          maxLength={100}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="focus-ring w-full rounded-lg border border-mithril/15 bg-ink/70 px-4 py-2.5 pr-11 text-parchment placeholder:text-mithril/30"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
          aria-pressed={visible}
          className="focus-ring absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-mithril/50 transition-colors hover:text-gold-bright"
        >
          <EyeIcon open={visible} />
        </button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-mithril/50">{hint}</p>}
    </div>
  );
}
