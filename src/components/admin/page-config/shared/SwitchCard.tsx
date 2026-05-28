interface Props {
  title: string;
  checked: boolean;
  onChange: (
    value: boolean
  ) => void;
}

export default function SwitchCard({
  title,
  checked,
  onChange,
}: Props) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(!checked)
      }
      className={`
        h-32 rounded-[2rem] border transition-all p-6 text-left
        ${
          checked
            ? "bg-cyan-500/10 border-cyan-500/30"
            : "bg-neutral-950 border-neutral-800"
        }
      `}
    >
      <div className="flex flex-col h-full justify-between">
        <h3 className="text-xl font-black uppercase italic tracking-tight text-white">
          {title}
        </h3>

        <div
          className={`
            w-14 h-8 rounded-full p-1 transition-all
            ${
              checked
                ? "bg-cyan-500"
                : "bg-neutral-700"
            }
          `}
        >
          <div
            className={`
              w-6 h-6 rounded-full bg-white transition-all
              ${
                checked
                  ? "translate-x-6"
                  : "translate-x-0"
              }
            `}
          />
        </div>
      </div>
    </button>
  );
}