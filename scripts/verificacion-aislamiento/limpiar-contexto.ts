import type { ContextoVerificacion } from "./tipos";

export async function limpiarContexto(contexto: ContextoVerificacion): Promise<void> {
  const { cliente, tenantA, tenantB } = contexto;
  const filtro = { tenantId: { in: [tenantA, tenantB] } };

  await cliente.movement.deleteMany({ where: filtro });
  await cliente.garmentImage.deleteMany({ where: filtro });
  await cliente.garmentVariant.deleteMany({ where: filtro });
  await cliente.garment.deleteMany({ where: filtro });
  await cliente.contactProvider.deleteMany({ where: filtro });
  await cliente.subCategory.deleteMany({ where: filtro });
  await cliente.size.deleteMany({ where: filtro });
  await cliente.sizeType.deleteMany({ where: filtro });
  await cliente.color.deleteMany({ where: filtro });
  await cliente.provider.deleteMany({ where: filtro });
  await cliente.carouselSlide.deleteMany({ where: filtro });
  await cliente.carousel.deleteMany({ where: filtro });
  await cliente.banner.deleteMany({ where: filtro });
  await cliente.grid.deleteMany({ where: filtro });
  await cliente.pageConfig.updateMany({ where: filtro, data: { homegridId: null } });
  await cliente.homegrid.deleteMany({ where: filtro });
  await cliente.pageConfig.deleteMany({ where: filtro });
  await cliente.customSectionItem.deleteMany({ where: filtro });
  await cliente.customSection.deleteMany({ where: filtro });
  await cliente.customPage.deleteMany({ where: filtro });
  await cliente.boardTypeTailOption.deleteMany({ where: filtro });
  await cliente.boardTypeFinOption.deleteMany({ where: filtro });
  await cliente.boardTypeFinConfigOption.deleteMany({ where: filtro });
  await cliente.boardTypeOption.deleteMany({ where: filtro });
  await cliente.boardTailOption.deleteMany({ where: filtro });
  await cliente.boardFinOption.deleteMany({ where: filtro });
  await cliente.boardFinConfigOption.deleteMany({ where: filtro });
  await cliente.boardMaterialOption.deleteMany({ where: filtro });
  await cliente.boardDeliveryOption.deleteMany({ where: filtro });
  await cliente.customBoard.deleteMany({ where: filtro });
  await cliente.category.deleteMany({ where: filtro });
  await cliente.account.deleteMany({ where: filtro });
  await cliente.user.deleteMany({ where: filtro });
  await cliente.tenant.deleteMany({ where: { id: { in: [tenantA, tenantB] } } });
}
