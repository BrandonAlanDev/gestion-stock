import { crearBicicleta } from "@/actions/bicicleta.actions";

export default function FormBicicleta() {
  return (
    <section>
      <h2>➕ Crear Bicicleta</h2>
      <small>
        Action: <b>crearBicicleta</b> → recibe FormData → crea en DB
      </small>

      <form action={crearBicicleta} style={{ marginTop: 12 }}>
        <input name="marca" placeholder="Marca" required />
        <input name="modelo" placeholder="Modelo" required />
        <input name="rodado" type="number" placeholder="Rodado" required />
        <input name="color" placeholder="Color (opcional)" />

        <button type="submit">Guardar</button>
      </form>
    </section>
  );
}
