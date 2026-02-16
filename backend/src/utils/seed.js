const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Exercise = require('../models/Exercise');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar datos existentes
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Exercise.deleteMany({});
    console.log('🗑️  Datos anteriores eliminados');

    // Crear cursos
    const javascriptCourse = await Course.create({
      title: 'JavaScript Fundamentos',
      description: 'Aprende los conceptos básicos de JavaScript desde cero',
      language: 'JavaScript',
      difficulty: 'Principiante',
      icon: 'javascript.png',
      color: '#F7DF1E',
      order: 1,
      estimatedTime: '15 horas'
    });

    const pythonCourse = await Course.create({
      title: 'Python para Principiantes',
      description: 'Introduce al mundo de Python con ejercicios prácticos',
      language: 'Python',
      difficulty: 'Principiante',
      icon: 'python.png',
      color: '#3776AB',
      order: 2,
      estimatedTime: '12 horas'
    });

    console.log('✅ Cursos creados');

    // Crear lecciones para JavaScript
    const jsLesson1 = await Lesson.create({
      course: javascriptCourse._id,
      title: '¿Qué es JavaScript?',
      description: 'Introducción a JavaScript y su importancia en el desarrollo web',
      order: 1,
      type: 'lesson',
      content: {
        theory: 'JavaScript es un lenguaje de programación que permite crear contenido dinámico en sitios web. Es uno de los lenguajes más populares del mundo.',
        examples: [{
          code: 'console.log("¡Hola, mundo!");',
          explanation: 'Este es tu primer programa en JavaScript',
          language: 'javascript'
        }],
        keyPoints: [
          'JavaScript es un lenguaje interpretado',
          'Se ejecuta principalmente en navegadores web',
          'Es esencial para el desarrollo web moderno'
        ]
      },
      xpReward: 10,
      difficulty: 'Fácil'
    });

    const jsLesson2 = await Lesson.create({
      course: javascriptCourse._id,
      title: 'Variables y Tipos de Datos',
      description: 'Aprende a declarar variables y trabajar con diferentes tipos de datos',
      order: 2,
      type: 'lesson',
      content: {
        theory: 'Las variables son contenedores para almacenar datos. En JavaScript, puedes usar var, let o const para declarar variables.',
        examples: [{
          code: 'let nombre = "Juan";\nconst edad = 25;\nlet esEstudiante = true;',
          explanation: 'Declaración de variables con diferentes tipos de datos',
          language: 'javascript'
        }],
        keyPoints: [
          'let: para variables que pueden cambiar',
          'const: para valores constantes',
          'Tipos: string, number, boolean, etc.'
        ]
      },
      xpReward: 15,
      difficulty: 'Fácil'
    });

    // Actualizar curso con lecciones
    javascriptCourse.lessons = [jsLesson1._id, jsLesson2._id];
    javascriptCourse.totalLessons = 2;
    await javascriptCourse.save();

    console.log('✅ Lecciones creadas');

    // Crear ejercicios para la primera lección de JS
    const exercise1 = await Exercise.create({
      lesson: jsLesson1._id,
      question: '¿Qué hace el comando console.log()?',
      type: 'multiple-choice',
      options: [
        { text: 'Imprime información en la consola', isCorrect: true },
        { text: 'Crea una nueva variable', isCorrect: false },
        { text: 'Define una función', isCorrect: false },
        { text: 'Cierra el programa', isCorrect: false }
      ],
      explanation: 'console.log() se utiliza para imprimir mensajes en la consola del navegador',
      xpReward: 5,
      order: 1,
      difficulty: 'Fácil'
    });

    const exercise2 = await Exercise.create({
      lesson: jsLesson1._id,
      question: 'Completa el código para mostrar "Hola Mundo" en la consola',
      type: 'fill-blank',
      codeTemplate: 'console.___("Hola Mundo");',
      correctAnswer: 'log',
      explanation: 'La función correcta es console.log()',
      hints: ['Es una función que muestra información', 'Tiene 3 letras'],
      xpReward: 5,
      order: 2,
      difficulty: 'Fácil'
    });

    // Crear ejercicios para la segunda lección
    const exercise3 = await Exercise.create({
      lesson: jsLesson2._id,
      question: '¿Qué palabra clave usarías para una variable que NO cambiará?',
      type: 'multiple-choice',
      options: [
        { text: 'const', isCorrect: true },
        { text: 'let', isCorrect: false },
        { text: 'var', isCorrect: false },
        { text: 'static', isCorrect: false }
      ],
      explanation: 'const se usa para valores constantes que no cambiarán',
      xpReward: 5,
      order: 1,
      difficulty: 'Fácil'
    });

    // Actualizar lecciones con ejercicios
    jsLesson1.exercises = [exercise1._id, exercise2._id];
    await jsLesson1.save();

    jsLesson2.exercises = [exercise3._id];
    await jsLesson2.save();

    console.log('✅ Ejercicios creados');

    // Crear una lección para Python
    const pyLesson1 = await Lesson.create({
      course: pythonCourse._id,
      title: 'Introducción a Python',
      description: 'Primeros pasos con Python',
      order: 1,
      type: 'lesson',
      content: {
        theory: 'Python es un lenguaje de programación de alto nivel, conocido por su sintaxis clara y legible.',
        examples: [{
          code: 'print("¡Hola, Python!")',
          explanation: 'Tu primer programa en Python',
          language: 'python'
        }],
        keyPoints: [
          'Python usa indentación para bloques de código',
          'Es ideal para principiantes',
          'Tiene múltiples aplicaciones'
        ]
      },
      xpReward: 10,
      difficulty: 'Fácil'
    });

    pythonCourse.lessons = [pyLesson1._id];
    pythonCourse.totalLessons = 1;
    await pythonCourse.save();

    console.log('✅ Datos de ejemplo creados exitosamente');
    console.log(`📚 ${await Course.countDocuments()} cursos`);
    console.log(`📖 ${await Lesson.countDocuments()} lecciones`);
    console.log(`✏️  ${await Exercise.countDocuments()} ejercicios`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedData();
