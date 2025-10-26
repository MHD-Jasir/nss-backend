import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// GET /api/departments
router.get('/', async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// POST /api/departments
router.post('/', async (req, res) => {
  try {
    const { id, name, isActive = true } = req.body;
    
    if (!id || !name) {
      return res.status(400).json({ error: 'ID and name are required' });
    }

    const department = await prisma.department.create({
      data: { id, name, isActive }
    });
    
    res.status(201).json(department);
  } catch (error) {
    console.error('Error creating department:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Department with this ID already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create department' });
    }
  }
});

// PUT /api/departments/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const department = await prisma.department.update({
      where: { id },
      data: { name, isActive }
    });

    res.json(department);
  } catch (error) {
    console.error('Error updating department:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Department not found' });
    } else {
      res.status(500).json({ error: 'Failed to update department' });
    }
  }
});

// DELETE /api/departments/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.department.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting department:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Department not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete department' });
    }
  }
});

export default router;
