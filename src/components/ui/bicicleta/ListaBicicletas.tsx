import Link from "next/link";
import FormEditarBicicleta from "./FormEditarBicicleta";

type Bicicleta = {
  id: number;
  marca: string;
  modelo: string;
  rodado: number;
  color: string | null;
};

export default function ListaBicicletas({
  bicicletas,
  orderBy,
  orderDir,
}: {
  bicicletas: Bicicleta[];
  orderBy?: string;
  orderDir?: string;
}) {
  const toggleDir = orderDir === "asc" ? "desc" : "asc";

  const Header = ({ campo }: { campo: string }) => (
    <Link
      href={`/bicicletas?orderBy=${campo}&orderDir=${toggleDir}`}
      className="cursor-pointer underline"
    >
      {campo.toUpperCase()}
    </Link>
  );

  return (
    <section className="space-y-2">
      <h2 className="font-semibold">📋 Listado</h2>
      <small className="text-gray-500">
        Click en el título → cambia orderBy en Prisma
      </small>

      <table className="border w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th><Header campo="marca" /></th>
            <th><Header campo="modelo" /></th>
            <th><Header campo="rodado" /></th>
            <th><Header campo="color" /></th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {bicicletas.map((bici) => (
            <tr key={bici.id} className="border-t">
              <td>{bici.marca}</td>
              <td>{bici.modelo}</td>
              <td>{bici.rodado}</td>
              <td>{bici.color}</td>
              <td>
                <FormEditarBicicleta bicicleta={bici} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
