import assert from "node:assert/strict";
import { resolverHostnameTenant } from "../src/lib/tenants/resolver-hostname-tenant";

const prueba = { enDesarrollo: true, hostnamePrueba: "Tienda.Ejemplo.com" };

assert.equal(resolverHostnameTenant("localhost:3000", prueba), "tienda.ejemplo.com");
assert.equal(resolverHostnameTenant("127.0.0.1:3000", prueba), "tienda.ejemplo.com");
assert.equal(resolverHostnameTenant("demo.localhost:3000", prueba), "tienda.ejemplo.com");
assert.equal(resolverHostnameTenant("otro.ejemplo.com", prueba), "otro.ejemplo.com");
assert.equal(resolverHostnameTenant("localhost:3000", { ...prueba, enDesarrollo: false }), "localhost");
assert.equal(resolverHostnameTenant("localhost:3000", { ...prueba, hostnamePrueba: "" }), "localhost");
assert.equal(resolverHostnameTenant("localhost:3000", { ...prueba, hostnamePrueba: "https://tienda.ejemplo.com" }), null);
assert.equal(resolverHostnameTenant("localhost:3000", { ...prueba, hostnamePrueba: "localhost" }), null);
assert.equal(resolverHostnameTenant("localhost:3000, otro.ejemplo.com", prueba), null);

console.log("Dominio de prueba: selección local, aislamiento de producción y entradas inválidas verificados.");
