import { actualizarBicicleta } from "@/actions/bicicleta.actions";

export default function FormEditarBicicleta({
  bicicleta,
}: {
  bicicleta: any;
}) {
  return (
    <form
      action={actualizarBicicleta}
      className="flex gap-1 items-center"
    >
      <input type="hidden" name="id" value={bicicleta.id} />

      <input name="marca" defaultValue={bicicleta.marca} className="border px-1 w-20" />
      <input name="modelo" defaultValue={bicicleta.modelo} className="border px-1 w-20" />
      <input
        name="rodado"
        type="number"
        defaultValue={bicicleta.rodado}
        className="border px-1 w-16"
      />
      <input name="color" defaultValue={bicicleta.color ?? ""} className="border px-1 w-20" />

      <button className="bg-green-600 text-white px-2 rounded">
        Guardar
      </button>
    </form>
  );
}
