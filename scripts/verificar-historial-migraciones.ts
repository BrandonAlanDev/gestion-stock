import assert from "node:assert/strict";
import { coincideHistorialMigraciones } from "./tenants/comparar-migraciones";

const migraciones = [
  { nombre: "20260101000000_inicio", checksum: "a1" },
  { nombre: "20260102000000_pedidos", checksum: "b2" },
];

assert.equal(
  coincideHistorialMigraciones(migraciones, [...migraciones].reverse()),
  true,
  "El orden de lectura no debe alterar un historial idéntico",
);
assert.equal(
  coincideHistorialMigraciones(migraciones, [
    migraciones[0]!,
    { nombre: "20260102000000_pedidos", checksum: "checksum-distinto" },
  ]),
  false,
  "Un checksum distinto debe invalidar el historial",
);
assert.equal(
  coincideHistorialMigraciones(migraciones, [migraciones[0]!]),
  false,
  "Una migración faltante debe invalidar el historial",
);
assert.equal(
  coincideHistorialMigraciones(migraciones, [
    ...migraciones,
    { nombre: "20260103000000_extra", checksum: "c3" },
  ]),
  false,
  "Una migración adicional debe invalidar el historial",
);

console.log("Historial de migraciones: nombres, checksums, faltantes y orden verificados.");
