import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import * as petsService from "../services/petsService.js";

const router = express.Router();

// Validation middleware
const validatePetData = (req, res, next) => {
  const { name, type, age } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Pet name is required and must be a non-empty string' });
  }
  
  if (!type || typeof type !== 'string' || type.trim().length === 0) {
    return res.status(400).json({ error: 'Pet type is required and must be a non-empty string' });
  }
  
  if (age !== undefined && (typeof age !== 'number' || age < 0 || age > 50)) {
    return res.status(400).json({ error: 'Pet age must be a number between 0 and 50' });
  }
  
  // Clean data
  req.body.name = name.trim();
  req.body.type = type.trim();
  
  next();
};

// ✅ Create pet
router.post("/", verifyToken, validatePetData, async (req, res) => {
  try {
    const { name, type, age } = req.body;
    const newPet = await petsService.createPet(req.user.uid, name, type, age);
    res.status(201).json({
      message: 'Pet created successfully',
      pet: newPet
    });
  } catch (error) {
    console.error('❌ Error creating pet:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get pets by logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const pets = await petsService.getPetsByUser(req.user.uid);
    res.json({
      message: 'Pets retrieved successfully',
      count: pets.length,
      pets
    });
  } catch (error) {
    console.error('❌ Error getting pets:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get single pet by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const pet = await petsService.getPetById(req.user.uid, req.params.id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    res.json({
      message: 'Pet retrieved successfully',
      pet
    });
  } catch (error) {
    console.error('❌ Error getting pet:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Update pet
router.put("/:id", verifyToken, validatePetData, async (req, res) => {
  try {
    const { name, type, age } = req.body;
    const updatedPet = await petsService.updatePet(req.user.uid, req.params.id, { name, type, age });
    if (!updatedPet) {
      return res.status(404).json({ error: 'Pet not found or you do not have permission to update it' });
    }
    res.json({
      message: 'Pet updated successfully',
      pet: updatedPet
    });
  } catch (error) {
    console.error('❌ Error updating pet:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Delete pet (only if user is the owner)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const result = await petsService.deletePet(req.user.uid, req.params.id);
    res.json({
      message: 'Pet deleted successfully',
      result
    });
  } catch (error) {
    console.error('❌ Error deleting pet:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('permission')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;