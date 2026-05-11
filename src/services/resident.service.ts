import { residentRepository } from "../repositories/resident.repository";

export const residentService = {
  async getAll(apartmentId?: string, take?: number, cursor?: string) {
    return residentRepository.findMany(apartmentId, take, cursor);
  },
};
