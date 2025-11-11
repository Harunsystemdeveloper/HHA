import { useEffect, useState } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  buttonLabel?: string;
};

export default function SearchBar({ value, onChange, placeholder = 'Sök inlägg...', buttonLabel = 'Sök' }: Props) {
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  function submit() {
    onChange(local.trim());
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-24 text-[15px] shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
      />
      <button
        type="button"
        onClick={submit}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        {buttonLabel}
      </button>
    </div>
  );
}

