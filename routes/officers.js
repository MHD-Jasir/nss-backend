import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// GET /api/officers
router.get('/', async (req, res) => {
  try {
    const officers = await prisma.officerCredential.findMany({
      where: { isActive: true },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
        // Exclude passwordHash from response
      },
      orderBy: { name: 'asc' }
    });
    res.json(officers);
  } catch (error) {
    console.error('Error fetching officers:', error);
    res.status(500).json({ error: 'Failed to fetch officers' });
  }
});

// POST /api/officers
router.post('/', async (req, res) => {
  try {
    const { id, username, passwordHash, name, email, role = 'officer', isActive = true } = req.body;
    
    if (!id || !username || !passwordHash || !name || !email) {
      return res.status(400).json({ error: 'All fields except role and isActive are required' });
    }

    const officer = await prisma.officerCredential.create({
      data: { id, username, passwordHash, name, email, role, isActive }
    });
    
    // Return without password hash
    const { passwordHash: _, ...officerResponse } = officer;
    res.status(201).json(officerResponse);
  } catch (error) {
    console.error('Error creating officer:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Officer with this ID or username already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create officer' });
    }
  }
});

// POST /api/officers/login
router.post('/login', async (req, res) => {
  try {
    const { username, passwordHash } = req.body;
    
    if (!username || !passwordHash) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const officer = await prisma.officerCredential.findFirst({
      where: { 
        username, 
        passwordHash, 
        isActive: true 
      }
    });

    if (!officer) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return officer info without password hash
    const { passwordHash: _, ...officerResponse } = officer;
    res.json({ 
      success: true, 
      officer: officerResponse 
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// PUT /api/officers/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    delete updateData.id;

    const officer = await prisma.officerCredential.update({
      where: { id },
      data: updateData
    });

    // Return without password hash
    const { passwordHash: _, ...officerResponse } = officer;
    res.json(officerResponse);
  } catch (error) {
    console.error('Error updating officer:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Officer not found' });
    } else {
      res.status(500).json({ error: 'Failed to update officer' });
    }
  }
});

// DELETE /api/officers/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.officerCredential.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting officer:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Officer not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete officer' });
    }
  }
});

export default router;
