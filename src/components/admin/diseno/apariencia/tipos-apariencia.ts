export interface BannerApariencia {
  id: number;
  image: string | null;
  title: string | null;
  subtitle: string | null;
  text: string | null;
  url: string | null;
}

export interface ConfigApariencia {
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
  banners: BannerApariencia[];
}

export type ConfigAparienciaEntrada =
  | null
  | Partial<{
      storeName: string | null;
      slogan: string | null;
      description: string | null;
      logo: string | null;
      favicon: string | null;
      primaryColor: string | null;
      secondaryColor: string | null;
      bgColor: string | null;
      fontPrimary: string | null;
      fontSecondary: string | null;
      borderRadius: string | null;
      shadowLevel: string | null;
      density: string | null;
      banners: BannerApariencia[] | null;
    }>;
