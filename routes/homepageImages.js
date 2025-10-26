import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// GET /api/homepage-images
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const whereClause = type ? { type, isActive: true } : { isActive: true };
    
    const images = await prisma.homepageImage.findMany({
      where: whereClause,
      orderBy: { order: 'asc' }
    });
    res.json(images);
  } catch (error) {
    console.error('Error fetching homepage images:', error);
    res.status(500).json({ error: 'Failed to fetch homepage images' });
  }
});

// POST /api/homepage-images
router.post('/', async (req, res) => {
  try {
    const { id, url, type, order = 0, isActive = true } = req.body;
    
    if (!id || !url || !type) {
      return res.status(400).json({ error: 'ID, URL, and type are required' });
    }

    if (!['left', 'right'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "left" or "right"' });
    }

    const image = await prisma.homepageImage.create({
      data: { id, url, type, order, isActive }
    });
    
    res.status(201).json(image);
  } catch (error) {
    console.error('Error creating homepage image:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Homepage image with this ID already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create homepage image' });
    }
  }
});

// PUT /api/homepage-images/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    delete updateData.id;

    const image = await prisma.homepageImage.update({
      where: { id },
      data: updateData
    });

    res.json(image);
  } catch (error) {
    console.error('Error updating homepage image:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Homepage image not found' });
    } else {
      res.status(500).json({ error: 'Failed to update homepage image' });
    }
  }
});

// DELETE /api/homepage-images/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.homepageImage.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting homepage image:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Homepage image not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete homepage image' });
    }
  }
});

export default router;
