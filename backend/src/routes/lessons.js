const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const Exercise = require('../models/Exercise');

// @route   GET /api/lessons/:id
// @desc    Obtener una lección por ID con sus ejercicios
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate({
        path: 'course',
        select: 'title language icon color'
      })
      .populate({
        path: 'exercises',
        select: '-correctAnswer',
        options: { sort: { order: 1 } }
      });

    if (!lesson) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lección no encontrada' 
      });
    }

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al obtener la lección' });
  }
});

// @route   POST /api/lessons
// @desc    Crear una nueva lección
// @access  Private (Admin)
router.post('/', async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);

    // Actualizar el curso para incluir esta lección
    const Course = require('../models/Course');
    await Course.findByIdAndUpdate(
      lesson.course,
      { 
        $push: { lessons: lesson._id },
        $inc: { totalLessons: 1 }
      }
    );

    res.status(201).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al crear lección' });
  }
});

// @route   GET /api/lessons/:id/exercises
// @desc    Obtener todos los ejercicios de una lección
// @access  Public
router.get('/:id/exercises', async (req, res) => {
  try {
    const exercises = await Exercise.find({ lesson: req.params.id })
      .sort({ order: 1 })
      .select('-correctAnswer'); // No enviar la respuesta correcta

    res.json({
      success: true,
      count: exercises.length,
      data: exercises
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al obtener ejercicios' });
  }
});

module.exports = router;
