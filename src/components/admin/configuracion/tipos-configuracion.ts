export interface BannerConfiguracion {
  id: number;
  image: string | null;
  title: string | null;
  subtitle: string | null;
  text: string | null;
  url: string | null;
}

export interface ConfigCompleta {
  storeName: string;
  slogan: string | null;
  description: string | null;
  logo: string | null;
  favicon: string | null;
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  fontPrimary: string;
  fontSecondary: string;
  borderRadius: string;
  shadowLevel: string;
  density: string;
  banners: BannerConfiguracion[];
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  locationEnabled: boolean;
  address: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  x: string | null;
  youtube: string | null;
  linkedin: string | null;
  ecommerceEnabled: boolean;
  cartEnabled: boolean;
  checkoutEnabled: boolean;
  currency: string;
  language: string;
  maintenanceMode: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  termsAndConditions: string | null;
  privacyPolicy: string | null;
  footerAboutText: string | null;
  footerCopyrightText: string | null;
  footerShowSobre: boolean;
  footerShowNavegacion: boolean;
  footerShowContacto: boolean;
  footerShowUbicacion: boolean;
  footerShowRedes: boolean;
  footerShowLegales: boolean;
}
