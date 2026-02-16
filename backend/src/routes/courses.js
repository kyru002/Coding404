const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

// @route   GET /api/courses
// @desc    Obtener todos los cursos
// @access  Public
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true })
      .sort({ order: 1 })
      .select('-__v');

    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al obtener cursos' });
  }
});

// @route   GET /api/courses/:id
// @desc    Obtener un curso por ID con sus lecciones
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: 'lessons',
        select: 'title description order type difficulty xpReward isLocked',
        options: { sort: { order: 1 } }
      });

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Curso no encontrado' 
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al obtener el curso' });
  }
});

// @route   POST /api/courses
// @desc    Crear un nuevo curso
// @access  Private (Admin)
router.post('/', async (req, res) => {
  try {
    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al crear curso' });
  }
});

// @route   GET /api/courses/:id/lessons
// @desc    Obtener todas las lecciones de un curso
// @access  Public
router.get('/:id/lessons', async (req, res) => {
  try {
    const lessons = await Lesson.find({ course: req.params.id })
      .sort({ order: 1 })
      .select('-__v');

    res.json({
      success: true,
      count: lessons.length,
      data: lessons
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al obtener lecciones' });
  }
});

module.exports = router;
