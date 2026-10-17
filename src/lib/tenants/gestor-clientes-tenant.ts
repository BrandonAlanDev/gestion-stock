import "server-only";
import type { TenantRegistryEntry } from "./registry/types";

export type IdentidadConexionTenant = TenantRegistryEntry;

export interface OpcionesGestorClientesTenant<T> {
  limiteClientes: number;
  ttlInactividadMs: number;
  crearCliente: (identidad: IdentidadConexionTenant) => Promise<T>;
  desconectarCliente: (cliente: T) => Promise<void>;
  ahora?: () => number;
}

interface EntradaCliente<T> {
  clave: string;
  tenantId: string;
  referenciaBase: string;
  cliente?: T;
  listo: Promise<T>;
  resolver: (cliente: T) => void;
  rechazar: (error: unknown) => void;
  leases: number;
  usadoEn: number;
  obsoleto: boolean;
}

interface ReservaCliente<T> {
  entrada: EntradaCliente<T>;
  inicializar: boolean;
}

/** Gestiona clientes por proceso, con leases para no expulsar clientes en uso. */
export class GestorClientesTenant<T> {
  private readonly clientes = new Map<string, EntradaCliente<T>>();
  private cola: Promise<void> = Promise.resolve();
  private readonly ahora: () => number;

  constructor(private readonly opciones: OpcionesGestorClientesTenant<T>) {
    if (!Number.isInteger(opciones.limiteClientes) || opciones.limiteClientes < 1) {
      throw new Error("El límite de clientes tenant debe ser un entero positivo");
    }
    if (!Number.isFinite(opciones.ttlInactividadMs) || opciones.ttlInactividadMs < 1) {
      throw new Error("El TTL de clientes tenant debe ser positivo");
    }
    this.ahora = opciones.ahora ?? Date.now;
  }

  async ejecutar<R>(
    identidad: IdentidadConexionTenant,
    operacion: (cliente: T) => Promise<R>,
  ): Promise<R> {
    const reserva = await this.reservar(identidad);
    const { entrada } = reserva;

    if (reserva.inicializar) {
      try {
        const cliente = await this.opciones.crearCliente(identidad);
        entrada.cliente = cliente;
        entrada.resolver(cliente);
      } catch (error) {
        entrada.rechazar(error);
      }
    }

    let cliente: T;
    try {
      cliente = await entrada.listo;
    } catch {
      entrada.obsoleto = true;
      await this.soltar(entrada);
      throw new Error("No se pudo completar la operación en la base de datos de la organización");
    }

    try {
      return await operacion(cliente);
    } finally {
      await this.soltar(entrada);
    }
  }

  async invalidar(tenantId: string): Promise<void> {
    await this.exclusivo(async () => {
      for (const entrada of this.clientes.values()) {
        if (entrada.tenantId !== tenantId) continue;
        entrada.obsoleto = true;
        if (entrada.leases === 0) await this.desalojar(entrada);
      }
    });
  }

  private clave(identidad: IdentidadConexionTenant): string {
    return JSON.stringify([
      identidad.tenant.id,
      identidad.referenciaBase,
      identidad.versionCredenciales,
    ]);
  }

  private async exclusivo<R>(operacion: () => Promise<R>): Promise<R> {
    let liberar: () => void = () => undefined;
    const anterior = this.cola;
    this.cola = new Promise<void>((resolve) => { liberar = resolve; });
    await anterior;
    try {
      return await operacion();
    } finally {
      liberar();
    }
  }

  private crearEntrada(
    clave: string,
    identidad: IdentidadConexionTenant,
  ): EntradaCliente<T> {
    let resolver!: (cliente: T) => void;
    let rechazar!: (error: unknown) => void;
    const listo = new Promise<T>((resolve, reject) => {
      resolver = resolve;
      rechazar = reject;
    });
    void listo.catch(() => undefined);
    return {
      clave,
      tenantId: identidad.tenant.id,
      referenciaBase: identidad.referenciaBase,
      listo,
      resolver,
      rechazar,
      leases: 1,
      usadoEn: this.ahora(),
      obsoleto: false,
    };
  }

  private async desalojar(entrada: EntradaCliente<T>): Promise<void> {
    if (entrada.leases !== 0 || this.clientes.get(entrada.clave) !== entrada) return;
    this.clientes.delete(entrada.clave);
    if (entrada.cliente !== undefined) {
      try {
        await this.opciones.desconectarCliente(entrada.cliente);
      } catch {
        // La entrada salió del registro; el siguiente uso creará un cliente nuevo.
      }
    }
  }

  private async limpiarInactivos(): Promise<void> {
    const ahora = this.ahora();
    const candidatas = [...this.clientes.values()]
      .filter((entrada) => entrada.leases === 0 && (
        entrada.obsoleto || ahora - entrada.usadoEn >= this.opciones.ttlInactividadMs
      ))
      .sort((a, b) => a.usadoEn - b.usadoEn);
    for (const entrada of candidatas) await this.desalojar(entrada);
  }

  private async reservar(identidad: IdentidadConexionTenant): Promise<ReservaCliente<T>> {
    const clave = this.clave(identidad);
    return this.exclusivo(async () => {
      for (const existente of this.clientes.values()) {
        if (
          existente.referenciaBase === identidad.referenciaBase &&
          existente.tenantId !== identidad.tenant.id
        ) {
          throw new Error("La referencia de conexión ya está asociada a otro tenant activo");
        }
        if (existente.tenantId === identidad.tenant.id && existente.clave !== clave) {
          existente.obsoleto = true;
        }
      }

      await this.limpiarInactivos();
      const existente = this.clientes.get(clave);
      if (existente) {
        if (existente.obsoleto) {
          throw new Error("La conexión de este tenant fue invalidada; reintentá la operación");
        }
        existente.leases += 1;
        existente.usadoEn = this.ahora();
        return { entrada: existente, inicializar: false };
      }

      await this.limpiarInactivos();
      while (this.clientes.size >= this.opciones.limiteClientes) {
        const menosUsada = [...this.clientes.values()]
          .filter((entrada) => entrada.leases === 0)
          .sort((a, b) => a.usadoEn - b.usadoEn)[0];
        if (!menosUsada) {
          throw new Error("Se alcanzó el límite de conexiones a bases tenant; reintentá la operación");
        }
        await this.desalojar(menosUsada);
      }

      const entrada = this.crearEntrada(clave, identidad);
      this.clientes.set(clave, entrada);
      return { entrada, inicializar: true };
    });
  }

  private async soltar(entrada: EntradaCliente<T>): Promise<void> {
    await this.exclusivo(async () => {
      entrada.leases = Math.max(0, entrada.leases - 1);
      entrada.usadoEn = this.ahora();
      if (entrada.leases === 0 && entrada.obsoleto) await this.desalojar(entrada);
    });
  }
}
