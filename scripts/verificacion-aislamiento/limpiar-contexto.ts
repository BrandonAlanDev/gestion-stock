import type { ContextoVerificacion } from "./tipos";

export async function limpiarContexto(contexto: ContextoVerificacion): Promise<void> {
  const { cliente, tenantA, tenantB } = contexto;
  const filtro = { tenantId: { in: [tenantA, tenantB] } };

  await cliente.movement.deleteMany({ where: filtro });
  await cliente.garmentVariantOptionValue.deleteMany({
    where: { variant: { tenantId: { in: [tenantA, tenantB] } } },
  });
  await cliente.garmentOptionValue.deleteMany({ where: filtro });
  await cliente.garmentVariant.deleteMany({ where: filtro });
  await cliente.garmentOption.deleteMany({ where: filtro });
  await cliente.garmentImage.deleteMany({ where: filtro });
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
  await cliente.category.deleteMany({ where: filtro });
  await cliente.account.deleteMany({ where: filtro });
  await cliente.user.deleteMany({ where: filtro });
  await cliente.tenant.deleteMany({ where: { id: { in: [tenantA, tenantB] } } });
}
