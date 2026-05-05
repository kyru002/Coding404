const getLevelBlueprint = (levelId) => {
  const stageLabels = ['Fundamentos', 'Aplicación Guiada', 'Variaciones', 'Optimización', 'Integración']
  const stageDescriptions = [
    'Comprensión base del concepto.',
    'Aplicación práctica en un caso guiado.',
    'Variantes y alternativas del concepto.',
    'Mejoras de calidad y legibilidad.',
    'Integración con contenidos previos.',
  ]
  const contexts = ['UI básica', 'Datos simples', 'Interacción local', 'Componentes reutilizables', 'Estructura semántica', 'Caso real']

  const safeLevel = Math.max(1, Number(levelId || 1))
  const stageIndex = (safeLevel - 1) % stageLabels.length
  const contextIndex = Math.floor((safeLevel - 1) / stageLabels.length) % contexts.length

  return {
    label: `${stageLabels[stageIndex]} · ${contexts[contextIndex]}`,
    description: `${stageDescriptions[stageIndex]} Contexto: ${contexts[contextIndex]}.`,
    theoryLine: `En este nivel, aplica el tema en contexto de ${contexts[contextIndex]}.`,
    practiceLine: `Resuelve una actividad del tema en contexto de ${contexts[contextIndex].toLowerCase()}.`
  }
}

const buildCourse = ({ language, description, topics }) => {
  const levels = Array.from({ length: 30 }, (_, index) => {
    const id = index + 1
    const topic = topics[index % topics.length]
    const blueprint = getLevelBlueprint(id)
    const isExam = id % 10 === 0
    const difficulty = id <= 10 ? 'fácil' : id <= 20 ? 'medio' : 'difícil'
    const basePoints = id <= 10 ? 75 : id <= 20 ? 100 : 125
    const enrichedTheory = [...(topic.theory || []), `${blueprint.label}: ${blueprint.theoryLine}`]
    const levelName = `${topic.title} · N${id}`
    const levelDescription = `${topic.description} ${blueprint.description}`
    const enrichedPractice = {
      ...(topic.practice || {}),
      instruction: `${topic.practice?.instruction || `Aplica ${topic.title} en código.`} (${blueprint.label}) ${blueprint.practiceLine}`,
      goalLines: [...new Set([...(topic.practice?.goalLines || []), blueprint.practiceLine])]
    }

    return {
      id,
      name: levelName,
      description: levelDescription,
      difficulty,
      points: isExam ? basePoints + 50 : basePoints,
      isExam,
      content: {
        title: levelName,
        theory: enrichedTheory,
        example: topic.example
      },
      quiz: [topic.quiz],
      fillBlanks: topic.fillBlanks,
      practice: isExam
        ? {
            instruction: topic.examPractice?.instruction || `Examen práctico de ${language}: integra los conceptos del módulo en un único ejercicio.`,
            requirements: topic.examPractice?.requirements || topic.practice.requirements,
            goalLines: topic.examPractice?.goalLines || topic.practice.goalLines
          }
        : enrichedPractice
    }
  })

  return {
    language,
    icon: '💻',
    description,
    levels
  }
}

const cssTopics = [
  {
    title: 'Selectores y reglas CSS',
    description: 'Aprende cómo seleccionar elementos y aplicar reglas de estilo.',
    theory: [
      'Una regla CSS tiene selector y bloque de declaraciones.',
      'Puedes seleccionar por etiqueta, clase o id.',
      'Las propiedades definen el aspecto visual.',
      'El navegador aplica las reglas en cascada.'
    ],
    example: 'h1 { color: #1f3cff; }\n.texto { font-size: 16px; }',
    quiz: {
      question: '¿Qué selector aplica estilo a una clase?',
      options: ['#titulo', '.titulo', 'titulo'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa los huecos con selectores CSS válidos.',
      preview: 'h1 { color: #1f3cff; }\n.texto { font-size: 16px; }',
      segments: ['', ' { color: #1f3cff; }\n', ' { font-size: 16px; }'],
      answers: ['h1', '.texto'],
      optionPool: ['h1', '.texto', '#texto', 'body', 'main', '.card']
    },
    practice: {
      instruction: 'Crea estilos para título y párrafo usando color y tamaño de fuente.',
      requirements: ['h1', 'p', 'color', 'font-size'],
      goalLines: ['h1 { color: #1f3cff; }', 'p { font-size: 16px; }']
    },
    examPractice: {
      instruction: 'Examen CSS: diseña una tarjeta con título, texto y botón usando clases.',
      requirements: ['.card', 'padding', 'border-radius', '.card h2', '.card button'],
      goalLines: ['.card { padding: 16px; border-radius: 12px; }', '.card h2 { color: #1f3cff; }', '.card button { background: #233dff; color: white; }']
    }
  },
  {
    title: 'Modelo de caja',
    description: 'Controla espacio interno, borde y margen en cada elemento.',
    theory: [
      'Todo elemento se renderiza como una caja.',
      'padding crea espacio interno.',
      'margin separa elementos externos.',
      'border define el contorno de la caja.'
    ],
    example: '.card { margin: 12px; padding: 16px; border: 1px solid #ccc; }',
    quiz: {
      question: '¿Qué propiedad crea espacio fuera del borde?',
      options: ['padding', 'margin', 'outline'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Rellena propiedades del modelo de caja.',
      preview: '.card { margin: 12px; padding: 16px; border: 1px solid #ccc; }',
      segments: ['.card { ', ': 12px; ', ': 16px; border: 1px solid #ccc; }'],
      answers: ['margin', 'padding'],
      optionPool: ['margin', 'padding', 'display', 'color', 'width']
    },
    practice: {
      instruction: 'Define una clase .panel con margen, padding y borde redondeado.',
      requirements: ['.panel', 'margin', 'padding', 'border-radius'],
      goalLines: ['.panel {', '  margin: 12px;', '  padding: 16px;', '  border-radius: 10px;', '}']
    }
  },
  {
    title: 'Colores y fondos',
    description: 'Aplica color de texto, fondo y gradientes básicos.',
    theory: [
      'color cambia el texto.',
      'background-color cambia el fondo del elemento.',
      'Puedes usar formatos hex, rgb o nombres.',
      'Los gradientes se definen con background.'
    ],
    example: 'body { background: linear-gradient(180deg, #1f3cff, #2c49ff); color: white; }',
    quiz: {
      question: '¿Qué propiedad cambia el color del texto?',
      options: ['font-color', 'text-color', 'color'],
      correct: 2
    },
    fillBlanks: {
      instruction: 'Completa las propiedades para color y fondo.',
      preview: 'body { background-color: #1f3cff; color: white; }',
      segments: ['body { ', '-color: #1f3cff; ', ': white; }'],
      answers: ['background', 'color'],
      optionPool: ['background', 'color', 'border', 'font-size', 'display']
    },
    practice: {
      instruction: 'Estiliza body con fondo y color de texto legible.',
      requirements: ['body', 'background', 'color'],
      goalLines: ['body {', '  background: #1f3cff;', '  color: white;', '}']
    }
  },
  {
    title: 'Tipografía básica',
    description: 'Controla tamaño, peso e interlineado del texto.',
    theory: [
      'font-family define la fuente.',
      'font-size controla el tamaño.',
      'font-weight ajusta grosor.',
      'line-height mejora la legibilidad.'
    ],
    example: 'p { font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; }',
    quiz: {
      question: '¿Qué propiedad controla el tamaño del texto?',
      options: ['font-size', 'text-size', 'line-size'],
      correct: 0
    },
    fillBlanks: {
      instruction: 'Selecciona propiedades tipográficas correctas.',
      preview: 'p { font-size: 16px; font-weight: 600; }',
      segments: ['p { ', ': 16px; ', ': 600; }'],
      answers: ['font-size', 'font-weight'],
      optionPool: ['font-size', 'font-weight', 'margin', 'padding', 'border']
    },
    practice: {
      instruction: 'Define estilo de texto para párrafos y títulos.',
      requirements: ['h1', 'p', 'font-size', 'font-weight'],
      goalLines: ['h1 { font-size: 32px; }', 'p { font-size: 16px; font-weight: 400; }']
    }
  },
  {
    title: 'Display y posicionamiento básico',
    description: 'Aprende block, inline y reglas simples de posición.',
    theory: [
      'display controla cómo se comporta un elemento.',
      'block ocupa toda la línea.',
      'inline ocupa el ancho de su contenido.',
      'position permite ajustar ubicación.'
    ],
    example: '.badge { display: inline-block; position: relative; }',
    quiz: {
      question: '¿Qué valor de display suele ocupar toda la línea?',
      options: ['inline', 'block', 'none'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa con propiedades de layout básico.',
      preview: '.badge { display: inline-block; position: relative; }',
      segments: ['.badge { ', ': inline-block; ', ': relative; }'],
      answers: ['display', 'position'],
      optionPool: ['display', 'position', 'color', 'font-size', 'align']
    },
    practice: {
      instruction: 'Crea una etiqueta tipo badge con display y posición relativa.',
      requirements: ['.badge', 'display', 'position'],
      goalLines: ['.badge {', '  display: inline-block;', '  position: relative;', '}']
    }
  },
  {
    title: 'Flexbox para layouts',
    description: 'Construye filas y columnas de forma flexible.',
    theory: [
      'display: flex activa Flexbox.',
      'justify-content alinea en eje principal.',
      'align-items alinea en eje cruzado.',
      'gap separa elementos sin márgenes manuales.'
    ],
    example: '.row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }',
    quiz: {
      question: '¿Qué propiedad activa Flexbox?',
      options: ['display: grid', 'display: flex', 'position: flex'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa una fila flexible con Flexbox.',
      preview: '.row { display: flex; justify-content: center; }',
      segments: ['.row { ', ': flex; ', ': center; }'],
      answers: ['display', 'justify-content'],
      optionPool: ['display', 'justify-content', 'font-size', 'color', 'border']
    },
    practice: {
      instruction: 'Crea un contenedor .row con Flexbox centrado.',
      requirements: ['.row', 'display: flex', 'justify-content', 'align-items'],
      goalLines: ['.row {', '  display: flex;', '  justify-content: center;', '  align-items: center;', '}']
    }
  },
  {
    title: 'Grid básico',
    description: 'Organiza contenido en columnas con CSS Grid.',
    theory: [
      'display: grid activa el sistema de cuadrícula.',
      'grid-template-columns define columnas.',
      'gap controla separación entre celdas.',
      'Grid es ideal para estructuras de página.'
    ],
    example: '.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }',
    quiz: {
      question: '¿Qué propiedad define columnas en Grid?',
      options: ['grid-columns', 'grid-template-columns', 'columns-grid'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa una cuadrícula de dos columnas.',
      preview: '.grid { display: grid; grid-template-columns: 1fr 1fr; }',
      segments: ['.grid { display: ', '; ', ': 1fr 1fr; }'],
      answers: ['grid', 'grid-template-columns'],
      optionPool: ['grid', 'grid-template-columns', 'justify-content', 'padding', 'font-size']
    },
    practice: {
      instruction: 'Crea una grilla de dos columnas para tarjetas.',
      requirements: ['display: grid', 'grid-template-columns', 'gap'],
      goalLines: ['.cards {', '  display: grid;', '  grid-template-columns: 1fr 1fr;', '  gap: 12px;', '}']
    }
  },
  {
    title: 'Responsive básico',
    description: 'Adapta diseño con media queries.',
    theory: [
      'Las media queries aplican estilos según tamaño de pantalla.',
      'max-width es útil para móvil primero.',
      'Puedes cambiar tipografías y layout.',
      'Diseñar responsive mejora la experiencia en móviles.'
    ],
    example: '@media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }',
    quiz: {
      question: '¿Qué regla permite estilos por tamaño de pantalla?',
      options: ['@screen', '@media', '@responsive'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Rellena una media query correcta.',
      preview: '@media (max-width: 768px) { .menu { display: none; } }',
      segments: ['', ' (max-width: 768px) { .menu { ', ': none; } }'],
      answers: ['@media', 'display'],
      optionPool: ['@media', 'display', 'font-size', 'padding', 'color']
    },
    practice: {
      instruction: 'Haz responsive un menú ocultándolo en móvil.',
      requirements: ['@media', 'max-width', 'display'],
      goalLines: ['@media (max-width: 768px) {', '  .menu { display: none; }', '}']
    }
  },
  {
    title: 'Pseudo clases y estados',
    description: 'Define estilos para hover, focus y active.',
    theory: [
      ':hover aplica estilo al pasar el mouse.',
      ':focus mejora accesibilidad en teclado.',
      ':active se usa al interactuar.',
      'Estados visuales dan feedback al usuario.'
    ],
    example: 'button:hover { background: #2c49ff; }\nbutton:focus { outline: 2px solid #7de8ff; }',
    quiz: {
      question: '¿Qué pseudo clase se activa al pasar el cursor?',
      options: [':focus', ':hover', ':visited'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa estados visuales de botón.',
      preview: 'button:hover { color: white; }\nbutton:focus { outline: 2px solid #7de8ff; }',
      segments: ['button', ' { color: white; }\nbutton', ' { outline: 2px solid #7de8ff; }'],
      answers: [':hover', ':focus'],
      optionPool: [':hover', ':focus', ':active', ':before', ':after']
    },
    practice: {
      instruction: 'Agrega estilos hover y focus a un botón.',
      requirements: ['button:hover', 'button:focus', 'outline'],
      goalLines: ['button:hover { background: #2c49ff; }', 'button:focus { outline: 2px solid #7de8ff; }']
    }
  },
  {
    title: 'Transiciones y animación simple',
    description: 'Crea interacciones suaves con transition.',
    theory: [
      'transition anima cambios de propiedades.',
      'Define propiedad, duración y easing.',
      'Úsalo junto a estados hover/focus.',
      'Ayuda a mejorar UX sin sobrecargar la interfaz.'
    ],
    example: '.card { transition: transform 0.2s ease; }\n.card:hover { transform: translateY(-2px); }',
    quiz: {
      question: '¿Qué propiedad permite animar cambios suaves?',
      options: ['animation-name', 'transition', 'transform-only'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa una transición básica.',
      preview: '.card { transition: transform 0.2s ease; }',
      segments: ['.card { ', ': transform 0.2s ease; } .card', ' { transform: translateY(-2px); }'],
      answers: ['transition', ':hover'],
      optionPool: ['transition', ':hover', ':focus', 'animation', 'display']
    },
    practice: {
      instruction: 'Añade transición y efecto hover a una tarjeta.',
      requirements: ['transition', ':hover', 'transform'],
      goalLines: ['.card { transition: transform 0.2s ease; }', '.card:hover { transform: translateY(-2px); }']
    }
  }
]

const jsTopics = [
  {
    title: 'Variables y tipos',
    description: 'Declara datos con let y const y comprende tipos básicos.',
    theory: [
      'let permite reasignar variables.',
      'const crea referencias que no cambian.',
      'JavaScript maneja tipos dinámicos.',
      'string, number y boolean son tipos básicos.'
    ],
    example: 'const nombre = "Ana";\nlet edad = 23;\nconsole.log(nombre, edad);',
    quiz: {
      question: '¿Qué palabra clave evita reasignación?',
      options: ['var', 'let', 'const'],
      correct: 2
    },
    fillBlanks: {
      instruction: 'Completa declaraciones básicas en JavaScript.',
      preview: 'const nombre = "Ana";\nlet edad = 23;',
      segments: ['', ' nombre = "Ana";\n', ' edad = 23;'],
      answers: ['const', 'let'],
      optionPool: ['const', 'let', 'var', 'function', 'if']
    },
    practice: {
      instruction: 'Declara nombre y edad y muéstralos por consola.',
      requirements: ['const ', 'let ', 'console.log'],
      goalLines: ['const nombre = "Ana";', 'let edad = 23;', 'console.log(nombre, edad);']
    },
    examPractice: {
      instruction: 'Examen JS: crea variables de usuario y muestra un mensaje personalizado.',
      requirements: ['const ', 'let ', 'console.log', 'template'],
      goalLines: ['const usuario = "Kike";', 'let puntos = 120;', 'const mensaje = `Usuario ${usuario}: ${puntos}`;', 'console.log(mensaje);']
    }
  },
  {
    title: 'Operadores y condicionales',
    description: 'Toma decisiones con if, else y operadores lógicos.',
    theory: [
      'if evalúa una condición booleana.',
      'else define alternativa cuando la condición no se cumple.',
      '=== compara valor y tipo.',
      '&& y || combinan condiciones.'
    ],
    example: 'if (edad >= 18) {\n  console.log("Mayor de edad");\n} else {\n  console.log("Menor");\n}',
    quiz: {
      question: '¿Qué operador compara valor y tipo?',
      options: ['==', '===', '='],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Rellena la estructura condicional.',
      preview: 'if (edad >= 18) { console.log("OK"); } else { console.log("NO"); }',
      segments: ['', ' (edad >= 18) { console.log("OK"); } ', ' { console.log("NO"); }'],
      answers: ['if', 'else'],
      optionPool: ['if', 'else', 'for', 'while', 'switch']
    },
    practice: {
      instruction: 'Crea una condición que imprima aprobado o pendiente.',
      requirements: ['if (', 'else', 'console.log'],
      goalLines: ['if (nota >= 5) {', '  console.log("Aprobado");', '} else {', '  console.log("Pendiente");', '}']
    }
  },
  {
    title: 'Bucles básicos',
    description: 'Repite tareas con for y while.',
    theory: [
      'for repite cuando conoces iteraciones.',
      'while repite mientras la condición sea true.',
      'Evita bucles infinitos actualizando estado.',
      'Los bucles reducen código repetido.'
    ],
    example: 'for (let i = 0; i < 3; i++) {\n  console.log(i);\n}',
    quiz: {
      question: '¿Cuál bucle es común para iterar por índice?',
      options: ['if', 'for', 'switch'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa un bucle for.',
      preview: 'for (let i = 0; i < 3; i++) { console.log(i); }',
      segments: ['', ' (let i = 0; i < 3; i++) { ', '(i); }'],
      answers: ['for', 'console.log'],
      optionPool: ['for', 'while', 'console.log', 'if', 'return']
    },
    practice: {
      instruction: 'Imprime números del 1 al 5 usando un bucle.',
      requirements: ['for (', 'console.log'],
      goalLines: ['for (let i = 1; i <= 5; i++) {', '  console.log(i);', '}']
    }
  },
  {
    title: 'Funciones',
    description: 'Crea funciones reutilizables con parámetros.',
    theory: [
      'Una función encapsula lógica reutilizable.',
      'Puede recibir parámetros de entrada.',
      'return devuelve un valor.',
      'Nombrar bien funciones mejora mantenimiento.'
    ],
    example: 'function saludar(nombre) {\n  return `Hola ${nombre}`;\n}',
    quiz: {
      question: '¿Qué palabra devuelve un resultado de función?',
      options: ['break', 'yield', 'return'],
      correct: 2
    },
    fillBlanks: {
      instruction: 'Completa una función con retorno.',
      preview: 'function sumar(a, b) { return a + b; }',
      segments: ['', ' sumar(a, b) { ', ' a + b; }'],
      answers: ['function', 'return'],
      optionPool: ['function', 'return', 'if', 'let', 'while']
    },
    practice: {
      instruction: 'Crea una función sumar y muestra su resultado.',
      requirements: ['function ', 'return ', 'console.log'],
      goalLines: ['function sumar(a, b) {', '  return a + b;', '}', 'console.log(sumar(2, 3));']
    }
  },
  {
    title: 'Arrays y métodos básicos',
    description: 'Trabaja listas con push, map y filter básicos.',
    theory: [
      'Los arrays almacenan colecciones ordenadas.',
      'push agrega elementos al final.',
      'map transforma cada elemento.',
      'filter selecciona según condición.'
    ],
    example: 'const nums = [1, 2, 3];\nconst dobles = nums.map(n => n * 2);',
    quiz: {
      question: '¿Qué método transforma cada elemento y devuelve nuevo array?',
      options: ['push', 'map', 'find'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa operaciones básicas sobre arrays.',
      preview: 'const lista = [1,2,3];\nlista.push(4);',
      segments: ['const lista = [1,2,3];\nlista.', '(4);\nconst total = lista.', '((a,b) => a+b, 0);'],
      answers: ['push', 'reduce'],
      optionPool: ['push', 'map', 'filter', 'reduce', 'slice']
    },
    practice: {
      instruction: 'Crea un array y calcula suma total.',
      requirements: ['const ', '[', 'reduce', 'console.log'],
      goalLines: ['const notas = [7, 8, 9];', 'const total = notas.reduce((acc, n) => acc + n, 0);', 'console.log(total);']
    }
  },
  {
    title: 'Objetos y propiedades',
    description: 'Modela entidades con pares clave-valor.',
    theory: [
      'Los objetos representan datos estructurados.',
      'Puedes acceder con punto o corchetes.',
      'Se pueden combinar con funciones.',
      'Son base para trabajar con APIs.'
    ],
    example: 'const usuario = { nombre: "Ana", edad: 23 };\nconsole.log(usuario.nombre);',
    quiz: {
      question: '¿Qué estructura usa pares clave-valor?',
      options: ['Array', 'Objeto', 'Set'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa un objeto básico.',
      preview: 'const usuario = { nombre: "Ana", edad: 23 };',
      segments: ['const usuario = ', ' nombre: "Ana", ', ': 23 };'],
      answers: ['{', 'edad'],
      optionPool: ['{', 'edad', 'let', 'if', 'for']
    },
    practice: {
      instruction: 'Crea un objeto producto y muestra su precio.',
      requirements: ['const producto', '{', 'precio', 'console.log'],
      goalLines: ['const producto = { nombre: "Teclado", precio: 49 };', 'console.log(producto.precio);']
    }
  },
  {
    title: 'DOM y selección de elementos',
    description: 'Accede y modifica elementos de la página.',
    theory: [
      'document.querySelector busca elementos por selector.',
      'textContent cambia texto visible.',
      'classList permite añadir o quitar clases.',
      'El DOM conecta JavaScript con HTML.'
    ],
    example: 'const titulo = document.querySelector("h1");\ntitulo.textContent = "Nuevo título";',
    quiz: {
      question: '¿Qué método selecciona el primer elemento que coincide con un selector?',
      options: ['getElement', 'querySelector', 'findElement'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa una operación básica de DOM.',
      preview: 'const btn = document.querySelector("button");\nbtn.textContent = "Enviar";',
      segments: ['const btn = document.', '("button");\nbtn.', ' = "Enviar";'],
      answers: ['querySelector', 'textContent'],
      optionPool: ['querySelector', 'textContent', 'append', 'innerCSS', 'fetch']
    },
    practice: {
      instruction: 'Selecciona un elemento y cambia su texto.',
      requirements: ['document.queryselector', 'textcontent'],
      goalLines: ['const mensaje = document.querySelector("#msg");', 'mensaje.textContent = "Hola desde JS";']
    }
  },
  {
    title: 'Eventos',
    description: 'Responde a clics y acciones del usuario.',
    theory: [
      'addEventListener escucha eventos.',
      'click es un evento muy común en UI.',
      'El callback contiene la lógica a ejecutar.',
      'Los eventos permiten interactividad real.'
    ],
    example: 'btn.addEventListener("click", () => {\n  console.log("Click");\n});',
    quiz: {
      question: '¿Qué método se usa para escuchar eventos?',
      options: ['on', 'addEventListener', 'listenEvent'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa un listener de click.',
      preview: 'btn.addEventListener("click", () => { console.log("ok"); });',
      segments: ['btn.', '("click", () => { ', '("ok"); });'],
      answers: ['addEventListener', 'console.log'],
      optionPool: ['addEventListener', 'console.log', 'querySelector', 'if', 'return']
    },
    practice: {
      instruction: 'Crea un botón que imprima mensaje al hacer click.',
      requirements: ['addeventlistener', 'click', 'console.log'],
      goalLines: ['const btn = document.querySelector("button");', 'btn.addEventListener("click", () => {', '  console.log("Botón pulsado");', '});']
    }
  },
  {
    title: 'Fetch y JSON básico',
    description: 'Consume datos remotos con fetch y promesas.',
    theory: [
      'fetch realiza peticiones HTTP.',
      'response.json transforma respuesta en objeto.',
      'then encadena procesamiento asíncrono.',
      'catch maneja errores de red.'
    ],
    example: 'fetch("/api/usuarios")\n  .then(res => res.json())\n  .then(data => console.log(data));',
    quiz: {
      question: '¿Qué método convierte la respuesta a JSON?',
      options: ['toJSON()', 'response.json()', 'parseJSON()'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa una llamada fetch.',
      preview: 'fetch("/api")\n  .then(res => res.json())\n  .then(data => console.log(data));',
      segments: ['', '("/api")\n  .then(res => res.', '())\n  .then(data => console.log(data));'],
      answers: ['fetch', 'json'],
      optionPool: ['fetch', 'json', 'map', 'filter', 'querySelector']
    },
    practice: {
      instruction: 'Crea una petición fetch y muestra datos por consola.',
      requirements: ['fetch(', '.then', 'json', 'console.log'],
      goalLines: ['fetch("/api")', '  .then(res => res.json())', '  .then(data => console.log(data));']
    }
  },
  {
    title: 'Módulos y buenas prácticas',
    description: 'Organiza código y evita duplicación.',
    theory: [
      'Divide lógica en funciones pequeñas.',
      'Usa nombres claros para variables y funciones.',
      'Evita variables globales innecesarias.',
      'Estructura el proyecto en módulos.'
    ],
    example: 'export function formatear(nombre) {\n  return nombre.trim();\n}',
    quiz: {
      question: '¿Qué mejora más la mantenibilidad del código?',
      options: ['Funciones largas', 'Variables globales', 'Funciones pequeñas y claras'],
      correct: 2
    },
    fillBlanks: {
      instruction: 'Completa una exportación de función.',
      preview: 'export function saludar(nombre) { return nombre.trim(); }',
      segments: ['', ' function saludar(nombre) { ', ' nombre.trim(); }'],
      answers: ['export', 'return'],
      optionPool: ['export', 'return', 'if', 'for', 'while']
    },
    practice: {
      instruction: 'Escribe una función reutilizable y úsala en consola.',
      requirements: ['function ', 'return ', 'console.log'],
      goalLines: ['function normalizar(valor) {', '  return valor.trim().toLowerCase();', '}', 'console.log(normalizar(" Hola "));']
    }
  }
]

const sqlTopics = [
  {
    title: 'SELECT básico',
    description: 'Consulta datos con SELECT y FROM.',
    theory: [
      'SELECT recupera columnas de una tabla.',
      'FROM indica la tabla de origen.',
      'Puedes usar * para todas las columnas.',
      'Es la base de casi toda consulta SQL.'
    ],
    example: 'SELECT nombre, ciudad\nFROM clientes;',
    quiz: {
      question: '¿Qué cláusula indica la tabla origen?',
      options: ['WHERE', 'FROM', 'GROUP BY'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa una consulta SQL simple.',
      preview: 'SELECT nombre FROM clientes;',
      segments: ['', ' nombre ', ' clientes;'],
      answers: ['SELECT', 'FROM'],
      optionPool: ['SELECT', 'FROM', 'WHERE', 'ORDER BY', 'INSERT']
    },
    practice: {
      instruction: 'Escribe una consulta que lea nombre y email de usuarios.',
      requirements: ['select', 'from', 'usuarios'],
      goalLines: ['SELECT nombre, email', 'FROM usuarios;']
    },
    examPractice: {
      instruction: 'Examen SQL: consulta clientes activos y ordénalos por nombre.',
      requirements: ['select', 'from', 'where', 'order by'],
      goalLines: ['SELECT nombre, email', 'FROM clientes', 'WHERE activo = 1', 'ORDER BY nombre;']
    }
  },
  {
    title: 'Filtros con WHERE',
    description: 'Restringe resultados con condiciones.',
    theory: [
      'WHERE filtra filas según condición.',
      'Puedes usar =, >, <, >=, <= y <>.',
      'AND y OR combinan reglas.',
      'Filtrar reduce resultados irrelevantes.'
    ],
    example: 'SELECT * FROM productos\nWHERE precio > 50;',
    quiz: {
      question: '¿Qué cláusula filtra filas?',
      options: ['ORDER BY', 'WHERE', 'LIMIT'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Rellena una cláusula de filtro.',
      preview: 'SELECT * FROM productos WHERE precio > 50;',
      segments: ['SELECT * ', ' productos ', ' precio > 50;'],
      answers: ['FROM', 'WHERE'],
      optionPool: ['FROM', 'WHERE', 'GROUP BY', 'HAVING', 'INSERT']
    },
    practice: {
      instruction: 'Filtra pedidos con total mayor a 100.',
      requirements: ['select', 'from', 'where', '> 100'],
      goalLines: ['SELECT *', 'FROM pedidos', 'WHERE total > 100;']
    }
  },
  {
    title: 'Ordenar resultados',
    description: 'Ordena datos con ORDER BY ascendente o descendente.',
    theory: [
      'ORDER BY ordena filas por una o más columnas.',
      'ASC es ascendente (por defecto).',
      'DESC es descendente.',
      'Mejora lectura de reportes.'
    ],
    example: 'SELECT nombre, precio FROM productos\nORDER BY precio DESC;',
    quiz: {
      question: '¿Qué palabra ordena de mayor a menor?',
      options: ['ASC', 'DOWN', 'DESC'],
      correct: 2
    },
    fillBlanks: {
      instruction: 'Completa el ordenamiento SQL.',
      preview: 'SELECT * FROM clientes ORDER BY nombre ASC;',
      segments: ['SELECT * FROM clientes ', ' nombre ', ';'],
      answers: ['ORDER BY', 'ASC'],
      optionPool: ['ORDER BY', 'ASC', 'WHERE', 'GROUP BY', 'JOIN']
    },
    practice: {
      instruction: 'Ordena productos por precio descendente.',
      requirements: ['select', 'from', 'order by', 'desc'],
      goalLines: ['SELECT nombre, precio', 'FROM productos', 'ORDER BY precio DESC;']
    }
  },
  {
    title: 'INSERT y creación de filas',
    description: 'Inserta nuevos registros en tablas.',
    theory: [
      'INSERT INTO agrega filas nuevas.',
      'VALUES define valores por columna.',
      'Es buena práctica listar columnas explícitas.',
      'Cuida tipos de datos al insertar.'
    ],
    example: 'INSERT INTO usuarios (nombre, email)\nVALUES ("Ana", "ana@mail.com");',
    quiz: {
      question: '¿Qué instrucción agrega una nueva fila?',
      options: ['UPDATE', 'INSERT INTO', 'ALTER TABLE'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa un INSERT básico.',
      preview: 'INSERT INTO usuarios (nombre) VALUES ("Ana");',
      segments: ['', ' usuarios (nombre) ', ' ("Ana");'],
      answers: ['INSERT INTO', 'VALUES'],
      optionPool: ['INSERT INTO', 'VALUES', 'SELECT', 'FROM', 'WHERE']
    },
    practice: {
      instruction: 'Inserta un cliente con nombre y ciudad.',
      requirements: ['insert into', 'values', 'clientes'],
      goalLines: ['INSERT INTO clientes (nombre, ciudad)', 'VALUES ("Marta", "Sevilla");']
    }
  },
  {
    title: 'UPDATE y DELETE',
    description: 'Actualiza y elimina registros de forma segura.',
    theory: [
      'UPDATE modifica datos existentes.',
      'DELETE elimina filas.',
      'WHERE evita afectar toda la tabla.',
      'Siempre revisa antes de ejecutar en producción.'
    ],
    example: 'UPDATE usuarios SET activo = 1 WHERE id = 10;\nDELETE FROM usuarios WHERE id = 12;',
    quiz: {
      question: '¿Qué instrucción elimina registros?',
      options: ['DROP', 'DELETE', 'REMOVE'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa una actualización con filtro.',
      preview: 'UPDATE usuarios SET activo = 1 WHERE id = 2;',
      segments: ['', ' usuarios SET activo = 1 ', ' id = 2;'],
      answers: ['UPDATE', 'WHERE'],
      optionPool: ['UPDATE', 'WHERE', 'FROM', 'SELECT', 'ORDER BY']
    },
    practice: {
      instruction: 'Actualiza estado de un pedido por id.',
      requirements: ['update', 'set', 'where'],
      goalLines: ['UPDATE pedidos', 'SET estado = "enviado"', 'WHERE id = 4;']
    }
  },
  {
    title: 'Funciones agregadas',
    description: 'Calcula totales y métricas con COUNT y SUM.',
    theory: [
      'COUNT cuenta filas.',
      'SUM suma valores numéricos.',
      'AVG calcula promedio.',
      'MIN y MAX obtienen extremos.'
    ],
    example: 'SELECT COUNT(*) AS total, AVG(precio) AS promedio\nFROM productos;',
    quiz: {
      question: '¿Qué función cuenta filas?',
      options: ['SUM()', 'COUNT()', 'AVG()'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa funciones agregadas.',
      preview: 'SELECT COUNT(*) FROM ventas;',
      segments: ['SELECT ', '(*) ', ' ventas;'],
      answers: ['COUNT', 'FROM'],
      optionPool: ['COUNT', 'SUM', 'FROM', 'WHERE', 'JOIN']
    },
    practice: {
      instruction: 'Calcula total de pedidos y suma de importe.',
      requirements: ['select', 'count', 'sum', 'from'],
      goalLines: ['SELECT COUNT(*) AS total_pedidos, SUM(total) AS facturacion', 'FROM pedidos;']
    }
  },
  {
    title: 'GROUP BY y HAVING',
    description: 'Agrupa datos por categorías y filtra grupos.',
    theory: [
      'GROUP BY agrupa filas por columnas.',
      'HAVING filtra grupos agregados.',
      'Se usa junto con COUNT, SUM o AVG.',
      'Permite construir reportes de negocio.'
    ],
    example: 'SELECT ciudad, COUNT(*) AS total\nFROM clientes\nGROUP BY ciudad\nHAVING COUNT(*) > 5;',
    quiz: {
      question: '¿Qué cláusula filtra después de agrupar?',
      options: ['WHERE', 'HAVING', 'ORDER BY'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa una consulta agrupada.',
      preview: 'SELECT ciudad, COUNT(*) FROM clientes GROUP BY ciudad;',
      segments: ['SELECT ciudad, COUNT(*) FROM clientes ', ' ciudad', ';'],
      answers: ['GROUP BY', 'HAVING'],
      optionPool: ['GROUP BY', 'HAVING', 'WHERE', 'ORDER BY', 'JOIN']
    },
    practice: {
      instruction: 'Agrupa ventas por vendedor y filtra los que tienen más de 3.',
      requirements: ['group by', 'having', 'count'],
      goalLines: ['SELECT vendedor_id, COUNT(*) AS total', 'FROM ventas', 'GROUP BY vendedor_id', 'HAVING COUNT(*) > 3;']
    }
  },
  {
    title: 'JOIN entre tablas',
    description: 'Relaciona datos de varias tablas.',
    theory: [
      'JOIN combina filas relacionadas de dos tablas.',
      'ON define condición de unión.',
      'INNER JOIN devuelve coincidencias.',
      'LEFT JOIN conserva registros de la tabla izquierda.'
    ],
    example: 'SELECT p.id, c.nombre\nFROM pedidos p\nINNER JOIN clientes c ON p.cliente_id = c.id;',
    quiz: {
      question: '¿Qué cláusula define la condición del JOIN?',
      options: ['WHERE', 'ON', 'USING ONLY'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa una consulta con JOIN.',
      preview: 'SELECT * FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id;',
      segments: ['SELECT * FROM pedidos ', ' clientes ', ' pedidos.cliente_id = clientes.id;'],
      answers: ['INNER JOIN', 'ON'],
      optionPool: ['INNER JOIN', 'ON', 'GROUP BY', 'HAVING', 'VALUES']
    },
    practice: {
      instruction: 'Une pedidos con clientes para ver nombre y total.',
      requirements: ['select', 'join', 'on', 'from'],
      goalLines: ['SELECT c.nombre, p.total', 'FROM pedidos p', 'INNER JOIN clientes c ON p.cliente_id = c.id;']
    }
  },
  {
    title: 'Subconsultas básicas',
    description: 'Encadena consultas para resolver filtros avanzados.',
    theory: [
      'Una subconsulta es una consulta dentro de otra.',
      'Puede ir en SELECT, FROM o WHERE.',
      'IN y EXISTS ayudan con resultados de subconsulta.',
      'Útil cuando necesitas lógica por etapas.'
    ],
    example: 'SELECT nombre FROM clientes\nWHERE id IN (SELECT cliente_id FROM pedidos);',
    quiz: {
      question: '¿Qué palabra permite verificar pertenencia a un conjunto?',
      options: ['IN', 'IS', 'ONLY'],
      correct: 0
    },
    fillBlanks: {
      instruction: 'Completa una consulta con IN.',
      preview: 'SELECT nombre FROM clientes WHERE id IN (SELECT cliente_id FROM pedidos);',
      segments: ['SELECT nombre FROM clientes WHERE id ', ' (SELECT cliente_id ', ' pedidos);'],
      answers: ['IN', 'FROM'],
      optionPool: ['IN', 'FROM', 'JOIN', 'ORDER BY', 'LIMIT']
    },
    practice: {
      instruction: 'Filtra productos vendidos usando subconsulta.',
      requirements: ['select', 'where', 'in (select', 'from'],
      goalLines: ['SELECT nombre', 'FROM productos', 'WHERE id IN (SELECT producto_id FROM ventas);']
    }
  },
  {
    title: 'Diseño básico de tablas',
    description: 'Crea tablas con claves y tipos simples.',
    theory: [
      'CREATE TABLE define estructura.',
      'PRIMARY KEY identifica filas únicas.',
      'VARCHAR guarda texto variable.',
      'INT guarda números enteros.'
    ],
    example: 'CREATE TABLE usuarios (\n  id INT PRIMARY KEY,\n  nombre VARCHAR(100)\n);',
    quiz: {
      question: '¿Qué restricción garantiza unicidad por fila?',
      options: ['FOREIGN KEY', 'PRIMARY KEY', 'UNIQUE INDEXED ONLY'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa una sentencia de creación de tabla.',
      preview: 'CREATE TABLE usuarios (id INT PRIMARY KEY, nombre VARCHAR(100));',
      segments: ['', ' TABLE usuarios (id INT PRIMARY KEY, nombre ', '(100));'],
      answers: ['CREATE', 'VARCHAR'],
      optionPool: ['CREATE', 'VARCHAR', 'SELECT', 'UPDATE', 'GROUP BY']
    },
    practice: {
      instruction: 'Define tabla productos con id, nombre y precio.',
      requirements: ['create table', 'id int', 'nombre varchar', 'precio'],
      goalLines: ['CREATE TABLE productos (', '  id INT PRIMARY KEY,', '  nombre VARCHAR(120),', '  precio DECIMAL(10,2)', ');']
    }
  }
]

const pythonTopics = [
  {
    title: 'Sintaxis e impresión',
    description: 'Empieza con print y estructura básica de scripts.',
    theory: [
      'Python usa indentación para definir bloques.',
      'print() muestra resultados en consola.',
      'No necesitas punto y coma al final de línea.',
      'La legibilidad es prioridad en Python.'
    ],
    example: 'print("Hola, mundo")',
    quiz: {
      question: '¿Qué función imprime texto en Python?',
      options: ['echo()', 'print()', 'println()'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa un print básico.',
      preview: 'print("Hola")',
      segments: ['', '("', '")'],
      answers: ['print', 'Hola'],
      optionPool: ['print', 'Hola', 'input', 'def', 'if']
    },
    practice: {
      instruction: 'Imprime tu nombre y una frase de bienvenida.',
      requirements: ['print(', '"'],
      goalLines: ['nombre = "Kike"', 'print(f"Bienvenido {nombre}")']
    },
    examPractice: {
      instruction: 'Examen Python: pide nombre y edad, luego muestra un mensaje formateado.',
      requirements: ['input(', 'print(', 'f"'],
      goalLines: ['nombre = input("Nombre: ")', 'edad = int(input("Edad: "))', 'print(f"Hola {nombre}, tienes {edad} años")']
    }
  },
  {
    title: 'Variables y tipos',
    description: 'Declara variables numéricas, texto y booleanos.',
    theory: [
      'Las variables se crean al asignar.',
      'str, int y bool son tipos comunes.',
      'Python infiere el tipo automáticamente.',
      'type() ayuda a inspeccionar tipo de dato.'
    ],
    example: 'nombre = "Ana"\nedad = 22\nactivo = True',
    quiz: {
      question: '¿Cuál es un booleano válido en Python?',
      options: ['true', 'TRUE', 'True'],
      correct: 2
    },
    fillBlanks: {
      instruction: 'Completa variables en Python.',
      preview: 'nombre = "Ana"\nedad = 22',
      segments: ['', ' = "Ana"\n', ' = 22'],
      answers: ['nombre', 'edad'],
      optionPool: ['nombre', 'edad', 'for', 'def', 'class']
    },
    practice: {
      instruction: 'Crea variables de usuario y muéstralas.',
      requirements: ['=', 'print('],
      goalLines: ['usuario = "ana"', 'puntos = 100', 'print(usuario, puntos)']
    }
  },
  {
    title: 'Condicionales',
    description: 'Aplica decisiones con if, elif y else.',
    theory: [
      'if evalúa una condición.',
      'elif permite condiciones adicionales.',
      'else ejecuta el caso por defecto.',
      'La indentación define el bloque de código.'
    ],
    example: 'if edad >= 18:\n    print("Mayor")\nelse:\n    print("Menor")',
    quiz: {
      question: '¿Qué palabra se usa para condición alternativa intermedia?',
      options: ['elseif', 'elif', 'else if'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa una estructura condicional.',
      preview: 'if nota >= 5:\n    print("Aprobado")\nelse:\n    print("Pendiente")',
      segments: ['', ' nota >= 5:\n    print("Aprobado")\n', ':\n    print("Pendiente")'],
      answers: ['if', 'else'],
      optionPool: ['if', 'else', 'for', 'while', 'def']
    },
    practice: {
      instruction: 'Evalúa una nota e imprime Aprobado o Pendiente.',
      requirements: ['if ', 'else:', 'print('],
      goalLines: ['nota = 6', 'if nota >= 5:', '    print("Aprobado")', 'else:', '    print("Pendiente")']
    }
  },
  {
    title: 'Bucles for y while',
    description: 'Automatiza repeticiones y recorridos.',
    theory: [
      'for recorre secuencias.',
      'range() genera secuencias numéricas.',
      'while repite según condición.',
      'Debes evitar bucles infinitos.'
    ],
    example: 'for i in range(3):\n    print(i)',
    quiz: {
      question: '¿Qué función se usa frecuentemente con for para números?',
      options: ['list()', 'range()', 'len()'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa un bucle for en Python.',
      preview: 'for i in range(5):\n    print(i)',
      segments: ['', ' i in range(5):\n    ', '(i)'],
      answers: ['for', 'print'],
      optionPool: ['for', 'print', 'if', 'def', 'return']
    },
    practice: {
      instruction: 'Imprime números del 1 al 5 con for.',
      requirements: ['for ', 'range(', 'print('],
      goalLines: ['for i in range(1, 6):', '    print(i)']
    }
  },
  {
    title: 'Funciones',
    description: 'Define lógica reutilizable con def.',
    theory: [
      'def crea funciones en Python.',
      'Puedes definir parámetros.',
      'return devuelve resultados.',
      'Las funciones mejoran mantenibilidad.'
    ],
    example: 'def sumar(a, b):\n    return a + b',
    quiz: {
      question: '¿Qué palabra clave declara una función en Python?',
      options: ['func', 'def', 'function'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa una función con retorno.',
      preview: 'def saludar(nombre):\n    return f"Hola {nombre}"',
      segments: ['', ' saludar(nombre):\n    ', ' f"Hola {nombre}"'],
      answers: ['def', 'return'],
      optionPool: ['def', 'return', 'for', 'class', 'input']
    },
    practice: {
      instruction: 'Crea función multiplicar y úsala.',
      requirements: ['def ', 'return ', 'print('],
      goalLines: ['def multiplicar(a, b):', '    return a * b', 'print(multiplicar(3, 4))']
    }
  },
  {
    title: 'Listas y diccionarios',
    description: 'Gestiona colecciones en memoria.',
    theory: [
      'Las listas son colecciones ordenadas.',
      'append agrega elementos al final.',
      'Los diccionarios almacenan clave-valor.',
      'Puedes iterar ambos con for.'
    ],
    example: 'nombres = ["Ana", "Luis"]\nusuario = {"nombre": "Ana", "edad": 22}',
    quiz: {
      question: '¿Qué método agrega un elemento al final de una lista?',
      options: ['add()', 'append()', 'push()'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa operaciones de lista.',
      preview: 'nombres = []\nnombres.append("Ana")',
      segments: ['nombres = []\nnombres.', '("Ana")', ''],
      answers: ['append', 'Ana'],
      optionPool: ['append', 'Ana', 'remove', 'print', 'class']
    },
    practice: {
      instruction: 'Crea lista de tareas y recórrela con for.',
      requirements: ['[', 'for ', 'print('],
      goalLines: ['tareas = ["estudiar", "practicar"]', 'for tarea in tareas:', '    print(tarea)']
    }
  },
  {
    title: 'Manejo de errores',
    description: 'Controla excepciones con try y except.',
    theory: [
      'try envuelve código que puede fallar.',
      'except captura la excepción.',
      'finally se ejecuta siempre al final.',
      'Manejar errores evita caídas inesperadas.'
    ],
    example: 'try:\n    numero = int(input("Número: "))\nexcept ValueError:\n    print("Entrada inválida")',
    quiz: {
      question: '¿Qué bloque captura excepciones?',
      options: ['catch', 'except', 'rescue'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa un bloque try/except.',
      preview: 'try:\n    x = int("a")\nexcept ValueError:\n    print("error")',
      segments: ['', ':\n    x = int("a")\n', ' ValueError:\n    print("error")'],
      answers: ['try', 'except'],
      optionPool: ['try', 'except', 'if', 'for', 'def']
    },
    practice: {
      instruction: 'Convierte entrada a entero y captura errores.',
      requirements: ['try:', 'except', 'int(', 'print('],
      goalLines: ['try:', '    edad = int(input("Edad: "))', '    print(edad)', 'except ValueError:', '    print("Edad no válida")']
    }
  },
  {
    title: 'Archivos básicos',
    description: 'Lee y escribe datos en archivos de texto.',
    theory: [
      'open() abre archivos en distintos modos.',
      'with cierra automáticamente recursos.',
      'read() lee contenido.',
      'write() escribe contenido.'
    ],
    example: 'with open("notas.txt", "w") as f:\n    f.write("Hola")',
    quiz: {
      question: '¿Qué estructura se recomienda para manejar archivos?',
      options: ['for', 'with', 'switch'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa manejo de archivo con with.',
      preview: 'with open("log.txt", "w") as f:\n    f.write("ok")',
      segments: ['', ' open("log.txt", "w") as f:\n    f.', '("ok")'],
      answers: ['with', 'write'],
      optionPool: ['with', 'write', 'read', 'def', 'if']
    },
    practice: {
      instruction: 'Escribe una línea en archivo y luego léela.',
      requirements: ['with open', 'write(', 'read('],
      goalLines: ['with open("demo.txt", "w") as f:', '    f.write("hola")', 'with open("demo.txt", "r") as f:', '    print(f.read())']
    }
  },
  {
    title: 'Módulos y paquetes',
    description: 'Importa utilidades y organiza código.',
    theory: [
      'import carga módulos externos o internos.',
      'from ... import ... selecciona funciones concretas.',
      'math y random son módulos útiles.',
      'Separar código en módulos mejora escalabilidad.'
    ],
    example: 'import math\nprint(math.sqrt(25))',
    quiz: {
      question: '¿Qué palabra se usa para cargar un módulo?',
      options: ['include', 'import', 'require'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa una importación simple.',
      preview: 'import math\nprint(math.sqrt(16))',
      segments: ['', ' math\nprint(math.', '(16))'],
      answers: ['import', 'sqrt'],
      optionPool: ['import', 'sqrt', 'print', 'def', 'return']
    },
    practice: {
      instruction: 'Importa random y genera un número.',
      requirements: ['import ', 'random', 'print('],
      goalLines: ['import random', 'numero = random.randint(1, 10)', 'print(numero)']
    }
  },
  {
    title: 'Entrada y salida básica',
    description: 'Interactúa con el usuario desde consola.',
    theory: [
      'input() captura texto del usuario.',
      'int() y float() convierten tipos numéricos.',
      'Las f-strings facilitan formateo.',
      'Combinar input y lógica permite mini apps.'
    ],
    example: 'nombre = input("Nombre: ")\nprint(f"Hola {nombre}")',
    quiz: {
      question: '¿Qué función lee texto desde consola?',
      options: ['scan()', 'input()', 'readline()'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa una interacción por consola.',
      preview: 'nombre = input("Nombre: ")\nprint(f"Hola {nombre}")',
      segments: ['nombre = ', '("Nombre: ")\n', '(f"Hola {nombre}")'],
      answers: ['input', 'print'],
      optionPool: ['input', 'print', 'return', 'for', 'class']
    },
    practice: {
      instruction: 'Pide nombre y edad e imprime resumen.',
      requirements: ['input(', 'int(', 'print('],
      goalLines: ['nombre = input("Nombre: ")', 'edad = int(input("Edad: "))', 'print(f"{nombre} tiene {edad} años")']
    }
  }
]

const javaTopics = [
  {
    title: 'Hola Mundo y estructura',
    description: 'Conoce la clase principal y el método main.',
    theory: [
      'Java organiza código en clases.',
      'main es el punto de entrada.',
      'System.out.println imprime en consola.',
      'Cada instrucción finaliza con punto y coma.'
    ],
    example: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hola");\n  }\n}',
    quiz: {
      question: '¿Qué método inicia el programa en Java?',
      options: ['start()', 'main()', 'runMain()'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa la estructura principal de Java.',
      preview: 'public class Main { public static void main(String[] args) { System.out.println("Hola"); } }',
      segments: ['public class Main { ', ' static void main(String[] args) { ', '.println("Hola"); } }'],
      answers: ['public', 'System.out'],
      optionPool: ['public', 'private', 'System.out', 'print', 'class']
    },
    practice: {
      instruction: 'Crea una clase con main e imprime tu nombre.',
      requirements: ['public class', 'public static void main', 'system.out.println'],
      goalLines: ['public class Main {', '  public static void main(String[] args) {', '    System.out.println("Hola, Kike");', '  }', '}']
    },
    examPractice: {
      instruction: 'Examen Java: crea programa que declare variables y muestre resumen.',
      requirements: ['public class', 'main(string[] args)', 'int ', 'string ', 'system.out.println'],
      goalLines: ['public class Main {', '  public static void main(String[] args) {', '    String nombre = "Ana";', '    int edad = 22;', '    System.out.println(nombre + " - " + edad);', '  }', '}']
    }
  },
  {
    title: 'Variables y tipos',
    description: 'Trabaja con tipos primitivos y String.',
    theory: [
      'int guarda enteros.',
      'double guarda decimales.',
      'boolean guarda verdadero o falso.',
      'String representa texto.'
    ],
    example: 'int edad = 23;\nString nombre = "Ana";\nboolean activo = true;',
    quiz: {
      question: '¿Qué tipo se usa para texto en Java?',
      options: ['Text', 'String', 'CharArray'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa declaraciones de variables.',
      preview: 'int edad = 23;\nString nombre = "Ana";',
      segments: ['', ' edad = 23;\n', ' nombre = "Ana";'],
      answers: ['int', 'String'],
      optionPool: ['int', 'String', 'boolean', 'class', 'void']
    },
    practice: {
      instruction: 'Declara nombre y puntos e imprímelos.',
      requirements: ['string ', 'int ', 'system.out.println'],
      goalLines: ['String nombre = "Luis";', 'int puntos = 100;', 'System.out.println(nombre + " " + puntos);']
    }
  },
  {
    title: 'Condicionales',
    description: 'Controla flujo con if, else y switch.',
    theory: [
      'if evalúa condiciones.',
      'else define alternativa.',
      'switch es útil con múltiples casos.',
      'Usa operadores lógicos para combinar reglas.'
    ],
    example: 'if (nota >= 5) {\n  System.out.println("Aprobado");\n} else {\n  System.out.println("Pendiente");\n}',
    quiz: {
      question: '¿Qué bloque se ejecuta cuando if es falso?',
      options: ['else', 'default', 'catch'],
      correct: 0
    },
    fillBlanks: {
      instruction: 'Completa una condicional básica.',
      preview: 'if (edad >= 18) { System.out.println("Mayor"); } else { System.out.println("Menor"); }',
      segments: ['', ' (edad >= 18) { System.out.println("Mayor"); } ', ' { System.out.println("Menor"); }'],
      answers: ['if', 'else'],
      optionPool: ['if', 'else', 'for', 'while', 'class']
    },
    practice: {
      instruction: 'Evalúa una nota e imprime resultado.',
      requirements: ['if (', 'else', 'system.out.println'],
      goalLines: ['if (nota >= 5) {', '  System.out.println("Aprobado");', '} else {', '  System.out.println("Pendiente");', '}']
    }
  },
  {
    title: 'Bucles',
    description: 'Automatiza tareas con for y while.',
    theory: [
      'for repite por número de iteraciones.',
      'while repite por condición.',
      'Actualiza el contador para evitar loops infinitos.',
      'Los bucles simplifican procesos repetitivos.'
    ],
    example: 'for (int i = 0; i < 3; i++) {\n  System.out.println(i);\n}',
    quiz: {
      question: '¿Qué bucle suele usarse con contador i?',
      options: ['if', 'for', 'switch'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa un bucle for en Java.',
      preview: 'for (int i = 0; i < 5; i++) { System.out.println(i); }',
      segments: ['', ' (int i = 0; i < 5; i++) { ', '(i); }'],
      answers: ['for', 'System.out.println'],
      optionPool: ['for', 'while', 'System.out.println', 'if', 'return']
    },
    practice: {
      instruction: 'Imprime números del 1 al 5 con for.',
      requirements: ['for (', 'int i', 'system.out.println'],
      goalLines: ['for (int i = 1; i <= 5; i++) {', '  System.out.println(i);', '}']
    }
  },
  {
    title: 'Métodos',
    description: 'Define funciones reutilizables con parámetros.',
    theory: [
      'Un método encapsula lógica.',
      'Puede tener parámetros de entrada.',
      'return devuelve valor cuando aplica.',
      'Métodos reducen duplicación de código.'
    ],
    example: 'static int sumar(int a, int b) {\n  return a + b;\n}',
    quiz: {
      question: '¿Qué palabra devuelve un valor en un método?',
      options: ['break', 'return', 'yield'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa un método con retorno.',
      preview: 'static int sumar(int a, int b) { return a + b; }',
      segments: ['static int sumar(int a, int b) { ', ' a + b; ', '}'],
      answers: ['return', 'class'],
      optionPool: ['return', 'class', 'if', 'for', 'new']
    },
    practice: {
      instruction: 'Crea método multiplicar y úsalo desde main.',
      requirements: ['static int', 'return', 'main(string[] args)'],
      goalLines: ['static int multiplicar(int a, int b) {', '  return a * b;', '}', 'System.out.println(multiplicar(2, 4));']
    }
  },
  {
    title: 'Arrays y colecciones',
    description: 'Guarda múltiples valores y recórrelos.',
    theory: [
      'Los arrays tienen tamaño fijo.',
      'ArrayList es dinámico.',
      'Puedes recorrer con for o foreach.',
      'Son claves para estructuras de datos.'
    ],
    example: 'int[] nums = {1,2,3};\nfor (int n : nums) { System.out.println(n); }',
    quiz: {
      question: '¿Qué colección crece dinámicamente?',
      options: ['int[]', 'ArrayList', 'String[] fijo'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa una iteración de array.',
      preview: 'int[] nums = {1,2,3};\nfor (int n : nums) { System.out.println(n); }',
      segments: ['int[] nums = {1,2,3};\n', ' (int n : nums) { ', '(n); }'],
      answers: ['for', 'System.out.println'],
      optionPool: ['for', 'while', 'System.out.println', 'if', 'return']
    },
    practice: {
      instruction: 'Crea un array y muestra sus valores.',
      requirements: ['int[]', 'for (', 'system.out.println'],
      goalLines: ['int[] edades = {20, 25, 30};', 'for (int edad : edades) {', '  System.out.println(edad);', '}']
    }
  },
  {
    title: 'POO básica',
    description: 'Define clases, atributos y métodos.',
    theory: [
      'Una clase define un molde.',
      'Un objeto es una instancia de una clase.',
      'Los atributos almacenan estado.',
      'Los métodos definen comportamiento.'
    ],
    example: 'class Persona {\n  String nombre;\n  void saludar() { System.out.println("Hola"); }\n}',
    quiz: {
      question: '¿Qué es una instancia de clase?',
      options: ['Paquete', 'Objeto', 'Método'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa una clase Java básica.',
      preview: 'class Persona { String nombre; void saludar() {} }',
      segments: ['', ' Persona { String nombre; ', ' saludar() {} }'],
      answers: ['class', 'void'],
      optionPool: ['class', 'void', 'int', 'if', 'for']
    },
    practice: {
      instruction: 'Crea clase Producto con atributo y método mostrar.',
      requirements: ['class ', 'string ', 'void ', 'system.out.println'],
      goalLines: ['class Producto {', '  String nombre = "Teclado";', '  void mostrar() { System.out.println(nombre); }', '}']
    }
  },
  {
    title: 'Excepciones',
    description: 'Maneja errores con try/catch.',
    theory: [
      'try contiene código riesgoso.',
      'catch maneja excepción.',
      'finally se ejecuta siempre.',
      'Mejora robustez del programa.'
    ],
    example: 'try {\n  int x = Integer.parseInt("a");\n} catch (NumberFormatException e) {\n  System.out.println("Error");\n}',
    quiz: {
      question: '¿Qué bloque maneja una excepción en Java?',
      options: ['catch', 'except', 'rescue'],
      correct: 0
    },
    fillBlanks: {
      instruction: 'Completa estructura try/catch.',
      preview: 'try { int x = Integer.parseInt("a"); } catch (Exception e) { System.out.println("error"); }',
      segments: ['', ' { int x = Integer.parseInt("a"); } ', ' (Exception e) { System.out.println("error"); }'],
      answers: ['try', 'catch'],
      optionPool: ['try', 'catch', 'if', 'for', 'class']
    },
    practice: {
      instruction: 'Convierte texto a número controlando errores.',
      requirements: ['try', 'catch', 'parseint', 'system.out.println'],
      goalLines: ['try {', '  int valor = Integer.parseInt("12");', '  System.out.println(valor);', '} catch (Exception e) {', '  System.out.println("Error");', '}']
    }
  },
  {
    title: 'Lectura de datos con Scanner',
    description: 'Captura entrada del usuario por consola.',
    theory: [
      'Scanner permite leer datos de System.in.',
      'nextLine lee texto completo.',
      'nextInt lee enteros.',
      'Debes cerrar el scanner al final.'
    ],
    example: 'Scanner sc = new Scanner(System.in);\nString nombre = sc.nextLine();',
    quiz: {
      question: '¿Qué clase se usa para leer entrada en consola?',
      options: ['ReaderInput', 'Scanner', 'ConsoleRead'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa lectura con Scanner.',
      preview: 'Scanner sc = new Scanner(System.in);\nString nombre = sc.nextLine();',
      segments: ['', ' sc = new Scanner(System.in);\nString nombre = sc.', '();'],
      answers: ['Scanner', 'nextLine'],
      optionPool: ['Scanner', 'nextLine', 'println', 'parseInt', 'class']
    },
    practice: {
      instruction: 'Lee nombre del usuario y muéstralo.',
      requirements: ['scanner', 'nextline', 'system.out.println'],
      goalLines: ['Scanner sc = new Scanner(System.in);', 'String nombre = sc.nextLine();', 'System.out.println(nombre);', 'sc.close();']
    }
  },
  {
    title: 'Buenas prácticas básicas',
    description: 'Escribe código limpio y mantenible.',
    theory: [
      'Usa nombres descriptivos para clases y métodos.',
      'Evita repetir lógica duplicada.',
      'Separa responsabilidades por clase.',
      'Formatea consistentemente el código.'
    ],
    example: 'public class Calculadora {\n  public int sumar(int a, int b) { return a + b; }\n}',
    quiz: {
      question: '¿Qué mejora la mantenibilidad de un proyecto Java?',
      options: ['Nombres ambiguos', 'Métodos enormes', 'Métodos claros y cortos'],
      correct: 2
    },
    fillBlanks: {
      instruction: 'Completa una firma de método limpia.',
      preview: 'public int sumar(int a, int b) { return a + b; }',
      segments: ['', ' int sumar(int a, int b) { ', ' a + b; }'],
      answers: ['public', 'return'],
      optionPool: ['public', 'private', 'return', 'for', 'if']
    },
    practice: {
      instruction: 'Crea clase utilitaria con método reusable.',
      requirements: ['public class', 'public static', 'return'],
      goalLines: ['public class TextoUtil {', '  public static String limpiar(String t) {', '    return t.trim().toLowerCase();', '  }', '}']
    }
  }
]

const phpTopics = [
  {
    title: 'Introducción y echo',
    description: 'Crea tu primer script PHP y muestra salida.',
    theory: [
      'PHP se ejecuta en el servidor.',
      'Los bloques PHP usan etiquetas <?php ?>.',
      'echo imprime contenido.',
      'Puedes mezclar HTML y PHP en una misma página.'
    ],
    example: '<?php\necho "Hola desde PHP";\n?>',
    quiz: {
      question: '¿Qué instrucción muestra texto en PHP?',
      options: ['printline', 'echo', 'console.log'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa un bloque PHP básico.',
      preview: '<?php\necho "Hola";\n?>',
      segments: ['', '\necho "Hola";\n', ''],
      answers: ['<?php', '?>'],
      optionPool: ['<?php', '?>', 'echo', 'if', 'function']
    },
    practice: {
      instruction: 'Imprime un mensaje de bienvenida con PHP.',
      requirements: ['<?php', 'echo', '?>'],
      goalLines: ['<?php', 'echo "Bienvenido a Coding 404";', '?>']
    },
    examPractice: {
      instruction: 'Examen PHP: muestra datos de usuario con variables y condicional.',
      requirements: ['<?php', '$', 'if', 'echo', '?>'],
      goalLines: ['<?php', '$nombre = "Ana";', '$activo = true;', 'if ($activo) { echo "Hola $nombre"; }', '?>']
    }
  },
  {
    title: 'Variables y tipos',
    description: 'Declara variables con $ y tipos comunes.',
    theory: [
      'Las variables en PHP comienzan con $.',
      'No necesitas declarar tipo explícito.',
      'PHP maneja strings, números y booleanos.',
      'Usa nombres claros para legibilidad.'
    ],
    example: '$nombre = "Ana";\n$edad = 22;\n$activo = true;',
    quiz: {
      question: '¿Cómo empieza una variable en PHP?',
      options: ['#', '$', '@'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa variables en PHP.',
      preview: '$nombre = "Ana";\n$edad = 22;',
      segments: ['', 'nombre = "Ana";\n', 'edad = 22;'],
      answers: ['$', '$'],
      optionPool: ['$', 'echo', 'if', 'function', '?>']
    },
    practice: {
      instruction: 'Declara variables usuario y puntos, luego imprímelas.',
      requirements: ['$', 'echo', ';'],
      goalLines: ['<?php', '$usuario = "kike";', '$puntos = 150;', 'echo $usuario . " " . $puntos;', '?>']
    }
  },
  {
    title: 'Condicionales',
    description: 'Controla flujo con if y else.',
    theory: [
      'if ejecuta código según condición.',
      'else define rama alternativa.',
      'Puedes usar operadores lógicos.',
      'Evalúa booleans y comparaciones.'
    ],
    example: 'if ($edad >= 18) {\n  echo "Mayor";\n} else {\n  echo "Menor";\n}',
    quiz: {
      question: '¿Qué bloque se ejecuta cuando la condición es falsa?',
      options: ['then', 'else', 'default'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa estructura condicional de PHP.',
      preview: 'if ($ok) { echo "Sí"; } else { echo "No"; }',
      segments: ['', ' ($ok) { echo "Sí"; } ', ' { echo "No"; }'],
      answers: ['if', 'else'],
      optionPool: ['if', 'else', 'for', 'while', 'function']
    },
    practice: {
      instruction: 'Evalúa una nota e imprime resultado.',
      requirements: ['if (', 'else', 'echo'],
      goalLines: ['<?php', '$nota = 7;', 'if ($nota >= 5) { echo "Aprobado"; } else { echo "Pendiente"; }', '?>']
    }
  },
  {
    title: 'Bucles',
    description: 'Repite tareas con for y foreach.',
    theory: [
      'for recorre con contador.',
      'foreach recorre arrays asociativos y listas.',
      'while repite por condición.',
      'Los bucles automatizan tareas repetitivas.'
    ],
    example: 'for ($i = 0; $i < 3; $i++) {\n  echo $i;\n}',
    quiz: {
      question: '¿Qué bucle recorre arrays fácilmente en PHP?',
      options: ['switch', 'foreach', 'if'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa un bucle for en PHP.',
      preview: 'for ($i = 0; $i < 5; $i++) { echo $i; }',
      segments: ['', ' ($i = 0; $i < 5; $i++) { ', ' $i; }'],
      answers: ['for', 'echo'],
      optionPool: ['for', 'foreach', 'echo', 'if', 'return']
    },
    practice: {
      instruction: 'Imprime números del 1 al 5 con for.',
      requirements: ['for (', '$i', 'echo'],
      goalLines: ['<?php', 'for ($i = 1; $i <= 5; $i++) {', '  echo $i;', '}', '?>']
    }
  },
  {
    title: 'Funciones',
    description: 'Define funciones para reutilizar lógica.',
    theory: [
      'function declara funciones en PHP.',
      'Los parámetros reciben datos de entrada.',
      'return devuelve resultados.',
      'Las funciones evitan repetir código.'
    ],
    example: 'function sumar($a, $b) {\n  return $a + $b;\n}',
    quiz: {
      question: '¿Qué palabra declara una función en PHP?',
      options: ['def', 'function', 'fnc'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa función con retorno.',
      preview: 'function saludar($n) { return "Hola " . $n; }',
      segments: ['', ' saludar($n) { ', ' "Hola " . $n; }'],
      answers: ['function', 'return'],
      optionPool: ['function', 'return', 'echo', 'if', 'while']
    },
    practice: {
      instruction: 'Crea función multiplicar y úsala.',
      requirements: ['function ', 'return', 'echo'],
      goalLines: ['<?php', 'function multiplicar($a, $b) { return $a * $b; }', 'echo multiplicar(3, 4);', '?>']
    }
  },
  {
    title: 'Arrays y foreach',
    description: 'Gestiona colecciones con arrays.',
    theory: [
      'Los arrays guardan múltiples valores.',
      'foreach recorre cada elemento.',
      'array_push agrega nuevos datos.',
      'Puedes usar arrays asociativos clave-valor.'
    ],
    example: '$nombres = ["Ana", "Luis"];\nforeach ($nombres as $n) { echo $n; }',
    quiz: {
      question: '¿Qué estructura recorre elementos de un array?',
      options: ['if', 'foreach', 'switch'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa un foreach simple.',
      preview: 'foreach ($items as $item) { echo $item; }',
      segments: ['', ' ($items as $item) { ', ' $item; }'],
      answers: ['foreach', 'echo'],
      optionPool: ['foreach', 'echo', 'for', 'if', 'return']
    },
    practice: {
      instruction: 'Crea array de tareas y recórrelo con foreach.',
      requirements: ['[', 'foreach', 'echo'],
      goalLines: ['<?php', '$tareas = ["estudiar", "practicar"];', 'foreach ($tareas as $tarea) { echo $tarea; }', '?>']
    }
  },
  {
    title: 'Formularios básicos',
    description: 'Recibe datos enviados por GET y POST.',
    theory: [
      '$_GET recibe parámetros de URL.',
      '$_POST recibe datos de formularios.',
      'htmlspecialchars evita inyección en salida.',
      'Valida datos antes de usarlos.'
    ],
    example: '$nombre = $_POST["nombre"] ?? "";\necho htmlspecialchars($nombre);',
    quiz: {
      question: '¿Qué superglobal suele usarse para enviar formularios seguros?',
      options: ['$_POST', '$_COOKIE', '$_SERVER_ONLY'],
      correct: 0
    },
    fillBlanks: {
      instruction: 'Completa lectura de datos de formulario.',
      preview: '$email = $_POST["email"] ?? "";',
      segments: ['$email = ', '["email"] ?? "";', ''],
      answers: ['$_POST', '$_GET'],
      optionPool: ['$_POST', '$_GET', '$_SESSION', 'echo', 'if']
    },
    practice: {
      instruction: 'Lee un campo nombre y muéstralo escapado.',
      requirements: ['$_post', 'htmlspecialchars', 'echo'],
      goalLines: ['<?php', '$nombre = $_POST["nombre"] ?? "";', 'echo htmlspecialchars($nombre);', '?>']
    }
  },
  {
    title: 'Sesiones',
    description: 'Mantén estado entre páginas con sesiones.',
    theory: [
      'session_start inicia sesión.',
      '$_SESSION guarda datos persistentes por usuario.',
      'Es útil para login y preferencias.',
      'Cerrar sesión limpia estado guardado.'
    ],
    example: 'session_start();\n$_SESSION["user"] = "ana";',
    quiz: {
      question: '¿Qué función inicia una sesión en PHP?',
      options: ['start_session()', 'session_start()', 'open_session()'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa uso básico de sesión.',
      preview: 'session_start();\n$_SESSION["user"] = "ana";',
      segments: ['', '();\n', '["user"] = "ana";'],
      answers: ['session_start', '$_SESSION'],
      optionPool: ['session_start', '$_SESSION', '$_POST', 'echo', 'if']
    },
    practice: {
      instruction: 'Guarda nombre de usuario en sesión.',
      requirements: ['session_start', '$_session', '='],
      goalLines: ['<?php', 'session_start();', '$_SESSION["usuario"] = "ana";', 'echo $_SESSION["usuario"];', '?>']
    }
  },
  {
    title: 'Conexión básica a base de datos',
    description: 'Abre conexión simple con mysqli/PDO.',
    theory: [
      'PHP suele conectarse a MySQL.',
      'PDO es flexible y recomendado.',
      'Usa consultas preparadas para seguridad.',
      'Maneja errores de conexión adecuadamente.'
    ],
    example: '$pdo = new PDO("mysql:host=localhost;dbname=app", "user", "pass");',
    quiz: {
      question: '¿Qué API moderna es recomendada para conexión a BD?',
      options: ['mysql_old', 'PDO', 'db_connect_legacy'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa una conexión con PDO.',
      preview: '$pdo = new PDO("mysql:host=localhost;dbname=app", "user", "pass");',
      segments: ['$pdo = new ', '("mysql:host=localhost;dbname=app", "user", "pass");', ''],
      answers: ['PDO', 'mysqli'],
      optionPool: ['PDO', 'mysqli', 'echo', 'if', 'function']
    },
    practice: {
      instruction: 'Define objeto PDO y maneja excepción simple.',
      requirements: ['new pdo', 'try', 'catch'],
      goalLines: ['<?php', 'try {', '  $pdo = new PDO("mysql:host=localhost;dbname=app", "user", "pass");', '} catch (Exception $e) { echo "Error"; }', '?>']
    }
  },
  {
    title: 'Buenas prácticas',
    description: 'Escribe PHP más seguro y mantenible.',
    theory: [
      'Valida y sanea entradas del usuario.',
      'Evita concatenar SQL sin preparar.',
      'Separa lógica y presentación.',
      'Usa nombres claros y funciones pequeñas.'
    ],
    example: 'function limpiar($valor) { return trim(htmlspecialchars($valor)); }',
    quiz: {
      question: '¿Qué ayuda a evitar XSS al mostrar datos?',
      options: ['htmlspecialchars', 'explode', 'strpos'],
      correct: 0
    },
    fillBlanks: {
      instruction: 'Completa una función de saneamiento.',
      preview: 'function limpiar($v) { return trim(htmlspecialchars($v)); }',
      segments: ['', ' limpiar($v) { ', ' trim(htmlspecialchars($v)); }'],
      answers: ['function', 'return'],
      optionPool: ['function', 'return', 'if', 'for', 'echo']
    },
    practice: {
      instruction: 'Crea función limpiar y úsala con echo.',
      requirements: ['function ', 'return', 'htmlspecialchars', 'echo'],
      goalLines: ['<?php', 'function limpiar($v) { return trim(htmlspecialchars($v)); }', 'echo limpiar(" <hola> ");', '?>']
    }
  }
]

const nodeTopics = [
  {
    title: 'Introducción a Node.js',
    description: 'Entiende qué es Node.js y cómo ejecutar tu primer archivo.',
    theory: [
      'Node.js ejecuta JavaScript fuera del navegador.',
      'Se usa para APIs, servidores y herramientas CLI.',
      'La ejecución se hace desde terminal con node archivo.js.',
      'Su modelo no bloqueante ayuda con alto tráfico.'
    ],
    example: 'console.log("Hola desde Node.js");',
    quiz: {
      question: '¿Qué comando ejecuta un archivo Node llamado app.js?',
      options: ['node app.js', 'run app.js', 'npm app.js'],
      correct: 0
    },
    fillBlanks: {
      instruction: 'Completa el comando y la salida básica en Node.',
      preview: 'node app.js\nconsole.log("Hola Node")',
      segments: ['', ' app.js\n', '("Hola Node")'],
      answers: ['node', 'console.log'],
      optionPool: ['node', 'npm', 'console.log', 'print', 'require']
    },
    practice: {
      instruction: 'Crea un archivo Node que imprima un mensaje de inicio.',
      requirements: ['console.log', 'hola'],
      goalLines: ['// app.js', 'console.log("Hola Node.js");']
    },
    examPractice: {
      instruction: 'Examen Node.js: crea un script que imprima estado y fecha del sistema.',
      requirements: ['console.log', 'new date'],
      goalLines: ['const now = new Date();', 'console.log("Servidor listo");', 'console.log(now.toISOString());']
    }
  },
  {
    title: 'Módulos y require',
    description: 'Importa módulos nativos y propios con require.',
    theory: [
      'require() carga módulos en CommonJS.',
      'Node trae módulos nativos como os, path o fs.',
      'module.exports permite compartir funciones.',
      'Separar lógica en módulos mejora mantenibilidad.'
    ],
    example: 'const os = require("os");\nconsole.log(os.platform());',
    quiz: {
      question: '¿Qué función se usa para importar módulos en CommonJS?',
      options: ['import()', 'require()', 'load()'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa la importación de módulo os.',
      preview: 'const os = require("os");',
      segments: ['const ', ' = ', ';'],
      answers: ['os', 'require("os")'],
      optionPool: ['os', 'require("os")', 'import "os"', 'module', 'path']
    },
    practice: {
      instruction: 'Importa os y muestra el sistema operativo.',
      requirements: ['require(', 'os', 'console.log'],
      goalLines: ['const os = require("os");', 'console.log(os.platform());']
    }
  },
  {
    title: 'Módulo fs (archivos)',
    description: 'Lee y escribe archivos usando el módulo fs.',
    theory: [
      'fs permite operaciones de lectura/escritura en disco.',
      'Hay versiones síncronas y asíncronas.',
      'readFile y writeFile son métodos comunes.',
      'Siempre maneja errores al trabajar con archivos.'
    ],
    example: 'const fs = require("fs");\nfs.writeFileSync("log.txt", "Hola");',
    quiz: {
      question: '¿Qué módulo nativo gestiona archivos en Node?',
      options: ['file', 'fs', 'disk'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa uso básico de fs.',
      preview: 'const fs = require("fs");\nfs.writeFileSync("demo.txt", "ok");',
      segments: ['const ', ' = require("fs");\n', '.writeFileSync("demo.txt", "ok");'],
      answers: ['fs', 'fs'],
      optionPool: ['fs', 'path', 'os', 'http', 'events']
    },
    practice: {
      instruction: 'Escribe un archivo demo.txt y léelo por consola.',
      requirements: ['require("fs")', 'writefile', 'readfile', 'console.log'],
      goalLines: ['const fs = require("fs");', 'fs.writeFileSync("demo.txt", "Node OK");', 'const contenido = fs.readFileSync("demo.txt", "utf8");', 'console.log(contenido);']
    }
  },
  {
    title: 'Servidor HTTP básico',
    description: 'Levanta un servidor web con el módulo http.',
    theory: [
      'http.createServer crea un servidor en Node.',
      'listen define el puerto de escucha.',
      'req y res controlan solicitud y respuesta.',
      'Puedes responder texto o JSON.'
    ],
    example: 'const http = require("http");\nhttp.createServer((req,res)=>res.end("Hola")).listen(3000);',
    quiz: {
      question: '¿Qué módulo se usa para crear un servidor básico en Node?',
      options: ['server', 'http', 'express'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa una estructura mínima de servidor HTTP.',
      preview: 'const http = require("http");\nhttp.createServer((req,res)=>res.end("ok")).listen(3000);',
      segments: ['const http = require("http");\nhttp.', '((req,res)=>res.end("ok")).', '(3000);'],
      answers: ['createServer', 'listen'],
      optionPool: ['createServer', 'listen', 'route', 'start', 'open']
    },
    practice: {
      instruction: 'Crea servidor en puerto 3000 que devuelva texto.',
      requirements: ['require("http")', 'createserver', 'res.end', 'listen(3000'],
      goalLines: ['const http = require("http");', 'http.createServer((req, res) => {', '  res.end("Servidor Node activo");', '}).listen(3000);']
    }
  },
  {
    title: 'Rutas y URL',
    description: 'Responde distinto según la ruta solicitada.',
    theory: [
      'req.url permite saber la ruta pedida.',
      'Puedes condicionar respuestas por endpoint.',
      'res.writeHead ajusta status y content-type.',
      'Es la base para APIs REST simples.'
    ],
    example: 'if (req.url === "/api") { res.end("API"); }',
    quiz: {
      question: '¿Qué propiedad trae la ruta solicitada en un request HTTP?',
      options: ['req.path', 'req.url', 'req.routeOnly'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa control de ruta en servidor Node.',
      preview: 'if (req.url === "/") { res.end("Inicio"); }',
      segments: ['if (req.', ' === "/") { res.', '("Inicio"); }'],
      answers: ['url', 'end'],
      optionPool: ['url', 'path', 'end', 'send', 'write']
    },
    practice: {
      instruction: 'Responde diferente para / y /api.',
      requirements: ['req.url', 'if (', 'res.end'],
      goalLines: ['if (req.url === "/") {', '  res.end("Home");', '} else if (req.url === "/api") {', '  res.end("API");', '}']
    }
  },
  {
    title: 'npm y paquetes',
    description: 'Gestiona dependencias con npm.',
    theory: [
      'npm es el gestor de paquetes de Node.',
      'package.json define scripts y dependencias.',
      'npm install agrega paquetes al proyecto.',
      'Usa versiones estables y revisadas.'
    ],
    example: 'npm install express',
    quiz: {
      question: '¿Qué archivo describe dependencias de un proyecto Node?',
      options: ['config.json', 'package.json', 'node.json'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa comandos y archivo de npm.',
      preview: 'npm install express\npackage.json',
      segments: ['', ' install express\n', '.json'],
      answers: ['npm', 'package'],
      optionPool: ['npm', 'node', 'package', 'module', 'express']
    },
    practice: {
      instruction: 'Configura un script start en package.json.',
      requirements: ['"scripts"', '"start"', 'node'],
      goalLines: ['{', '  "scripts": {', '    "start": "node server.js"', '  }', '}']
    }
  },
  {
    title: 'Express básico',
    description: 'Crea una API simple con Express.',
    theory: [
      'Express simplifica la creación de servidores Node.',
      'app.get define rutas GET.',
      'app.listen inicia servidor.',
      'Es el framework más usado en backend JS.'
    ],
    example: 'const express = require("express");\nconst app = express();\napp.get("/", (req,res)=>res.send("OK"));',
    quiz: {
      question: '¿Qué método define una ruta GET en Express?',
      options: ['app.route()', 'app.get()', 'app.fetch()'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa una app Express mínima.',
      preview: 'const express = require("express");\nconst app = express();\napp.get("/", (req,res)=>res.send("ok"));',
      segments: ['const express = require("express");\nconst app = express();\napp.', '("/", (req,res)=>res.', '("ok"));'],
      answers: ['get', 'send'],
      optionPool: ['get', 'post', 'send', 'json', 'listen']
    },
    practice: {
      instruction: 'Crea endpoint /status que devuelva JSON.',
      requirements: ['express', 'app.get', '/status', 'res.json'],
      goalLines: ['const express = require("express");', 'const app = express();', 'app.get("/status", (req, res) => res.json({ ok: true }));', 'app.listen(3000);']
    }
  },
  {
    title: 'Middlewares',
    description: 'Usa middlewares para procesar requests.',
    theory: [
      'Un middleware se ejecuta antes del handler final.',
      'express.json procesa cuerpo JSON.',
      'next() pasa al siguiente middleware.',
      'Sirve para logs, auth y validaciones.'
    ],
    example: 'app.use(express.json());',
    quiz: {
      question: '¿Qué middleware de Express parsea JSON?',
      options: ['express.text()', 'express.json()', 'express.parseJSON()'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa configuración de middleware JSON.',
      preview: 'app.use(express.json());',
      segments: ['app.', '(express.', '());'],
      answers: ['use', 'json'],
      optionPool: ['use', 'get', 'json', 'send', 'listen']
    },
    practice: {
      instruction: 'Agrega middleware de logging y express.json.',
      requirements: ['app.use', 'express.json', 'next()'],
      goalLines: ['app.use(express.json());', 'app.use((req, res, next) => {', '  console.log(req.method, req.url);', '  next();', '});']
    }
  },
  {
    title: 'API REST básica',
    description: 'Crea endpoints GET y POST sencillos.',
    theory: [
      'REST usa recursos y métodos HTTP.',
      'GET recupera datos y POST crea.',
      'El cuerpo JSON llega por req.body.',
      'Responde con status adecuados.'
    ],
    example: 'app.post("/users", (req,res)=>res.status(201).json(req.body));',
    quiz: {
      question: '¿Qué método HTTP se usa para crear un recurso?',
      options: ['GET', 'POST', 'DELETE'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa endpoint POST con respuesta 201.',
      preview: 'app.post("/users", (req,res)=>res.status(201).json(req.body));',
      segments: ['app.', '("/users", (req,res)=>res.', '(201).json(req.body));'],
      answers: ['post', 'status'],
      optionPool: ['post', 'get', 'status', 'send', 'listen']
    },
    practice: {
      instruction: 'Crea endpoints GET /users y POST /users.',
      requirements: ['app.get', 'app.post', 'res.json', 'req.body'],
      goalLines: ['app.get("/users", (req, res) => res.json([]));', 'app.post("/users", (req, res) => res.status(201).json(req.body));']
    }
  },
  {
    title: 'Conexión a base de datos y buenas prácticas',
    description: 'Prepara tu backend para producción básica.',
    theory: [
      'Node se conecta a MongoDB/MySQL mediante paquetes.',
      'Variables de entorno guardan secretos.',
      'Maneja errores de forma centralizada.',
      'Organiza rutas, controladores y servicios.'
    ],
    example: 'require("dotenv").config();\nconst uri = process.env.DB_URI;',
    quiz: {
      question: '¿Dónde debes guardar credenciales de base de datos?',
      options: ['Código fuente', '.env', 'README'],
      correct: 1
    },
    fillBlanks: {
      instruction: 'Completa carga de variables de entorno.',
      preview: 'require("dotenv").config();\nconst uri = process.env.DB_URI;',
      segments: ['require("dotenv").', '();\nconst uri = process.', '.DB_URI;'],
      answers: ['config', 'env'],
      optionPool: ['config', 'env', 'listen', 'route', 'json']
    },
    practice: {
      instruction: 'Crea estructura base de backend con .env y manejo de errores.',
      requirements: ['dotenv', 'process.env', 'try', 'catch'],
      goalLines: ['require("dotenv").config();', 'try {', '  const dbUri = process.env.DB_URI;', '  console.log(dbUri);', '} catch (error) {', '  console.error(error);', '}']
    }
  }
]

const vueTopics = [
  {
    title: 'Instancia Vue y reactividad',
    description: 'Crea tu primera aplicación Vue y entiende la reactividad.',
    theory: [
      'Vue es un framework progresivo para construir interfaces.',
      'createApp monta la aplicación en un elemento del DOM.',
      'data() retorna un objeto con el estado reactivo.',
      'Cuando cambias el estado, la vista se actualiza sola.',
    ],
    example: 'import { createApp } from \"vue\";\n\nconst app = createApp({\n  data() {\n    return { mensaje: \"Hola Vue\" }\n  }\n});\napp.mount(\"#app\");',
    quiz: {
      question: '¿Qué método monta la aplicación Vue en el DOM?',
      options: ['app.render()', 'app.mount()', 'app.start()'],
      correct: 1,
    },
    fillBlanks: {
      instruction: 'Completa la creación de una app Vue.',
      preview: 'const app = createApp({\n  data() {\n    return { titulo: \"Mi App\" }\n  }\n});\napp.mount(\"#app\");',
      segments: ['const app = ', '({\n  data() {\n    return { titulo: \"Mi App\" }\n  }\n});\napp.', '(\"#app\");'],
      answers: ['createApp', 'mount'],
      optionPool: ['createApp', 'mount', 'render', 'new Vue', 'init'],
    },
    practice: {
      instruction: 'Crea una app Vue con data reactiva y móntala.',
      requirements: ['createApp', 'data()', 'return', 'mount'],
      goalLines: ['const app = createApp({', '  data() {', '    return { nombre: \"Vue\" }', '  }', '});', 'app.mount(\"#app\");'],
    }
  },
  {
    title: 'Template syntax e interpolación',
    description: 'Muestra datos dinámicos en el HTML con {{ }}.',
    theory: [
      'Las dobles llaves {{ }} insertan datos en el template.',
      'Puedes usar expresiones JS simples dentro de {{ }}.',
      'v-text establece el texto de un elemento completo.',
      'v-html renderiza HTML crudo (usar con cuidado).',
    ],
    example: '<div id=\"app\">\n  <h1>{{ titulo }}</h1>\n  <p>{{ mensaje.toUpperCase() }}</p>\n  <p>Suma: {{ 2 + 3 }}</p>\n</div>',
    quiz: {
      question: '¿Qué sintaxis muestra datos reactivos en el template?',
      options: ['<%= dato %>', '{{ dato }}', '${dato}'],
      correct: 1,
    },
    fillBlanks: {
      instruction: 'Completa la interpolación en el template.',
      preview: '<h1>{{ titulo }}</h1>\n<p>{{ descripcion }}</p>',
      segments: ['<h1>', ' titulo }}</h1>\n<p>{{ ', ' }}</p>'],
      answers: ['{{', 'descripcion'],
      optionPool: ['{{', 'descripcion', 'v-text', 'data', 'props'],
    },
    practice: {
      instruction: 'Crea un template que muestre título y mensaje.',
      requirements: ['{{', '}}', 'titulo', 'mensaje'],
      goalLines: ['<h1>{{ titulo }}</h1>', '<p>{{ mensaje }}</p>'],
    }
  },
  {
    title: 'v-bind y atributos dinámicos',
    description: 'Vincula atributos HTML a datos reactivos.',
    theory: [
      'v-bind:attr vincula un atributo a una expresión.',
      'La forma corta es :attr (dos puntos).',
      'Puedes vincular src, href, class, style, etc.',
      ':class acepta objetos y arrays para clases condicionales.',
    ],
    example: '<img :src=\"imagenUrl\" :alt=\"descripcion\">\n<a :href=\"enlace\">Visitar</a>\n<div :class=\"{ activo: esActivo }\">Contenido</div>',
    quiz: {
      question: '¿Cuál es la forma corta de v-bind?',
      options: ['@', ':', '#'],
      correct: 1,
    },
    fillBlanks: {
      instruction: 'Completa los bindings dinámicos.',
      preview: '<img :src=\"foto\" :alt=\"nombre\">\n<button :disabled=\"cargando\">Enviar</button>',
      segments: ['<img ', 'src=\"foto\" ', 'alt=\"nombre\">\n<button :disabled=\"cargando\">Enviar</button>'],
      answers: [':', ':'],
      optionPool: [':', 'v-bind:', '@', 'v-on:', '#'],
    },
    practice: {
      instruction: 'Vincula imagen y clase condicional con v-bind.',
      requirements: [':src', ':class', ':alt'],
      goalLines: ['<img :src=\"foto\" :alt=\"titulo\">', '<div :class=\"{ destacado: esDestacado }\">Tarjeta</div>'],
    }
  },
  {
    title: 'Eventos con v-on',
    description: 'Responde a acciones del usuario con eventos.',
    theory: [
      'v-on:evento escucha eventos del DOM.',
      'La forma corta es @evento.',
      'Puedes llamar métodos definidos en methods.',
      'El objeto $event contiene info del evento.',
    ],
    example: '<button @click=\"contador++\">+1</button>\n<button @click=\"saludar\">Saludar</button>\n<input @input=\"actualizar($event)\">\n\nmethods: {\n  saludar() { alert(\"Hola\") },\n  actualizar(e) { this.texto = e.target.value }\n}',
    quiz: {
      question: '¿Cuál es la forma corta de v-on:click?',
      options: [':click', '@click', '#click'],
      correct: 1,
    },
    fillBlanks: {
      instruction: 'Completa los listeners de eventos.',
      preview: '<button @click=\"incrementar\">+1</button>\n<input @input=\"buscar\">',
      segments: ['<button ', 'click=\"incrementar\">+1</button>\n<input ', 'input=\"buscar\">'],
      answers: ['@', '@'],
      optionPool: ['@', ':', 'v-on:', 'v-bind:', '#'],
    },
    practice: {
      instruction: 'Crea un contador con botón click y un input con evento.',
      requirements: ['@click', 'methods', '@input'],
      goalLines: ['<button @click=\"contador++\">{{ contador }}</button>', '<input @input=\"onInput\">', 'methods: {', '  onInput(e) { this.texto = e.target.value }', '}'],
    }
  },
  {
    title: 'v-model y two-way binding',
    description: 'Sincroniza inputs con datos reactivos automáticamente.',
    theory: [
      'v-model crea enlace bidireccional entre input y data.',
      'Funciona con input, textarea, select y checkbox.',
      'v-model es azúcar sintáctico de :value + @input.',
      'Puedes usar modificadores: .lazy, .number, .trim.',
    ],
    example: '<input v-model=\"nombre\" placeholder=\"Tu nombre\">\n<p>Hola, {{ nombre }}</p>\n\n<select v-model=\"lenguaje\">\n  <option>JavaScript</option>\n  <option>Vue</option>\n</select>\n<p>Elegiste: {{ lenguaje }}</p>',
    quiz: {
      question: '¿Qué directiva crea enlace bidireccional?',
      options: ['v-bind', 'v-model', 'v-sync'],
      correct: 1,
    },
    fillBlanks: {
      instruction: 'Completa el two-way binding.',
      preview: '<input v-model=\"email\" placeholder=\"Email\">\n<p>{{ email }}</p>',
      segments: ['<input ', '=\"email\" placeholder=\"Email\">\n<p>{{ ', ' }}</p>'],
      answers: ['v-model', 'email'],
      optionPool: ['v-model', 'email', 'v-bind', ':value', 'v-text'],
    },
    practice: {
      instruction: 'Crea formulario con v-model en input y select.',
      requirements: ['v-model', '<input', '<select', '<option'],
      goalLines: ['<input v-model=\"nombre\" placeholder=\"Nombre\">', '<select v-model=\"rol\">', '  <option>Frontend</option>', '  <option>Backend</option>', '</select>', '<p>{{ nombre }} - {{ rol }}</p>'],
    }
  },
  {
    title: 'Renderizado condicional',
    description: 'Muestra u oculta elementos con v-if y v-show.',
    theory: [
      'v-if añade o quita el elemento del DOM.',
      'v-else y v-else-if crean alternativas.',
      'v-show solo cambia display CSS (no quita del DOM).',
      'Usa v-if para condiciones que cambian poco, v-show para toggle rápido.',
    ],
    example: '<div v-if=\"logueado\">\n  <p>Bienvenido, {{ usuario }}</p>\n</div>\n<div v-else>\n  <p>Inicia sesión</p>\n</div>\n\n<button v-show=\"tienePermiso\">Editar</button>',
    quiz: {
      question: '¿Qué directiva oculta un elemento sin quitarlo del DOM?',
      options: ['v-if', 'v-show', 'v-hide'],
      correct: 1,
    },
    fillBlanks: {
      instruction: 'Completa el renderizado condicional.',
      preview: '<p v-if=\"activo\">Activo</p>\n<p v-else>Inactivo</p>',
      segments: ['<p ', '=\"activo\">Activo</p>\n<p ', '>Inactivo</p>'],
      answers: ['v-if', 'v-else'],
      optionPool: ['v-if', 'v-else', 'v-show', 'v-for', ':if'],
    },
    practice: {
      instruction: 'Muestra contenido diferente según estado del usuario.',
      requirements: ['v-if', 'v-else', 'v-show'],
      goalLines: ['<div v-if=\"esAdmin\">Panel Admin</div>', '<div v-else>Panel Usuario</div>', '<button v-show=\"puedeEditar\">Editar</button>'],
    }
  },
  {
    title: 'Listas con v-for',
    description: 'Renderiza listas de datos dinámicamente.',
    theory: [
      'v-for=\"item in lista\" itera sobre un array.',
      'Siempre usa :key para que Vue identifique cada elemento.',
      'Puedes acceder al índice: v-for=\"(item, i) in lista\".',
      'v-for funciona también con objetos y rangos.',
    ],
    example: '<ul>\n  <li v-for=\"tarea in tareas\" :key=\"tarea.id\">\n    {{ tarea.texto }}\n  </li>\n</ul>\n\ndata() {\n  return {\n    tareas: [\n      { id: 1, texto: \"Aprender Vue\" },\n      { id: 2, texto: \"Crear proyecto\" }\n    ]\n  }\n}',
    quiz: {
      question: '¿Qué atributo es obligatorio usar con v-for?',
      options: [':id', ':key', ':index'],
      correct: 1,
    },
    fillBlanks: {
      instruction: 'Completa la lista dinámica.',
      preview: '<li v-for=\"item in items\" :key=\"item.id\">{{ item.nombre }}</li>',
      segments: ['<li ', '=\"item in items\" ', '=\"item.id\">{{ item.nombre }}</li>'],
      answers: ['v-for', ':key'],
      optionPool: ['v-for', ':key', 'v-if', ':id', 'v-bind'],
    },
    practice: {
      instruction: 'Renderiza una lista de productos con v-for.',
      requirements: ['v-for', ':key', '{{ '],
      goalLines: ['<div v-for=\"producto in productos\" :key=\"producto.id\">', '  <h3>{{ producto.nombre }}</h3>', '  <p>{{ producto.precio }}€</p>', '</div>'],
    }
  },
  {
    title: 'Computed properties y watchers',
    description: 'Calcula valores derivados y reacciona a cambios.',
    theory: [
      'computed define propiedades calculadas con cache automático.',
      'Se recalculan solo cuando cambian sus dependencias.',
      'watch observa cambios en datos específicos.',
      'watch es útil para efectos secundarios (API calls, etc.).',
    ],
    example: 'computed: {\n  nombreCompleto() {\n    return this.nombre + \" \" + this.apellido;\n  },\n  tareasCompletadas() {\n    return this.tareas.filter(t => t.completada).length;\n  }\n},\nwatch: {\n  busqueda(nuevo, anterior) {\n    this.buscarEnAPI(nuevo);\n  }\n}',
    quiz: {
      question: '¿Qué ventaja tienen las computed properties sobre los methods?',
      options: ['Son más rápidas siempre', 'Tienen cache automático', 'No necesitan return'],
      correct: 1,
    },
    fillBlanks: {
      instruction: 'Completa computed property y watcher.',
      preview: 'computed: {\n  total() { return this.precio * this.cantidad; }\n},\nwatch: {\n  filtro(val) { this.filtrar(val); }\n}',
      segments: ['', ': {\n  total() { return this.precio * this.cantidad; }\n},\n', ': {\n  filtro(val) { this.filtrar(val); }\n}'],
      answers: ['computed', 'watch'],
      optionPool: ['computed', 'watch', 'methods', 'data', 'props'],
    },
    practice: {
      instruction: 'Crea computed para precio total y watch para búsqueda.',
      requirements: ['computed', 'return', 'watch'],
      goalLines: ['computed: {', '  precioTotal() {', '    return this.precio * this.cantidad;', '  }', '},', 'watch: {', '  termino(valor) {', '    this.buscar(valor);', '  }', '}'],
    }
  },
  {
    title: 'Componentes: props y emit',
    description: 'Divide la UI en piezas reutilizables que se comunican.',
    theory: [
      'Los componentes encapsulan template, lógica y estilos.',
      'props recibe datos del componente padre.',
      '$emit envía eventos del hijo al padre.',
      'El flujo es: datos bajan con props, eventos suben con emit.',
    ],
    example: '// Componente hijo: Boton.vue\nexport default {\n  props: [\"texto\", \"color\"],\n  emits: [\"click-boton\"],\n  template: `<button :style=\"{background: color}\" @click=\"$emit(\'click-boton\')\">\n    {{ texto }}\n  </button>`\n}\n\n// Uso en padre:\n<Boton texto=\"Guardar\" color=\"#1f3cff\" @click-boton=\"guardar\" />',
    quiz: {
      question: '¿Cómo envía un hijo eventos al padre?',
      options: ['this.props()', 'this.$emit()', 'this.send()'],
      correct: 1,
    },
    fillBlanks: {
      instruction: 'Completa props y emit del componente.',
      preview: 'props: [\"titulo\"],\n$emit(\"actualizar\", valor)',
      segments: ['', ': [\"titulo\"],\nthis.', '(\"actualizar\", valor)'],
      answers: ['props', '$emit'],
      optionPool: ['props', '$emit', 'data', 'methods', 'watch'],
    },
    practice: {
      instruction: 'Crea componente con props y emit.',
      requirements: ['props', '$emit', 'template'],
      goalLines: ['export default {', '  props: [\"nombre\"],', '  emits: [\"seleccionar\"],', '  template: `<button @click=\"$emit(\'seleccionar\', nombre)\">{{ nombre }}</button>`', '}'],
    }
  },
  {
    title: 'Lifecycle hooks y ciclo de vida',
    description: 'Ejecuta código en momentos clave del componente.',
    theory: [
      'created() se ejecuta cuando el componente se inicializa.',
      'mounted() se ejecuta cuando el componente está en el DOM.',
      'updated() se ejecuta tras cada cambio reactivo.',
      'unmounted() limpia recursos al destruir el componente.',
    ],
    example: 'export default {\n  data() {\n    return { usuarios: [] }\n  },\n  async mounted() {\n    const res = await fetch(\"/api/usuarios\");\n    this.usuarios = await res.json();\n  },\n  unmounted() {\n    console.log(\"Componente destruido\");\n  }\n}',
    quiz: {
      question: '¿En qué hook es seguro acceder al DOM?',
      options: ['created', 'mounted', 'beforeCreate'],
      correct: 1,
    },
    fillBlanks: {
      instruction: 'Completa los lifecycle hooks.',
      preview: 'mounted() {\n  this.cargarDatos();\n},\nunmounted() {\n  clearInterval(this.timer);\n}',
      segments: ['', '() {\n  this.cargarDatos();\n},\n', '() {\n  clearInterval(this.timer);\n}'],
      answers: ['mounted', 'unmounted'],
      optionPool: ['mounted', 'unmounted', 'created', 'updated', 'computed'],
    },
    practice: {
      instruction: 'Carga datos en mounted y limpia en unmounted.',
      requirements: ['mounted', 'fetch', 'unmounted'],
      goalLines: ['async mounted() {', '  const res = await fetch(\"/api/datos\");', '  this.datos = await res.json();', '},', 'unmounted() {', '  clearInterval(this.intervalo);', '}'],
    }
  }
];

export const cssData = buildCourse({
  language: 'CSS',
  description: 'Lenguaje de estilos para diseñar interfaces web.',
  topics: cssTopics
})

export const javascriptData = buildCourse({
  language: 'JavaScript',
  description: 'Lenguaje base de la interactividad en aplicaciones web.',
  topics: jsTopics
})

export const vueData = buildCourse({
  language: 'Vue',
  description: 'Framework progresivo para construir interfaces de usuario reactivas.',
  topics: vueTopics
})

export const sqlData = buildCourse({
  language: 'SQL',
  description: 'Lenguaje para consultar y manipular bases de datos relacionales.',
  topics: sqlTopics
})

export const pythonData = buildCourse({
  language: 'Python',
  description: 'Lenguaje versátil para automatización, datos y backend.',
  topics: pythonTopics
})

export const javaData = buildCourse({
  language: 'Java',
  description: 'Lenguaje orientado a objetos muy usado en backend empresarial.',
  topics: javaTopics
})

export const phpData = buildCourse({
  language: 'PHP',
  description: 'Lenguaje de servidor para construir aplicaciones web dinámicas.',
  topics: phpTopics
})

export const nodeData = buildCourse({
  language: 'Node.js',
  description: 'Entorno backend para crear APIs y servidores con JavaScript.',
  topics: nodeTopics
})
