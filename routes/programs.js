import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// GET /api/programs
router.get('/', async (req, res) => {
  try {
    const programs = await prisma.program.findMany({
      orderBy: { startDate: 'desc' }
    });
    res.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
});

// POST /api/programs
router.post('/', async (req, res) => {
  try {
    const { 
      id, title, description, type = 'academic', 
      startDate, endDate, maxParticipants, 
      registrationOpen = true, department, coordinator 
    } = req.body;
    
    if (!id || !title || !startDate || !endDate || !maxParticipants || !department || !coordinator) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const program = await prisma.program.create({
      data: { 
        id, title, description, type, 
        startDate: new Date(startDate), 
        endDate: new Date(endDate), 
        maxParticipants, registrationOpen, 
        department, coordinator 
      }
    });
    
    res.status(201).json(program);
  } catch (error) {
    console.error('Error creating program:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Program with this ID already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create program' });
    }
  }
});

// PUT /api/programs/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.id;

    // Convert date strings to Date objects if present
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const program = await prisma.program.update({
      where: { id },
      data: updateData
    });

    res.json(program);
  } catch (error) {
    console.error('Error updating program:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Program not found' });
    } else {
      res.status(500).json({ error: 'Failed to update program' });
    }
  }
});

// DELETE /api/programs/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.program.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting program:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Program not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete program' });
    }
  }
});

export default router;
