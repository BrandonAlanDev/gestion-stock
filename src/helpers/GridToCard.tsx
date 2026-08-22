export default function mapGridToCard(grid: any) {
  let href = "#";
  switch (grid.linkType) {
    case "CATEGORY":
      href = `/productos?categoria=${grid.linkValue}`;
      break;
    case "PRODUCT":
      href = `/productos/item/${grid.linkValue}`;
      break;
    case "PAGE":
      href = grid.linkValue || "#";
      break;
    case "EXTERNAL":
      href = grid.linkValue || "#";
      break;
    case "NONE":
    default:
      href = "#";
  }
  return {
    id: grid.id,
    label: grid.title,
    sublabel: grid.subtitle,
    subtitleNeon: grid.subtitleNeon || false,
    subtitleDim: grid.subtitleDim || false,
    linkStyle: grid.linkStyle || "IMAGE",
    buttonVariant: grid.buttonVariant || "DEFAULT",
    buttonText: grid.buttonText || "",
    buttonBgColor: grid.buttonBgColor || "",
    buttonTextColor: grid.buttonTextColor || "",
    image: grid.image,
    href,
  };
}