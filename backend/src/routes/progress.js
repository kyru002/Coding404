const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const User = require('../models/User');

// @route   GET /api/progress/user/:userId
// @desc    Obtener todo el progreso de un usuario
// @access  Private
router.get('/user/:userId', async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.params.userId })
      .populate('course', 'title language icon')
      .populate('lesson', 'title order type')
      .sort({ lastAccessedAt: -1 });

    res.json({
      success: true,
      count: progress.length,
      data: progress
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al obtener progreso' });
  }
});

// @route   GET /api/progress/user/:userId/course/:courseId
// @desc    Obtener progreso de un usuario en un curso específico
// @access  Private
router.get('/user/:userId/course/:courseId', async (req, res) => {
  try {
    const progress = await Progress.find({ 
      user: req.params.userId,
      course: req.params.courseId
    })
      .populate('lesson', 'title order type xpReward')
      .sort({ 'lesson.order': 1 });

    const completedLessons = progress.filter(p => p.isCompleted).length;
    const totalXP = progress.reduce((sum, p) => sum + p.xpEarned, 0);

    res.json({
      success: true,
      data: {
        progress,
        stats: {
          completedLessons,
          totalLessons: progress.length,
          totalXP,
          completionRate: progress.length > 0 ? (completedLessons / progress.length * 100).toFixed(2) : 0
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al obtener progreso del curso' });
  }
});

// @route   POST /api/progress
// @desc    Guardar o actualizar progreso de una lección
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { userId, courseId, lessonId, exerciseId, isCorrect, score } = req.body;

    // Buscar o crear progreso
    let progress = await Progress.findOne({
      user: userId,
      course: courseId,
      lesson: lessonId
    });

    if (!progress) {
      progress = await Progress.create({
        user: userId,
        course: courseId,
        lesson: lessonId
      });
    }

    // Si es un ejercicio completado
    if (exerciseId) {
      const Exercise = require('../models/Exercise');
      const exercise = await Exercise.findById(exerciseId);
      
      const existingExercise = progress.completedExercises.find(
        e => e.exercise.toString() === exerciseId
      );

      if (existingExercise) {
        existingExercise.isCorrect = isCorrect;
        existingExercise.attempts += 1;
      } else {
        progress.completedExercises.push({
          exercise: exerciseId,
          isCorrect,
          attempts: 1,
          completedAt: new Date()
        });

        if (isCorrect && exercise) {
          progress.xpEarned += exercise.xpReward;
          
          // Actualizar XP del usuario
          await User.findByIdAndUpdate(userId, {
            $inc: { xp: exercise.xpReward }
          });
        }
      }
    }

    // Actualizar score si se proporciona
    if (score !== undefined) {
      progress.score = score;
    }

    // Actualizar fecha de último acceso
    progress.lastAccessedAt = new Date();

    // Verificar si la lección está completada
    const Lesson = require('../models/Lesson');
    const lesson = await Lesson.findById(lessonId).populate('exercises');
    
    if (lesson && lesson.exercises.length > 0) {
      const completedCount = progress.completedExercises.filter(e => e.isCorrect).length;
      if (completedCount >= lesson.exercises.length) {
        progress.isCompleted = true;
        progress.completedAt = new Date();
      }
    }

    await progress.save();

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al guardar progreso' });
  }
});

module.exports = router;
