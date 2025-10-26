import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// GET /api/coordinators
router.get('/', async (req, res) => {
  try {
    const coordinators = await prisma.coordinator.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(coordinators);
  } catch (error) {
    console.error('Error fetching coordinators:', error);
    res.status(500).json({ error: 'Failed to fetch coordinators' });
  }
});

// POST /api/coordinators
router.post('/', async (req, res) => {
  try {
    const { id, name, email, phone, department, position, isActive = true } = req.body;
    
    if (!id || !name || !email || !phone || !department || !position) {
      return res.status(400).json({ error: 'All fields except isActive are required' });
    }

    const coordinator = await prisma.coordinator.create({
      data: { id, name, email, phone, department, position, isActive }
    });
    
    res.status(201).json(coordinator);
  } catch (error) {
    console.error('Error creating coordinator:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Coordinator with this ID already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create coordinator' });
    }
  }
});

// PUT /api/coordinators/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    delete updateData.id;

    const coordinator = await prisma.coordinator.update({
      where: { id },
      data: updateData
    });

    res.json(coordinator);
  } catch (error) {
    console.error('Error updating coordinator:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Coordinator not found' });
    } else {
      res.status(500).json({ error: 'Failed to update coordinator' });
    }
  }
});

// DELETE /api/coordinators/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.coordinator.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting coordinator:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Coordinator not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete coordinator' });
    }
  }
});

export default router;
