export interface CustomPage {
  slug: string;
  title: string;
  subtitle?: string;
  sections: CustomSection[];
}

export interface CustomSection {
  id: string;
  type:
    | "hero"
    | "cards"
    | "timeline"
    | "faq"
    | "cta"
    | "gallery"
    | "text";

  title?: string;
  subtitle?: string;

  items?: CustomItem[];

  config?: Record<string, any>;
}

export interface CustomItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
}

export default function PageRenderer({
  page,
}: {
  page: CustomPage;
}) {
  return (
    <main>
    </main>
  );
}