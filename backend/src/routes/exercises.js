const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');

// @route   GET /api/exercises/:id
// @desc    Obtener un ejercicio por ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id)
      .select('-correctAnswer') // No enviar la respuesta correcta
      .populate({
        path: 'lesson',
        select: 'title course',
        populate: {
          path: 'course',
          select: 'title language'
        }
      });

    if (!exercise) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ejercicio no encontrado' 
      });
    }

    res.json({
      success: true,
      data: exercise
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al obtener el ejercicio' });
  }
});

// @route   POST /api/exercises/:id/check
// @desc    Verificar respuesta de un ejercicio
// @access  Public
router.post('/:id/check', async (req, res) => {
  try {
    const { answer } = req.body;
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ejercicio no encontrado' 
      });
    }

    let isCorrect = false;

    // Verificar según el tipo de ejercicio
    if (exercise.type === 'multiple-choice') {
      // Para multiple choice, verificar si la opción seleccionada es correcta
      const selectedOption = exercise.options.find(opt => opt.text === answer);
      isCorrect = selectedOption ? selectedOption.isCorrect : false;
    } else {
      // Para otros tipos, comparar directamente
      isCorrect = answer.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();
    }

    res.json({
      success: true,
      isCorrect,
      explanation: exercise.explanation,
      correctAnswer: isCorrect ? null : exercise.correctAnswer,
      xpEarned: isCorrect ? exercise.xpReward : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al verificar respuesta' });
  }
});

// @route   POST /api/exercises
// @desc    Crear un nuevo ejercicio
// @access  Private (Admin)
router.post('/', async (req, res) => {
  try {
    const exercise = await Exercise.create(req.body);

    // Actualizar la lección para incluir este ejercicio
    const Lesson = require('../models/Lesson');
    await Lesson.findByIdAndUpdate(
      exercise.lesson,
      { $push: { exercises: exercise._id } }
    );

    res.status(201).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al crear ejercicio' });
  }
});

module.exports = router;
