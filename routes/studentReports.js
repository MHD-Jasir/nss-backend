import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// GET /api/student-reports
router.get('/', async (req, res) => {
  try {
    const reports = await prisma.studentReport.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching student reports:', error);
    res.status(500).json({ error: 'Failed to fetch student reports' });
  }
});

// GET /api/student-reports/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const report = await prisma.studentReport.findUnique({
      where: { id }
    });

    if (!report) {
      return res.status(404).json({ error: 'Student report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching student report:', error);
    res.status(500).json({ error: 'Failed to fetch student report' });
  }
});

// POST /api/student-reports
router.post('/', async (req, res) => {
  try {
    const { 
      id, studentId, studentName, department, year, 
      activities = [], coordinatedPrograms = [] 
    } = req.body;
    
    if (!id || !studentId || !studentName || !department || !year) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const report = await prisma.studentReport.create({
      data: { 
        id, studentId, studentName, department, year, 
        activities, coordinatedPrograms 
      }
    });
    
    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating student report:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Student report with this ID already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create student report' });
    }
  }
});

// PUT /api/student-reports/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.id;

    const report = await prisma.studentReport.update({
      where: { id },
      data: updateData
    });

    res.json(report);
  } catch (error) {
    console.error('Error updating student report:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Student report not found' });
    } else {
      res.status(500).json({ error: 'Failed to update student report' });
    }
  }
});

// DELETE /api/student-reports/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.studentReport.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting student report:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Student report not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete student report' });
    }
  }
});

export default router;
