import { condominiumRepository } from "../repositories/condominium.repository";
import { CreateCondominiumRequest } from "../schemas/condominium.schema";

export const condominiumService = {
  async getAll(managerId?: string) {
    return condominiumRepository.findMany(managerId);
  },

  async create(data: CreateCondominiumRequest & { managerId: string }) {
    return condominiumRepository.create({
      name: data.name,
      address: data.address,
      managerId: data.managerId,
      cnpj: data.cnpj,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
    });
  },
};
