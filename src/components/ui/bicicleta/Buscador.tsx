import { Button } from "../button";
export default function Buscador() {
  return (
    <section className="space-y-1 w-full">
      <form className="flex justify-between gap-2 w-full border-2 border-primary bg-white/90 p-2 rounded-2xl">
        <input
          name="search"
          placeholder="🔍 Buscar..."
          className="px-2 py-1 rounded w-full border border-white/90"
        />
        <Button variant={'celeste'} className="px-3 rounded">
          Buscar
        </Button>
      </form>
    </section>
  );
}
