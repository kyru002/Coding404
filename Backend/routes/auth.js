const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../services/emailService');

const router = express.Router();

const isStrongPassword = (value) => {
  const hasMinLength = value.length >= 8;
  const hasUppercase = /[A-Z]/.test(value);
  const hasNumber = /\d/.test(value);
  return hasMinLength && hasUppercase && hasNumber;
};

const isValidEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const getLearningPathDefaults = (programmerType) => {
  const normalized = (programmerType || '').toLowerCase().trim();

  if (normalized.includes('front')) {
    return {
      preferredTrack: 'Front-end',
      recommendedCourse: 'frontend',
      activeCourse: 'frontend',
      startedCourses: ['frontend'],
      startedLessons: ['frontend-html'],
      completedLessons: [],
    };
  }

  if (normalized.includes('back')) {
    return {
      preferredTrack: 'Back-end',
      recommendedCourse: 'backend',
      activeCourse: 'backend',
      startedCourses: ['backend'],
      startedLessons: ['backend-java'],
      completedLessons: [],
    };
  }

  if (normalized.includes('base') || normalized.includes('dato') || normalized.includes('database')) {
    return {
      preferredTrack: 'Bases de Datos',
      recommendedCourse: 'database',
      activeCourse: 'database',
      startedCourses: ['database'],
      startedLessons: ['database-mysql'],
      completedLessons: [],
    };
  }

  if (normalized.includes('full')) {
    return {
      preferredTrack: 'Full-Stack',
      recommendedCourse: 'frontend',
      activeCourse: 'frontend',
      startedCourses: ['frontend'],
      startedLessons: ['frontend-html'],
      completedLessons: [],
    };
  }

  return {
    preferredTrack: 'Otros',
    recommendedCourse: 'frontend',
    activeCourse: 'frontend',
    startedCourses: ['frontend'],
    startedLessons: ['frontend-html'],
    completedLessons: [],
  };
};

router.post('/register', async (req, res) => {
  try {
    const {
      fullName,
      email,
      username,
      password,
      programmerType,
      github,
    } = req.body;

    if (!fullName || !email || !username || !password || !programmerType) {
      return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'El email no es valido.' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: 'La contrasena debe tener 8 caracteres, una mayuscula y un numero.',
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({ message: 'El usuario o email ya existe.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      username,
      passwordHash,
      programmerType,
      role: 'user',
      isBanned: false,
      learningPath: getLearningPathDefaults(programmerType),
      github: {
        hasAccount: Boolean(github?.hasAccount),
        username: github?.username || '',
      },
    });

    // Enviar email de bienvenida sin contraseña en texto plano
    await sendWelcomeEmail({
      fullName: newUser.fullName,
      email: newUser.email,
      username: newUser.username,
    });

    return res.status(201).json({
      message: 'Usuario registrado correctamente.',
      userId: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      username: newUser.username,
      programmerType: newUser.programmerType,
      learningPath: newUser.learningPath,
      role: newUser.role || 'user',
      isAdmin: (newUser.role || 'user') === 'admin',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Usuario y contrasena son obligatorios.' });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: 'Ese usuario no existe.' });
    }

    if (user.isBanned) {
      const reason = String(user.bannedReason || '').trim();
      const detail = reason ? ` Motivo: ${reason}` : '';
      return res.status(403).json({
        message: `Tu cuenta está baneada y no puede iniciar sesión.${detail}`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'La contrasena no coincide.' });
    }

    return res.json({
      message: 'Login correcto.',
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      programmerType: user.programmerType,
      learningPath: user.learningPath,
      role: user.role || 'user',
      isAdmin: (user.role || 'user') === 'admin',
    });
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    console.error('Stack:', error.stack);
    return res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      'fullName username email phone bio programmerType learningPath github registeredAt role isBanned bannedReason bannedAt'
    );

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

router.patch('/user/:userId/learning', async (req, res) => {
  try {
    const { userId } = req.params;
    const payload = req.body?.learningPath || {};

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const sanitizeArray = (value) => {
      if (!Array.isArray(value)) return [];
      return [...new Set(value.filter((item) => typeof item === 'string' && item.trim().length > 0))];
    };

    user.learningPath = {
      preferredTrack:
        typeof payload.preferredTrack === 'string'
          ? payload.preferredTrack
          : user.learningPath?.preferredTrack || user.programmerType,
      recommendedCourse:
        typeof payload.recommendedCourse === 'string'
          ? payload.recommendedCourse
          : user.learningPath?.recommendedCourse || 'frontend',
      activeCourse:
        typeof payload.activeCourse === 'string'
          ? payload.activeCourse
          : user.learningPath?.activeCourse || 'frontend',
      startedCourses:
        sanitizeArray(payload.startedCourses).length > 0
          ? sanitizeArray(payload.startedCourses)
          : sanitizeArray(user.learningPath?.startedCourses),
      startedLessons:
        payload.startedLessons !== undefined
          ? sanitizeArray(payload.startedLessons)
          : sanitizeArray(user.learningPath?.startedLessons),
      completedLessons:
        payload.completedLessons !== undefined
          ? sanitizeArray(payload.completedLessons)
          : sanitizeArray(user.learningPath?.completedLessons),
    };

    await user.save();

    return res.json({
      message: 'Ruta de aprendizaje actualizada.',
      learningPath: user.learningPath,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

router.post('/check', async (req, res) => {
  try {
    const { email, username, githubUsername } = req.body;

    if (!email && !username && !githubUsername) {
      return res.status(400).json({ message: 'Se requiere email, usuario o GitHub.' });
    }

    const existingUser = await User.findOne({
      $or: [
        email ? { email } : null,
        username ? { username } : null,
        githubUsername ? { 'github.username': githubUsername } : null,
      ].filter(Boolean),
    });

    return res.json({
      emailTaken: Boolean(existingUser && email && existingUser.email === email),
      usernameTaken:
        Boolean(existingUser && username && existingUser.username === username),
      githubUsernameTaken:
        Boolean(
          existingUser &&
          githubUsername &&
          existingUser.github &&
          existingUser.github.username === githubUsername
        ),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// Actualizar perfil del usuario
router.put('/user/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, phone, bio, github } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Validar y actualizar username si cambió
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(409).json({ message: 'Este nombre de usuario ya está en uso.' });
      }
      user.username = username.trim().toLowerCase();
    }

    // Validar email si cambió
    if (email && email !== user.email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'El email no es válido.' });
      }
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({ message: 'Este email ya está en uso.' });
      }
      user.email = email;
    }

    // Actualizar campos
    if (phone !== undefined) user.phone = phone.trim();
    if (bio !== undefined) user.bio = String(bio || '').trim().slice(0, 180);
    
    // Actualizar GitHub
    if (github) {
      user.github = {
        hasAccount: Boolean(github.hasAccount),
        username: (github.username || '').trim(),
      };
    }

    await user.save();

    return res.json({
      message: 'Perfil actualizado correctamente.',
      user: {
        username: user.username,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        github: user.github,
      },
    });
  } catch (error) {
    console.error('Error en PUT /user/:userId/profile:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// Cambiar contraseña
router.post('/user/:userId/change-password', async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message: 'La contraseña debe tener 8 caracteres, una mayúscula y un número.',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'La contraseña actual no es correcta.' });
    }

    // Cambiar contraseña
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: 'Contraseña cambiada correctamente.' });
  } catch (error) {
    console.error('Error en POST /user/:userId/change-password:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

module.exports = router;
