import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// GET /api/students
router.get('/', async (req, res) => {
  try {
    const students = await prisma.registeredStudent.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// POST /api/students
router.post('/', async (req, res) => {
  try {
    const { id, name, email, phone, department, year, enrollmentNumber } = req.body;
    
    if (!id || !name || !email || !phone || !department || !year || !enrollmentNumber) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const student = await prisma.registeredStudent.create({
      data: { id, name, email, phone, department, year, enrollmentNumber }
    });
    
    res.status(201).json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Student with this ID already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create student' });
    }
  }
});

// PUT /api/students/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    delete updateData.id; // Remove ID from update data

    const student = await prisma.registeredStudent.update({
      where: { id },
      data: updateData
    });

    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Student not found' });
    } else {
      res.status(500).json({ error: 'Failed to update student' });
    }
  }
});

// DELETE /api/students/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.registeredStudent.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting student:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Student not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete student' });
    }
  }
});

export default router;
