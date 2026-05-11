import { apartmentRepository } from "../repositories/apartment.repository";
import { CreateApartmentRequest } from "../schemas/condominium.schema";

export const apartmentService = {
  async getAll(condominiumId?: string, take?: number, cursor?: string) {
    return apartmentRepository.findMany(condominiumId, take, cursor);
  },

  async create(data: CreateApartmentRequest) {
    return apartmentRepository.create({
      number: data.number,
      block: data.block,
      areaM2: data.areaM2,
      fractionPct: data.fractionPct,
      condominiumId: data.condominiumId,
    });
  },
};
