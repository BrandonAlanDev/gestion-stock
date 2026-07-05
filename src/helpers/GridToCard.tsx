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
    image: grid.image,
    href,
  };
}