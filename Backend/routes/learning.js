const express = require('express');
const mongoose = require('mongoose');
const Curriculum = require('../models/Curriculum');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const CourseEn = require('../models/CourseEn');
const LessonEn = require('../models/LessonEn');
const League = require('../models/League');
const UserLeague = require('../models/UserLeague');
const User = require('../models/User');
const UserLanguageProgress = require('../models/UserLanguageProgress');
const Friendship = require('../models/Friendship');
const { seedCurricula } = require('../data/curriculaSeed');

const router = express.Router();

const LANGUAGE_ALIASES = {
  MYSQL: 'SQL',
};

const normalizeLanguage = (language = '') => {
  const value = String(language).trim();
  const alias = LANGUAGE_ALIASES[value.toUpperCase()];
  return alias || value;
};
const SUPPORTED_LANGUAGES = new Set(seedCurricula.map((item) => normalizeLanguage(item.language)));

const isSupportedLanguage = (language = '') => {
  const normalized = normalizeLanguage(language);
  return SUPPORTED_LANGUAGES.has(normalized);
};
const LEVELS_PER_LANGUAGE = 30;
const POINTS_PER_LEVEL = 2;

const sanitizeLevels = (value, maxLevels = LEVELS_PER_LANGUAGE) => {
  if (!Array.isArray(value)) return [];

  const sanitized = [...new Set(value
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0)
  )].sort((a, b) => a - b);

  // Evitar que datos corruptos o seeds creen más de los niveles soportados.
  if (Number.isInteger(maxLevels) && maxLevels > 0) {
    return sanitized.slice(0, maxLevels);
  }

  return sanitized;
};

const POINTS_PER_LANGUAGE = LEVELS_PER_LANGUAGE * POINTS_PER_LEVEL;
const POINTS_PER_RANK = 200;
const PUBLIC_USER_FILTER = {
  role: { $ne: 'admin' },
  isBanned: { $ne: true },
};

const normalizeUiLanguage = (value = '') => (String(value).toLowerCase() === 'en' ? 'en' : 'es');

const TRANSLATION_REPLACEMENTS = [
  [/\bComentarios\b/gi, 'Comments'],
  [/\bImágenes\b/gi, 'Images'],
  [/\bImagenes\b/gi, 'Images'],
  [/\bBloque e Inline\b/gi, 'Block and Inline'],
  [/\bClases\b/gi, 'Classes'],
  [/\bRutas\b/gi, 'Routes'],
  [/\bHead y Meta\b/gi, 'Head and Meta'],
  [/\bMi CV Básico\b/gi, 'My Basic CV'],
  [/\bMi CV Basico\b/gi, 'My Basic CV'],
  [/\bPerfil Estilizado\b/gi, 'Styled Profile'],
  [/\bLanding Interactiva\b/gi, 'Interactive Landing'],
  [/\bCSS en HTML\b/gi, 'CSS in HTML'],
  [/\bJS en HTML\b/gi, 'JS in HTML'],
  [/\bSintaxis base para trabajar\b/gi, 'Base syntax to work with'],
  [/\bCommon mistake a evitar\b/gi, 'Common mistake to avoid'],
  [/\bal usar\b/gi, 'when using'],
  [/\bcómo evitarlo\b/gi, 'how to avoid it'],
  [/\bcomo evitarlo\b/gi, 'how to avoid it'],
  [/\bCómo estudiar este bloque\b/gi, 'How to study this block'],
  [/\bexplica la idea en voz alta y luego impleméntala en code\b/gi, 'explain the idea out loud and then implement it in code'],
  [/\bexplica la idea en voz alta y luego implementala en code\b/gi, 'explain the idea out loud and then implement it in code'],
  [/\bObjective final del Level\b/gi, 'Final objective of the level'],
  [/\bConecta la theory con un caso de uso concreto\b/gi, 'Connect the theory with a concrete use case'],
  [/\bCompara distintas formas de resolver el mismo problema\b/gi, 'Compare different ways to solve the same problem'],
  [/\bRelaciona este concepto con otros bloques del curso\b/gi, 'Relate this concept with other course blocks'],
  [/\bIdentifica la sintaxis base y su uso principal\b/gi, 'Identify the base syntax and its main use'],
  [/\bapply buenas prácticas para mejorar legibilidad y calidad\b/gi, 'apply best practices to improve readability and quality'],
  [/\bapply buenas practicas para mejorar legibilidad y calidad\b/gi, 'apply best practices to improve readability and quality'],
  [/\bContexto\b/gi, 'Context'],
  [/\bDatos simples\b/gi, 'Simple data'],
  [/\bInteracción local\b/gi, 'Local interaction'],
  [/\bInteraccion local\b/gi, 'Local interaction'],
  [/\bComponentes reutilizables\b/gi, 'Reusable components'],
  [/\bEstructura Semantics\b/gi, 'Semantic structure'],
  [/\bCaso real\b/gi, 'Real case'],
  [/\bElementos\b/gi, 'Elements'],
  [/\bAtributos\b/gi, 'Attributes'],
  [/\bEstilos Inline\b/gi, 'Inline Styles'],
  [/\bFormato Texto\b/gi, 'Text Formatting'],
  [/\bCitas\b/gi, 'Quotes'],
  [/\bListas\b/gi, 'Lists'],
  [/\bTablas\b/gi, 'Tables'],
  [/\bFormularios\b/gi, 'Forms'],
  [/\bSemántica\b/gi, 'Semantics'],
  [/\bSemantica\b/gi, 'Semantics'],
  [/\bAccesibilidad\b/gi, 'Accessibility'],
  [/\bMultimedia\b/gi, 'Multimedia'],
  [/\bMetaetiquetas\b/gi, 'Meta Tags'],
  [/\bProyecto Final\b/gi, 'Final Project'],
  [/\bFase del nivel\b/gi, 'Level phase'],
  [/\bQué aprenderás\b/gi, 'What you will learn'],
  [/\bQue aprenderas\b/gi, 'What you will learn'],
  [/\bIdea clave\b/gi, 'Key idea'],
  [/\bAplicación directa\b/gi, 'Direct application'],
  [/\bAplicacion directa\b/gi, 'Direct application'],
  [/\bCaso práctico de\b/gi, 'Practical case of'],
  [/\bCaso practico de\b/gi, 'Practical case of'],
  [/\baplicado a un ejercicio real\b/gi, 'applied to a real exercise'],
  [/\bconcepto principal del nivel en\b/gi, 'main concept of the level in'],
  [/\bUI básica\b/gi, 'basic UI'],
  [/\bUI basica\b/gi, 'basic UI'],
  [/\bFundamentos\b/gi, 'Fundamentals'],
  [/\bAplicación Guiada\b/gi, 'Guided Application'],
  [/\bAplicacion Guiada\b/gi, 'Guided Application'],
  [/\bVariaciones\b/gi, 'Variations'],
  [/\bOptimización\b/gi, 'Optimization'],
  [/\bOptimizacion\b/gi, 'Optimization'],
  [/\bIntegración\b/gi, 'Integration'],
  [/\bIntegracion\b/gi, 'Integration'],
  [/\bRuta de Niveles\b/gi, 'Level Route'],
  [/\bNivel\b/gi, 'Level'],
  [/\bNiveles\b/gi, 'Levels'],
  [/\bProyecto\b/gi, 'Project'],
  [/\bPrueba\b/gi, 'Test'],
  [/\bCompletar\b/gi, 'Complete'],
  [/\bSiguiente\b/gi, 'Next'],
  [/\bAnterior\b/gi, 'Previous'],
  [/\bEnunciado\b/gi, 'Statement'],
  [/\bEjemplo\b/gi, 'Example'],
  [/\bPuntos clave\b/gi, 'Key points'],
  [/\bObjetivo\b/gi, 'Objective'],
  [/\bFase\b/gi, 'Phase'],
  [/\bError común\b/gi, 'Common mistake'],
  [/\bError comun\b/gi, 'Common mistake'],
  [/\bError frecuente\b/gi, 'Common mistake'],
  [/\bChecklist\b/gi, 'Checklist'],
  [/\bteoría\b/gi, 'theory'],
  [/\bteoria\b/gi, 'theory'],
  [/\bpráctica\b/gi, 'practice'],
  [/\bpractica\b/gi, 'practice'],
  [/\bfundamentos\b/gi, 'fundamentals'],
  [/\bintroducción\b/gi, 'introduction'],
  [/\bintroduccion\b/gi, 'introduction'],
  [/\bsemántica\b/gi, 'semantics'],
  [/\bsemantica\b/gi, 'semantics'],
  [/\betiquetas\b/gi, 'tags'],
  [/\bencabezados\b/gi, 'headings'],
  [/\bpárrafos\b/gi, 'paragraphs'],
  [/\bparrafos\b/gi, 'paragraphs'],
  [/\benlaces\b/gi, 'links'],
  [/\blistas\b/gi, 'lists'],
  [/\btablas\b/gi, 'tables'],
  [/\bformularios\b/gi, 'forms'],
  [/\baccesibilidad\b/gi, 'accessibility'],
  [/\bcódigo\b/gi, 'code'],
  [/\bcodigo\b/gi, 'code'],
  [/\bresuelve\b/gi, 'solve'],
  [/\baplica\b/gi, 'apply'],
  [/\bcompletado\b/gi, 'completed'],
  [/\bfácil\b/gi, 'easy'],
  [/\bfacil\b/gi, 'easy'],
  [/\bmedio\b/gi, 'medium'],
  [/\bdifícil\b/gi, 'hard'],
  [/\bdificil\b/gi, 'hard'],
  [/\bLenguaje de marcado para crear páginas web\./gi, 'Markup language to build web pages.'],
  [/\bLenguaje de estilos para diseñar interfaces web\./gi, 'Styling language to design web interfaces.'],
  [/\bLenguaje base de la interactividad web\./gi, 'Core language of web interactivity.'],
  [/\bFramework progresivo para construir interfaces de usuario reactivas\./gi, 'Progressive framework to build reactive user interfaces.'],
  [/\bEntorno backend para crear APIs y servidores con JavaScript\./gi, 'Backend runtime to build APIs and servers with JavaScript.'],
  [/\bLenguaje para consultar y manipular bases de datos\./gi, 'Language to query and manage databases.'],
  [/\bLenguaje versátil para backend y automatización\./gi, 'Versatile language for backend and automation.'],
  [/\bLenguaje orientado a objetos usado en backend empresarial\./gi, 'Object-oriented language used in enterprise backend.'],
  [/\bLenguaje de servidor para aplicaciones web dinámicas\./gi, 'Server-side language for dynamic web applications.'],
];

const looksLikeCode = (value = '') => {
  const text = String(value || '');
  if (!text.trim()) return false;
  return /<\/?[a-z][^>]*>|\{\{|=>|\bfunction\b|\bconst\b|;|\n\s{2,}/i.test(text);
};

const translateTextToEnglish = (value = '') => {
  const text = String(value || '');
  if (!text || looksLikeCode(text)) return text;

  let localized = text;
  TRANSLATION_REPLACEMENTS.forEach(([pattern, replacement]) => {
    localized = localized.replace(pattern, replacement);
  });
  return localized;
};

const localizeStructuredValue = (value, uiLanguage = 'es') => {
  if (uiLanguage !== 'en') return value;

  if (Array.isArray(value)) {
    return value.map((entry) => localizeStructuredValue(entry, uiLanguage));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, localizeStructuredValue(entry, uiLanguage)])
    );
  }

  if (typeof value === 'string') {
    return translateTextToEnglish(value);
  }

  return value;
};

const localizeCurriculumLevel = (level, uiLanguage = 'es') => {
  if (uiLanguage !== 'en') return level;
  return localizeStructuredValue(level, 'en');
};

const getLeague = (points) => {
  let leagueName = 'Junior Explorer';
  
  if (points >= 1000) leagueName = 'Legendary Lead';
  else if (points >= 800) leagueName = 'Tech Architect';
  else if (points >= 600) leagueName = 'Software Engineer';
  else if (points >= 400) leagueName = 'Stack Crafter';
  else if (points >= 200) leagueName = 'Code Builder';
  
  // Find the league in leagueSeed to get the order
  const leagueSeedEntry = leagueSeed.find(l => l.name === leagueName);
  
  if (leagueName === 'Legendary Lead') {
    return { key: 'legendary-lead', name: 'Legendary Lead', image: '/images/6.png', order: leagueSeedEntry?.order || 6 };
  } else if (leagueName === 'Tech Architect') {
    return { key: 'tech-architect', name: 'Tech Architect', image: '/images/5.png', order: leagueSeedEntry?.order || 5 };
  } else if (leagueName === 'Software Engineer') {
    return { key: 'software-engineer', name: 'Software Engineer', image: '/images/4.png', order: leagueSeedEntry?.order || 4 };
  } else if (leagueName === 'Stack Crafter') {
    return { key: 'stack-crafter', name: 'Stack Crafter', image: '/images/3.png', order: leagueSeedEntry?.order || 3 };
  } else if (leagueName === 'Code Builder') {
    return { key: 'code-builder', name: 'Code Builder', image: '/images/2.png', order: leagueSeedEntry?.order || 2 };
  } else {
    return { key: 'junior-explorer', name: 'Junior Explorer', image: '/images/1.png', order: leagueSeedEntry?.order || 1 };
  }
};

const leagueSeed = [
  { order: 1, name: 'Junior Explorer', minPoints: 0, maxPoints: 199, image: '/images/1.png' },
  { order: 2, name: 'Code Builder', minPoints: 200, maxPoints: 399, image: '/images/2.png' },
  { order: 3, name: 'Stack Crafter', minPoints: 400, maxPoints: 599, image: '/images/3.png' },
  { order: 4, name: 'Software Engineer', minPoints: 600, maxPoints: 799, image: '/images/4.png' },
  { order: 5, name: 'Tech Architect', minPoints: 800, maxPoints: 999, image: '/images/5.png' },
  { order: 6, name: 'Legendary Lead', minPoints: 1000, maxPoints: null, image: '/images/6.png' },
];

const ensureCurriculaClassified = async () => {
  const sourceCurricula = seedCurricula;

  for (const curriculum of sourceCurricula) {
    const language = normalizeLanguage(curriculum.language);
    if (!language) {
      continue;
    }

    const course = await Course.findOneAndUpdate(
      { language },
      {
        title: `${language} Course`,
        description: curriculum.description || '',
        titleI18n: {
          es: `${language} Course`,
          en: `${language} Course`,
        },
        descriptionI18n: {
          es: curriculum.description || '',
          en: translateTextToEnglish(curriculum.description || ''),
        },
        language,
        createdAtCourse: curriculum.createdAt || new Date(),
      },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
      }
    );

    const courseEn = await CourseEn.findOneAndUpdate(
      { language },
      {
        title: `${language} Course`,
        description: translateTextToEnglish(curriculum.description || ''),
        language,
        createdAtCourse: curriculum.createdAt || new Date(),
      },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
      }
    );

    const levels = Array.isArray(curriculum.levels) ? [...curriculum.levels] : [];
    levels.sort((a, b) => Number(a.id || 0) - Number(b.id || 0));

    for (const level of levels) {
      const orderInCourse = Number(level.id || 0);
      if (!Number.isInteger(orderInCourse) || orderInCourse <= 0) {
        continue;
      }

      const theoryBlock = Array.isArray(level?.content?.theory)
        ? level.content.theory.join('\n')
        : '';
      const levelEn = localizeCurriculumLevel(level, 'en');
      const theoryBlockEn = Array.isArray(levelEn?.content?.theory)
        ? levelEn.content.theory.join('\n')
        : translateTextToEnglish(theoryBlock);

      await Lesson.findOneAndUpdate(
        { courseId: course._id, orderInCourse },
        {
          courseId: course._id,
          title: level.name || `Lección ${orderInCourse}`,
          titleI18n: {
            es: level.name || `Lección ${orderInCourse}`,
            en: translateTextToEnglish(level.name || `Lección ${orderInCourse}`),
          },
          orderInCourse,
          theoryContent: theoryBlock,
          theoryContentI18n: {
            es: theoryBlock,
            en: translateTextToEnglish(theoryBlock),
          },
          lessonData: level,
          lessonDataI18n: {
            es: level,
            en: localizeCurriculumLevel(level, 'en'),
          },
        },
        {
          upsert: true,
          returnDocument: 'after',
          setDefaultsOnInsert: true,
        }
      );

      await LessonEn.findOneAndUpdate(
        { courseId: courseEn._id, orderInCourse },
        {
          courseId: courseEn._id,
          title: levelEn?.name || translateTextToEnglish(level.name || `Lección ${orderInCourse}`),
          orderInCourse,
          theoryContent: theoryBlockEn,
          lessonData: levelEn,
        },
        {
          upsert: true,
          returnDocument: 'after',
          setDefaultsOnInsert: true,
        }
      );
    }
  }

  // Conservamos la colección legacy Curriculum para no borrar datos históricos.
};

const ensureLeaguesSeeded = async () => {
  const existingCount = await League.countDocuments();
  if (existingCount > 0) return;

  await League.insertMany(leagueSeed);
};

router.get('/curricula', async (req, res) => {
  try {
    const uiLanguage = normalizeUiLanguage(req.query?.lang);
    await ensureCurriculaClassified();

    const CourseModel = uiLanguage === 'en' ? CourseEn : Course;
    const courses = await CourseModel.find({}, { language: 1, description: 1, descriptionI18n: 1, _id: 0 }).sort({ language: 1 }).lean();
    const curricula = courses.map((course) => ({
      language: course.language,
      description: course?.descriptionI18n?.[uiLanguage] || course.description || '',
    }));
    return res.json({ curricula });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo obtener el listado de temarios.' });
  }
});

router.get('/curricula/:language', async (req, res) => {
  try {
    const language = normalizeLanguage(req.params.language);
    const uiLanguage = normalizeUiLanguage(req.query?.lang);

    await ensureCurriculaClassified();
    const CourseModel = uiLanguage === 'en' ? CourseEn : Course;
    const LessonModel = uiLanguage === 'en' ? LessonEn : Lesson;
    let course = await CourseModel.findOne({ language }).lean();

    if (!course) {
      // Fallback para HTML si aún no existe en colecciones nuevas.
      if (String(language).toUpperCase() === 'HTML') {
        // eslint-disable-next-line global-require
        const htmlCurriculum = require('../../Frontend/src/data/languages/html.json');
        const localizedHtmlCurriculum = uiLanguage === 'en'
          ? localizeStructuredValue(htmlCurriculum, 'en')
          : htmlCurriculum;
        return res.json({ curriculum: localizedHtmlCurriculum });
      }
      return res.status(404).json({ message: 'Temario no encontrado para ese lenguaje.' });
    }

    const lessons = await LessonModel.find({ courseId: course._id }).sort({ orderInCourse: 1 }).lean();

    const levels = lessons.map((lesson, index) => {
      const fallbackLevel = {
        id: lesson.orderInCourse,
        name: lesson?.titleI18n?.[uiLanguage] || lesson.title,
        description: lesson?.titleI18n?.[uiLanguage] || lesson.title,
        difficulty: lesson.orderInCourse <= 10 ? 'fácil' : lesson.orderInCourse <= 20 ? 'medio' : 'difícil',
        points: lesson.orderInCourse <= 10 ? 75 : lesson.orderInCourse <= 20 ? 100 : 125,
        isExam: lesson.orderInCourse % 10 === 0,
        content: {
          title: lesson?.titleI18n?.[uiLanguage] || lesson.title,
          theory: (lesson?.theoryContentI18n?.[uiLanguage] || lesson.theoryContent || '').split('\n').filter(Boolean),
          example: '',
        },
        quiz: [],
        fillBlanks: {
          instruction: 'Completa el ejercicio',
          preview: '',
          segments: ['', ''],
          answers: [''],
          optionPool: [''],
        },
        practice: {
          instruction: 'Resuelve la práctica del nivel.',
          requirements: [],
          goalLines: [],
        },
      };

      const localizedRawLevel = lesson?.lessonDataI18n?.[uiLanguage]
        || (uiLanguage === 'en' ? localizeCurriculumLevel(lesson.lessonData, 'en') : lesson.lessonData);

      const rawLevel = localizedRawLevel && typeof localizedRawLevel === 'object'
        ? localizedRawLevel
        : fallbackLevel;

      return {
        ...fallbackLevel,
        ...rawLevel,
        id: Number(rawLevel.id || fallbackLevel.id || index + 1),
        name: rawLevel.name || fallbackLevel.name,
      };
    });
    const usedLevelNames = new Set();
    const normalizedLevels = levels.map((level, index) => {
      const safeId = Number(level.id || index + 1);
      const rawName = String(level?.name || level?.title || `Nivel ${safeId}`).trim();
      const nameWithIndex = /\s·\sN\d+$/i.test(rawName)
        ? rawName
        : `${rawName} · N${safeId}`;

      let uniqueName = nameWithIndex;
      let suffixCounter = 2;
      while (usedLevelNames.has(uniqueName.toLowerCase())) {
        uniqueName = `${nameWithIndex} · V${suffixCounter}`;
        suffixCounter += 1;
      }
      usedLevelNames.add(uniqueName.toLowerCase());

      return {
        ...level,
        id: safeId,
        name: uniqueName,
        content: {
          ...(level.content || {}),
          title: uniqueName,
        },
      };
    });

    const curriculum = {
      language: course.language,
      description: course?.descriptionI18n?.[uiLanguage] || course.description,
      levels: normalizedLevels,
    };

    return res.json({ curriculum });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo obtener el temario.' });
  }
});

router.get('/progress/:userId/:language', async (req, res) => {
  try {
    const { userId } = req.params;
    const language = normalizeLanguage(req.params.language);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID de usuario inválido.' });
    }

    if (!isSupportedLanguage(language)) {
      return res.status(400).json({ message: `Lenguaje inválido para progreso: ${language}` });
    }

    // Si el usuario es el Demo (usuario de demostración), devolvemos progreso completo.
    const user = await User.findById(userId, { username: 1 }).lean();
    if (user && String(user.username).toLowerCase() === 'demo') {
      const allLevels = Array.from({ length: LEVELS_PER_LANGUAGE }, (_, i) => i + 1);

      // Persistir progreso completo para el lenguaje solicitado
      const fullProgressForRequested = {
        userId,
        language,
        completedLevels: allLevels,
        completionPercentage: 100,
        totalPoints: allLevels.length * POINTS_PER_LEVEL,
        completedAt: new Date(),
        lastActivityAt: new Date(),
      };

      await UserLanguageProgress.findOneAndUpdate(
        { userId, language },
        fullProgressForRequested,
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );

      // Asegurar que el usuario demo tenga progreso completo en todos los lenguajes soportados
      const languagesToSeed = Array.from(SUPPORTED_LANGUAGES);
      const ops = languagesToSeed.map((lang) => {
        const doc = {
          userId,
          language: lang,
          completedLevels: allLevels,
          completionPercentage: 100,
          totalPoints: allLevels.length * POINTS_PER_LEVEL,
          completedAt: new Date(),
          lastActivityAt: new Date(),
        };
        return UserLanguageProgress.findOneAndUpdate(
          { userId, language: lang },
          doc,
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
      });

      // Ejecutar en paralelo
      await Promise.all(ops);

      return res.json({ progress: fullProgressForRequested });
    }

    const progress = await UserLanguageProgress.findOne({ userId, language });

    return res.json({
      progress: progress || {
        userId,
        language,
        completedLevels: [],
        totalPoints: 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo obtener el progreso.' });
  }
});

router.put('/progress/:userId/:language', async (req, res) => {
  try {
    const { userId } = req.params;
    const language = normalizeLanguage(req.params.language);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID de usuario inválido.' });
    }

    if (!isSupportedLanguage(language)) {
      return res.status(400).json({ message: `Lenguaje inválido para progreso: ${language}` });
    }

    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const completedLevels = sanitizeLevels(req.body?.completedLevels, LEVELS_PER_LANGUAGE);
    const totalPoints = completedLevels.length * POINTS_PER_LEVEL;
    const completionPercentage = Math.min(100, Math.round((completedLevels.length / LEVELS_PER_LANGUAGE) * 100));
    const completedAt = completedLevels.length >= LEVELS_PER_LANGUAGE ? new Date() : null;

    const progress = await UserLanguageProgress.findOneAndUpdate(
      { userId, language },
      {
        userId,
        language,
        completedLevels,
        completionPercentage,
        totalPoints,
        completedAt,
        lastActivityAt: new Date(),
      },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
      }
    );

    const [pointsSummary] = await UserLanguageProgress.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalUserPoints: { $sum: { $ifNull: ['$totalPoints', 0] } } } },
    ]);
    const totalUserPoints = Number(pointsSummary?.totalUserPoints || 0);

    await ensureLeaguesSeeded();
    const leagueInfo = getLeague(totalUserPoints);
    const leagueRecord = await League.findOne({ name: leagueInfo.name }, { _id: 1 }).lean();

    if (leagueRecord?._id) {
      await UserLeague.findOneAndUpdate(
        { userId },
        {
          userId,
          leagueId: leagueRecord._id,
          totalPoints: totalUserPoints,
          updatedAtLeague: new Date(),
        },
        {
          upsert: true,
          returnDocument: 'after',
          setDefaultsOnInsert: true,
        }
      );
    }

    return res.json({
      message: 'Progreso actualizado.',
      progress,
      totalUserPoints,
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo guardar el progreso.' });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const { userId, scope = 'global' } = req.query;
    await ensureLeaguesSeeded();
    const safeScope = scope === 'friends' ? 'friends' : 'global';

    let allowedUserIds = null;
    if (safeScope === 'friends' && userId && mongoose.Types.ObjectId.isValid(userId)) {
      const friendships = await Friendship.find({
        status: 'accepted',
        $or: [{ userId }, { friendId: userId }],
      }).lean();

      const friendIds = friendships.map((item) => {
        const left = String(item.userId);
        const right = String(item.friendId);
        return left === String(userId) ? right : left;
      });

      allowedUserIds = [...new Set([String(userId), ...friendIds])]
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
    }

    if (safeScope === 'friends' && !Array.isArray(allowedUserIds)) {
      return res.json({
        leagues: await League.find({}, { _id: 0, order: 1, name: 1, image: 1 }).sort({ order: 1 }),
        leaderboard: [],
        userSummary: {
          hasProgress: false,
          rank: null,
          totalPoints: 0,
          learnedLanguagesCount: 0,
          totalCompletedLevels: 0,
          league: getLeague(0),
          pointsPerLanguage: POINTS_PER_LANGUAGE,
          pointsPerRank: POINTS_PER_RANK,
        },
      });
    }

    const pipeline = [
      {
        $addFields: {
          learnedLanguage: {
            $cond: [
              { $gte: [{ $size: { $ifNull: ['$completedLevels', []] } }, LEVELS_PER_LANGUAGE] },
              1,
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: '$userId',
          learnedLanguagesCount: { $sum: '$learnedLanguage' },
          totalCompletedLevels: { $sum: { $size: '$completedLevels' } },
        },
      },
      {
        $addFields: {
          totalPoints: { $multiply: ['$totalCompletedLevels', POINTS_PER_LEVEL] },
        },
      },
    ];

    if (Array.isArray(allowedUserIds)) {
      pipeline.push({ $match: { _id: { $in: allowedUserIds } } });
    }

    pipeline.push(
      { $sort: { totalPoints: -1, totalCompletedLevels: -1 } },
      { $limit: 50 }
    );

    const aggregated = await UserLanguageProgress.aggregate(pipeline);
    const progressByUserId = new Map(aggregated.map((item) => [String(item._id), item]));

    const userFilter = Array.isArray(allowedUserIds)
      ? { _id: { $in: allowedUserIds } }
      : {};

    const users = await User.find(
      { ...userFilter, ...PUBLIC_USER_FILTER },
      { username: 1, fullName: 1, avatarUrl: 1, programmerType: 1 }
    ).lean();

    const leaderboard = users
      .map((user) => {
        const progress = progressByUserId.get(String(user._id));
        const totalPoints = progress?.totalPoints || 0;
        const totalCompletedLevels = progress?.totalCompletedLevels || 0;
        const learnedLanguagesCount = progress?.learnedLanguagesCount || 0;

        return {
          userId: String(user._id),
          username: user?.username || 'usuario',
          fullName: user?.fullName || '',
          avatarUrl: user?.avatarUrl || '',
          programmerType: user?.programmerType || 'Programador',
          totalPoints,
          learnedLanguagesCount,
          totalCompletedLevels,
          league: getLeague(totalPoints),
        };
      })
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        if (b.totalCompletedLevels !== a.totalCompletedLevels) return b.totalCompletedLevels - a.totalCompletedLevels;
        return (a.username || '').localeCompare(b.username || '');
      })
      .slice(0, 50)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

    let userSummary = {
      hasProgress: false,
      rank: null,
      totalPoints: 0,
      learnedLanguagesCount: 0,
      totalCompletedLevels: 0,
      league: getLeague(0),
      pointsPerLanguage: POINTS_PER_LANGUAGE,
      pointsPerRank: POINTS_PER_RANK,
    };

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const summaryUser = await User.findById(userId, { role: 1, isBanned: 1 }).lean();
      if (summaryUser?.role === 'admin' || summaryUser?.isBanned) {
        const leaguesFromDb = await League.find({}, { _id: 0, order: 1, name: 1, image: 1 }).sort({ order: 1 });

        return res.json({
          leagues: leaguesFromDb,
          leaderboard,
          userSummary,
        });
      }

      const userProgress = await UserLanguageProgress.find({ userId });
      const learnedLanguagesCount = userProgress.reduce((sum, item) => {
        const hasLearnedLanguage = Array.isArray(item.completedLevels) && item.completedLevels.length >= LEVELS_PER_LANGUAGE;
        return sum + (hasLearnedLanguage ? 1 : 0);
      }, 0);
      const totalCompletedLevels = userProgress.reduce((sum, item) => sum + ((item.completedLevels || []).length), 0);
      const totalPoints = totalCompletedLevels * POINTS_PER_LEVEL;
      const rankEntry = leaderboard.find((item) => item.userId === userId);

      userSummary = {
        hasProgress: learnedLanguagesCount > 0,
        rank: rankEntry?.rank || null,
        totalPoints,
        learnedLanguagesCount,
        totalCompletedLevels,
        league: getLeague(totalPoints),
        pointsPerLanguage: POINTS_PER_LANGUAGE,
        pointsPerRank: POINTS_PER_RANK,
      };
    }

    const leaguesFromDb = await League.find({}, { _id: 0, order: 1, name: 1, image: 1 }).sort({ order: 1 });

    return res.json({
      leagues: leaguesFromDb,
      leaderboard,
      userSummary,
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo cargar la clasificación.' });
  }
});

// Endpoint para completar todos los cursos de un usuario (útil para pruebas)
router.post('/complete-all-courses/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID de usuario inválido.' });
    }

    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const languages = ['Python', 'JavaScript', 'HTML', 'CSS', 'Java', 'SQL', 'Vue', 'PHP', 'Node.js'];
    const allCompletedLevels = Array.from({ length: 30 }, (_, i) => i + 1); // 30 niveles completos

    let updated = 0;

    for (const language of languages) {
      await UserLanguageProgress.findOneAndUpdate(
        { userId, language },
        {
          userId,
          language,
          completedLevels: allCompletedLevels,
          completionPercentage: 100,
          totalPoints: allCompletedLevels.length * POINTS_PER_LEVEL,
          completedAt: new Date(),
          lastActivityAt: new Date(),
        },
        {
          upsert: true,
          returnDocument: 'after',
          setDefaultsOnInsert: true,
        }
      );
      updated++;
    }

    return res.json({
      message: 'Todos los cursos completados',
      totalCoursesCompleted: updated,
      totalPoints: (allCompletedLevels.length * POINTS_PER_LEVEL) * languages.length,
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo completar los cursos.' });
  }
});

// Mapeo de lenguajes a lecciones
const LANGUAGE_TO_LESSON_MAP = {
  'HTML': { lessonId: 'frontend-html', courseName: 'frontend' },
  'CSS': { lessonId: 'frontend-css', courseName: 'frontend' },
  'JavaScript': { lessonId: 'frontend-js', courseName: 'frontend' },
  'Vue': { lessonId: 'fullstack-vue', courseName: 'fullstack' },
  'Node.js': { lessonId: 'backend-api', courseName: 'backend' },
  'SQL': { lessonId: 'database-mysql', courseName: 'database' },
  'Python': { lessonId: 'python', courseName: 'python' },
  'Java': { lessonId: 'backend-java', courseName: 'backend' },
  'PHP': { lessonId: 'backend-api', courseName: 'backend' }
};

// Endpoint para marcar lección como completada si se completan TODOS los niveles de un lenguaje
router.post('/complete-lesson/:userId/:language', async (req, res) => {
  try {
    const { userId } = req.params;
    const language = normalizeLanguage(req.params.language);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID de usuario inválido.' });
    }

    const mappedLesson = LANGUAGE_TO_LESSON_MAP[language];
    if (!mappedLesson) {
      return res.status(400).json({ message: `No hay lección asociada a ${language}` });
    }

    // Verificar si se completaron TODOS los niveles del lenguaje
    const progress = await UserLanguageProgress.findOne({
      userId,
      language
    });

    if (!progress) {
      return res.status(404).json({ message: `No se encontró progreso para ${language}` });
    }

    const completedCount = progress.completedLevels?.length || 0;
    // Verificar que se completaron TODOS los 30 niveles del lenguaje
    const REQUIRED_COMPLETED_LEVELS = 30;

    console.log(
      `📊 ${language}: ${completedCount}/${REQUIRED_COMPLETED_LEVELS} niveles completados`
    );

    // Si no están todos los 30 completados, no marcar la lección
    if (completedCount < REQUIRED_COMPLETED_LEVELS) {
      return res.json({
        message: `Lenguaje no completado. ${completedCount}/${REQUIRED_COMPLETED_LEVELS} niveles.`,
        lessonId: mappedLesson.lessonId,
        completed: false,
        completedLevels: completedCount,
        totalLevels: REQUIRED_COMPLETED_LEVELS
      });
    }

    // Se completó el lenguaje! Marcar la lección
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (!user.learningPath) {
      user.learningPath = {
        preferredTrack: user.programmerType,
        recommendedCourse: 'frontend',
        activeCourse: 'frontend',
        startedCourses: [],
        startedLessons: [],
        completedLessons: []
      };
    }

    if (!Array.isArray(user.learningPath.completedLessons)) {
      user.learningPath.completedLessons = [];
    }

    const lessonId = mappedLesson.lessonId;
    if (!user.learningPath.completedLessons.includes(lessonId)) {
      user.learningPath.completedLessons.push(lessonId);
      await user.save();
      console.log(`✅ Lección "${lessonId}" completada para usuario ${user.username}`);
    }

    return res.json({
      message: `¡Felicidades! Completaste el lenguaje ${language}`,
      lessonId,
      courseName: mappedLesson.courseName,
      completed: true,
      completedLessons: user.learningPath.completedLessons
    });
  } catch (error) {
    console.error('Error completando lección:', error);
    return res.status(500).json({ message: 'Error al marcar lección como completada.' });
  }
});

module.exports = {
  learningRouter: router,
  ensureCurriculaClassified,
  ensureLeaguesSeeded,
};
