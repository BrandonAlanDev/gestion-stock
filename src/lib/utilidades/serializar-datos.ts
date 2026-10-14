export function serializarDatos<T>(datos: T): T {
  return JSON.parse(
    JSON.stringify(datos, (_, valor) =>
      typeof valor === "object" && valor?.constructor?.name === "Decimal"
        ? valor.toNumber()
        : valor
    )
  );
}
