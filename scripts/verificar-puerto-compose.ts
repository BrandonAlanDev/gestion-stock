import assert from "node:assert/strict";
import { obtenerPuertoPublicadoLoopback } from "./tenants/puerto-compose";

assert.equal(obtenerPuertoPublicadoLoopback("127.0.0.1:33061\n"), 33061);
assert.throws(() => obtenerPuertoPublicadoLoopback("0.0.0.0:33061\n"), /loopback/);
assert.throws(() => obtenerPuertoPublicadoLoopback("127.0.0.1:33061\n127.0.0.1:33062\n"), /única/);
assert.throws(() => obtenerPuertoPublicadoLoopback("127.0.0.1:0\n"), /válido/);
assert.throws(() => obtenerPuertoPublicadoLoopback("127.0.0.1:65536\n"), /válido/);

console.log("Puertos de Compose: salida única, válida y restringida a loopback verificada.");
