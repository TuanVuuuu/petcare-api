import * as petsRepo from "../repositories/petsRepo.js";

export async function createPet(ownerId, name, type, age) {
  return await petsRepo.createPet(ownerId, name, type, age);
}

export async function getPetsByUser(ownerId) {
  return await petsRepo.getPetsByUser(ownerId);
}

export async function getPetById(ownerId, petId) {
  return await petsRepo.getPetById(ownerId, petId);
}

export async function updatePet(ownerId, petId, updateData) {
  return await petsRepo.updatePet(ownerId, petId, updateData);
}

export async function deletePet(ownerId, petId) {
  return await petsRepo.deletePet(ownerId, petId);
}