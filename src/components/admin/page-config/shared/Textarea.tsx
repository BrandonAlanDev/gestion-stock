interface Props {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}

export default function Textarea({
  label,
  value,
  onChange,
}: Props) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500 block mb-3">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        rows={5}
        className="w-full p-5 rounded-2xl bg-neutral-950 border border-neutral-800 text-sm font-bold outline-none focus:border-cyan-500 transition-all resize-none"
      />
    </div>
  );
}