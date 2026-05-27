const createTopic = (title, description, theory, example, quiz, fillBlanks, practice) => ({
  title,
  description,
  theory,
  example,
  quiz,
  fillBlanks,
  practice,
});

const normalizeTheory = (topic) => {
  if (Array.isArray(topic?.theory)) return topic.theory.filter(Boolean)
  if (typeof topic?.theory === 'string' && topic.theory.trim()) return [topic.theory.trim()]
  return ['Repasa el concepto principal de este nivel.']
}

const getHtmlTagConcept = (tag) => {
  const conceptMap = {
    table: 'Define una tabla para organizar información en filas y columnas.',
    tr: 'Representa una fila dentro de una tabla.',
    th: 'Representa una celda de encabezado dentro de una tabla.',
    td: 'Representa una celda de datos dentro de una tabla.',
    ul: 'Crea una lista no ordenada.',
    ol: 'Crea una lista ordenada.',
    li: 'Representa un elemento dentro de una lista.',
    form: 'Agrupa controles para enviar datos.',
    input: 'Crea campos de entrada para formularios.',
    label: 'Describe y asocia texto a un control de formulario.',
    a: 'Crea enlaces entre páginas o secciones.',
    img: 'Inserta imágenes en la página.',
    header: 'Define la cabecera de una sección o página.',
    nav: 'Contiene enlaces de navegación.',
    main: 'Contiene el contenido principal del documento.',
    footer: 'Define el pie de página de una sección o página.',
    section: 'Agrupa contenido temático relacionado.',
    article: 'Representa contenido independiente.',
  }

  return conceptMap[tag] || `Etiqueta HTML usada para estructurar contenido: <${tag}>.`
}

const extractHtmlTags = (example = '') => {
  const matches = [...String(example).matchAll(/<([a-z][a-z0-9-]*)\b/gi)]
  return [...new Set(matches.map((match) => match[1].toLowerCase()))]
}

const normalizeFillToken = (token, language) => {
  const raw = String(token || '').trim()
  if (!raw) return raw

  if (String(language).toUpperCase() !== 'HTML') return raw

  const tagMatch = raw.match(/^<\/?\s*([a-z][a-z0-9-]*)\s*>?$/i)
  if (tagMatch) {
    return `<${tagMatch[1].toLowerCase()}>`
  }

  return raw
}

const rotateTake = (items, startIndex, size) => {
  if (!Array.isArray(items) || items.length === 0) return []
  const safeStart = ((startIndex % items.length) + items.length) % items.length
  const picked = []
  for (let index = 0; index < size; index++) {
    picked.push(items[(safeStart + index) % items.length])
  }
  return picked
}

const normalizeKey = (value) => String(value || '').trim().toLowerCase()

const ensureUniqueQuizSet = (quizzes, { topicTitle, language, levelId }) => {
  const seenQuestions = new Set()
  const seenCorrectAnswers = new Set()
  const seenOptionSignatures = new Set()

  return (quizzes || []).map((quiz, index) => {
    const safeQuiz = {
      ...(quiz || {}),
      options: Array.isArray(quiz?.options) ? [...quiz.options] : [],
      correct: Number.isInteger(quiz?.correct) ? quiz.correct : 0,
    }

    if (!safeQuiz.options.length) {
      safeQuiz.options = [String(topicTitle || 'Concepto principal'), 'Opción alternativa', 'Ninguna de las anteriores']
      safeQuiz.correct = 0
    }

    if (safeQuiz.correct < 0 || safeQuiz.correct >= safeQuiz.options.length) {
      safeQuiz.correct = 0
    }

    const questionKey = normalizeKey(safeQuiz.question)
    if (!questionKey || seenQuestions.has(questionKey)) {
      safeQuiz.question = `${String(safeQuiz.question || `Pregunta sobre ${topicTitle}`)} · V${index + 1}`
    }
    seenQuestions.add(normalizeKey(safeQuiz.question))

    let correctAnswer = String(safeQuiz.options[safeQuiz.correct] || '').trim()
    const correctAnswerKey = normalizeKey(correctAnswer)
    if (!correctAnswerKey || seenCorrectAnswers.has(correctAnswerKey)) {
      correctAnswer = `${correctAnswer || String(topicTitle || 'Respuesta') } · ${String(language || '').toUpperCase()} N${levelId}Q${index + 1}`
      safeQuiz.options[safeQuiz.correct] = correctAnswer
    }
    seenCorrectAnswers.add(normalizeKey(safeQuiz.options[safeQuiz.correct]))

    let signature = safeQuiz.options.map((option) => normalizeKey(option)).sort().join('|')
    if (seenOptionSignatures.has(signature)) {
      const optionIndexToAdjust = safeQuiz.correct === 0 ? 1 : 0
      if (safeQuiz.options[optionIndexToAdjust]) {
        safeQuiz.options[optionIndexToAdjust] = `${safeQuiz.options[optionIndexToAdjust]} · V${index + 1}`
      }
      signature = safeQuiz.options.map((option) => normalizeKey(option)).sort().join('|')
    }
    seenOptionSignatures.add(signature)

    return safeQuiz
  })
}

const getLevelBlueprint = (levelId) => {
  const stageLabels = ['Fundamentos', 'Aplicación Guiada', 'Variaciones', 'Optimización', 'Integración']
  const stageDescriptions = [
    'Enfoque en comprensión base del concepto.',
    'Aplicación práctica del tema en un contexto guiado.',
    'Exploración de variantes y alternativas del concepto.',
    'Mejora de estructura, claridad y mantenibilidad.',
    'Integración del tema con conocimientos previos.',
  ]
  const stageTheoryLines = [
    'Identifica la sintaxis base y su uso principal.',
    'Conecta la teoría con un caso de uso concreto.',
    'Compara distintas formas de resolver el mismo problema.',
    'Aplica buenas prácticas para mejorar legibilidad y calidad.',
    'Relaciona este concepto con otros bloques del curso.',
  ]
  const contexts = [
    'UI básica',
    'Datos simples',
    'Interacción local',
    'Componentes reutilizables',
    'Estructura semántica',
    'Caso real',
  ]

  const safeLevel = Math.max(1, Number(levelId || 1))
  const stageIndex = (safeLevel - 1) % stageLabels.length
  const contextIndex = Math.floor((safeLevel - 1) / stageLabels.length) % contexts.length
  const context = contexts[contextIndex]

  return {
    label: `${stageLabels[stageIndex]} · ${context}`,
    description: `${stageDescriptions[stageIndex]} Contexto del nivel: ${context}.`,
    theoryLine: `${stageTheoryLines[stageIndex]} Contexto: ${context}.`,
    practiceLine: `Construye una solución aplicando el tema en contexto de ${context.toLowerCase()}.`,
  }
}

const buildPedagogicalTheory = ({ topic, language, levelId, blueprint }) => {
  const baseTheory = normalizeTheory(topic)
  const primary = baseTheory[0] || `Comprende el concepto base de ${topic?.title || 'este nivel'}.`
  const secondary = baseTheory[1] || `Aplica ${topic?.title || 'el tema'} con sintaxis correcta.`
  const practical = baseTheory[2] || `Lleva ${topic?.title || 'el concepto'} a un caso práctico simple.`
  const commonMistake = baseTheory[3] || `Error común: aplicar ${topic?.title || 'el concepto'} sin validar el resultado.`

  return [
    `Fase del nivel ${levelId}: ${blueprint.label}.`,
    `Qué aprenderás: ${primary}`,
    `Idea clave: ${secondary}`,
    `Aplicación directa: ${practical}`,
    `Error frecuente a evitar: ${commonMistake}`,
    `Cómo estudiar este bloque: explica la idea en voz alta y luego impleméntala en código.`,
    `Checklist de validación: sintaxis correcta, intención clara, salida comprobada.`,
    `Objetivo final del nivel: ${blueprint.theoryLine}`,
  ]
}

const buildQuizVariants = (topic, language, levelId) => {
  const theory = normalizeTheory(topic)
  const baseQuiz = topic?.quiz || {
    question: `¿Cuál concepto describe mejor ${topic.title}?`,
    options: [topic.title, 'Ninguna opción', 'Todas las opciones'],
    correct: 0,
  }

  const variants = []
  variants.push(baseQuiz)

  if (String(language).toUpperCase() === 'HTML') {
    const tags = extractHtmlTags(topic?.example)
    const mainTag = tags[0] || 'div'
    const altTag = tags[1] || 'span'
    const thirdTag = tags[2] || 'p'

    variants.push({
      question: `En el tema "${topic.title}", ¿qué función cumple <${mainTag}>?`,
      options: [
        getHtmlTagConcept(mainTag),
        `Se utiliza para reemplazar siempre a <${altTag}> en cualquier caso.`,
        `Solo sirve para estilos CSS y no afecta estructura.`,
      ],
      correct: 0,
    })

    variants.push({
      question: `¿Cuál es la diferencia más precisa entre <${mainTag}> y <${altTag}> en este tema?`,
      options: [
        `${getHtmlTagConcept(mainTag)} Mientras que <${altTag}> se usa con otro propósito semántico.`,
        'Ambas etiquetas son exactamente iguales en todos los contextos.',
        `La etiqueta <${altTag}> elimina la necesidad de usar <${mainTag}> siempre.`,
      ],
      correct: 0,
    })

    variants.push({
      question: `¿Qué afirmación es correcta según el temario de ${topic.title}?`,
      options: [
        theory[0],
        `Nunca se recomienda usar elementos de ${topic.title} en proyectos reales.`,
        `Los conceptos de ${topic.title} solo funcionan con JavaScript avanzado.`,
      ],
      correct: 0,
    })

    variants.push({
      question: `En este nivel, ¿qué etiqueta aparece junto a <${mainTag}> en el ejemplo práctico?`,
      options: [`<${altTag}>`, `<${thirdTag}>`, '<script>'],
      correct: 0,
    })

    const hasTableTags = tags.includes('table') || tags.includes('tr') || tags.includes('th') || tags.includes('td')
    if (hasTableTags) {
      variants.push({
        question: 'En una tabla HTML, ¿qué etiqueta representa una celda de encabezado?',
        options: ['<th>', '<td>', '<tr>'],
        correct: 0,
      })

      variants.push({
        question: 'En una tabla HTML, ¿qué etiqueta representa una fila completa?',
        options: ['<tr>', '<td>', '<th>'],
        correct: 0,
      })

      variants.push({
        question: '¿Qué etiqueta se usa para celdas de datos normales dentro de una tabla?',
        options: ['<td>', '<th>', '<thead>'],
        correct: 0,
      })

      variants.push({
        question: 'Si quieres una tabla semántica básica, ¿cuál secuencia es correcta?',
        options: ['<table> → <tr> → <th>/<td>', '<tr> → <table> → <td>', '<td> → <th> → <table>'],
        correct: 0,
      })
    } else {
      variants.push({
        question: `¿Cuál de estas etiquetas aparece en el ejemplo de ${topic.title}?`,
        options: [`<${mainTag}>`, '<script>', '<canvas>'],
        correct: 0,
      })
    }
  } else {
    variants.push({
      question: `¿Qué afirmación es correcta sobre ${topic.title}?`,
      options: [
        theory[0],
        `${topic.title} no se utiliza en proyectos reales.`,
        `${topic.title} siempre reemplaza por completo a todos los demás conceptos.`,
      ],
      correct: 0,
    })

    variants.push({
      question: `¿Qué opción describe mejor el objetivo del tema ${topic.title}?`,
      options: [
        topic.description || `Aplicar ${topic.title} en ejercicios prácticos.`,
        'Eliminar por completo la estructura del código.',
        'Evitar usar validaciones o buenas prácticas.',
      ],
      correct: 0,
    })

    variants.push({
      question: `Según el ejemplo del nivel, ¿qué elemento es clave en ${topic.title}?`,
      options: [
        (baseQuiz.options && baseQuiz.options[baseQuiz.correct]) || topic.title,
        'No existe ningún elemento clave.',
        'Solo se usa texto plano sin reglas.',
      ],
      correct: 0,
    })
  }

  const startOffset = Number(levelId || 1) - 1
  const picked = rotateTake(variants, startOffset, 4)
  return ensureUniqueQuizSet(picked, {
    topicTitle: topic.title,
    language,
    levelId,
  })
}

const buildFillVariantFromTerms = (topic, language, preferredTerms = []) => {
  const example = String(topic?.example || '')
  const fallback = topic?.fillBlanks
  if (!example || !fallback) return fallback || null

  let terms = preferredTerms.filter(Boolean)
  if (terms.length < 2) {
    if (String(language).toUpperCase() === 'HTML') {
      terms = extractHtmlTags(example).slice(0, 2).map((tag) => `<${tag}>`)
    } else {
      const reqTerms = (topic?.practice?.requirements || []).slice(0, 2)
      terms = reqTerms.length >= 2 ? reqTerms : (fallback.answers || []).slice(0, 2)
    }
  }

  if (terms.length < 2) return fallback

  const buildTermRegex = (term) => {
    const rawTerm = String(term || '').trim()
    if (String(language).toUpperCase() === 'HTML') {
      const tagMatch = rawTerm.match(/^<\/?\s*([a-z][a-z0-9-]*)\s*>?$/i)
      if (tagMatch) {
        return new RegExp(`<\\/?\\s*${tagMatch[1]}\\b[^>]*>?`, 'i')
      }
    }

    const escaped = rawTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(escaped, 'i')
  }

  const matchPositions = terms
    .map((term) => {
      const regex = buildTermRegex(term)
      const found = regex.exec(example)
      return found ? { term, index: found.index, regex } : null
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index)
    .slice(0, 2)

  if (matchPositions.length < 2) return fallback

  let working = example
  const orderedTerms = matchPositions.map((item) => item.term)
  matchPositions.forEach((item, index) => {
    working = working.replace(item.regex, `__BLANK_${index}__`)
  })

  const segments = working.split(/__BLANK_\d+__/)
  const normalizedAnswers = orderedTerms.map((term) => normalizeFillToken(term, language))
  const normalizedPool = [...new Set([...(fallback.optionPool || []), ...orderedTerms].map((option) => normalizeFillToken(option, language)))]

  return {
    instruction: `${fallback.instruction} Selecciona las etiquetas en el orden correcto del código.`,
    preview: example,
    segments,
    answers: normalizedAnswers,
    optionPool: normalizedPool,
  }
}

const buildFillVariantAsAlternative = (base, language, variantIndex) => {
  const pool = Array.isArray(base.optionPool) ? [...base.optionPool] : []
  let shuffledPool = [...pool]
  
  if (variantIndex === 1) {
    shuffledPool = pool.slice().reverse()
  } else if (variantIndex === 2) {
    if (pool.length > 1) {
      shuffledPool = [pool[pool.length - 1], ...pool.slice(0, -1)]
    }
  }
  
  return {
    ...base,
    instruction: `${base.instruction} (Reto ${variantIndex + 1}/3) Selecciona las opciones en orden.`,
    answers: (base.answers || []).map((answer) => normalizeFillToken(answer, language)),
    optionPool: [...new Set(shuffledPool.map((option) => normalizeFillToken(option, language)))],
  }
}

const buildFillVariants = (topic, language, levelId) => {
  const base = topic?.fillBlanks || {
    instruction: `Completa los huecos del tema ${topic.title}.`,
    preview: topic?.example || '',
    segments: ['', '', ''],
    answers: ['opcion1', 'opcion2'],
    optionPool: ['opcion1', 'opcion2', 'opcion3'],
  }

  const firstVariant = {
    ...base,
    instruction: `${base.instruction} (Reto 1/3) Selecciona las opciones en orden.`,
    answers: (base.answers || []).map((answer) => normalizeFillToken(answer, language)),
    optionPool: [...new Set((base.optionPool || []).map((option) => normalizeFillToken(option, language)))],
  }

  const secondVariant = buildFillVariantFromTerms(topic, language, (base.answers || []).slice().reverse()) || buildFillVariantAsAlternative(base, language, 1)
  secondVariant.instruction = `${base.instruction} (Reto 2/3) Selecciona las opciones en orden.`

  const preferredThirdTerms = Array.isArray(base.answers) && base.answers.length >= 2
    ? base.answers.slice(0, 2)
    : []
  const thirdVariant = buildFillVariantFromTerms(topic, language, preferredThirdTerms) || buildFillVariantAsAlternative(base, language, 2)
  thirdVariant.instruction = `${base.instruction} (Reto 3/3) Selecciona las opciones en orden.`

  const variants = [firstVariant, secondVariant, thirdVariant]
  return rotateTake(variants, Number(levelId || 1) - 1, 3)
}

const getCoveredTopicsForLevel = (topics, levelId) => {
  const uniqueTopics = []
  for (let index = 0; index < levelId; index++) {
    const topic = topics[index % topics.length]
    if (topic && !uniqueTopics.find((item) => item.title === topic.title)) {
      uniqueTopics.push(topic)
    }
  }
  return uniqueTopics
}

const buildLevelProjectConfig = ({ language, levelId, topics }) => {
  if (levelId % 10 !== 0) return null

  if (language === 'HTML') {
    if (levelId === 10) {
      return {
        isFinal: false,
        title: 'Proyecto 1: Mi CV Básico',
        statement: 'Crea una página web básica en HTML que represente una presentación personal. Debe incluir un título principal, varios textos descriptivos y una cita. Utiliza diferentes tipos de etiquetas como encabezados, párrafos y formato de texto. Aplica estilos inline para dar color o formato a algunos elementos. Añade comentarios en el código explicando cada sección.',
        requirements: ["<h1", "<p", "<blockquote", "style=", "<!--"],
        goalLines: ["<!-- Comentario principal -->", "<h1>Hola, soy...</h1>", "<p>Desarrollador</p>", "<blockquote style=\"color: blue;\">Cita favorita</blockquote>"],
        isProject: true,
        projectTabs: ["HTML"],
        image: "/images/01_Proyecto_html.png"
      }
    } else if (levelId === 20) {
      return {
        isFinal: false,
        title: 'Proyecto 2: Perfil Estilizado',
        statement: 'Mejora tu página web personal añadiendo estilos con CSS. Incluye una imagen, un enlace a una web externa y un favicon (usa link rel=\'icon\'). Organiza la información usando listas y una tabla de habilidades. Aplica clases e identificadores (id) para dar estilos diferentes a cada sección. Diferencia entre elementos en bloque e inline.',
        requirements: ["<img", "<a", "<link", "<ul", "<table", "class=", "id=", "display:"],
        goalLines: ["<!-- Index.html -->", "<link rel=\"icon\" href=\"...\">", "<img src=\"...\">", "<!-- Styles.css -->", ".clase { color: red; }", "#id { font-weight: bold; }"],
        isProject: true,
        projectTabs: ["HTML", "CSS"],
        image: "/images/02_Proyecto_html.png"
      }
    } else if (levelId === 30) {
      return {
        isFinal: true,
        title: 'Proyecto 3: Landing Interactiva',
        statement: 'Crea una landing page completa estructurada con etiquetas semánticas HTML (header, nav, main, section, footer). Debe incluir varias secciones, un formulario funcional y contenido multimedia. Aplica diseño responsive básico mediante CSS y organiza el layout correctamente. Añade interactividad usando JavaScript dentro de la pestaña correspondiente. Incluye un elemento gráfico usando canvas o SVG.',
        requirements: ["<header", "<main", "<footer", "<form", "<canvas", "@media", "document.querySelector"],
        goalLines: ["<!-- HTML -->", "<form id=\"contacto\">", "<canvas id=\"grafico\"></canvas>", "/* CSS */", "@media (max-width: 768px)", "// JS", "document.querySelector('#contacto').addEventListener('submit')"],
        isProject: true,
        projectTabs: ["HTML", "CSS", "JavaScript"],
        image: "/images/03_proyecto_html.png"
      }
    }
  }

  const isFinal = levelId === 30
  const coveredTopics = getCoveredTopicsForLevel(topics, levelId)
  const coveredTitles = coveredTopics.map((topic) => topic.title)
  const coveredList = coveredTitles.join(', ')

  const requirements = [...new Set(
    coveredTopics
      .flatMap((topic) => (topic?.practice?.requirements || []))
      .filter(Boolean)
  )].slice(0, 8)

  const title = isFinal
    ? `Proyecto final de ${language}`
    : `Mini proyecto ${Math.floor(levelId / 10)} de ${language}`

  const statement = isFinal
    ? `Desarrolla una solución completa aplicando todo lo aprendido en ${language}: ${coveredList}.`
    : `Integra los conceptos del bloque en un proyecto práctico de ${language}: ${coveredList}.`

  const goalLines = isFinal
    ? [
        `Planifica una solución usando: ${coveredList}.`,
        'Construye una versión funcional y bien estructurada.',
        'Verifica que cumpla los requisitos del enunciado y buenas prácticas.',
      ]
    : [
        `Crea una solución que combine: ${coveredList}.`,
        'Implementa al menos los elementos obligatorios del bloque.',
        'Entrega una versión funcional y clara.',
      ]

  return {
    isFinal,
    title,
    statement,
    requirements,
    goalLines,
  }
}

const buildPracticeVariants = (topic, language, isExam, levelId, projectConfig = null) => {
  if (projectConfig) {
    const projectRequirements = Array.isArray(projectConfig.requirements) ? projectConfig.requirements : []
    const extendedRequirements = [...new Set([...projectRequirements, ...projectRequirements.slice(0, 2)])]

    return [
      {
        instruction: `${projectConfig.title}: ${projectConfig.statement}`,
        requirements: projectRequirements,
        goalLines: projectConfig.goalLines,
      },
      {
        instruction: projectConfig.isFinal
          ? `${projectConfig.title}: versión final. Refina, valida y entrega una solución completa del curso.`
          : `${projectConfig.title}: mejora tu solución inicial, optimiza estructura y valida requisitos.`,
        requirements: extendedRequirements,
        goalLines: projectConfig.goalLines,
      },
    ]
  }

  const base = topic?.practice || {
    instruction: `Aplica el tema ${topic.title} en código.`,
    requirements: [],
    goalLines: ['Escribe una solución válida.'],
  }

  const baseRequirements = Array.isArray(base.requirements) ? base.requirements : []
  const extensionRequirementByLanguage = {
    HTML: '<section',
    CSS: '@media',
    JAVASCRIPT: 'if',
    VUE: 'v-if',
    SQL: 'where',
    PYTHON: 'if',
    JAVA: 'if',
    PHP: 'if',
    'NODE.JS': 'if',
  }

  const normalizedLanguage = String(language || '').toUpperCase()
  const extensionRequirement = extensionRequirementByLanguage[normalizedLanguage] || 'return'

  const primaryRequirements = [...new Set(baseRequirements.filter(Boolean))]
  const rotatedRequirements = primaryRequirements.length > 1
    ? [...primaryRequirements.slice(1), primaryRequirements[0]]
    : primaryRequirements
  const secondaryRequirements = [...new Set([...rotatedRequirements, extensionRequirement])]

  const primaryGoals = Array.isArray(base.goalLines) && base.goalLines.length
    ? base.goalLines
    : ['Implementa la solución base del ejercicio.']

  const secondaryGoals = [
    `Extiende la solución base de ${topic.title} con una variación funcional.`,
    'Refactoriza para mantener el código claro y reutilizable.',
    `Añade al menos un requisito extra: ${extensionRequirement}.`,
  ]

  const variants = [
    {
      instruction: `${base.instruction} (Reto 1/2): resuelve la versión base.`,
      requirements: primaryRequirements,
      goalLines: primaryGoals,
    },
    {
      instruction: isExam
        ? `Examen práctico de ${language}: crea una segunda solución alternativa integrando ${topic.title}.`
        : `${base.instruction} (Reto 2/2): crea una variante diferente con un requisito extra.`,
      requirements: secondaryRequirements,
      goalLines: secondaryGoals,
    },
  ]

  return rotateTake(variants, Number(levelId || 1) - 1, 2)
}

const generateTests = (topic, language, levelId, isExam, projectConfig = null) => {
  const quizVariants = buildQuizVariants(topic, language, levelId)
  const fillVariants = buildFillVariants(topic, language, levelId)
  const practiceVariants = buildPracticeVariants(topic, language, isExam, levelId, projectConfig)
  const theory = normalizeTheory(topic)
  const tests = [];

  for (let testNum = 1; testNum <= 9; testNum++) {
    const testTheoryPoint = theory[Math.min(testNum - 1, theory.length - 1)];

    let testType = 'quiz';
    if (testNum >= 5 && testNum <= 7) {
      testType = 'fillBlanks';
    } else if (testNum >= 8) {
      testType = 'code_practice';
    }

    const baseTest = {
      number: testNum,
      title: `Prueba ${testNum}/9: ${topic.title}`,
      type: testType,
      theoryPoint: testTheoryPoint || theory[0],
      theoryFull: theory,
    };

    if (testNum <= 4) {
      const quizVariant = { ...(quizVariants[testNum - 1] || {}) }
      const quizOptions = Array.isArray(quizVariant.options) ? [...quizVariant.options] : []
      baseTest.quiz = {
        ...quizVariant,
        options: quizOptions,
        question: String(quizVariant.question || `Pregunta de ${topic.title}`),
      }
    } else if (testNum >= 5 && testNum <= 7) {
      const fillVariant = { ...(fillVariants[testNum - 5] || {}) }
      baseTest.fillBlanks = {
        ...fillVariant,
        instruction: String(fillVariant.instruction || `Completa el ejercicio de ${topic.title}`),
      }
    } else {
      const practiceVariant = { ...(practiceVariants[testNum - 8] || {}) }
      baseTest.practice = {
        ...practiceVariant,
        instruction: String(practiceVariant.instruction || `Práctica de ${topic.title}`),
      }
    }

    tests.push(baseTest);
  }

  return tests;
};

const LANGUAGE_UNITS = {
  HTML: ['Intro HTML', 'Elementos', 'Atributos', 'Encabezados', 'Párrafos', 'Estilos Inline', 'Formato Texto', 'Citas', 'Comentarios', 'Colores', 'CSS en HTML', 'Enlaces', 'Imágenes', 'Favicon', 'Tablas', 'Listas', 'Bloque e Inline', 'Clases', 'ID', 'Iframes', 'JS en HTML', 'Rutas', 'Head y Meta', 'Layout', 'Responsive', 'Semántica', 'Formularios', 'Multimedia', 'Canvas', 'SVG'],
  CSS: ['Sintaxis CSS', 'Selectores', 'Colores CSS', 'Fondos', 'Bordes', 'Márgenes', 'Padding', 'Tamaño Caja', 'Box Model', 'Outline', 'Texto CSS', 'Fuentes', 'Iconos', 'Enlaces CSS', 'Listas CSS', 'Tablas CSS', 'Display', 'Max Width', 'Position', 'Z-Index', 'Overflow', 'Float', 'Inline-Block', 'Align', 'Combinadores', 'Pseudo-clases', 'Pseudo-elementos', 'Opacity', 'Flexbox', 'Grid'],
  JAVASCRIPT: ['Salida JS', 'Sintaxis JS', 'Variables', 'Let y Const', 'Operadores', 'Aritmética', 'Tipos Datos', 'Funciones', 'Objetos', 'Eventos', 'Strings', 'Métodos String', 'Números', 'Arrays', 'Métodos Array', 'Fechas', 'Math', 'Booleanos', 'Comparaciones', 'If Else', 'Switch', 'Bucle For', 'Bucle While', 'Break Continue', 'Set y Map', 'JSON', 'DOM Básico', 'DOM Eventos', 'Fetch API', 'Promesas'],
  VUE: ['Instancia Vue', 'Template Syntax', 'v-bind', 'v-on Eventos', 'v-model', 'v-if v-show', 'v-for Listas', 'Computed', 'Watchers', 'Componentes', 'Props', 'Emit', 'Slots', 'Lifecycle Hooks', 'Composition API', 'ref y reactive', 'Vue Router', 'Rutas Dinámicas', 'Navegación', 'Vuex Básico', 'State', 'Mutations', 'Actions', 'Getters', 'Módulos', 'Transiciones', 'Directivas Custom', 'Mixins', 'Plugins', 'Deploy Vue'],
  'NODE.JS': ['Intro Node', 'Módulos', 'FS Module', 'Path Module', 'OS Module', 'Events', 'HTTP Server', 'URL Module', 'NPM Básico', 'Package JSON', 'Express Intro', 'Routing', 'Middleware', 'REST API', 'Query Params', 'Body Parsing', 'Async Await', 'Errores', 'Variables Entorno', 'CORS', 'Autenticación', 'JWT Básico', 'MongoDB Node', 'Mongoose', 'Subida Archivos', 'Sockets Intro', 'Testing Node', 'Deploy Node', 'Logs', 'Arquitectura'],
  SQL: ['SELECT', 'WHERE', 'ORDER BY', 'INSERT', 'UPDATE', 'DELETE', 'NULL', 'MIN y MAX', 'COUNT', 'SUM y AVG', 'LIKE', 'IN', 'BETWEEN', 'Aliases', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'UNION', 'GROUP BY', 'HAVING', 'EXISTS', 'ANY y ALL', 'CASE', 'CREATE DB', 'CREATE TABLE', 'ALTER TABLE', 'CONSTRAINTS', 'INDEX', 'VIEW', 'TRANSACTION'],
  PYTHON: ['Sintaxis Python', 'Variables', 'Tipos Datos', 'Números', 'Strings', 'Booleanos', 'Operadores', 'Listas', 'Tuplas', 'Sets', 'Diccionarios', 'If Else', 'While', 'For', 'Funciones', 'Lambda', 'Scope', 'Módulos', 'Datetime', 'Math', 'JSON', 'Regex', 'Input', 'Archivos', 'Excepciones', 'Clases', 'Herencia', 'Iteradores', 'Virtualenv', 'Conexión DB'],
  JAVA: ['Intro Java', 'Sintaxis Java', 'Output', 'Variables', 'Tipos Primitivos', 'Type Casting', 'Operadores', 'Strings', 'Math', 'Boolean', 'If Else', 'Switch', 'For Loop', 'While Loop', 'Arrays', 'Métodos', 'Clases y Objetos', 'Constructores', 'Modifiers', 'Encapsulación', 'Packages', 'Herencia', 'Polimorfismo', 'Interfaces', 'Enums', 'Scanner', 'Date Time', 'ArrayList', 'HashMap', 'File I/O'],
  PHP: ['Intro PHP', 'Sintaxis PHP', 'Variables PHP', 'Echo Print', 'Tipos PHP', 'Strings PHP', 'Números PHP', 'Math PHP', 'Constantes', 'Operadores PHP', 'If Else PHP', 'Switch PHP', 'Loops PHP', 'Funciones PHP', 'Arrays PHP', 'Superglobals', 'Forms PHP', 'Validación', 'Date Time PHP', 'Include Require', 'Archivos PHP', 'Cookies', 'Sesiones', 'Filtros', 'JSON PHP', 'Clases PHP', 'Constructores PHP', 'Acceso OOP', 'Herencia PHP', 'MySQL PHP'],
}

const getLanguageUnitTitle = (language, levelId, fallbackTitle) => {
  const normalized = String(language || '').toUpperCase()
  const units = LANGUAGE_UNITS[normalized] || []
  return units[levelId - 1] || `${fallbackTitle} ${levelId}`
}

const getLanguageTokens = (language) => {
  const normalized = String(language || '').toUpperCase()
  const map = {
    HTML: ['<section>', '<article>', '<form>'],
    CSS: ['selector', 'property', 'value'],
    JAVASCRIPT: ['const', 'function()', '=>'],
    VUE: ['ref()', 'v-model', 'setup()'],
    'NODE.JS': ['require()', 'module.exports', 'app.get()'],
    SQL: ['SELECT', 'FROM', 'WHERE'],
    PYTHON: ['def', 'if', 'return'],
    JAVA: ['class', 'public', 'static'],
    PHP: ['<?php', 'echo', '?>'],
  }
  return map[normalized] || ['concepto', 'sintaxis', 'práctica']
}

const buildLanguageExample = (language, unitTitle, tokens) => {
  const normalized = String(language || '').toUpperCase()
  if (normalized === 'HTML') return `<section><h2>${unitTitle}</h2><article>Ejemplo práctico</article></section>`
  if (normalized === 'CSS') return `.demo { ${tokens[1]}: ${tokens[2]}; }`
  if (normalized === 'JAVASCRIPT') return `function demo(){ const tema = "${unitTitle}"; return tema; }`
  if (normalized === 'NODE.JS') return `const http = require('http');\nhttp.createServer((req,res)=>res.end('${unitTitle}'));`
  if (normalized === 'SQL') return `SELECT '${unitTitle}' AS tema FROM tabla_demo WHERE activo = 1;`
  if (normalized === 'PYTHON') return `def demo():\n    tema = "${unitTitle}"\n    return tema`
  if (normalized === 'JAVA') return `class Main { public static void main(String[] args){ System.out.println("${unitTitle}"); } }`
  if (normalized === 'PHP') return `<?php\n$tema = "${unitTitle}";\necho $tema;\n?>`
  return `// ${unitTitle}`
}

const buildUniqueTopicForLevel = (baseTopic, language, levelId, unitTitle) => {
  const tokens = getLanguageTokens(language)
  const example = buildLanguageExample(language, unitTitle, tokens)

  return {
    ...baseTopic,
    title: unitTitle,
    description: `Nivel centrado en ${unitTitle.toLowerCase()} de ${language}.`,
    theory: [
      `${unitTitle}: concepto principal del nivel en ${language}.`,
      `Sintaxis base para trabajar ${unitTitle.toLowerCase()}.`,
      `Caso práctico de ${unitTitle.toLowerCase()} aplicado a un ejercicio real.`,
      `Error común al usar ${unitTitle.toLowerCase()} y cómo evitarlo.`,
    ],
    example,
    quiz: {
      question: `En ${language}, ¿qué objetivo tiene ${unitTitle}?`,
      options: [
        `Aplicar ${unitTitle} correctamente en código.`,
        `Ignorar la sintaxis de ${unitTitle}.`,
        `Sustituir todo el lenguaje solo con ${unitTitle}.`,
      ],
      correct: 0,
    },
    fillBlanks: {
      instruction: `Completa el bloque clave de ${unitTitle}.`,
      preview: example,
      segments: ['', ' ', ''],
      answers: [tokens[0], tokens[1]],
      optionPool: [tokens[0], tokens[1], tokens[2]],
    },
    practice: {
      instruction: `Crea una mini solución usando ${unitTitle}.`,
      requirements: [tokens[0], tokens[1]],
      goalLines: [
        `Implementa ${unitTitle} con sintaxis válida de ${language}.`,
        `Valida que el resultado funcione con un caso de prueba simple.`,
      ],
    },
  }
}

const buildCurriculum = ({ language, description, topics }) => {
  const levelTopics = Array.from({ length: 30 }, (_, idx) => {
    const levelId = idx + 1
    const baseTopic = topics[idx % topics.length]
    const unitTitle = getLanguageUnitTitle(language, levelId, baseTopic?.title || `Nivel ${levelId}`)
    return buildUniqueTopicForLevel(baseTopic, language, levelId, unitTitle)
  })

  const levels = Array.from({ length: 30 }, (_, idx) => {
    const id = idx + 1;
    const topic = levelTopics[idx];
    const blueprint = getLevelBlueprint(id)
    const projectConfig = buildLevelProjectConfig({ language, levelId: id, topics: levelTopics })
    const isExam = id % 10 === 0;
    const theory = buildPedagogicalTheory({ topic, language, levelId: id, blueprint })
    const levelName = `${topic.title} · N${id}`
    const levelDescription = `${topic.description} ${blueprint.description}`
    const basePractice = topic?.practice || {
      instruction: `Aplica el tema ${topic.title} en código.`,
      requirements: [],
      goalLines: ['Escribe una solución válida.'],
    }
    const enrichedPractice = {
      ...basePractice,
      instruction: `${basePractice.instruction} ${blueprint.practiceLine}`,
    }
    const topicForLevel = {
      ...topic,
      title: `${topic.title}`,
      description: levelDescription,
      theory,
      practice: enrichedPractice,
    }

    return {
      id,
      name: projectConfig?.isProject ? projectConfig.title : levelName,
      description: projectConfig?.isProject ? (projectConfig.statement.substring(0, 100) + '...') : levelDescription,
      difficulty: id <= 10 ? 'fácil' : id <= 20 ? 'medio' : 'difícil',
      points: id <= 10 ? 75 : id <= 20 ? 100 : 125,
      isExam: projectConfig?.isProject ? true : isExam,
      isProject: projectConfig?.isProject || false,
      projectTabs: projectConfig?.projectTabs || null,
      image: projectConfig?.image || null,
      content: {
        title: levelName,
        theory,
        example: topic.example,
      },
      quiz: [topicForLevel.quiz],
      fillBlanks: topicForLevel.fillBlanks,
      practice: projectConfig
        ? {
            instruction: `${projectConfig.title}: ${projectConfig.statement}`,
            requirements: projectConfig.requirements,
            goalLines: projectConfig.goalLines,
          }
        : enrichedPractice,
      tests: generateTests(topicForLevel, language, id, isExam, projectConfig),
    };
  });

  return {
    language,
    description,
    levels,
  };
};

const htmlTopics = [
  createTopic(
    'Introducción y estructura base',
    'Crea la estructura mínima de una página HTML.',
    [
      'HTML es el lenguaje base de la web.',
      'Todo documento inicia con <!DOCTYPE html>.',
      'head guarda metadatos y title.',
      'body contiene lo visible para el usuario.',
    ],
    '<!DOCTYPE html>\n<html lang="es">\n<head><title>Mi página</title></head>\n<body><h1>Hola mundo</h1></body>\n</html>',
    {
      question: '¿Qué etiqueta contiene el contenido visible?',
      options: ['head', 'body', 'title'],
      correct: 1,
    },
    {
      instruction: 'Completa la base de una página HTML.',
      preview: '<!DOCTYPE html>\n<html lang="es">\n<head><title>Demo</title></head>\n<body>Contenido</body>\n</html>',
      segments: ['<!DOCTYPE html>\n', ' lang="es">\n<head><title>Demo</title></head>\n', '>Contenido</body>\n</html>'],
      answers: ['<html', '<body'],
      optionPool: ['<html', '<body', '<head', '<main', '<section'],
    },
    {
      instruction: 'Crea una página con título principal y párrafo.',
      requirements: ['<h1', '<p'],
      goalLines: ['<h1>Mi primera web</h1>', '<p>Estoy aprendiendo HTML.</p>'],
    }
  ),
  createTopic(
    'Encabezados y párrafos',
    'Organiza contenido con títulos y texto.',
    [
      'h1 a h6 crean niveles de encabezado.',
      'p define párrafos para estructurar texto.',
      'Una buena jerarquía mejora la lectura.',
      'Usa un solo h1 principal por página.',
    ],
    '<h1>Título principal</h1>\n<h2>Subtítulo</h2>\n<p>Contenido del párrafo.</p>',
    {
      question: '¿Qué etiqueta representa el encabezado más importante?',
      options: ['h6', 'h1', 'header'],
      correct: 1,
    },
    {
      instruction: 'Completa encabezado y párrafo.',
      preview: '<h1>Bienvenido</h1>\n<p>Texto introductorio</p>',
      segments: ['', '>Bienvenido</h1>\n', '>Texto introductorio</p>'],
      answers: ['<h1', '<p'],
      optionPool: ['<h1', '<h2', '<p', '<div', '<span'],
    },
    {
      instruction: 'Crea una sección con h1, h2 y un párrafo.',
      requirements: ['<h1', '<h2', '<p'],
      goalLines: ['<h1>Curso HTML</h1>', '<h2>Lección 1</h2>', '<p>Hoy veremos encabezados y párrafos.</p>'],
    }
  ),
  createTopic(
    'Listas ordenadas y no ordenadas',
    'Muestra información en listas.',
    [
      'ul crea listas no ordenadas.',
      'ol crea listas numeradas.',
      'li define cada elemento de lista.',
      'Las listas mejoran legibilidad.',
    ],
    '<ul><li>HTML</li><li>CSS</li></ul>\n<ol><li>Paso 1</li><li>Paso 2</li></ol>',
    {
      question: '¿Qué etiqueta crea una lista numerada?',
      options: ['ul', 'ol', 'li'],
      correct: 1,
    },
    {
      instruction: 'Completa una lista básica.',
      preview: '<ul><li>Elemento</li></ul>',
      segments: ['', '><li>Elemento</li>', '>'],
      answers: ['<ul', '</ul'],
      optionPool: ['<ul', '</ul', '<ol', '<li', '<p'],
    },
    {
      instruction: 'Crea una ul y una ol con dos elementos cada una.',
      requirements: ['<ul', '<ol', '<li'],
      goalLines: ['<ul><li>HTML</li><li>CSS</li></ul>', '<ol><li>Abrir editor</li><li>Guardar archivo</li></ol>'],
    }
  ),
  createTopic(
    'Tablas HTML',
    'Presenta datos en filas y columnas.',
    [
      'table crea la tabla.',
      'tr define filas.',
      'th define cabeceras.',
      'td define celdas de datos.',
    ],
    '<table>\n<tr><th>Nombre</th><th>Edad</th></tr>\n<tr><td>Ana</td><td>22</td></tr>\n</table>',
    {
      question: '¿Qué etiqueta representa una celda de encabezado?',
      options: ['td', 'th', 'tr'],
      correct: 1,
    },
    {
      instruction: 'Completa cabeceras y celdas de tabla.',
      preview: '<table><tr><th>Curso</th></tr><tr><td>HTML</td></tr></table>',
      segments: ['<table><tr>', '>Curso</th></tr><tr>', '>HTML</td></tr></table>'],
      answers: ['<th', '<td'],
      optionPool: ['<th', '<td', '<li', '<p', '<div'],
    },
    {
      instruction: 'Crea una tabla con 2 columnas y 2 filas de datos.',
      requirements: ['<table', '<tr', '<th', '<td'],
      goalLines: ['<table>', '<tr><th>Lenguaje</th><th>Nivel</th></tr>', '<tr><td>HTML</td><td>Inicial</td></tr>', '<tr><td>CSS</td><td>Básico</td></tr>', '</table>'],
    }
  ),
  createTopic(
    'Formularios e inputs',
    'Captura datos del usuario en la web.',
    [
      'form agrupa controles de entrada.',
      'input crea campos de texto, email y más.',
      'label mejora accesibilidad del formulario.',
      'button envía o ejecuta acciones.',
    ],
    '<form>\n<label for="email">Email</label>\n<input id="email" type="email">\n<button>Enviar</button>\n</form>',
    {
      question: '¿Qué etiqueta relaciona texto descriptivo con un input?',
      options: ['label', 'span', 'legend-only'],
      correct: 0,
    },
    {
      instruction: 'Completa formulario básico.',
      preview: '<form><label for="nombre">Nombre</label><input id="nombre" type="text"></form>',
      segments: ['', '><label for="nombre">Nombre</label>', ' id="nombre" type="text"></form>'],
      answers: ['<form', '<input'],
      optionPool: ['<form', '<input', '<table', '<ul', '<img'],
    },
    {
      instruction: 'Crea formulario con label, input email y botón.',
      requirements: ['<form', '<label', '<input', 'type="email"', '<button'],
      goalLines: ['<form>', '<label for="correo">Correo</label>', '<input id="correo" type="email">', '<button type="submit">Enviar</button>', '</form>'],
    }
  ),
  createTopic(
    'Semántica HTML5',
    'Estructura páginas con etiquetas semánticas.',
    [
      'header representa cabecera de la página.',
      'nav contiene la navegación.',
      'main agrupa contenido principal.',
      'section y article dividen el contenido.',
    ],
    '<header>Mi web</header>\n<nav>Menú</nav>\n<main><section>Contenido</section></main>\n<footer>Pie</footer>',
    {
      question: '¿Qué etiqueta contiene el contenido principal?',
      options: ['main', 'aside', 'head'],
      correct: 0,
    },
    {
      instruction: 'Completa estructura semántica.',
      preview: '<header>Título</header><main><section>Contenido</section></main>',
      segments: ['', '>Título</header>', '><section>Contenido</section></main>'],
      answers: ['<header', '<main'],
      optionPool: ['<header', '<main', '<div', '<span', '<table'],
    },
    {
      instruction: 'Crea layout semántico con header, nav, main y footer.',
      requirements: ['<header', '<nav', '<main', '<footer'],
      goalLines: ['<header>Mi sitio</header>', '<nav><a href="#">Inicio</a></nav>', '<main><section>Contenido principal</section></main>', '<footer>Contacto</footer>'],
    }
  ),
  createTopic(
    'Bloques, inline, class e id',
    'Diferencia elementos de bloque y en línea.',
    [
      'div es un contenedor de bloque.',
      'span es un contenedor en línea.',
      'class se puede repetir en varios elementos.',
      'id debe ser único en la página.',
    ],
    '<div class="card">\n  <span id="estado">Activo</span>\n</div>',
    {
      question: '¿Qué atributo debe ser único en una página?',
      options: ['class', 'id', 'style'],
      correct: 1,
    },
    {
      instruction: 'Completa atributos class e id.',
      preview: '<div class="card"><span id="tag">Nuevo</span></div>',
      segments: ['<div ', '="card"><span ', '="tag">Nuevo</span></div>'],
      answers: ['class', 'id'],
      optionPool: ['class', 'id', 'href', 'src', 'alt'],
    },
    {
      instruction: 'Crea un div con class y un span con id.',
      requirements: ['<div', 'class=', '<span', 'id='],
      goalLines: ['<div class="producto">', '  <span id="precio">19.99€</span>', '</div>'],
    }
  ),
  createTopic(
    'Multimedia, iframe y entidades',
    'Inserta recursos y símbolos especiales.',
    [
      'video y audio permiten contenido multimedia.',
      'iframe incrusta contenido externo.',
      'Las entidades muestran caracteres especiales.',
      'Ejemplo: &copy; y &nbsp; son entidades HTML.',
    ],
    '<video controls><source src="demo.mp4" type="video/mp4"></video>\n<iframe src="https://www.w3schools.com"></iframe>\n<p>&copy; 2026</p>',
    {
      question: '¿Qué etiqueta incrusta otra página web?',
      options: ['embed-only', 'iframe', 'object-id'],
      correct: 1,
    },
    {
      instruction: 'Completa iframe y entidad HTML.',
      preview: '<iframe src="https://www.w3schools.com"></iframe>\n<p>&copy; 2026</p>',
      segments: ['', ' src="https://www.w3schools.com"></iframe>\n<p>', '; 2026</p>'],
      answers: ['<iframe', '&copy'],
      optionPool: ['<iframe', '&copy', '<video', '<audio', '&nbsp'],
    },
    {
      instruction: 'Añade video o iframe y muestra © en un párrafo.',
      requirements: ['<p', '&copy', '<iframe'],
      goalLines: ['<iframe src="https://www.w3schools.com"></iframe>', '<p>&copy; Mi proyecto HTML</p>'],
    }
  ),
];

const cssTopics = [
  createTopic(
    'Selectores y reglas',
    'Define estilos por etiqueta, clase e id.',
    ['Una regla CSS tiene selector y bloque.', 'Usa clases para reutilizar estilos.', 'id es único por página.', 'La cascada determina prioridad.'],
    'h1 { color: #1f3cff; }\n.card { padding: 12px; }',
    { question: '¿Qué selector representa una clase?', options: ['#card', '.card', 'card'], correct: 1 },
    {
      instruction: 'Completa propiedades CSS básicas.',
      preview: '.card { color: #fff; padding: 12px; }',
      segments: ['.card { ', ': #fff; ', ': 12px; }'],
      answers: ['color', 'padding'],
      optionPool: ['color', 'padding', 'display', 'for', 'if'],
    },
    {
      instruction: 'Estiliza una tarjeta con color y padding.',
      requirements: ['.card', 'color', 'padding'],
      goalLines: ['.card {', '  color: #fff;', '  padding: 12px;', '}'],
    }
  ),
  createTopic(
    'Flexbox y layout',
    'Alinea elementos en filas y columnas.',
    ['display:flex activa flexbox.', 'justify-content alinea horizontalmente.', 'align-items alinea verticalmente.', 'gap separa elementos.'],
    '.row { display: flex; justify-content: center; align-items: center; }',
    { question: '¿Qué propiedad activa flexbox?', options: ['display:flex', 'position:flex', 'layout:flex'], correct: 0 },
    {
      instruction: 'Completa contenedor flex.',
      preview: '.row { display: flex; justify-content: center; }',
      segments: ['.row { ', ': flex; ', ': center; }'],
      answers: ['display', 'justify-content'],
      optionPool: ['display', 'justify-content', 'font-size', 'echo', 'return'],
    },
    {
      instruction: 'Crea una fila centrada con flexbox.',
      requirements: ['display: flex', 'justify-content', 'align-items'],
      goalLines: ['.row {', '  display: flex;', '  justify-content: center;', '  align-items: center;', '}'],
    }
  ),
  createTopic(
    'Responsive y media queries',
    'Adapta estilos a distintos tamaños de pantalla.',
    ['@media aplica condiciones de ancho.', 'max-width ayuda a móviles.', 'Puedes reordenar layouts.', 'Mejora la experiencia de usuario.'],
    '@media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }',
    { question: '¿Qué regla se usa para estilos responsivos?', options: ['@media', '@responsive', '@layout'], correct: 0 },
    {
      instruction: 'Completa una media query.',
      preview: '@media (max-width: 768px) { .menu { display: none; } }',
      segments: ['', ' (max-width: 768px) { .menu { ', ': none; } }'],
      answers: ['@media', 'display'],
      optionPool: ['@media', 'display', 'import', 'node', 'class'],
    },
    {
      instruction: 'Oculta un menú en móvil con media query.',
      requirements: ['@media', 'max-width', 'display'],
      goalLines: ['@media (max-width: 768px) {', '  .menu { display: none; }', '}'],
    }
  ),
];

const javascriptTopics = [
  createTopic(
    'Variables y condicionales',
    'Controla datos y decisiones.',
    ['let/const declaran variables.', 'if/else manejan flujo.', '=== compara valor y tipo.', 'Usa nombres claros.'],
    'const nombre = "Ana";\nif (nombre) { console.log(nombre); }',
    { question: '¿Qué palabra evita reasignación?', options: ['var', 'let', 'const'], correct: 2 },
    {
      instruction: 'Completa declaración y condicional.',
      preview: 'const nombre = "Ana";\nif (nombre) { console.log(nombre); }',
      segments: ['', ' nombre = "Ana";\n', ' (nombre) { console.log(nombre); }'],
      answers: ['const', 'if'],
      optionPool: ['const', 'if', 'for', 'SELECT', 'class'],
    },
    {
      instruction: 'Declara una variable y muéstrala por consola.',
      requirements: ['const ', 'console.log'],
      goalLines: ['const curso = "JavaScript";', 'console.log(curso);'],
    }
  ),
  createTopic(
    'Funciones y arrays',
    'Crea lógica reusable y procesa listas.',
    ['function define funciones.', 'return devuelve resultados.', 'map transforma arrays.', 'filter selecciona elementos.'],
    'function sumar(a,b){ return a+b }\nconst nums = [1,2,3].map(n => n*2);',
    { question: '¿Qué palabra devuelve un resultado en una función?', options: ['break', 'return', 'yield'], correct: 1 },
    {
      instruction: 'Completa función y retorno.',
      preview: 'function suma(a, b) { return a + b; }',
      segments: ['', ' suma(a, b) { ', ' a + b; }'],
      answers: ['function', 'return'],
      optionPool: ['function', 'return', 'if', 'echo', 'FROM'],
    },
    {
      instruction: 'Crea función y úsala con console.log.',
      requirements: ['function ', 'return ', 'console.log'],
      goalLines: ['function multiplicar(a, b) {', '  return a * b;', '}', 'console.log(multiplicar(2, 3));'],
    }
  ),
  createTopic(
    'DOM y eventos',
    'Conecta JavaScript con la interfaz.',
    ['querySelector selecciona nodos.', 'addEventListener escucha eventos.', 'textContent actualiza texto.', 'Evita lógica acoplada al DOM.'],
    'const btn = document.querySelector("button");\nbtn.addEventListener("click", () => console.log("ok"));',
    { question: '¿Qué método escucha eventos?', options: ['onEvent', 'addEventListener', 'listen'], correct: 1 },
    {
      instruction: 'Completa selección y evento.',
      preview: 'btn.addEventListener("click", () => console.log("ok"));',
      segments: ['btn.', '("click", () => ', '("ok"));'],
      answers: ['addEventListener', 'console.log'],
      optionPool: ['addEventListener', 'console.log', 'SELECT', 'echo', 'class'],
    },
    {
      instruction: 'Crea un evento click que cambie texto.',
      requirements: ['queryselector', 'addeventlistener', 'textcontent'],
      goalLines: ['const title = document.querySelector("h1");', 'document.querySelector("button").addEventListener("click", () => {', '  title.textContent = "Actualizado";', '});'],
    }
  ),
];

const nodeTopics = [
  createTopic(
    'Introducción a Node.js',
    'Ejecuta JavaScript fuera del navegador.',
    ['Node.js corre JS en servidor.', 'Se ejecuta con node app.js.', 'Es ideal para APIs.', 'Modelo no bloqueante.'],
    'console.log("Hola Node");',
    { question: '¿Qué comando ejecuta app.js?', options: ['node app.js', 'npm app.js', 'run app.js'], correct: 0 },
    {
      instruction: 'Completa ejecución básica de Node.',
      preview: 'node app.js\nconsole.log("Hola")',
      segments: ['', ' app.js\n', '("Hola")'],
      answers: ['node', 'console.log'],
      optionPool: ['node', 'console.log', 'SELECT', 'echo', 'import'],
    },
    {
      instruction: 'Crea script Node con mensaje inicial.',
      requirements: ['console.log', 'hola'],
      goalLines: ['console.log("Hola desde Node.js");'],
    }
  ),
  createTopic(
    'Módulos y fs/http',
    'Importa módulos nativos para archivos y servidor.',
    ['require importa módulos.', 'fs gestiona archivos.', 'http crea servidor.', 'listen abre puerto.'],
    'const fs = require("fs");\nconst http = require("http");',
    { question: '¿Qué función importa módulos CommonJS?', options: ['import', 'require', 'load'], correct: 1 },
    {
      instruction: 'Completa importaciones en Node.',
      preview: 'const fs = require("fs");\nconst http = require("http");',
      segments: ['const fs = ', '("fs");\nconst http = ', '("http");'],
      answers: ['require', 'require'],
      optionPool: ['require', 'import', 'SELECT', 'echo', 'class'],
    },
    {
      instruction: 'Crea servidor HTTP en puerto 3000.',
      requirements: ['require("http")', 'createserver', 'listen(3000'],
      goalLines: ['const http = require("http");', 'http.createServer((req, res) => {', '  res.end("API OK");', '}).listen(3000);'],
    }
  ),
  createTopic(
    'Express y API REST',
    'Construye endpoints de backend.',
    ['Express simplifica rutas.', 'app.get y app.post definen endpoints.', 'res.json responde JSON.', 'express.json parsea body.'],
    'const express = require("express");\nconst app = express();',
    { question: '¿Qué método define ruta GET en Express?', options: ['app.route', 'app.get', 'app.fetch'], correct: 1 },
    {
      instruction: 'Completa endpoint en Express.',
      preview: 'app.get("/status", (req,res) => res.json({ ok: true }));',
      segments: ['app.', '("/status", (req,res) => res.', '({ ok: true }));'],
      answers: ['get', 'json'],
      optionPool: ['get', 'post', 'json', 'SELECT', 'echo'],
    },
    {
      instruction: 'Crea API con endpoint /status.',
      requirements: ['express', 'app.get', '/status', 'res.json'],
      goalLines: ['const express = require("express");', 'const app = express();', 'app.get("/status", (req, res) => res.json({ ok: true }));', 'app.listen(3000);'],
    }
  ),
];

const sqlTopics = [
  createTopic(
    'SELECT y WHERE',
    'Consulta y filtra datos.',
    ['SELECT recupera datos.', 'FROM define tabla.', 'WHERE filtra filas.', 'ORDER BY ordena resultados.'],
    'SELECT nombre FROM usuarios WHERE activo = 1;',
    { question: '¿Qué cláusula filtra filas?', options: ['FROM', 'WHERE', 'GROUP BY'], correct: 1 },
    {
      instruction: 'Completa una consulta SQL.',
      preview: 'SELECT * FROM clientes WHERE activo = 1;',
      segments: ['', ' * ', ' clientes WHERE activo = 1;'],
      answers: ['SELECT', 'FROM'],
      optionPool: ['SELECT', 'FROM', 'if', 'echo', 'return'],
    },
    {
      instruction: 'Escribe consulta de clientes activos.',
      requirements: ['select', 'from', 'where'],
      goalLines: ['SELECT nombre, email', 'FROM clientes', 'WHERE activo = 1;'],
    }
  ),
  createTopic(
    'INSERT y UPDATE',
    'Modifica información en tablas.',
    ['INSERT crea registros.', 'UPDATE edita campos.', 'DELETE elimina filas.', 'Usa WHERE para seguridad.'],
    'INSERT INTO usuarios (nombre) VALUES ("Ana");\nUPDATE usuarios SET activo = 1 WHERE id = 2;',
    { question: '¿Qué sentencia agrega una fila?', options: ['UPDATE', 'INSERT INTO', 'ALTER'], correct: 1 },
    {
      instruction: 'Completa sentencia de inserción.',
      preview: 'INSERT INTO usuarios (nombre) VALUES ("Ana");',
      segments: ['', ' INTO usuarios (nombre) ', ' ("Ana");'],
      answers: ['INSERT', 'VALUES'],
      optionPool: ['INSERT', 'VALUES', 'WHERE', 'if', 'class'],
    },
    {
      instruction: 'Inserta un producto y actualiza su precio.',
      requirements: ['insert', 'values', 'update', 'set', 'where'],
      goalLines: ['INSERT INTO productos (nombre, precio) VALUES ("Teclado", 49);', 'UPDATE productos SET precio = 45 WHERE nombre = "Teclado";'],
    }
  ),
  createTopic(
    'JOIN y GROUP BY',
    'Cruza tablas y resume datos.',
    ['JOIN relaciona tablas.', 'ON define condición.', 'GROUP BY agrupa resultados.', 'HAVING filtra grupos.'],
    'SELECT c.nombre, COUNT(*) FROM clientes c JOIN pedidos p ON c.id = p.cliente_id GROUP BY c.nombre;',
    { question: '¿Qué cláusula se usa para unir tablas?', options: ['MERGE', 'JOIN', 'UNION ONLY'], correct: 1 },
    {
      instruction: 'Completa consulta con JOIN.',
      preview: 'SELECT * FROM pedidos p JOIN clientes c ON p.cliente_id = c.id;',
      segments: ['SELECT * FROM pedidos p ', ' clientes c ', ' p.cliente_id = c.id;'],
      answers: ['JOIN', 'ON'],
      optionPool: ['JOIN', 'ON', 'if', 'echo', 'return'],
    },
    {
      instruction: 'Crea reporte de pedidos por cliente.',
      requirements: ['join', 'on', 'group by', 'count'],
      goalLines: ['SELECT c.nombre, COUNT(*) AS total', 'FROM clientes c JOIN pedidos p ON c.id = p.cliente_id', 'GROUP BY c.nombre;'],
    }
  ),
];

const pythonTopics = [
  createTopic(
    'Sintaxis y variables',
    'Empieza con Python básico.',
    ['print muestra salida.', 'Variables se asignan con =.', 'Indentación define bloques.', 'Python es legible y flexible.'],
    'nombre = "Ana"\nprint(nombre)',
    { question: '¿Qué función imprime en Python?', options: ['echo()', 'print()', 'println()'], correct: 1 },
    {
      instruction: 'Completa variable e impresión.',
      preview: 'nombre = "Ana"\nprint(nombre)',
      segments: ['', ' = "Ana"\n', '(nombre)'],
      answers: ['nombre', 'print'],
      optionPool: ['nombre', 'print', 'SELECT', 'echo', 'class'],
    },
    {
      instruction: 'Crea variables y muéstralas por consola.',
      requirements: ['=', 'print('],
      goalLines: ['curso = "Python"', 'nivel = 1', 'print(curso, nivel)'],
    }
  ),
  createTopic(
    'Condicionales y bucles',
    'Controla flujo y repeticiones.',
    ['if/else manejan decisiones.', 'for recorre secuencias.', 'while usa condición.', 'range genera secuencias.'],
    'for i in range(3):\n    print(i)',
    { question: '¿Qué estructura repite por secuencia?', options: ['if', 'for', 'try'], correct: 1 },
    {
      instruction: 'Completa bucle for básico.',
      preview: 'for i in range(5):\n    print(i)',
      segments: ['', ' i in range(5):\n    ', '(i)'],
      answers: ['for', 'print'],
      optionPool: ['for', 'print', 'SELECT', 'echo', 'class'],
    },
    {
      instruction: 'Imprime números del 1 al 5.',
      requirements: ['for ', 'range(', 'print('],
      goalLines: ['for i in range(1, 6):', '    print(i)'],
    }
  ),
  createTopic(
    'Funciones y listas',
    'Reutiliza lógica y procesa colecciones.',
    ['def declara funciones.', 'return devuelve resultados.', 'list almacena varios valores.', 'append agrega elementos.'],
    'def suma(a, b):\n    return a + b\nnums = [1,2,3]',
    { question: '¿Qué palabra define una función?', options: ['func', 'def', 'function'], correct: 1 },
    {
      instruction: 'Completa función con retorno.',
      preview: 'def suma(a, b):\n    return a + b',
      segments: ['', ' suma(a, b):\n    ', ' a + b'],
      answers: ['def', 'return'],
      optionPool: ['def', 'return', 'SELECT', 'echo', 'class'],
    },
    {
      instruction: 'Crea función multiplicar y úsala.',
      requirements: ['def ', 'return ', 'print('],
      goalLines: ['def multiplicar(a, b):', '    return a * b', 'print(multiplicar(3, 4))'],
    }
  ),
];

const javaTopics = [
  createTopic(
    'Clase Main y salida',
    'Construye programa Java mínimo.',
    ['Java organiza en clases.', 'main es punto de entrada.', 'System.out.println imprime salida.', 'Sintaxis usa ; al final.'],
    'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hola");\n  }\n}',
    { question: '¿Qué método inicia un programa Java?', options: ['start()', 'main()', 'init()'], correct: 1 },
    {
      instruction: 'Completa estructura básica Java.',
      preview: 'public class Main { public static void main(String[] args) { System.out.println("Hola"); } }',
      segments: ['', ' class Main { public static void main(String[] args) { ', '.println("Hola"); } }'],
      answers: ['public', 'System.out'],
      optionPool: ['public', 'System.out', 'SELECT', 'echo', 'return'],
    },
    {
      instruction: 'Crea Main que imprima mensaje.',
      requirements: ['public class', 'main(string[] args)', 'system.out.println'],
      goalLines: ['public class Main {', '  public static void main(String[] args) {', '    System.out.println("Java OK");', '  }', '}'],
    }
  ),
  createTopic(
    'Variables y condicionales',
    'Trabaja tipos y decisiones en Java.',
    ['int y String son tipos comunes.', 'if/else decide flujo.', 'boolean modela estados.', 'Usa operadores lógicos.'],
    'int edad = 22;\nif (edad >= 18) { System.out.println("Mayor"); }',
    { question: '¿Qué tipo representa texto?', options: ['Text', 'String', 'Word'], correct: 1 },
    {
      instruction: 'Completa una condición Java.',
      preview: 'if (edad >= 18) { System.out.println("Mayor"); } else { System.out.println("Menor"); }',
      segments: ['', ' (edad >= 18) { System.out.println("Mayor"); } ', ' { System.out.println("Menor"); }'],
      answers: ['if', 'else'],
      optionPool: ['if', 'else', 'SELECT', 'echo', 'class'],
    },
    {
      instruction: 'Evalúa nota y muestra resultado.',
      requirements: ['if (', 'else', 'system.out.println'],
      goalLines: ['if (nota >= 5) {', '  System.out.println("Aprobado");', '} else {', '  System.out.println("Pendiente");', '}'],
    }
  ),
  createTopic(
    'Métodos y arrays',
    'Crea funciones y recorre colecciones.',
    ['Los métodos encapsulan lógica.', 'return devuelve valor.', 'Los arrays guardan datos.', 'for recorre elementos.'],
    'static int suma(int a, int b) { return a + b; }\nint[] nums = {1,2,3};',
    { question: '¿Qué palabra devuelve valor en un método?', options: ['yield', 'return', 'break'], correct: 1 },
    {
      instruction: 'Completa método con retorno.',
      preview: 'static int suma(int a, int b) { return a + b; }',
      segments: ['static int suma(int a, int b) { ', ' a + b; ', '}'],
      answers: ['return', 'class'],
      optionPool: ['return', 'class', 'if', 'SELECT', 'echo'],
    },
    {
      instruction: 'Crea método y úsalo en main.',
      requirements: ['static int', 'return', 'system.out.println'],
      goalLines: ['static int multiplicar(int a, int b) {', '  return a * b;', '}', 'System.out.println(multiplicar(2, 3));'],
    }
  ),
];

const phpTopics = [
  createTopic(
    'Sintaxis PHP básica',
    'Inicia scripts del lado servidor.',
    ['PHP se ejecuta en servidor.', '<?php ?> delimita bloque.', 'echo imprime salida.', 'Puedes mezclar HTML y PHP.'],
    '<?php\necho "Hola PHP";\n?>',
    { question: '¿Qué instrucción muestra texto en PHP?', options: ['printline', 'echo', 'console.log'], correct: 1 },
    {
      instruction: 'Completa bloque PHP básico.',
      preview: '<?php\necho "Hola";\n?>',
      segments: ['', '\necho "Hola";\n', ''],
      answers: ['<?php', '?>'],
      optionPool: ['<?php', '?>', 'SELECT', 'def', 'class'],
    },
    {
      instruction: 'Crea script que imprima un mensaje.',
      requirements: ['<?php', 'echo', '?>'],
      goalLines: ['<?php', 'echo "PHP activo";', '?>'],
    }
  ),
  createTopic(
    'Variables y condicionales',
    'Maneja lógica en backend con PHP.',
    ['Variables usan $.', 'if/else maneja flujo.', 'Comparaciones controlan decisiones.', 'Mantén validaciones claras.'],
    '$edad = 20;\nif ($edad >= 18) { echo "Mayor"; }',
    { question: '¿Cómo inicia una variable en PHP?', options: ['#', '$', '@'], correct: 1 },
    {
      instruction: 'Completa variable y condicional en PHP.',
      preview: '$edad = 20;\nif ($edad >= 18) { echo "Mayor"; }',
      segments: ['', 'edad = 20;\n', ' ($edad >= 18) { echo "Mayor"; }'],
      answers: ['$', 'if'],
      optionPool: ['$', 'if', 'SELECT', 'def', 'class'],
    },
    {
      instruction: 'Evalúa una nota con if/else.',
      requirements: ['$', 'if (', 'else', 'echo'],
      goalLines: ['<?php', '$nota = 7;', 'if ($nota >= 5) { echo "Aprobado"; } else { echo "Pendiente"; }', '?>'],
    }
  ),
  createTopic(
    'Funciones y formularios',
    'Procesa entradas y reutiliza lógica.',
    ['function define funciones.', 'return devuelve valores.', '$_POST recibe formularios.', 'htmlspecialchars evita XSS básico.'],
    'function limpiar($v) { return trim(htmlspecialchars($v)); }',
    { question: '¿Qué superglobal recibe datos POST?', options: ['$_GET', '$_POST', '$_SESSION'], correct: 1 },
    {
      instruction: 'Completa función PHP con return.',
      preview: 'function saludar($n) { return "Hola " . $n; }',
      segments: ['', ' saludar($n) { ', ' "Hola " . $n; }'],
      answers: ['function', 'return'],
      optionPool: ['function', 'return', 'SELECT', 'def', 'class'],
    },
    {
      instruction: 'Lee nombre por POST y muéstralo escapado.',
      requirements: ['$_post', 'htmlspecialchars', 'echo'],
      goalLines: ['<?php', '$nombre = $_POST["nombre"] ?? "";', 'echo htmlspecialchars($nombre);', '?>'],
    }
  ),
];

const vueTopics = [
  createTopic(
    'Instancia Vue y reactividad',
    'Crea tu primera aplicación Vue y entiende la reactividad.',
    [
      'Vue es un framework progresivo para construir interfaces.',
      'createApp monta la aplicación en un elemento del DOM.',
      'data() retorna un objeto con el estado reactivo.',
      'Cuando cambias el estado, la vista se actualiza sola.',
    ],
    'import { createApp } from \"vue\";\n\nconst app = createApp({\n  data() {\n    return { mensaje: \"Hola Vue\" }\n  }\n});\napp.mount(\"#app\");',
    {
      question: '¿Qué método monta la aplicación Vue en el DOM?',
      options: ['app.render()', 'app.mount()', 'app.start()'],
      correct: 1,
    },
    {
      instruction: 'Completa la creación de una app Vue.',
      preview: 'const app = createApp({\n  data() {\n    return { titulo: \"Mi App\" }\n  }\n});\napp.mount(\"#app\");',
      segments: ['const app = ', '({\n  data() {\n    return { titulo: \"Mi App\" }\n  }\n});\napp.', '(\"#app\");'],
      answers: ['createApp', 'mount'],
      optionPool: ['createApp', 'mount', 'render', 'new Vue', 'init'],
    },
    {
      instruction: 'Crea una app Vue con data reactiva y móntala.',
      requirements: ['createApp', 'data()', 'return', 'mount'],
      goalLines: ['const app = createApp({', '  data() {', '    return { nombre: \"Vue\" }', '  }', '});', 'app.mount(\"#app\");'],
    }
  ),
  createTopic(
    'Template syntax e interpolación',
    'Muestra datos dinámicos en el HTML con {{ }}.',
    [
      'Las dobles llaves {{ }} insertan datos en el template.',
      'Puedes usar expresiones JS simples dentro de {{ }}.',
      'v-text establece el texto de un elemento completo.',
      'v-html renderiza HTML crudo (usar con cuidado).',
    ],
    '<div id=\"app\">\n  <h1>{{ titulo }}</h1>\n  <p>{{ mensaje.toUpperCase() }}</p>\n  <p>Suma: {{ 2 + 3 }}</p>\n</div>',
    {
      question: '¿Qué sintaxis muestra datos reactivos en el template?',
      options: ['<%= dato %>', '{{ dato }}', '${dato}'],
      correct: 1,
    },
    {
      instruction: 'Completa la interpolación en el template.',
      preview: '<h1>{{ titulo }}</h1>\n<p>{{ descripcion }}</p>',
      segments: ['<h1>', ' titulo }}</h1>\n<p>{{ ', ' }}</p>'],
      answers: ['{{', 'descripcion'],
      optionPool: ['{{', 'descripcion', 'v-text', 'data', 'props'],
    },
    {
      instruction: 'Crea un template que muestre título y mensaje.',
      requirements: ['{{', '}}', 'titulo', 'mensaje'],
      goalLines: ['<h1>{{ titulo }}</h1>', '<p>{{ mensaje }}</p>'],
    }
  ),
  createTopic(
    'v-bind y atributos dinámicos',
    'Vincula atributos HTML a datos reactivos.',
    [
      'v-bind:attr vincula un atributo a una expresión.',
      'La forma corta es :attr (dos puntos).',
      'Puedes vincular src, href, class, style, etc.',
      ':class acepta objetos y arrays para clases condicionales.',
    ],
    '<img :src=\"imagenUrl\" :alt=\"descripcion\">\n<a :href=\"enlace\">Visitar</a>\n<div :class=\"{ activo: esActivo }\">Contenido</div>',
    {
      question: '¿Cuál es la forma corta de v-bind?',
      options: ['@', ':', '#'],
      correct: 1,
    },
    {
      instruction: 'Completa los bindings dinámicos.',
      preview: '<img :src=\"foto\" :alt=\"nombre\">\n<button :disabled=\"cargando\">Enviar</button>',
      segments: ['<img ', 'src=\"foto\" ', 'alt=\"nombre\">\n<button :disabled=\"cargando\">Enviar</button>'],
      answers: [':', ':'],
      optionPool: [':', 'v-bind:', '@', 'v-on:', '#'],
    },
    {
      instruction: 'Vincula imagen y clase condicional con v-bind.',
      requirements: [':src', ':class', ':alt'],
      goalLines: ['<img :src=\"foto\" :alt=\"titulo\">', '<div :class=\"{ destacado: esDestacado }\">Tarjeta</div>'],
    }
  ),
  createTopic(
    'Eventos con v-on',
    'Responde a acciones del usuario con eventos.',
    [
      'v-on:evento escucha eventos del DOM.',
      'La forma corta es @evento.',
      'Puedes llamar métodos definidos en methods.',
      'El objeto $event contiene info del evento.',
    ],
    '<button @click=\"contador++\">+1</button>\n<button @click=\"saludar\">Saludar</button>\n<input @input=\"actualizar($event)\">\n\nmethods: {\n  saludar() { alert(\"Hola\") },\n  actualizar(e) { this.texto = e.target.value }\n}',
    {
      question: '¿Cuál es la forma corta de v-on:click?',
      options: [':click', '@click', '#click'],
      correct: 1,
    },
    {
      instruction: 'Completa los listeners de eventos.',
      preview: '<button @click=\"incrementar\">+1</button>\n<input @input=\"buscar\">',
      segments: ['<button ', 'click=\"incrementar\">+1</button>\n<input ', 'input=\"buscar\">'],
      answers: ['@', '@'],
      optionPool: ['@', ':', 'v-on:', 'v-bind:', '#'],
    },
    {
      instruction: 'Crea un contador con botón click y un input con evento.',
      requirements: ['@click', 'methods', '@input'],
      goalLines: ['<button @click=\"contador++\">{{ contador }}</button>', '<input @input=\"onInput\">', 'methods: {', '  onInput(e) { this.texto = e.target.value }', '}'],
    }
  ),
  createTopic(
    'v-model y two-way binding',
    'Sincroniza inputs con datos reactivos automáticamente.',
    [
      'v-model crea enlace bidireccional entre input y data.',
      'Funciona con input, textarea, select y checkbox.',
      'v-model es azúcar sintáctico de :value + @input.',
      'Puedes usar modificadores: .lazy, .number, .trim.',
    ],
    '<input v-model=\"nombre\" placeholder=\"Tu nombre\">\n<p>Hola, {{ nombre }}</p>\n\n<select v-model=\"lenguaje\">\n  <option>JavaScript</option>\n  <option>Vue</option>\n</select>\n<p>Elegiste: {{ lenguaje }}</p>',
    {
      question: '¿Qué directiva crea enlace bidireccional?',
      options: ['v-bind', 'v-model', 'v-sync'],
      correct: 1,
    },
    {
      instruction: 'Completa el two-way binding.',
      preview: '<input v-model=\"email\" placeholder=\"Email\">\n<p>{{ email }}</p>',
      segments: ['<input ', '=\"email\" placeholder=\"Email\">\n<p>{{ ', ' }}</p>'],
      answers: ['v-model', 'email'],
      optionPool: ['v-model', 'email', 'v-bind', ':value', 'v-text'],
    },
    {
      instruction: 'Crea formulario con v-model en input y select.',
      requirements: ['v-model', '<input', '<select', '<option'],
      goalLines: ['<input v-model=\"nombre\" placeholder=\"Nombre\">', '<select v-model=\"rol\">', '  <option>Frontend</option>', '  <option>Backend</option>', '</select>', '<p>{{ nombre }} - {{ rol }}</p>'],
    }
  ),
  createTopic(
    'Renderizado condicional',
    'Muestra u oculta elementos con v-if y v-show.',
    [
      'v-if añade o quita el elemento del DOM.',
      'v-else y v-else-if crean alternativas.',
      'v-show solo cambia display CSS (no quita del DOM).',
      'Usa v-if para condiciones que cambian poco, v-show para toggle rápido.',
    ],
    '<div v-if=\"logueado\">\n  <p>Bienvenido, {{ usuario }}</p>\n</div>\n<div v-else>\n  <p>Inicia sesión</p>\n</div>\n\n<button v-show=\"tienePermiso\">Editar</button>',
    {
      question: '¿Qué directiva oculta un elemento sin quitarlo del DOM?',
      options: ['v-if', 'v-show', 'v-hide'],
      correct: 1,
    },
    {
      instruction: 'Completa el renderizado condicional.',
      preview: '<p v-if=\"activo\">Activo</p>\n<p v-else>Inactivo</p>',
      segments: ['<p ', '=\"activo\">Activo</p>\n<p ', '>Inactivo</p>'],
      answers: ['v-if', 'v-else'],
      optionPool: ['v-if', 'v-else', 'v-show', 'v-for', ':if'],
    },
    {
      instruction: 'Muestra contenido diferente según estado del usuario.',
      requirements: ['v-if', 'v-else', 'v-show'],
      goalLines: ['<div v-if=\"esAdmin\">Panel Admin</div>', '<div v-else>Panel Usuario</div>', '<button v-show=\"puedeEditar\">Editar</button>'],
    }
  ),
  createTopic(
    'Listas con v-for',
    'Renderiza listas de datos dinámicamente.',
    [
      'v-for=\"item in lista\" itera sobre un array.',
      'Siempre usa :key para que Vue identifique cada elemento.',
      'Puedes acceder al índice: v-for=\"(item, i) in lista\".',
      'v-for funciona también con objetos y rangos.',
    ],
    '<ul>\n  <li v-for=\"tarea in tareas\" :key=\"tarea.id\">\n    {{ tarea.texto }}\n  </li>\n</ul>\n\ndata() {\n  return {\n    tareas: [\n      { id: 1, texto: \"Aprender Vue\" },\n      { id: 2, texto: \"Crear proyecto\" }\n    ]\n  }\n}',
    {
      question: '¿Qué atributo es obligatorio usar con v-for?',
      options: [':id', ':key', ':index'],
      correct: 1,
    },
    {
      instruction: 'Completa la lista dinámica.',
      preview: '<li v-for=\"item in items\" :key=\"item.id\">{{ item.nombre }}</li>',
      segments: ['<li ', '=\"item in items\" ', '=\"item.id\">{{ item.nombre }}</li>'],
      answers: ['v-for', ':key'],
      optionPool: ['v-for', ':key', 'v-if', ':id', 'v-bind'],
    },
    {
      instruction: 'Renderiza una lista de productos con v-for.',
      requirements: ['v-for', ':key', '{{ '],
      goalLines: ['<div v-for=\"producto in productos\" :key=\"producto.id\">', '  <h3>{{ producto.nombre }}</h3>', '  <p>{{ producto.precio }}€</p>', '</div>'],
    }
  ),
  createTopic(
    'Computed properties y watchers',
    'Calcula valores derivados y reacciona a cambios.',
    [
      'computed define propiedades calculadas con cache automático.',
      'Se recalculan solo cuando cambian sus dependencias.',
      'watch observa cambios en datos específicos.',
      'watch es útil para efectos secundarios (API calls, etc.).',
    ],
    'computed: {\n  nombreCompleto() {\n    return this.nombre + \" \" + this.apellido;\n  },\n  tareasCompletadas() {\n    return this.tareas.filter(t => t.completada).length;\n  }\n},\nwatch: {\n  busqueda(nuevo, anterior) {\n    this.buscarEnAPI(nuevo);\n  }\n}',
    {
      question: '¿Qué ventaja tienen las computed properties sobre los methods?',
      options: ['Son más rápidas siempre', 'Tienen cache automático', 'No necesitan return'],
      correct: 1,
    },
    {
      instruction: 'Completa computed property y watcher.',
      preview: 'computed: {\n  total() { return this.precio * this.cantidad; }\n},\nwatch: {\n  filtro(val) { this.filtrar(val); }\n}',
      segments: ['', ': {\n  total() { return this.precio * this.cantidad; }\n},\n', ': {\n  filtro(val) { this.filtrar(val); }\n}'],
      answers: ['computed', 'watch'],
      optionPool: ['computed', 'watch', 'methods', 'data', 'props'],
    },
    {
      instruction: 'Crea computed para precio total y watch para búsqueda.',
      requirements: ['computed', 'return', 'watch'],
      goalLines: ['computed: {', '  precioTotal() {', '    return this.precio * this.cantidad;', '  }', '},', 'watch: {', '  termino(valor) {', '    this.buscar(valor);', '  }', '}'],
    }
  ),
  createTopic(
    'Componentes: props y emit',
    'Divide la UI en piezas reutilizables que se comunican.',
    [
      'Los componentes encapsulan template, lógica y estilos.',
      'props recibe datos del componente padre.',
      '$emit envía eventos del hijo al padre.',
      'El flujo es: datos bajan con props, eventos suben con emit.',
    ],
    '// Componente hijo: Boton.vue\nexport default {\n  props: [\"texto\", \"color\"],\n  emits: [\"click-boton\"],\n  template: `<button :style=\"{background: color}\" @click=\"$emit(\'click-boton\')\">\n    {{ texto }}\n  </button>`\n}\n\n// Uso en padre:\n<Boton texto=\"Guardar\" color=\"#1f3cff\" @click-boton=\"guardar\" />',
    {
      question: '¿Cómo envía un hijo eventos al padre?',
      options: ['this.props()', 'this.$emit()', 'this.send()'],
      correct: 1,
    },
    {
      instruction: 'Completa props y emit del componente.',
      preview: 'props: [\"titulo\"],\n$emit(\"actualizar\", valor)',
      segments: ['', ': [\"titulo\"],\nthis.', '(\"actualizar\", valor)'],
      answers: ['props', '$emit'],
      optionPool: ['props', '$emit', 'data', 'methods', 'watch'],
    },
    {
      instruction: 'Crea componente con props y emit.',
      requirements: ['props', '$emit', 'template'],
      goalLines: ['export default {', '  props: [\"nombre\"],', '  emits: [\"seleccionar\"],', '  template: `<button @click=\"$emit(\'seleccionar\', nombre)\">{{ nombre }}</button>`', '}'],
    }
  ),
  createTopic(
    'Lifecycle hooks y ciclo de vida',
    'Ejecuta código en momentos clave del componente.',
    [
      'created() se ejecuta cuando el componente se inicializa.',
      'mounted() se ejecuta cuando el componente está en el DOM.',
      'updated() se ejecuta tras cada cambio reactivo.',
      'unmounted() limpia recursos al destruir el componente.',
    ],
    'export default {\n  data() {\n    return { usuarios: [] }\n  },\n  async mounted() {\n    const res = await fetch(\"/api/usuarios\");\n    this.usuarios = await res.json();\n  },\n  unmounted() {\n    console.log(\"Componente destruido\");\n  }\n}',
    {
      question: '¿En qué hook es seguro acceder al DOM?',
      options: ['created', 'mounted', 'beforeCreate'],
      correct: 1,
    },
    {
      instruction: 'Completa los lifecycle hooks.',
      preview: 'mounted() {\n  this.cargarDatos();\n},\nunmounted() {\n  clearInterval(this.timer);\n}',
      segments: ['', '() {\n  this.cargarDatos();\n},\n', '() {\n  clearInterval(this.timer);\n}'],
      answers: ['mounted', 'unmounted'],
      optionPool: ['mounted', 'unmounted', 'created', 'updated', 'computed'],
    },
    {
      instruction: 'Carga datos en mounted y limpia en unmounted.',
      requirements: ['mounted', 'fetch', 'unmounted'],
      goalLines: ['async mounted() {', '  const res = await fetch(\"/api/datos\");', '  this.datos = await res.json();', '},', 'unmounted() {', '  clearInterval(this.intervalo);', '}'],
    }
  ),
];

const seedCurricula = [
  buildCurriculum({ language: 'HTML', description: 'Lenguaje de marcado para crear páginas web.', topics: htmlTopics }),
  buildCurriculum({ language: 'CSS', description: 'Lenguaje de estilos para diseñar interfaces web.', topics: cssTopics }),
  buildCurriculum({ language: 'JavaScript', description: 'Lenguaje base de la interactividad web.', topics: javascriptTopics }),
  buildCurriculum({ language: 'Vue', description: 'Framework progresivo para construir interfaces de usuario reactivas.', topics: vueTopics }),
  buildCurriculum({ language: 'Node.js', description: 'Entorno backend para crear APIs y servidores con JavaScript.', topics: nodeTopics }),
  buildCurriculum({ language: 'SQL', description: 'Lenguaje para consultar y manipular bases de datos.', topics: sqlTopics }),
  buildCurriculum({ language: 'Python', description: 'Lenguaje versátil para backend y automatización.', topics: pythonTopics }),
  buildCurriculum({ language: 'Java', description: 'Lenguaje orientado a objetos usado en backend empresarial.', topics: javaTopics }),
  buildCurriculum({ language: 'PHP', description: 'Lenguaje de servidor para aplicaciones web dinámicas.', topics: phpTopics }),
];

module.exports = {
  seedCurricula,
};


