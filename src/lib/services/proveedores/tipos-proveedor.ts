export interface DatosCrearProveedor {
  nombre: string;
  detalles?: string | null;
  contactos: Array<{
    contacto: string;
    tipo: "EMAIL" | "PHONE";
  }>;
}

export interface DatosActualizarProveedor {
  nombre: string;
  detalles?: string | null;
  contactos: string[];
}
