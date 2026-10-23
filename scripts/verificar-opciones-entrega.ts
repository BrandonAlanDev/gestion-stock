import assert from "node:assert/strict";
import {
  calcularOpcionesEntregaCheckout,
  estaDisponibleMetodoEntrega,
  obtenerDatosFaltantesRetiro,
} from "../src/lib/pedidos/opciones-entrega";

const direccion = {
  address: "Calle 1",
  postalCode: "1000",
  city: "CABA",
  province: "Buenos Aires",
  country: "Argentina",
};
const base = {
  checkoutEnabled: true,
  envioDomicilioEnabled: true,
  retiroTiendaEnabled: true,
  ...direccion,
};

assert.deepEqual(calcularOpcionesEntregaCheckout(null), {
  domicilioDisponible: false,
  retiroTiendaDisponible: false,
  direccionRetiro: null,
});

assert.deepEqual(calcularOpcionesEntregaCheckout(base), {
  domicilioDisponible: true,
  retiroTiendaDisponible: true,
  direccionRetiro: "Calle 1, 1000 CABA, Buenos Aires, Argentina",
});

// Una tienda puede ofrecer solo retiro.
const soloRetiro = calcularOpcionesEntregaCheckout({ ...base, envioDomicilioEnabled: false });
assert.equal(soloRetiro.domicilioDisponible, false);
assert.equal(soloRetiro.retiroTiendaDisponible, true);
assert.equal(estaDisponibleMetodoEntrega(soloRetiro, "DOMICILIO"), false);
assert.equal(estaDisponibleMetodoEntrega(soloRetiro, "RETIRO_TIENDA"), true);

// Sin checkout no se ofrece ninguna modalidad.
assert.deepEqual(calcularOpcionesEntregaCheckout({ ...base, checkoutEnabled: false }), {
  domicilioDisponible: false,
  retiroTiendaDisponible: false,
  direccionRetiro: null,
});

// El retiro no depende de mostrar la ubicación pública.
const ubicacionOculta = { ...base, locationEnabled: false };
assert.equal(calcularOpcionesEntregaCheckout(ubicacionOculta).retiroTiendaDisponible, true);
assert.equal(
  calcularOpcionesEntregaCheckout({ ...base, retiroTiendaEnabled: false }).retiroTiendaDisponible,
  false,
);

// Los datos vacíos o con espacios cuentan como faltantes.
assert.deepEqual(obtenerDatosFaltantesRetiro(direccion), []);
assert.deepEqual(
  obtenerDatosFaltantesRetiro({ ...direccion, postalCode: "  ", country: null }),
  ["código postal", "país"],
);
assert.equal(
  calcularOpcionesEntregaCheckout({ ...base, postalCode: " " }).retiroTiendaDisponible,
  false,
);

console.log("Opciones de entrega: domicilio, retiro, solo retiro, checkout apagado y dirección incompleta verificados.");
