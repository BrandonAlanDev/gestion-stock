"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  ClipboardList,
  Clock,
  Cpu,
  CreditCard,
  Globe,
  History,
  Lock,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  PanelBottom,
  Percent,
  Phone,
  Plug,
  Scale,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  UserCircle,
  UserRound,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

import DrawersConfiguracion from "./DrawersConfiguracion";
import GrupoConfiguracion from "./GrupoConfiguracion";
import ItemConfiguracion from "./ItemConfiguracion";
import type { ConfigCompleta } from "./tipos-configuracion";
import type { ClaveDrawer } from "./tipos-panel";
import type { ResultadoMetodosPago, MetodoPagoAdmin } from "@/actions/pagos/obtener-metodos-pago";
import type { EstadoConexionMP } from "@/types/mercadopago";

const gruposNav = [
  { id: "general", titulo: "General", icono: Settings },
  { id: "ventas", titulo: "Ventas", icono: ShoppingBag },
  { id: "cuenta", titulo: "Cuenta", icono: UserRound },
  { id: "integraciones", titulo: "Integraciones", icono: Plug },
  { id: "sistema", titulo: "Sistema", icono: Cpu },
  { id: "avanzado", titulo: "Avanzado", icono: MoreHorizontal },
];

const MENSAJES_ERROR_MP: Record<string, string> = {
  no_autorizado: "No estás autorizado para conectar Mercado Pago.",
  sin_codigo: "Mercado Pago no devolvió el código de autorización. Intentá de nuevo.",
  estado_invalido: "La sesión de conexión expiró o fue manipulada. Intentá de nuevo.",
  configuracion_incompleta: "La conexión no está disponible en este momento.",
  autorizacion_cancelada: "Cancelaste la autorización de Mercado Pago.",
  autorizacion_fallida: "Mercado Pago no pudo autorizar la conexión. Intentá de nuevo.",
  conexion_fallida: "No se pudo completar la conexión. Intentá de nuevo más tarde.",
  inicio_fallido: "No se pudo iniciar la conexión. Intentá de nuevo más tarde.",
};

export default function PanelConfiguracion({
  config,
  estadoMercadoPago,
  resultadoMetodosPagoInicial,
}: {
  config: ConfigCompleta | null;
  estadoMercadoPago: EstadoConexionMP;
  resultadoMetodosPagoInicial: ResultadoMetodosPago;
}) {
  const [drawerAbierto, setDrawerAbierto] = useState<ClaveDrawer | null>(null);
  const [resultadoMetodosPago, setResultadoMetodosPago] = useState(resultadoMetodosPagoInicial);
  const router = useRouter();
  const parametrosBusqueda = useSearchParams();

  useEffect(() => {
    if (parametrosBusqueda.get("mp_success")) {
      toast.success("Cuenta conectada correctamente", {
        description: "Ahora podés cobrar con Mercado Pago. ¡Éxitos!",
      });
      setDrawerAbierto("mercadopago");
      router.replace("/admin/pageConfig");
    }

    const codigoError = parametrosBusqueda.get("mp_error");
    if (codigoError) {
      const mensaje =
        MENSAJES_ERROR_MP[codigoError] || "No se pudo conectar la cuenta de Mercado Pago.";
      toast.error("Error al conectar", { description: mensaje });
      setDrawerAbierto("mercadopago");
      router.replace("/admin/pageConfig");
    }
  }, [parametrosBusqueda, router]);

  if (!config) {
    return (
      <div className="min-h-screen">
        <p className="p-8 text-sm text-[var(--admin-texto-suave)]">
          No se pudo cargar la configuración
        </p>
      </div>
    );
  }

  const metodosPago = resultadoMetodosPago.ok ? resultadoMetodosPago.metodos : null;
  const actualizarMetodoPago = (id: MetodoPagoAdmin["id"], parcial: Partial<MetodoPagoAdmin>) => {
    setResultadoMetodosPago((resultado) =>
      resultado.ok
        ? {
            ok: true,
            metodos: resultado.metodos.map((metodo) =>
              metodo.id === id ? { ...metodo, ...parcial } : metodo,
            ),
          }
        : resultado,
    );
  };

  const tieneContacto = Boolean(config.phone || config.whatsapp || config.email);
  const tieneUbicacion = config.locationEnabled && Boolean(config.address);
  const seoCompleto = Boolean(config.metaTitle?.trim() && config.metaDescription?.trim());
  const tieneTextosLegales = Boolean(
    config.termsAndConditions?.trim() && config.privacyPolicy?.trim()
  );

  const cantidadRedes = [
    config.instagram,
    config.facebook,
    config.tiktok,
    config.x,
    config.youtube,
    config.linkedin,
  ].filter((red) => Boolean(red?.trim())).length;

  return (
    <div className="min-h-screen">
      <header>
        <div className="mx-auto max-w-5xl px-4 pt-7 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-[var(--admin-texto)]">Configuración</h1>
          <p className="text-sm text-[var(--admin-texto-suave)]">
            Administrá la información, las ventas y los ajustes de tu tienda.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <nav aria-label="Ir a una sección" className="flex flex-wrap gap-1.5">
          {gruposNav.map(({ id, titulo, icono: Icono }) => (
            <a
              key={id}
              href={`#grupo-${id}`}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-[var(--admin-fondo-opaco)] px-3 py-2 text-xs font-medium text-[var(--admin-texto-suave)] transition hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]"
            >
              <Icono size={13} />
              {titulo}
            </a>
          ))}
        </nav>

        <div className="mt-6 space-y-10">
          <GrupoConfiguracion idAncla="grupo-general" titulo="General">
            <ItemConfiguracion
              icono={Store}
              titulo="Información de la tienda"
              descripcion="Nombre, logo y descripción"
              varianteBadge={config.logo ? "activo" : "sin-configurar"}
              textoBadge={config.logo ? "Configurada" : "Incompleta"}
              alClick={() => setDrawerAbierto("informacion")}
            />
            <ItemConfiguracion
              icono={Phone}
              titulo="Datos de contacto"
              descripcion="Teléfono, WhatsApp y email"
              varianteBadge={tieneContacto ? "activo" : "sin-configurar"}
              textoBadge={tieneContacto ? "Configurado" : "Sin datos"}
              alClick={() => setDrawerAbierto("contacto")}
            />
            <ItemConfiguracion
              icono={MapPin}
              titulo="Ubicación"
              descripcion="Ubicación pública y disponibilidad de retiro en tienda"
              varianteBadge={
                tieneUbicacion ? "activo" : config.address ? "inactivo" : "sin-configurar"
              }
              textoBadge={
                tieneUbicacion ? "Visible" : config.address ? "Oculta" : "Sin dirección"
              }
              alClick={() => setDrawerAbierto("ubicacion")}
            />
            <ItemConfiguracion
              icono={Share2}
              titulo="Redes sociales"
              descripcion="Enlaces a tus perfiles"
              varianteBadge={cantidadRedes > 0 ? "activo" : "sin-configurar"}
              textoBadge={
                cantidadRedes > 0 ? `${cantidadRedes} conectadas` : "Sin redes"
              }
              alClick={() => setDrawerAbierto("redes")}
            />
            <ItemConfiguracion
              icono={Globe}
              titulo="Configuración regional"
              descripcion="Moneda e idioma"
              varianteBadge="info"
              textoBadge={`${config.currency} · ${
                config.language === "es" ? "Español" : config.language
              }`}
              alClick={() => setDrawerAbierto("regional")}
            />
            <ItemConfiguracion
              icono={Search}
              titulo="SEO"
              descripcion="Título y descripción para buscadores"
              varianteBadge={seoCompleto ? "activo" : "sin-configurar"}
              textoBadge={seoCompleto ? "Completo" : "Incompleto"}
              alClick={() => setDrawerAbierto("seo")}
            />
            <ItemConfiguracion
              icono={PanelBottom}
              titulo="Footer"
              descripcion="Textos y visibilidad del pie de página"
              varianteBadge={
                config.footerAboutText?.trim() ||
                config.footerCopyrightText?.trim() ||
                [
                  config.footerShowSobre,
                  config.footerShowNavegacion,
                  config.footerShowContacto,
                  config.footerShowUbicacion,
                  config.footerShowRedes,
                  config.footerShowLegales,
                ].some((visible) => visible === false)
                  ? "activo"
                  : "sin-configurar"
              }
              textoBadge={
                config.footerAboutText?.trim() ||
                config.footerCopyrightText?.trim() ||
                [
                  config.footerShowSobre,
                  config.footerShowNavegacion,
                  config.footerShowContacto,
                  config.footerShowUbicacion,
                  config.footerShowRedes,
                  config.footerShowLegales,
                ].some((visible) => visible === false)
                  ? "Configurado"
                  : "Por defecto"
              }
              alClick={() => setDrawerAbierto("footer")}
            />
            <ItemConfiguracion icono={Clock} titulo="Horarios" proximamente />
          </GrupoConfiguracion>

          <GrupoConfiguracion idAncla="grupo-ventas" titulo="Ventas">
            <ItemConfiguracion
              icono={ShoppingCart}
              titulo="Tienda online"
              descripcion="Carrito y compra en el sitio"
              varianteBadge={config.ecommerceEnabled ? "activo" : "inactivo"}
              textoBadge={config.ecommerceEnabled ? "Activada" : "Desactivada"}
              alClick={() => setDrawerAbierto("tienda")}
            />
            <ItemConfiguracion
              icono={CreditCard}
              titulo="Métodos de pago"
              descripcion="Tarjetas, transferencia y otros medios"
              varianteBadge={(metodosPago?.some((metodo) => metodo.activo) ?? false) ? "activo" : "sin-configurar"}
              textoBadge={
                metodosPago
                  ? metodosPago.some((metodo) => metodo.activo)
                    ? "Activados"
                    : "Sin activar"
                  : "No disponible"
              }
              alClick={() => setDrawerAbierto("pagos")}
            />
            <ItemConfiguracion icono={Truck} titulo="Envíos" descripcion="Gestioná las entregas a domicilio" href="/admin/envios" />
            <ItemConfiguracion icono={Percent} titulo="Impuestos" proximamente />
            <ItemConfiguracion icono={ClipboardList} titulo="Pedidos" descripcion="Consultá y gestioná los pedidos" href="/admin/orders" />
          </GrupoConfiguracion>

          <GrupoConfiguracion idAncla="grupo-cuenta" titulo="Cuenta">
            <ItemConfiguracion icono={Users} titulo="Usuarios" proximamente />
            <ItemConfiguracion icono={ShieldCheck} titulo="Permisos" proximamente />
            <ItemConfiguracion icono={UserCircle} titulo="Perfil" descripcion="Tus datos personales" href="/perfil" />
          </GrupoConfiguracion>

          <GrupoConfiguracion idAncla="grupo-integraciones" titulo="Integraciones">
            <ItemConfiguracion
              icono={MessageCircle}
              titulo="WhatsApp"
              descripcion="Recibí pedidos por WhatsApp"
              varianteBadge={config.whatsapp ? "activo" : "sin-configurar"}
              textoBadge={config.whatsapp ? "Conectado" : "Sin configurar"}
              alClick={() => setDrawerAbierto("whatsapp")}
            />
            <ItemConfiguracion
              icono={Wallet}
              titulo="Mercado Pago"
              descripcion="Cobrá online con tu cuenta"
              varianteBadge={estadoMercadoPago.conectada ? "activo" : "sin-configurar"}
              textoBadge={estadoMercadoPago.conectada ? "Conectado" : "Sin conectar"}
              alClick={() => setDrawerAbierto("mercadopago")}
            />
            <ItemConfiguracion icono={BarChart3} titulo="Google Analytics" proximamente />
            <ItemConfiguracion icono={Search} titulo="Google" proximamente />
          </GrupoConfiguracion>

          <GrupoConfiguracion idAncla="grupo-sistema" titulo="Sistema">
            <ItemConfiguracion
              icono={Wrench}
              titulo="Mantenimiento"
              descripcion="Ocultá la tienda temporalmente"
              varianteBadge={config.maintenanceMode ? "borrador" : "info"}
              textoBadge={config.maintenanceMode ? "Activado" : "Desactivado"}
              alClick={() => setDrawerAbierto("mantenimiento")}
            />
            <ItemConfiguracion
              icono={Scale}
              titulo="Textos legales"
              descripcion="Términos y política de privacidad"
              varianteBadge={tieneTextosLegales ? "activo" : "sin-configurar"}
              textoBadge={tieneTextosLegales ? "Completados" : "Sin definir"}
              alClick={() => setDrawerAbierto("legal")}
            />
            <ItemConfiguracion icono={Bell} titulo="Notificaciones" proximamente />
            <ItemConfiguracion icono={Lock} titulo="Seguridad" proximamente />
            <ItemConfiguracion icono={History} titulo="Auditoría" proximamente />
          </GrupoConfiguracion>

          <GrupoConfiguracion idAncla="grupo-avanzado" titulo="Avanzado">
            <ItemConfiguracion
              icono={AlertTriangle}
              titulo="Configuración avanzada"
              descripcion="Acciones peligrosas"
              varianteBadge="info"
              textoBadge="Con cuidado"
              alClick={() => setDrawerAbierto("avanzado")}
            />
          </GrupoConfiguracion>
        </div>
      </div>

      <DrawersConfiguracion
        config={config}
        drawerAbierto={drawerAbierto}
        alCerrar={() => setDrawerAbierto(null)}
        estadoMercadoPago={estadoMercadoPago}
        resultadoMetodosPago={resultadoMetodosPago}
        alActualizarMetodoPago={actualizarMetodoPago}
      />
    </div>
  );
}
