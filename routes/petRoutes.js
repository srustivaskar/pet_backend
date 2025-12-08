const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    getUserPets,
    getPetById,
    createPet,
    updatePet,
    deletePet,
    addMedicalRecord,
    addVaccination
} = require('../controllers/petController');

const router = express.Router();

// All pet routes require authentication
router.use(protect);

// Pet management routes
router.get('/', getUserPets);
router.get('/:id', getPetById);
router.post('/', createPet);
router.put('/:id', updatePet);
router.delete('/:id', deletePet);

// Medical record routes
router.post('/:id/medical', addMedicalRecord);
router.post('/:id/vaccination', addVaccination);

module.exports = router;
