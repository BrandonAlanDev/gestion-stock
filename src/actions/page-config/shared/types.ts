export type PageConfigInput = {
  storeName?: string;

  description?: string | null;
  slogan?: string | null;

  logo?: string | null;
  favicon?: string | null;
  banner?: string | null;

  primaryColor?: string | null;
  secondaryColor?: string | null;
  bgColor?: string | null;

  fontPrimary?: string;
  fontSecondary?: string;
  borderRadius?: string;
  shadowLevel?: string;
  density?: string;

  ecommerceEnabled?: boolean;
  cartEnabled?: boolean;
  checkoutEnabled?: boolean;

  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;

  locationEnabled?: boolean;

  address?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  postalCode?: string | null;
  mapsUrl?: string | null;

  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  x?: string | null;
  youtube?: string | null;
  linkedin?: string | null;

  currency?: string;
  language?: string;

  maintenanceMode?: boolean;

  arreglosEnabled?: boolean;
  escuelaEnabled?: boolean;
  personalizadoEnabled?: boolean;

  footerAboutText?: string | null;
  footerCopyrightText?: string | null;
  footerShowSobre?: boolean;
  footerShowNavegacion?: boolean;
  footerShowContacto?: boolean;
  footerShowUbicacion?: boolean;
  footerShowRedes?: boolean;
  footerShowLegales?: boolean;

  metaTitle?: string | null;
  metaDescription?: string | null;

  termsAndConditions?: string | null;
  privacyPolicy?: string | null;
};