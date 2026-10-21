import "server-only";

import { cache } from "react";
import { auth } from "@/auth";

/** Auth.js verifica el usuario al construir la sesión; se comparte en esta solicitud. */
export const obtenerSesionSolicitud = cache(() => auth());
