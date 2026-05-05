const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const UserLanguageProgress = require('../models/UserLanguageProgress');
const CommunityPost = require('../models/CommunityPost');
const Follow = require('../models/Follow');
const Friendship = require('../models/Friendship');

dotenv.config({ path: '.env.local' });

const LEVELS_PER_LANGUAGE = 30;
const POINTS_PER_LEVEL = 2;
const LANGUAGES = ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Python', 'SQL'];

const seedUsers = [
  { fullName: 'Aitana Vega', username: 'aitana_vega', email: 'aitana_vega@demo.coding404.dev', programmerType: 'Full-Stack', bio: 'Construyo apps web y me encantan los retos de arquitectura.' },
  { fullName: 'Marco Rivas', username: 'marco_rivas', email: 'marco_rivas@demo.coding404.dev', programmerType: 'Back-end', bio: 'API first. Fan de Node.js, SQL y sistemas escalables.' },
  { fullName: 'Noa Campos', username: 'noa_campos', email: 'noa_campos@demo.coding404.dev', programmerType: 'Front-end', bio: 'UI limpia, accesible y animaciones con sentido.' },
  { fullName: 'Leo Salas', username: 'leo_salas', email: 'leo_salas@demo.coding404.dev', programmerType: 'Data', bio: 'Mejoro decisiones con datos y automatizacion.' },
  { fullName: 'Clara Ortega', username: 'clara_ortega', email: 'clara_ortega@demo.coding404.dev', programmerType: 'Full-Stack', bio: 'Del diseno a produccion: producto completo y rapido.' },
  { fullName: 'Iker Montes', username: 'iker_montes', email: 'iker_montes@demo.coding404.dev', programmerType: 'Back-end', bio: 'Refactor, tests y rendimiento como filosofia diaria.' },
  { fullName: 'Sara Pardo', username: 'sara_pardo', email: 'sara_pardo@demo.coding404.dev', programmerType: 'Front-end', bio: 'Microinteracciones y componentes reutilizables.' },
  { fullName: 'Bruno Mena', username: 'bruno_mena', email: 'bruno_mena@demo.coding404.dev', programmerType: 'Full-Stack', bio: 'Aprendizaje continuo y foco en DX.' },
  { fullName: 'Elena Vidal', username: 'elena_vidal', email: 'elena_vidal@demo.coding404.dev', programmerType: 'Data', bio: 'Python, ETL y visualizacion orientada a impacto.' },
  { fullName: 'Gael Roca', username: 'gael_roca', email: 'gael_roca@demo.coding404.dev', programmerType: 'Back-end', bio: 'Servicios robustos y observabilidad desde el inicio.' },
  { fullName: 'Marta Soler', username: 'marta_soler', email: 'marta_soler@demo.coding404.dev', programmerType: 'Front-end', bio: 'Frontend moderno con performance y accesibilidad.' },
  { fullName: 'Nico Pena', username: 'nico_pena', email: 'nico_pena@demo.coding404.dev', programmerType: 'Full-Stack', bio: 'Me gusta convertir ideas en MVP reales.' },
  { fullName: 'Valeria Cruz', username: 'valeria_cruz', email: 'valeria_cruz@demo.coding404.dev', programmerType: 'Data', bio: 'SQL y dashboards para contar historias con datos.' },
  { fullName: 'Dani Ferrer', username: 'dani_ferrer', email: 'dani_ferrer@demo.coding404.dev', programmerType: 'Back-end', bio: 'Clean code, APIs seguras y despliegues confiables.' },
  { fullName: 'Alba Navas', username: 'alba_navas', email: 'alba_navas@demo.coding404.dev', programmerType: 'Front-end', bio: 'Componentes claros, tipografia y UX de producto.' },
  { fullName: 'Hugo Prats', username: 'hugo_prats', email: 'hugo_prats@demo.coding404.dev', programmerType: 'Back-end', bio: 'Integraciones limpias y servicios confiables.' },
  { fullName: 'Nora Moya', username: 'nora_moya', email: 'nora_moya@demo.coding404.dev', programmerType: 'Data', bio: 'Automatizo reportes y visualizaciones accionables.' },
  { fullName: 'Joel Crespo', username: 'joel_crespo', email: 'joel_crespo@demo.coding404.dev', programmerType: 'Full-Stack', bio: 'Producto, desarrollo y entrega en ciclos cortos.' },
  { fullName: 'Iria Costa', username: 'iria_costa', email: 'iria_costa@demo.coding404.dev', programmerType: 'Front-end', bio: 'Interfaces rapidas y accesibles, sin ruido visual.' },
  { fullName: 'Pablo Rey', username: 'pablo_rey', email: 'pablo_rey@demo.coding404.dev', programmerType: 'Back-end', bio: 'API robusta, seguridad y trazabilidad.' },
  { fullName: 'Lara Sanz', username: 'lara_sanz', email: 'lara_sanz@demo.coding404.dev', programmerType: 'Data', bio: 'Modelado de datos para resolver problemas reales.' },
  { fullName: 'Ruben Vidal', username: 'ruben_vidal', email: 'ruben_vidal@demo.coding404.dev', programmerType: 'Full-Stack', bio: 'Del bug al deploy con foco en calidad.' },
  { fullName: 'Olga Marin', username: 'olga_marin', email: 'olga_marin@demo.coding404.dev', programmerType: 'Front-end', bio: 'Detalles visuales y consistencia de diseno.' },
  { fullName: 'Sergi Ruiz', username: 'sergi_ruiz', email: 'sergi_ruiz@demo.coding404.dev', programmerType: 'Back-end', bio: 'Arquitectura escalable y mantenimiento simple.' },
  { fullName: 'Mireia Valls', username: 'mireia_valls', email: 'mireia_valls@demo.coding404.dev', programmerType: 'Data', bio: 'Insights utiles desde datos complejos.' },
  { fullName: 'Adrian Pons', username: 'adrian_pons', email: 'adrian_pons@demo.coding404.dev', programmerType: 'Full-Stack', bio: 'Construyo herramientas utiles para equipos dev.' },
  { fullName: 'Carla Izquierdo', username: 'carla_izquierdo', email: 'carla_izquierdo@demo.coding404.dev', programmerType: 'Front-end', bio: 'UI moderna con enfoque en conversion y claridad.' },
  { fullName: 'Toni Beltran', username: 'toni_beltran', email: 'toni_beltran@demo.coding404.dev', programmerType: 'Back-end', bio: 'Servicios modulares y monitoreo continuo.' },
];

const targetTotalLevels = [
  156, 148, 141, 136, 129, 124, 118, 112, 105, 98, 92, 86, 80, 74,
  70, 66, 63, 60, 57, 54, 50, 47, 44, 41, 38, 35, 33, 30,
];

const postTexts = [
  'Hoy termine una practica fuerte de algoritmos y optimizacion.',
  'Subi una mejora de arquitectura que redujo tiempos de respuesta.',
  'Termine una leccion y lo aplique en un mini proyecto personal.',
  'Hice refactor de componentes y mejoro mucho la legibilidad.',
  'Ajuste queries SQL y ahora todo responde mas rapido.',
  'Automatice tareas repetitivas y ahora el flujo va mas limpio.',
  'Probe una estrategia nueva para organizar el codigo por dominios.',
  'Me enfoque en tests y cubri varios casos borde hoy.',
  'Separe responsabilidades en la API y quedo mas mantenible.',
  'Mejore el feedback visual del usuario en formularios complejos.',
  'Implemente validaciones mas solidas en backend y frontend.',
  'Documente endpoints y simplifique la integracion del cliente.',
  'Optimice carga inicial de la app con cambios de estructura.',
  'Practique logica de negocio con escenarios reales del producto.',
  'Hoy cerre una mejora que reduce deuda tecnica en dos modulos.',
  'Deje una base de componentes reutilizables para acelerar features.',
  'Ajuste validaciones de formularios y mejore mensajes de error.',
  'Subi una version con mejor estructura de carpetas y servicios.',
  'Documente decisiones tecnicas para facilitar onboarding.',
  'Reorganice flujo de datos para hacerlo mas predecible.',
  'Mejoramos el rendimiento en vistas con listas largas.',
  'Integracion nueva completada con pruebas de regresion.',
  'Refactor parcial para reducir acoplamiento en modulos clave.',
  'Preparando release con mejoras de usabilidad y estabilidad.',
  'Optimizacion en queries y endpoints para menor latencia.',
  'Acabo de cerrar una historia compleja de extremo a extremo.',
  'Nuevo avance en el panel de comunidad y recomendaciones.',
  'Pequeno cambio hoy, gran impacto en mantenibilidad.',
];

const projectTitles = [
  'API de tareas colaborativas', 'Dashboard de rendimiento', 'Gestor de notas tecnicas',
  'Sistema de reservas ligero', 'Portal de retos semanales', 'Microblog tecnico',
  'Rastreador de habitos', 'Catalogo de recursos dev', 'Panel de metricas de aprendizaje',
  'App de objetivos de estudio', 'Bitacora de practicas', 'Gestor de snippets',
  'Analizador de progreso', 'Comunidad de proyectos', 'Asistente de estudio diario',
  'API de seguimiento de objetivos', 'Portal de pair programming', 'Mapa de progreso por lenguaje',
  'Organizador de tareas dev', 'Vista de actividad comunitaria', 'Control de logros semanales',
  'Catador de snippets utiles', 'Muro de avances del equipo', 'Resumen visual de productividad',
  'Sistema de retos por niveles', 'Panel de cursos completados', 'Explorador de proyectos top',
  'Backlog inteligente de comunidad',
];

function levelsForTotal(totalLevels, languageCount) {
  const cap = languageCount * LEVELS_PER_LANGUAGE;
  const safeTotal = Math.max(0, Math.min(totalLevels, cap));
  const base = Math.floor(safeTotal / languageCount);
  let remainder = safeTotal % languageCount;

  return Array.from({ length: languageCount }, () => {
    const value = Math.min(LEVELS_PER_LANGUAGE, base + (remainder > 0 ? 1 : 0));
    if (remainder > 0) remainder -= 1;
    return value;
  });
}

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function buildDenseFollowGraph(userIds, minFollowing = 20, maxFollowing = 24) {
  const targetFollowing = userIds.map(() => randomInt(minFollowing, maxFollowing));
  const followingSets = userIds.map(() => new Set());

  for (let i = 0; i < userIds.length; i += 1) {
    for (let step = 1; step <= minFollowing; step += 1) {
      followingSets[i].add((i + step) % userIds.length);
    }
  }

  for (let i = 0; i < userIds.length; i += 1) {
    while (followingSets[i].size < targetFollowing[i]) {
      const candidate = randomInt(0, userIds.length - 1);
      if (candidate !== i) followingSets[i].add(candidate);
    }
  }

  const docs = [];
  for (let i = 0; i < userIds.length; i += 1) {
    for (const targetIndex of followingSets[i]) {
      docs.push({ followerId: userIds[i], followingId: userIds[targetIndex] });
    }
  }

  return docs;
}

function randomDateWithinDays(daysBack) {
  const now = Date.now();
  const minTs = now - daysBack * 24 * 60 * 60 * 1000;
  return new Date(randomInt(minTs, now));
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const passwordHash = await bcrypt.hash('Test@1234', 10);

    const persistedUsers = [];

    for (let i = 0; i < seedUsers.length; i += 1) {
      const def = seedUsers[i];
      const user = await User.findOneAndUpdate(
        { username: def.username },
        {
          fullName: def.fullName,
          email: def.email,
          username: def.username,
          passwordHash,
          programmerType: def.programmerType,
          avatarUrl: '',
          bio: def.bio,
          github: { hasAccount: true, username: `${def.username}_dev` },
          phone: `+34 600 ${String(100000 + i).slice(-6)}`,
          role: 'user',
          isBanned: false,
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );

      persistedUsers.push(user);
    }

    for (let i = 0; i < persistedUsers.length; i += 1) {
      const user = persistedUsers[i];
      const split = levelsForTotal(targetTotalLevels[i], LANGUAGES.length);

      for (let langIdx = 0; langIdx < LANGUAGES.length; langIdx += 1) {
        const completedCount = split[langIdx];
        const completedLevels = Array.from({ length: completedCount }, (_, level) => level + 1);

        await UserLanguageProgress.findOneAndUpdate(
          { userId: user._id, language: LANGUAGES[langIdx] },
          {
            userId: user._id,
            language: LANGUAGES[langIdx],
            completedLevels,
            completionPercentage: Math.round((completedCount / LEVELS_PER_LANGUAGE) * 100),
            totalPoints: completedCount * POINTS_PER_LEVEL,
            lastActivityAt: new Date(),
          },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
      }
    }

    const userIds = persistedUsers.map((u) => u._id);

    await Follow.deleteMany({
      $or: [
        { followerId: { $in: userIds } },
        { followingId: { $in: userIds } },
      ],
    });

    const followDocs = buildDenseFollowGraph(userIds, 20, 24);
    if (followDocs.length) {
      await Follow.insertMany(followDocs, { ordered: false }).catch(() => undefined);
    }

    await Friendship.deleteMany({
      $or: [
        { userId: { $in: userIds } },
        { friendId: { $in: userIds } },
      ],
    });

    for (let i = 0; i < userIds.length; i += 1) {
      const userId = userIds[i];
      const friendA = userIds[(i + 1) % userIds.length];
      const friendB = userIds[(i + 2) % userIds.length];

      for (const friendId of [friendA, friendB]) {
        if (String(userId) === String(friendId)) continue;
        await Friendship.findOneAndUpdate(
          { userId, friendId },
          {
            userId,
            friendId,
            status: 'accepted',
            requestedAt: randomDateWithinDays(60),
            establishedAt: randomDateWithinDays(55),
          },
          { upsert: true, setDefaultsOnInsert: true }
        );
      }
    }

    await CommunityPost.deleteMany({ userId: { $in: userIds } });

    const posts = [];
    for (let i = 0; i < persistedUsers.length; i += 1) {
      const user = persistedUsers[i];

      const postACreatedAt = randomDateWithinDays(45);
      const postA = {
        userId: user._id,
        type: 'Compartio',
        text: postTexts[i],
        likes: [userIds[(i + 2) % userIds.length], userIds[(i + 4) % userIds.length]],
        comments: [
          { userId: userIds[(i + 1) % userIds.length], text: 'Buen avance, sigue asi.', createdAt: randomDateWithinDays(45) },
          { userId: userIds[(i + 8) % userIds.length], text: 'Gran progreso, me gusto tu enfoque en esta parte.', createdAt: randomDateWithinDays(35) },
        ],
        shareCount: i % 4,
        savedBy: [userIds[(i + 3) % userIds.length]],
        createdAt: postACreatedAt,
        updatedAt: postACreatedAt,
      };

      const postBCreatedAt = randomDateWithinDays(45);
      const postB = {
        userId: user._id,
        type: 'Proyecto',
        text: `Acabo de publicar ${projectTitles[i]} para la comunidad.`,
        likes: [userIds[(i + 6) % userIds.length]],
        comments: [
          { userId: userIds[(i + 5) % userIds.length], text: 'Me gusto la estructura de este proyecto.', createdAt: randomDateWithinDays(30) },
          { userId: userIds[(i + 11) % userIds.length], text: 'Muy buena idea, lo voy a probar este fin de semana.', createdAt: randomDateWithinDays(25) },
        ],
        shareCount: (i + 1) % 5,
        savedBy: [userIds[(i + 7) % userIds.length]],
        project: {
          title: projectTitles[i],
          description: 'Proyecto de practica para hacer crecer la comunidad y compartir avances.',
          url: `https://github.com/${user.username}/${user.username}-demo-project`,
          category: i % 2 === 0 ? 'Proyectos' : 'Algoritmos',
        },
        createdAt: postBCreatedAt,
        updatedAt: postBCreatedAt,
      };

      posts.push(postA, postB);
    }

    if (posts.length) {
      await CommunityPost.insertMany(posts);
    }

    console.log('? Seed completado: 28 usuarios de comunidad creados/actualizados.');
    console.log('? Ranking variado, red de seguidores/seguidos actualizada y actividad historica generada.');
    console.log('?? Password para todos: Test@1234');
    process.exit(0);
  } catch (error) {
    console.error('? Error en seed-community-users:', error.message);
    process.exit(1);
  }
}

run();
