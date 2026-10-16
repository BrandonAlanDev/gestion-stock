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
      className={`h-32 rounded-[2rem] border p-6 text-left transition-all ${
        checked
          ? "border-[var(--admin-primario)] bg-[var(--admin-primario-suave)] text-[var(--admin-primario)]"
          : "border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] text-[var(--admin-texto)]"
      }`}
    >
      <div className="flex flex-col h-full justify-between">
        <h3 className="text-xl font-black uppercase italic tracking-tight ">
          {title}
        </h3>

        <div
          className={`h-8 w-14 rounded-full p-1 transition-all ${
            checked ? "bg-[var(--admin-primario)]" : "bg-[var(--admin-fondo-hover)]"
          }`}
        >
          <div
            className={`
              h-6 w-6 rounded-full bg-[var(--admin-fondo)] transition-all
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
