import assert from "node:assert/strict";
import type { CredencialesBaseTenant } from "../src/lib/tenants/registry/types";
import {
  confirmarDestinoAislamiento,
  validarDestinoLocalDescartable,
} from "./tenants/validar-destino-aislamiento";

const base: CredencialesBaseTenant = {
  host: "127.0.0.1",
  puerto: 3307,
  usuario: "fixture",
  contrasena: "fixture",
  base: "gestion_tienda_test",
  ssl: false,
};

for (const host of ["localhost", "127.0.0.1", "::1", "[::1]"]) {
  assert.doesNotThrow(() => validarDestinoLocalDescartable("fixture", { ...base, host }));
}
for (const host of ["mysql.example.com", "192.168.1.20", "localhost.evil.test"]) {
  assert.throws(
    () => validarDestinoLocalDescartable("fixture", { ...base, host }),
    /host local descartable/,
  );
}
for (const database of ["gestion_tienda", "gestion_test_extra", "production_test;drop table Tenant"]) {
  assert.throws(
    () => validarDestinoLocalDescartable("fixture", { ...base, base: database }),
    /terminar en _test/,
  );
}

assert.doesNotThrow(() =>
  confirmarDestinoAislamiento(
    "fixture",
    base,
    "fixture|127.0.0.1:3307/gestion_tienda_test",
  ),
);
for (const confirmacion of [undefined, "fixture|mysql.example.com:3307/gestion_tienda_test", "fixture|127.0.0.1:3306/gestion_tienda_test"]) {
  assert.throws(
    () => confirmarDestinoAislamiento("fixture", base, confirmacion),
    /debe coincidir exactamente/,
  );
}

console.log("Guardas de destino y confirmación de pruebas descartables verificadas.");
