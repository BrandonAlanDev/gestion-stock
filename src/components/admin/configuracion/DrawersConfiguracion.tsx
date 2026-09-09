"use client";

import SeccionLegal from "@/components/admin/diseno/ajustes/SeccionLegal";
import SeccionMantenimiento from "@/components/admin/diseno/ajustes/SeccionMantenimiento";
import SeccionRegional from "@/components/admin/diseno/ajustes/SeccionRegional";
import SeccionSeo from "@/components/admin/diseno/ajustes/SeccionSeo";
import SeccionTiendaOnline from "@/components/admin/diseno/ajustes/SeccionTiendaOnline";
import type { ConfigAjustes } from "@/components/admin/diseno/ajustes/tipos-ajustes";
import SeccionIdentidad from "@/components/admin/diseno/apariencia/SeccionIdentidad";
import type { ConfigApariencia } from "@/components/admin/diseno/apariencia/tipos-apariencia";
import ContactSection from "@/components/admin/page-config/ContactSection";
import FooterSection from "@/components/admin/page-config/FooterSection";
import LocationSection from "@/components/admin/page-config/LocationSection";
import SocialsSection from "@/components/admin/page-config/SocialsSection";
import DrawerSeccion from "./DrawerSeccion";
import PanelAvanzado from "./PanelAvanzado";
import SeccionMercadoPago from "./SeccionMercadoPago";
import SeccionWhatsApp from "./SeccionWhatsApp";
import type { ConfigCompleta } from "./tipos-configuracion";
import type { ClaveDrawer } from "./tipos-panel";
import type { EstadoConexionMP } from "@/types/mercadopago";

interface DrawersConfiguracionProps {
  config: ConfigCompleta;
  drawerAbierto: ClaveDrawer | null;
  alCerrar: () => void;
  estadoMercadoPago: EstadoConexionMP;
}

export default function DrawersConfiguracion({
  config,
  drawerAbierto,
  alCerrar,
  estadoMercadoPago,
}: DrawersConfiguracionProps) {
  const aConfigApariencia = (): ConfigApariencia => ({
    storeName: config.storeName,
    slogan: config.slogan ?? null,
    description: config.description ?? null,
    logo: config.logo ?? null,
    favicon: config.favicon ?? null,
    primaryColor: config.primaryColor ?? "#06b6d4",
    secondaryColor: config.secondaryColor ?? "#ffffff",
    bgColor: config.bgColor ?? "#09090b",
    fontPrimary: config.fontPrimary,
    fontSecondary: config.fontSecondary,
    borderRadius: config.borderRadius,
    shadowLevel: config.shadowLevel,
    density: config.density,
  });

  const aConfigAjustes = (): ConfigAjustes => ({
    metaTitle: config.metaTitle ?? null,
    metaDescription: config.metaDescription ?? null,
    ecommerceEnabled: config.ecommerceEnabled,
    cartEnabled: config.cartEnabled,
    checkoutEnabled: config.checkoutEnabled,
    currency: config.currency,
    language: config.language,
    maintenanceMode: config.maintenanceMode,
    termsAndConditions: config.termsAndConditions ?? null,
    privacyPolicy: config.privacyPolicy ?? null,
  });

  return (
    <>
      <DrawerSeccion
        abierto={drawerAbierto === "informacion"}
        alCerrar={alCerrar}
        titulo="Información de la tienda"
        descripcion="Nombre, logo y descripción de tu marca"
      >
        <SeccionIdentidad config={aConfigApariencia()} />
      </DrawerSeccion>

      <DrawerSeccion
        abierto={drawerAbierto === "contacto"}
        alCerrar={alCerrar}
        titulo="Datos de contacto"
        descripcion="Teléfono, WhatsApp y email"
      >
        <ContactSection
          config={{
            phone: config.phone,
            whatsapp: config.whatsapp,
            email: config.email,
          }}
          primaryColor={config.primaryColor ?? undefined}
          secondaryColor={config.secondaryColor ?? undefined}
        />
      </DrawerSeccion>

      <DrawerSeccion
        abierto={drawerAbierto === "ubicacion"}
        alCerrar={alCerrar}
        titulo="Ubicación"
        descripcion="Dirección que se muestra en la tienda"
      >
        <LocationSection
          config={{
            locationEnabled: config.locationEnabled,
            address: config.address,
            city: config.city,
            province: config.province,
            country: config.country,
          }}
          primaryColor={config.primaryColor ?? undefined}
          secondaryColor={config.secondaryColor ?? undefined}
        />
      </DrawerSeccion>

      <DrawerSeccion
        abierto={drawerAbierto === "redes"}
        alCerrar={alCerrar}
        titulo="Redes sociales"
        descripcion="Enlaces a tus perfiles"
      >
        <SocialsSection
          config={{
            instagram: config.instagram,
            facebook: config.facebook,
            tiktok: config.tiktok,
            x: config.x,
            youtube: config.youtube,
            linkedin: config.linkedin,
          }}
          primaryColor={config.primaryColor ?? undefined}
          secondaryColor={config.secondaryColor ?? undefined}
        />
      </DrawerSeccion>

      <DrawerSeccion
        abierto={drawerAbierto === "regional"}
        alCerrar={alCerrar}
        titulo="Configuración regional"
        descripcion="Moneda e idioma"
      >
        <SeccionRegional config={aConfigAjustes()} />
      </DrawerSeccion>

      <DrawerSeccion
        abierto={drawerAbierto === "tienda"}
        alCerrar={alCerrar}
        titulo="Tienda online"
        descripcion="Carrito y compra en el sitio"
      >
        <SeccionTiendaOnline config={aConfigAjustes()} />
      </DrawerSeccion>

      <DrawerSeccion
        abierto={drawerAbierto === "whatsapp"}
        alCerrar={alCerrar}
        titulo="WhatsApp"
        descripcion="Recibí pedidos por WhatsApp"
      >
        <SeccionWhatsApp config={config} />
      </DrawerSeccion>

      <DrawerSeccion
        abierto={drawerAbierto === "mercadopago"}
        alCerrar={alCerrar}
        titulo="Mercado Pago"
        descripcion="Conectá tu cuenta para cobrar online"
      >
        <SeccionMercadoPago estadoInicial={estadoMercadoPago} />
      </DrawerSeccion>

      <DrawerSeccion
        abierto={drawerAbierto === "mantenimiento"}
        alCerrar={alCerrar}
        titulo="Mantenimiento"
        descripcion="Ocultá la tienda temporalmente"
      >
        <SeccionMantenimiento config={aConfigAjustes()} />
      </DrawerSeccion>

      <DrawerSeccion
        abierto={drawerAbierto === "seo"}
        alCerrar={alCerrar}
        titulo="SEO"
        descripcion="Título y descripción para buscadores"
      >
        <SeccionSeo config={aConfigAjustes()} />
      </DrawerSeccion>

      <DrawerSeccion
        abierto={drawerAbierto === "legal"}
        alCerrar={alCerrar}
        titulo="Textos legales"
        descripcion="Términos y políticas de privacidad"
      >
        <SeccionLegal config={aConfigAjustes()} />
      </DrawerSeccion>

      <DrawerSeccion
        abierto={drawerAbierto === "avanzado"}
        alCerrar={alCerrar}
        titulo="Configuración avanzada"
        descripcion="Acciones peligrosas"
      >
        <PanelAvanzado config={config} />
      </DrawerSeccion>

      <DrawerSeccion
        abierto={drawerAbierto === "footer"}
        alCerrar={alCerrar}
        titulo="Footer"
        descripcion="Textos y visibilidad del pie de página"
      >
        <FooterSection
          config={{
            footerAboutText: config.footerAboutText,
            footerCopyrightText: config.footerCopyrightText,
            footerShowSobre: config.footerShowSobre,
            footerShowNavegacion: config.footerShowNavegacion,
            footerShowContacto: config.footerShowContacto,
            footerShowUbicacion: config.footerShowUbicacion,
            footerShowRedes: config.footerShowRedes,
            footerShowLegales: config.footerShowLegales,
          }}
        />
      </DrawerSeccion>
    </>
  );
}
