import slugify from "slugify";

export function generateSeoImageData(
  storeName: string,
  type:
    | "logo"
    | "banner"
    | "favicon"
) {
  const slug = slugify(
    storeName,
    {
      lower: true,
      strict: true,
      trim: true,
    }
  );

  return {
    folder: `gestion-stock/${slug}/branding/${type}`,

    publicId: `${slug}-${type}`,

    displayName: `${slug}-${type}`,
  };
}