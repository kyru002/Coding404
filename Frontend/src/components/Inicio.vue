<template>
  <div class="inicio-container">
    <div class="language-tab-container">
      <button class="language-tab" @click="showLanguageModal = true">
        <img
          v-if="currentLanguageConfig && currentLanguageConfig.iconPath"
          :src="currentLanguageConfig.iconPath"
          :alt="`Icono ${currentLanguage}`"
          class="language-icon-img">
        <span v-else class="language-icon">💻</span>
        <span class="language-name">{{ currentLanguage }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="dropdown-icon">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      <div class="top-actions">
        <button class="streak-button" @click="openStreakCalendar" :title="t('viewStreak')">
          <span class="streak-flame" :class="{ active: streakDays > 1 }">🔥</span>
          <span class="streak-count">{{ streakDays }}</span>
        </button>

        <div class="ui-language-picker">
          <button class="ui-language-button" @click="showUiLanguageMenu = !showUiLanguageMenu" :title="t('changeUiLanguage')">
            <img
              :src="uiLanguage === 'es' ? '/images/espana.png' : '/images/reino-unido.png'"
              :alt="uiLanguage === 'es' ? 'Bandera ES' : 'Bandera GB'"
              class="ui-flag-image">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="ui-dropdown-icon">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>

          <div v-if="showUiLanguageMenu" class="ui-language-menu">
            <button class="ui-language-option" @click="setUiLanguage('es')">
              <img src="/images/espana.png" alt="Bandera ES" class="ui-option-flag-image">
              <span>ES</span>
            </button>
            <button class="ui-language-option" @click="setUiLanguage('en')">
              <img src="/images/reino-unido.png" alt="Bandera GB" class="ui-option-flag-image">
              <span>EN</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <transition name="modal">
      <div v-if="showStreakCalendar" class="modal-overlay" @click="showStreakCalendar = false">
        <div class="modal-content streak-calendar-modal" @click.stop>
          <button class="modal-close" @click="showStreakCalendar = false">✕</button>
          <h2>{{ t('streakCalendarTitle') }}</h2>
          <p class="calendar-subtitle">{{ t('connectedDays') }}: {{ streakDays }} · {{ t('maxStreak') }}: {{ maxStreakDays }}</p>

          <button class="restore-button" :disabled="!canRestoreStreak" @click="restoreStreak">
            {{ t('restoreStreak') }}
          </button>

          <div class="calendar-grid">
            <div v-for="month in calendarMonths" :key="month.month" class="month-card">
              <p class="month-title">{{ month.label }}</p>
              <div class="days-grid">
                <span
                  v-for="day in month.days"
                  :key="day.date"
                  class="day-dot"
                  :class="{ active: day.active }"
                  :title="day.date">
                  {{ day.day }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal">
      <div v-if="showLanguageModal" class="modal-overlay" @click="showLanguageModal = false">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="showLanguageModal = false">✕</button>
          <h2>{{ t('selectLearningLanguage') }}</h2>
          <div class="learning-path-selector">
            <button
              v-for="path in learningPaths"
              :key="path.id"
              class="path-option"
              :class="{ active: selectedLearningPath === path.id }"
              @click="selectLearningPath(path.id)">
              {{ path.name }}
            </button>
          </div>
          <div class="language-selector">
            <button
              v-for="lang in filteredLanguages"
              :key="lang.id"
              class="language-option"
              :class="{ active: currentLanguage === lang.name }"
              @click="selectLanguage(lang)">
              <img
                v-if="lang.iconPath"
                :src="lang.iconPath"
                :alt="`Icono ${lang.name}`"
                class="lang-icon-img">
              <span v-else class="lang-icon">💻</span>
              <span class="lang-name">{{ lang.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <div class="progress-section">
      <h1>{{ t('levelsRouteTitle').replace('{language}', currentLanguage) }}</h1>
      <div class="progress-stats">
        <div class="stat">
          <span class="stat-label">{{ t('currentLevel') }}</span>
          <span class="stat-value">{{ currentLevel }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">{{ t('languageXp') }}</span>
          <span class="stat-value">{{ currentLevelPoints }}xp</span>
        </div>
        <div class="stat">
          <span class="stat-label">{{ t('completed') }} ({{ currentLanguage }})</span>
          <span class="stat-value">{{ completedLevelsInCurrentLanguage }}/{{ totalLevels }}</span>
        </div>
      </div>
      <div class="top-progress">
        <div class="top-progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
    </div>

    <main class="map-area">
      <div class="path-wrapper">
        <div
          v-for="(level, idx) in displayLevels"
          :key="level.id"
          class="path-step"
          :class="getLaneClass(idx)">

          <button
            class="level-node"
            :class="{
              completed: completedLevels.includes(level.id),
              current: level.id === currentLevel,
              locked: isLevelLocked(level),
              exam: level.isExam
            }"
            :disabled="isLevelLocked(level)"
            @click="openLevel(level)">
            <div class="node-ring"></div>
            <template v-if="level.isExam">
              <div class="project-node-content">
                <div class="project-node-text">
                  <span class="project-node-title">{{ t('project') }}</span>
                  <span class="project-node-subtitle">{{ t('level') }} {{ level.id }}</span>
                </div>
                <div class="project-node-icon-wrap" aria-hidden="true">
                  <img src="/images/codificacion.png" alt="Proyecto" class="project-node-icon">
                </div>
              </div>
              <span v-if="completedLevels.includes(level.id)" class="project-check">✓</span>
            </template>
            <template v-else>
              <span v-if="completedLevels.includes(level.id)" class="node-icon">✓</span>
              <span v-else class="node-text">{{ level.id }}</span>
            </template>
            <span v-if="isLevelLocked(level)" class="lock-icon">🔒</span>
          </button>

          <div class="step-info">
            <p class="step-title">{{ getLocalizedLevelTitle(level) }}</p>
            <p class="step-subtitle">
              <span v-if="level.isExam">{{ t('project') }}</span>
              <span v-else>{{ t('level') }} {{ level.id }}</span>
              · {{ pointsPerLevel }} xp
            </p>
          </div>

          <div v-if="idx < displayLevels.length - 1" class="step-connector" :class="getConnectorClass(level.id)">
            <div class="connector-line"></div>
            <span v-if="currentLevel === level.id + 1" class="connector-tag">{{ t('youAreOnLevel') }} {{ currentLevel }}</span>
          </div>
        </div>
      </div>
    </main>

    <!-- FULL SCREEN LEVEL VIEW -->
    <transition name="fade">
      <div v-if="showLevelModal && selectedLevel" class="level-fullscreen">

        <!-- Header with back button -->
        <div class="level-header">
          <button class="back-button" @click="closeLevel">← {{ t('back') }}</button>
          <div class="header-info">
            <h2>{{ selectedLevel.isExam ? t('project') : t('level') }} {{ selectedLevel.id }} - {{ t('test') }} {{ currentTestNumber }}/{{ currentLevelTotalTests }}</h2>
            <p>{{ getLocalizedLevelTitle(selectedLevel) }}</p>
          </div>
          <span class="difficulty-badge" :class="selectedLevel.difficulty">
            {{ selectedLevel.difficulty.toUpperCase() }}
          </span>
        </div>

        <!-- Progress indicator for tests -->
        <div class="test-progress-bar">
          <div 
            v-for="testNum in currentLevelTotalTests" 
            :key="testNum"
            class="test-indicator"
            :class="{ 
              active: testNum === currentTestNumber,
              completed: levelTestsCompleted[selectedLevel.id] && levelTestsCompleted[selectedLevel.id].has(testNum)
            }">
            <span class="test-number">{{ testNum }}</span>
          </div>
        </div>

        <!-- Main content: Left (Instructions) | Right (Activity) -->
        <div class="level-content">

          <!-- LEFT PANEL -->
          <div class="left-panel">
            <div class="panel-content">
              <div v-if="currentTheoryPoints.length > 0" class="theory-content">
                <h3>{{ getLocalizedLevelTitle(selectedLevel) }}</h3>
                <ul class="theory-list">
                  <li v-for="(point, pointIdx) in currentTheoryPoints" :key="pointIdx">
                    {{ point }}
                  </li>
                </ul>
              </div>

              <div class="practice-content">
                <h3>{{ t('example') }}</h3>
                <div class="code-display">
                  <pre><code>{{ displayedExampleCode }}</code></pre>
                </div>
              </div>

              <div class="practice-content">
                <h3>{{ t('statement') }}</h3>
                <p class="practice-task">{{ practiceInstruction }}</p>
                <div v-if="practiceExample.image" class="goal-image-wrapper">
                  <img :src="practiceExample.image" :alt="practiceExample.alt" class="goal-image">
                  <p class="goal-caption">{{ practiceExample.caption }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT PANEL -->
          <div class="right-panel">

            <!-- Theory Quiz Section -->
            <div v-if="levelMode === 'theory_test' && levelQuiz.length > 0" class="quiz-section">

              <!-- Multiple Choice Options -->
              <div v-if="getQuestionType() === 'multiple_choice'" class="quiz-options">
                <div class="quiz-progress">{{ t('question') }} {{ currentQuizIndex + 1 }} {{ t('of') }} {{ levelQuiz.length }}</div>
                <h3>{{ localizeDynamicText(currentQuestion.question) }}</h3>
                <button
                  v-for="(option, optionIdx) in currentQuestionOptions"
                  :key="optionIdx"
                  class="option-button"
                  :class="{
                    selected: quizAnswers[currentQuizIndex] === optionIdx,
                    incorrect: errorMessage && quizAnswers[currentQuizIndex] === optionIdx && !checkAnswerCorrect()
                  }"
                  @click="answerQuestion(optionIdx)">
                  {{ String.fromCharCode(65 + optionIdx) }}. {{ localizeDynamicText(option) }}
                </button>
              </div>

              <!-- True/False Options -->
              <div v-else-if="getQuestionType() === 'true_false'" class="quiz-options">
                <div class="quiz-progress">{{ t('question') }} {{ currentQuizIndex + 1 }} {{ t('of') }} {{ levelQuiz.length }}</div>
                <h3>{{ localizeDynamicText(currentQuestion.question) }}</h3>
                <button
                  class="option-button"
                  :class="{ selected: quizAnswers[currentQuizIndex] === true }"
                  @click="answerQuestion(true)">✓ {{ t('trueLabel') }}</button>
                <button
                  class="option-button"
                  :class="{ selected: quizAnswers[currentQuizIndex] === false }"
                  @click="answerQuestion(false)">✗ {{ t('falseLabel') }}</button>
              </div>

              <!-- Error Message -->
              <div v-if="errorMessage" class="error-message">
                ⚠️ {{ errorMessage }}
              </div>

              <!-- Navigation Buttons -->
              <div class="quiz-navigation">
                <button class="nav-button" :disabled="currentQuizIndex === 0" @click="previousQuestion">← {{ t('previous') }}</button>
                <button
                  class="nav-button"
                  @click="nextQuestion">
                  {{ currentQuizIndex === levelQuiz.length - 1 ? (isLastTestOfLevel ? t('completeLevel') : t('completeTest') + ' ' + currentTestNumber + '/' + currentLevelTotalTests) : t('next') + ' →' }}
                </button>
              </div>
            </div>

            <!-- Fill Blanks Section -->
            <div v-else-if="levelMode === 'fill_blanks'" class="quiz-section">
              <h3 class="fill-title">{{ t('completeCodeBlanks') }}</h3>
              <div v-if="!(selectedLevel?.id === 1 && (currentTestNumber === 2 || currentTestNumber === 3 || currentTestNumber === 4))" class="fill-preview">
                <p class="fill-preview-title">{{ t('baseCodeToComplete') }}</p>
                <pre><code>{{ fillBlanksExercise.preview }}</code></pre>
              </div>
              <div class="fill-template">
                <template v-for="(segment, segIdx) in fillBlanksExercise.segments" :key="segIdx">
                  <span>{{ segment }}</span>
                  <button
                    v-if="segIdx < fillBlanksExercise.answers.length"
                    class="fill-slot"
                    :class="{ active: activeFillBlankIndex === segIdx, filled: Boolean(fillAnswers[segIdx]) }"
                    @click="setActiveFillBlank(segIdx)">
                    {{ fillAnswers[segIdx] || `${t('blank')} ${segIdx + 1}` }}
                  </button>
                </template>
              </div>

              <div class="fill-pieces">
                <p class="pieces-title">{{ t('pieces') }}</p>
                <div class="pieces-list">
                  <button
                    v-for="piece in fillPiecePool"
                    :key="piece.id"
                    class="piece-button"
                    @click="placeFillPiece(piece.id)">
                    {{ piece.value }}
                  </button>
                </div>
                <button
                  class="clear-slot-button"
                  :disabled="!fillAnswers[activeFillBlankIndex]"
                  @click="clearActiveFillBlank">
                  {{ t('clearActiveBlank') }}
                </button>
              </div>

              <div v-if="errorMessage" class="error-message">
                ⚠️ {{ errorMessage }}
              </div>

              <button class="nav-button single-action" @click="completeFillBlanksLevel">{{ isLastTestOfLevel ? t('completeLevel') : t('nextTest') + ' (' + currentTestNumber + '/' + currentLevelTotalTests + ')' }}</button>
            </div>

            <!-- Coding Practice Section -->
            <div v-else class="editor-section">
              <div class="terminal-card">
                <div class="terminal-topbar">
                  <span>{{ currentLanguage === 'HTML' ? 'editor@coding404' : 'terminal@coding404' }}</span>
                  <span>{{ currentLanguage.toLowerCase() }}</span>
                </div>
                <div class="terminal-body">
                  <div class="terminal-line">$ {{ t('objective') }}: {{ practiceInstruction }}</div>
                  <div
                    v-for="(line, idx) in terminalOutput"
                    :key="`terminal-${idx}`"
                    class="terminal-line">
                    {{ line }}
                  </div>
                  <!-- Project Tabs Picker -->
                  <div v-if="selectedLevel?.isProject && selectedLevel?.projectTabs" class="project-tabs" style="display: flex; gap: 4px; border-bottom: 2px solid #555; margin-bottom: 10px;">
                    <button 
                      v-for="tab in selectedLevel.projectTabs" 
                      :key="tab"
                      @click="activeProjectTab = tab"
                      :style="{
                        background: activeProjectTab === tab ? '#15b870' : 'transparent',
                        color: activeProjectTab === tab ? '#fff' : '#aaa',
                        border: 'none',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        borderRadius: '4px 4px 0 0',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }"
                    >
                      {{ tab === 'HTML' ? 'index.html' : tab === 'CSS' ? 'styles.css' : 'script.js' }}
                    </button>
                  </div>

                  <label class="terminal-label">
                    $ {{ currentLanguage === 'HTML' ? (uiLanguage === 'en' ? 'Write your HTML' : 'Escribe tu HTML') : t('writeYourSolution') }}
                  </label>
                  <textarea
                    v-model="currentEditorCode"
                    class="terminal-input"
                    :placeholder="`${currentLanguage === 'HTML' ? (uiLanguage === 'en' ? 'Write your HTML here' : 'Escribe tu HTML aquí') : t('writeYourCodeHere')} ${selectedLevel?.isProject ? activeProjectTab : currentLanguage}...`"
                  ></textarea>
                </div>
              </div>

              <!-- Checklist del ejercicio deshabilitado por solicitud del usuario -->
              <!-- <div v-if="codingChecklist.length > 0" class="requirements-card">
                <p class="requirements-title">Checklist del ejercicio</p>
                <ul class="requirements-list">
                  <li
                    v-for="item in codingChecklist"
                    :key="item.key"
                    :class="{ met: item.met }">
                    <span class="req-icon">{{ item.met ? '✅' : '❌' }}</span>
                    <span>{{ item.label }}</span>
                  </li>
                </ul>
              </div> -->

              <div v-if="['HTML', 'CSS', 'JavaScript', 'Vue'].includes(currentLanguage) && (currentLanguage !== 'HTML' || showHtmlPreview) && !(selectedLevel?.id === 1 && (currentTestNumber === 2 || currentTestNumber === 3 || currentTestNumber === 4))" class="preview-card">
                <div class="preview-topbar">
                  <span>{{ t('browser') }}</span>
                  <span>{{ t('preview') }}</span>
                </div>
                <div class="preview-body">
                  <iframe 
                    :srcdoc="previewHtml" 
                    sandbox="allow-scripts"
                    class="html-preview-frame">
                  </iframe>
                </div>
              </div>

              <div v-if="errorMessage" class="error-message">
                ⚠️ {{ errorMessage }}
              </div>

              <button
                v-if="currentLanguage === 'HTML'"
                class="run-button"
                @click="showPreviewInBrowser">
                ▶ {{ uiLanguage === 'en' ? 'View in browser' : 'Ver en navegador' }}
              </button>
              <button v-else class="run-button" @click="executeCode">▶ {{ t('runInTerminal') }}</button>
              <button class="nav-button single-action" @click="completeCodingLevel">
                <template v-if="levelMode === 'exam_practice'">
                  {{ isLastTestOfLevel ? t('validateAndCompleteExam') : t('validateAndNextTest') }}
                </template>
                <template v-else>
                  {{ isLastTestOfLevel ? t('completeLevel') : t('nextTest') + ' (' + currentTestNumber + '/' + currentLevelTotalTests + ')' }}
                </template>
              </button>
            </div>

          </div>

        </div>
      </div>
    </transition>

    <nav class="bottom-nav">
      <button class="nav-item" :class="{ active: activeSection === 'inicio' }" @click="handleNavigateSection('inicio')" :title="t('home')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      </button>

      <button class="nav-item" :class="{ active: activeSection === 'comunidad' }" @click="handleNavigateSection('comunidad')" :title="t('community')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      </button>

      <button class="nav-item" :class="{ active: activeSection === 'clasificacion' }" @click="handleNavigateSection('clasificacion')" :title="t('ranking')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 3H8v2H5v3c0 2.97 2.16 5.43 5 5.91V17H7v2h10v-2h-3v-3.09c2.84-.48 5-2.94 5-5.91V5h-3V3zm-9 5V7h1v4.82C7.16 11.4 7 9.54 7 8zm10 0c0 1.54-.16 3.4-1 3.82V7h1v1z" />
        </svg>
      </button>

      <button class="nav-item" :class="{ active: activeSection === 'lecciones' }" @click="handleNavigateSection('lecciones')" :title="t('lessons')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 4.5C5 3.67 5.67 3 6.5 3H18v14H7c-.55 0-1 .45-1 1s.45 1 1 1h11v2H7c-1.66 0-3-1.34-3-3V4.5z" />
          <path d="M14.06 8.19l1.75 1.75-4.93 4.94H9.13v-1.75l4.93-4.94zm2.47-.72l.94-.94a1 1 0 011.41 0l.59.59a1 1 0 010 1.41l-.94.94-2-2z" />
        </svg>
      </button>

      <button class="nav-item" :class="{ active: activeSection === 'perfil', 'has-alert': pendingRequestsCount > 0 }" @click="handleNavigateSection('perfil')" :title="t('profile')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
        <span v-if="pendingRequestsCount > 0" class="menu-alert-badge">{{ pendingRequestsCount > 9 ? '9+' : pendingRequestsCount }}</span>
      </button>
    </nav>
  </div>
</template>

<script>
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import { API_BASE_URL } from '../config/api'
import htmlLocalData from '../data/languages/html.json'
import { cssData, javascriptData, vueData, sqlData, pythonData, javaData, phpData, nodeData } from '../data/languages/courses'

export default {
  name: 'Inicio',
  components: {
    VueMonacoEditor
  },
  props: {
    activeSection: {
      type: String,
      default: 'inicio'
    },
    user: {
      type: Object,
      default: null
    },
    pendingRequestsCount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      currentLanguage: 'HTML',
      currentLanguageData: null,
      completedLevels: [],
      totalPoints: 0,
      selectedLevel: null,
      currentTestNumber: 1,
      levelTestsCompleted: {},
      currentQuizIndex: 0,
      quizAnswers: {},
      showLevelModal: false,
      showLanguageModal: false,
      apiBaseUrl: `${API_BASE_URL}/api/learning`,
      socialApiBaseUrl: `${API_BASE_URL}/api/social`,
      showStreakCalendar: false,
      showUiLanguageMenu: false,
      uiLanguage: 'es',
      streakDays: 0,
      maxStreakDays: 0,
      canRestoreStreak: false,
      calendarDays: [],
      lastHydratedUserId: '',
      selectedLearningPath: 'all',
      learningPaths: [
        { id: 'all', name: 'Todos' },
        { id: 'frontend', name: 'Front-end' },
        { id: 'backend', name: 'Back-end' },
        { id: 'fullstack', name: 'Full-stack' },
        { id: 'data', name: 'Datos' }
      ],
      languages: [
        { id: 1, name: 'HTML', file: 'html', iconPath: '/images/html-removebg-preview.png', tracks: ['frontend', 'fullstack'] },
        { id: 2, name: 'CSS', file: 'css', iconPath: '/images/css-removebg-preview.png', tracks: ['frontend', 'fullstack'] },
        { id: 3, name: 'JavaScript', file: 'javascript', iconPath: '/images/javaScript-removebg-preview.png', tracks: ['frontend', 'fullstack'] },
        { id: 4, name: 'Vue', file: 'vue', iconPath: '/images/vue-removebg-preview.png', tracks: ['frontend', 'fullstack'] },
        { id: 5, name: 'Java', file: 'java', iconPath: '/images/java-removebg-preview.png', tracks: ['backend', 'fullstack'] },
        { id: 6, name: 'PHP', file: 'php', iconPath: '/images/php-icon.svg', tracks: ['backend'] },
        { id: 7, name: 'Python', file: 'python', iconPath: '/images/python-removebg-preview.png', tracks: ['backend', 'data'] },
        { id: 8, name: 'MySQL', file: 'mysql', iconPath: '/images/sql-removebg-preview.png', tracks: ['backend', 'fullstack', 'data'] }
      ],
      errorMessage: '',
      pointsPerLevel: 2,
      quizAttempts: {},
      editorCode: '',
      projectFiles: {
        HTML: '',
        CSS: '',
        JavaScript: ''
      },
      activeProjectTab: 'HTML',
      fillAnswers: {},
      fillPiecePool: [],
      activeFillBlankIndex: 0,
      showHtmlPreview: false,
      terminalOutput: [],
      questionPresentationCache: {},
      generatedTestsCache: {},
      languageRequestId: 0,
      progressRequestId: 0,
      monacoOptions: {
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: 'on',
        wordWrap: 'on',
        tabSize: 2,
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        autoIndent: 'full',
        tabCompletion: 'on',
        snippetSuggestions: 'top',
        acceptSuggestionOnEnter: 'on',
        suggestOnTriggerCharacters: true,
        quickSuggestions: {
          other: true,
          comments: false,
          strings: true
        },
        suggest: {
          showSnippets: true,
          preview: true
        }
      }
    }
  },
  computed: {
    displayLevels() {
      const remoteLevels = Array.isArray(this.currentLanguageData?.levels)
        ? this.currentLanguageData.levels
        : []

      if (remoteLevels.length > 0) {
        return remoteLevels
      }

      const localFallback = this.getLocalCurriculumFallback(this.currentLanguage)
      return Array.isArray(localFallback?.levels) ? localFallback.levels : []
    },
    totalLevels() {
      return this.displayLevels.length || 30
    },
    completedLevelsInCurrentLanguage() {
      const languageLevels = this.displayLevels.map((level) => Number(level.id))
      const languageLevelSet = new Set(languageLevels)
      return this.completedLevels.filter((levelId) => languageLevelSet.has(Number(levelId))).length
    },
    currentLevelPoints() {
      return this.completedLevelsInCurrentLanguage * this.pointsPerLevel
    },
    progressPercentage() {
      if (!this.totalLevels) return 0
      return (this.completedLevelsInCurrentLanguage / this.totalLevels) * 100
    },
    editorLanguageLabel() {
      return this.currentLanguage
    },
    currentEditorCode: {
      get() {
        return this.selectedLevel?.isProject 
          ? this.projectFiles[this.activeProjectTab] 
          : this.editorCode;
      },
      set(value) {
        if (this.selectedLevel?.isProject) {
          this.projectFiles[this.activeProjectTab] = value;
        } else {
          this.editorCode = value;
        }
      }
    },
    monacoLanguage() {
      if (this.selectedLevel?.isProject) {
        if (this.activeProjectTab === 'HTML') return 'html'
        if (this.activeProjectTab === 'CSS') return 'css'
        if (this.activeProjectTab === 'JavaScript') return 'javascript'
      }

      const monacoLanguageMap = {
        HTML: 'html',
        CSS: 'css',
        JavaScript: 'javascript',
        Vue: 'javascript',
        MySQL: 'sql',
        Python: 'python',
        Java: 'java',
        PHP: 'php'
      }

      return monacoLanguageMap[this.currentLanguage] || 'plaintext'
    },
    filteredLanguages() {
      if (this.selectedLearningPath === 'all') {
        return this.languages
      }

      return this.languages.filter((language) => {
        return Array.isArray(language.tracks) && language.tracks.includes(this.selectedLearningPath)
      })
    },
    currentLanguageConfig() {
      return this.languages.find((lang) => lang.name === this.currentLanguage) || null
    },
    calendarMonths() {
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      return monthNames.map((name, index) => ({
        month: index + 1,
        label: name,
        days: this.calendarDays.filter((day) => day.month === index + 1)
      }))
    },
    activeLevelTests() {
      if (!this.selectedLevel) return []
      const backendTests = Array.isArray(this.selectedLevel.tests) ? this.selectedLevel.tests : []
      if (backendTests.length > 0) return backendTests

      const cacheKey = `${this.currentLanguage}-${this.selectedLevel.id}`
      if (!this.generatedTestsCache[cacheKey]) {
        this.generatedTestsCache[cacheKey] = this.generateNineSectionTests(this.selectedLevel)
      }
      return this.generatedTestsCache[cacheKey]
    },
    currentTestData() {
      if (!this.selectedLevel) return null
      return this.activeLevelTests[this.currentTestNumber - 1] || null
    },
    currentLevelTotalTests() {
      if (!this.selectedLevel) return 9
      return this.activeLevelTests.length || 9
    },
    isLastTestOfLevel() {
      return this.currentTestNumber >= this.currentLevelTotalTests
    },
    levelMode() {
      if (!this.selectedLevel) return 'theory_test'
      if (this.selectedLevel.isExam) return 'exam_practice'

      // Usar tipo de prueba del array tests si existe
      if (this.currentTestData) {
        const currentTest = this.currentTestData
        if (currentTest.type === 'quiz') return 'theory_test'
        if (currentTest.type === 'fillBlanks') return 'fill_blanks'
        if (currentTest.type === 'code_practice') return 'code_practice'
      }
      
      // Fallback al comportamiento anterior
      const sequence = (this.selectedLevel.id - 1) % 3
      if (sequence === 0) return 'theory_test'
      if (sequence === 1) return 'fill_blanks'
      return 'code_practice'
    },
    levelQuiz() {
      if (!this.selectedLevel || this.levelMode !== 'theory_test') return []

      if (this.currentTestData?.quiz) {
        return [this.currentTestData.quiz]
      }

      return this.selectedLevel.quiz || []
    },
    currentQuestion() {
      if (this.levelQuiz.length > 0) {
        return this.levelQuiz[this.currentQuizIndex] || {}
      }
      return {}
    },
    currentQuestionOptions() {
      if (!this.currentQuestion?.options || this.getQuestionType() !== 'multiple_choice') return []
      const prepared = this.prepareQuestionPresentation(this.currentQuestion, this.currentQuizIndex)
      return prepared.options
    },
    currentTheoryPoints() {
      if (!this.selectedLevel) return []

      // Para nivel 1 fases 4 y 5 (quizzes), no mostrar puntos de teoría en la izquierda
      if (this.selectedLevel.id === 1 && (this.currentTestNumber === 4 || this.currentTestNumber === 5)) {
        return []
      }

      if (this.selectedLevel.id === 1 && Array.isArray(this.currentTestData?.theoryPoints)) {
        return this.currentTestData.theoryPoints.map((line) => this.localizeDynamicText(String(line)))
      }

      const baseTheory = Array.isArray(this.selectedLevel?.content?.theory) ? this.selectedLevel.content.theory : []
      const phaseTheory = Array.isArray(this.currentTestData?.theoryBoost) ? this.currentTestData.theoryBoost : []
      const progressiveCount = Math.max(2, Math.min(baseTheory.length, Math.ceil(this.currentTestNumber / 2) + 1))
      const selectedTheory = baseTheory.slice(0, progressiveCount)
      const practiceHint = this.practiceInstruction || this.localizeDynamicText(`Aplica el tema ${this.selectedLevel.name} en un ejemplo corto.`)
      const languageMistakes = {
        HTML: 'Error común: usar etiquetas sin cerrar o estructura semántica incorrecta.',
        CSS: 'Error común: usar estilos sin pensar en cascada y especificidad.',
        JavaScript: 'Error común: confundir comparación (===) con asignación (=).',
        Vue: 'Error común: mezclar estado reactivo sin separar lógica de vista.',
        Python: 'Error común: fallar en la indentación o tipos en entrada de datos.',
        Java: 'Error común: errores de sintaxis por mayúsculas/minúsculas y tipos.',
        MySQL: 'Error común: ejecutar UPDATE/DELETE sin WHERE.',
        PHP: 'Error común: no validar entrada del usuario antes de mostrarla.'
      }

      const pedagogicBlocks = [
        `Objetivo de la fase ${this.currentTestNumber}/${this.currentLevelTotalTests}: dominar ${this.getShortLevelTitle(this.selectedLevel)} paso a paso.`,
        `Cómo aplicarlo ahora: ${practiceHint}`,
        languageMistakes[this.currentLanguage] || 'Error común: saltar la práctica sin comprobar el resultado final.',
        'Checklist mental: entiende el concepto, identifícalo en el ejemplo y aplícalo en tu respuesta.'
      ]

      return [...new Set([...selectedTheory, ...phaseTheory, ...pedagogicBlocks])].map((line) => this.localizeDynamicText(line))
    },
    fillBlanksExercise() {
      const fallbackPreview = this.selectedLevel?.content?.example || 'Ejemplo base:\n<div class="card">\n  <p>Contenido</p>\n</div>'
      const fallback = {
        instruction: 'Completa los huecos para reconstruir el código.',
        preview: fallbackPreview,
        segments: ['Código de referencia:\n' + fallbackPreview + '\n\nHueco 1: ', '\nHueco 2: ', ''],
        answers: this.currentLanguage === 'HTML' ? ['<h1>', '<p>'] : ['select', 'from'],
        optionPool: this.currentLanguage === 'HTML'
          ? ['<h1>', '<p>', '<div>', '<span>', '<a>', '<ul>']
          : this.getLanguageBaseOptionPool()
      }

      if (!this.selectedLevel) return this.normalizeFillExercise(fallback)

      if (this.currentTestData?.fillBlanks) {
        return this.normalizeFillExercise(this.currentTestData.fillBlanks)
      }

      if (this.selectedLevel.fillBlanks) {
        return this.normalizeFillExercise(this.selectedLevel.fillBlanks)
      }

      const customFillExercises = {
        2: {
          instruction: 'Rellena los huecos para completar la estructura básica de HTML.',
          preview: '<!DOCTYPE html>\n<html lang="es">\n<head>\n  <meta charset="UTF-8">\n  <title>Mi Página</title>\n</head>\n<body>\n  <!-- Contenido aquí -->\n</body>\n</html>',
          segments: [
            '<!DOCTYPE html>\n',
            ' lang="es">\n<head>\n  <meta charset="UTF-8">\n  <title>Mi Página</title>\n</head>\n',
            '\n  <!-- Contenido aquí -->\n</body>\n</html>'
          ],
          answers: ['<html>', '<body>'],
          optionPool: ['<html>', '<body>', '<head>', '<main>', '<section>', '<div>']
        },
        5: {
          instruction: 'Completa etiquetas de formato de texto según el ejemplo.',
          preview: '<p><strong>Importante</strong> y <em>énfasis</em></p>',
          segments: [
            '<p>',
            'Importante</strong> y ',
            'énfasis</em></p>'
          ],
          answers: ['<strong>', '<em>'],
          optionPool: ['<strong>', '<em>', '<b>', '<i>', '<mark>', '<small>']
        },
        8: {
          instruction: 'Selecciona las etiquetas correctas para construir una lista ordenada.',
          preview: '<ol>\n  <li>Primero</li>\n  <li>Segundo</li>\n</ol>',
          segments: [
            '',
            '\n  <li>Primero</li>\n  <li>Segundo</li>\n',
            ''
          ],
          answers: ['<ol>', '</ol>'],
          optionPool: ['<ol>', '</ol>', '<ul>', '</ul>', '<li>', '</li>']
        },
        11: {
          instruction: 'Completa los contenedores correctos para agrupar contenido.',
          preview: '<div class="contenedor">Contenido</div>\n<p>Texto con <span class="destacado">detalle</span></p>',
          segments: [
            '',
            ' class="contenedor">Contenido</div>\n<p>Texto con ',
            ' class="destacado">detalle</span></p>'
          ],
          answers: ['<div>', '<span>'],
          optionPool: ['<div>', '<span>', '<section>', '<article>', '<p>', '<a>']
        },
        14: {
          instruction: 'Selecciona las etiquetas correctas para inputs HTML5.',
          preview: '<input type="text" placeholder="Nombre">\n<input type="email" placeholder="Email">',
          segments: [
            '',
            ' type="text" placeholder="Nombre">\n',
            ' type="email" placeholder="Email">'
          ],
          answers: ['<input>', '<input>'],
          optionPool: ['<input>', '<label>', '<form>', '<textarea>', '<select>']
        },
        17: {
          instruction: 'Completa las etiquetas del head para metadatos.',
          preview: '<meta charset="UTF-8">\n<title>Mi sitio</title>',
          segments: [
            '',
            ' charset="UTF-8">\n',
            'Mi sitio</title>'
          ],
          answers: ['<meta>', '<title>'],
          optionPool: ['<meta>', '<title>', '<link>', '<script>', '<style>', '<head>']
        },
        22: {
          instruction: 'Completa las etiquetas del ejemplo de data attributes.',
          preview: '<button data-action="delete" data-id="123">Eliminar</button>\n<div data-role="card">Tarjeta</div>',
          segments: [
            '',
            ' data-action="delete" data-id="123">Eliminar</button>\n',
            ' data-role="card">Tarjeta</div>'
          ],
          answers: ['<button>', '<div>'],
          optionPool: ['<button>', '<div>', '<span>', '<section>', '<a>', '<input>']
        },
        23: {
          instruction: 'Completa etiquetas HTML usadas para conectar con Web APIs.',
          preview: '<button id="geo">Obtener ubicación</button>\n<div id="salida"></div>',
          segments: [
            '',
            ' id="geo">Obtener ubicación</button>\n',
            ' id="salida"></div>'
          ],
          answers: ['<button>', '<div>'],
          optionPool: ['<button>', '<div>', '<span>', '<section>', '<input>', '<article>']
        },
        26: {
          instruction: 'Completa etiquetas para mostrar emojis y caracteres especiales.',
          preview: '<h1>Bienvenido 😄</h1>\n<p>Símbolos: &copy; &hearts;</p>',
          segments: [
            '',
            'Bienvenido 😄</h1>\n',
            'Símbolos: &copy; &hearts;</p>'
          ],
          answers: ['<h1>', '<p>'],
          optionPool: ['<h1>', '<p>', '<div>', '<span>', '<small>', '<strong>']
        },
        29: {
          instruction: 'Completa estructura moderna con etiquetas semánticas.',
          preview: '<section class="card">\n  <article>Contenido destacado</article>\n</section>',
          segments: [
            '',
            ' class="card">\n  <article>Contenido destacado</article>\n',
            ''
          ],
          answers: ['<section>', '</section>'],
          optionPool: ['<section>', '</section>', '<article>', '</article>', '<div>', '</div>']
        }
      }

      if (this.currentLanguage === 'HTML' && customFillExercises[this.selectedLevel.id]) {
        return this.normalizeFillExercise(customFillExercises[this.selectedLevel.id])
      }

      const example = this.selectedLevel.content?.example || ''
      const openingTagMatches = [...example.matchAll(/<([a-z][a-z0-9]*)\b[^>]*>/gi)]
        .map(match => ({
          fullTag: match[0],
          normalizedTag: `<${match[1]}>`
        }))
        .filter(match => !['<html>', '<head>', '<body>', '<script>'].includes(match.normalizedTag))

      const selectedTags = openingTagMatches.slice(0, 2)

      if (selectedTags.length < 2) {
        return this.normalizeFillExercise(fallback)
      }

      let workingExample = example
      const placeholders = selectedTags.map((_, index) => `__BLANK_${index}__`)

      selectedTags.forEach((tagMatch, index) => {
        workingExample = workingExample.replace(tagMatch.fullTag, placeholders[index])
      })

      const segments = workingExample.split(/__BLANK_\d+__/)

      return this.normalizeFillExercise({
        instruction: `Completa los huecos usando etiquetas del tema: ${this.selectedLevel.name}.`,
        preview: example,
        segments,
        answers: selectedTags.map((tagMatch) => tagMatch.normalizedTag),
        optionPool: selectedTags.map((tagMatch) => tagMatch.normalizedTag)
      })
    },
    fillBlanksOptions() {
      if (this.levelMode !== 'fill_blanks') return []

      const basePool = this.getLanguageBaseOptionPool()

      const answerPool = this.fillBlanksExercise.answers || []
      const levelPool = this.fillBlanksExercise.optionPool || []
      const allOptions = [...new Set([...answerPool, ...levelPool, ...basePool])]
      const usedDistractors = new Set()
      const levelSeed = this.selectedLevel?.id || 0

      const scoreFromText = (text) => {
        let hash = levelSeed * 131
        for (let index = 0; index < text.length; index++) {
          hash = (hash * 31 + text.charCodeAt(index)) % 1000000007
        }
        return hash
      }

      const stableShuffle = (items, salt) => {
        return [...items]
          .map((item) => ({ item, score: scoreFromText(`${salt}-${item}`) }))
          .sort((first, second) => first.score - second.score)
          .map((entry) => entry.item)
      }

      return answerPool.map((answer, blankIndex) => {
        const possibleDistractors = stableShuffle(
          allOptions.filter((option) => option !== answer),
          `distractor-${blankIndex}`
        )

        const uniqueDistractors = possibleDistractors
          .filter((option) => !usedDistractors.has(option))
          .slice(0, 4)

        if (uniqueDistractors.length < 4) {
          const remaining = possibleDistractors.filter((option) => !uniqueDistractors.includes(option))
          uniqueDistractors.push(...remaining.slice(0, 4 - uniqueDistractors.length))
        }

        uniqueDistractors.forEach((option) => usedDistractors.add(option))

        return stableShuffle([answer, ...uniqueDistractors], `final-${blankIndex}`)
      })
    },
    practiceExample() {
      if (!this.selectedLevel) {
        return {
          instruction: '',
          image: '',
          alt: '',
          caption: ''
        }
      }

      if (this.levelMode !== 'code_practice' && this.levelMode !== 'exam_practice') {
        return {
          instruction: `Aplica los conceptos de ${this.selectedLevel.name} en la actividad de este nivel.`,
          image: '',
          alt: '',
          caption: ''
        }
      }

      const config = this.getCodePracticeConfig(this.selectedLevel)
      const projectImage = this.selectedLevel.image
      return {
        instruction: config.instruction,
        image: projectImage ? projectImage : this.buildPracticeImageDataUri(this.selectedLevel.name, config.goalLines),
        alt: `Objetivo visual para ${this.selectedLevel.name}`,
        caption: projectImage ? `Diseño sugerido para el proyecto` : `Resultado esperado: ${config.instruction}`
      }
    },
    practiceRequirements() {
      if (!this.selectedLevel) return []
      if (this.levelMode !== 'code_practice' && this.levelMode !== 'exam_practice') return []

      const config = this.getCodePracticeConfig(this.selectedLevel)
      if (config.requirements.length > 0) {
        return config.requirements
      }

      const example = (this.selectedLevel.content?.example || '').toLowerCase()
      const matches = [...example.matchAll(/<([a-z][a-z0-9]*)\b/gi)].map(match => `<${match[1]}>`)
      return [...new Set(matches)].slice(0, 3)
    },
    practiceInstruction() {
      if (!this.selectedLevel) return ''
      if (this.levelMode === 'theory_test') {
        return this.uiLanguage === 'en'
          ? 'Answer the test correctly to apply the theory and complete the level.'
          : 'Responde correctamente el test para aplicar la teoría y completar el nivel.'
      }
      if (this.levelMode === 'fill_blanks') {
        return this.localizeDynamicText(this.fillBlanksExercise.instruction)
      }
      return this.localizeDynamicText(this.practiceExample.instruction)
    },
    displayedExampleCode() {
      if (!this.selectedLevel) return ''

      const directExample = this.selectedLevel?.content?.example
      if (directExample && directExample.trim().length > 0) {
        return directExample
      }

      if (this.levelMode === 'code_practice' || this.levelMode === 'exam_practice') {
        const config = this.getCodePracticeConfig(this.selectedLevel)
        if (config?.goalLines?.length) {
          return config.goalLines.join('\n')
        }
      }

      return this.fillBlanksExercise.preview || ''
    },
    codingChecklist() {
      if (this.levelMode !== 'code_practice' && this.levelMode !== 'exam_practice') {
        return []
      }

      const codeToTest = this.selectedLevel?.isProject 
        ? `${this.projectFiles.HTML} ${this.projectFiles.CSS} ${this.projectFiles.JavaScript}`
        : (this.editorCode || '');

      return this.practiceRequirements.map((requirement) => ({
        key: requirement,
        label: this.getRequirementLabel(requirement),
        met: this.isRequirementMet(requirement, codeToTest)
      }))
    },
    previewHtml() {
      if (this.selectedLevel?.isProject) {
        const html = this.projectFiles.HTML || ''
        const css = this.projectFiles.CSS || ''
        const js = this.projectFiles.JavaScript || ''
        
        if (!html.trim() && !css.trim() && !js.trim()) {
           return this.uiLanguage === 'en'
             ? '<div style="color:#666;font-family:sans-serif;padding:20px;text-align:center;">Your project result will appear here...</div>'
             : '<div style="color:#666;font-family:sans-serif;padding:20px;text-align:center;">El resultado de tu proyecto aparecerá aquí...</div>';
        }

        const htmlSafe = html.replace(/<\/script>/g, '<\\/script>')
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <style>${css}</style>
            </head>
            <body>
              ${htmlSafe}
              <script>${js}<\/script>
            </body>
          </html>
        `;
      }

      const code = this.editorCode || '';
      if (!code.trim()) {
        return this.uiLanguage === 'en'
          ? '<div style="color:#666;font-family:sans-serif;padding:20px;text-align:center;">The result will appear here...</div>'
          : '<div style="color:#666;font-family:sans-serif;padding:20px;text-align:center;">El resultado aparecerá aquí...</div>'
      }
      
      if (this.currentLanguage === 'HTML') {
        return code;
      }
      
      if (this.currentLanguage === 'CSS') {
        return `<style>${code}<\/style><div style="font-family:sans-serif;padding:20px;">Elemento de prueba <div class="caja" id="caja">Aplica CSS aquí</div></div>`;
      }

      if (this.currentLanguage === 'JavaScript' || this.currentLanguage === 'Vue') {
        return `<div id="app" style="font-family:sans-serif;padding:20px;"></div><script>${code}<\/script>`;
      }

      return code;
    },
    currentLevel() {
      const maxLevel = this.totalLevels
      for (let level = 1; level <= maxLevel; level++) {
        if (!this.completedLevels.includes(level)) {
          return level
        }
      }
      return maxLevel
    }
  },
  watch: {
    user: {
      async handler(newUser, oldUser) {
        const newUserId = newUser?.userId || newUser?._id
        if (!newUserId) {
          this.lastHydratedUserId = ''
          this.streakDays = 0
          this.maxStreakDays = 0
          this.canRestoreStreak = false
          this.calendarDays = []
          return
        }

        const normalizedNewUserId = String(newUserId)
        const userChanged = normalizedNewUserId !== this.lastHydratedUserId

        if (userChanged) {
          this.lastHydratedUserId = normalizedNewUserId
          await this.registerDailyActivity()
        }

        const oldUserId = oldUser?.userId || oldUser?._id
        const programmerTypeChanged = Boolean(oldUser && newUser.programmerType !== oldUser.programmerType)

        if (userChanged || programmerTypeChanged) {
          this.initializeLanguageFromProgrammerType()
          await this.loadLanguage(this.currentLanguage)
          await this.loadProgress()
          await this.loadStreak()
        }
      },
      deep: true
    }
  },
  methods: {
    t(key) {
      const dictionary = {
        es: {
          viewStreak: 'Ver racha',
          changeUiLanguage: 'Cambiar idioma',
          streakCalendarTitle: 'Racha y calendario anual',
          connectedDays: 'Dias conectados',
          maxStreak: 'Maxima racha',
          restoreStreak: 'Restablecer racha (1 vez por semana)',
          selectLearningLanguage: 'Selecciona tu Lenguaje',
          currentLevel: 'Nivel actual',
          languageXp: 'EXP del lenguaje',
          completed: 'Completados',
          levelsRouteTitle: '{language} - Ruta de Niveles',
          project: 'Proyecto',
          level: 'Nivel',
          youAreOnLevel: 'Vas por nivel',
          back: 'Volver',
          test: 'Prueba',
          example: 'Ejemplo',
          statement: 'Enunciado',
          question: 'Pregunta',
          of: 'de',
          trueLabel: 'Verdadero',
          falseLabel: 'Falso',
          previous: 'Anterior',
          next: 'Siguiente',
          completeLevel: 'Completar Nivel',
          completeTest: 'Completar Prueba',
          completeCodeBlanks: 'Completa los huecos del código',
          baseCodeToComplete: 'Código base a completar',
          blank: 'Hueco',
          pieces: 'Piezas',
          clearActiveBlank: 'Limpiar hueco activo',
          nextTest: 'Siguiente Prueba',
          objective: 'objetivo',
          writeYourSolution: 'escribe tu solución',
          writeYourCodeHere: 'Escribe aquí tu código',
          browser: 'Navegador',
          preview: 'Vista Previa',
          runInTerminal: 'Ejecutar en terminal',
          validateAndCompleteExam: 'Validar y completar examen',
          validateAndNextTest: 'Validar y siguiente prueba',
          home: 'Inicio',
          community: 'Comunidad',
          ranking: 'Clasificación',
          lessons: 'Lecciones',
          profile: 'Perfil'
        },
        en: {
          viewStreak: 'View streak',
          changeUiLanguage: 'Change language',
          streakCalendarTitle: 'Streak and yearly calendar',
          connectedDays: 'Connected days',
          maxStreak: 'Best streak',
          restoreStreak: 'Restore streak (once per week)',
          selectLearningLanguage: 'Choose your language',
          currentLevel: 'Current level',
          languageXp: 'Language XP',
          completed: 'Completed',
          levelsRouteTitle: '{language} - Level Route',
          project: 'Project',
          level: 'Level',
          youAreOnLevel: 'You are on level',
          back: 'Back',
          test: 'Test',
          example: 'Example',
          statement: 'Statement',
          question: 'Question',
          of: 'of',
          trueLabel: 'True',
          falseLabel: 'False',
          previous: 'Previous',
          next: 'Next',
          completeLevel: 'Complete Level',
          completeTest: 'Complete Test',
          completeCodeBlanks: 'Complete the code blanks',
          baseCodeToComplete: 'Base code to complete',
          blank: 'Blank',
          pieces: 'Pieces',
          clearActiveBlank: 'Clear active blank',
          nextTest: 'Next Test',
          objective: 'objective',
          writeYourSolution: 'write your solution',
          writeYourCodeHere: 'Write your code here',
          browser: 'Browser',
          preview: 'Preview',
          runInTerminal: 'Run in terminal',
          validateAndCompleteExam: 'Validate and complete exam',
          validateAndNextTest: 'Validate and next test',
          home: 'Home',
          community: 'Community',
          ranking: 'Ranking',
          lessons: 'Lessons',
          profile: 'Profile'
        }
      }

      const langPack = dictionary[this.uiLanguage] || dictionary.es
      return langPack[key] || key
    },
    localizeDynamicText(text) {
      const source = String(text || '')
      if (this.uiLanguage !== 'en' || !source) return source

      const replacements = [
        [/\bfundamentos de\b/gi, 'fundamentals of'],
        [/\bintroducción a\b/gi, 'introduction to'],
        [/\bintroduccion a\b/gi, 'introduction to'],
        [/\bconceptos básicos de\b/gi, 'basic concepts of'],
        [/\bconceptos basicos de\b/gi, 'basic concepts of'],
        [/\bestilos con\b/gi, 'styling with'],
        [/\bmaquetación\b/gi, 'layout'],
        [/\bmaquetacion\b/gi, 'layout'],
        [/\bformularios\b/gi, 'forms'],
        [/\baccesibilidad\b/gi, 'accessibility'],
        [/\bestructura\b/gi, 'structure'],
        [/\bsemántica\b/gi, 'semantics'],
        [/\bsemantica\b/gi, 'semantics'],
        [/\betiquetas\b/gi, 'tags'],
        [/\bencabezados\b/gi, 'headings'],
        [/\bpárrafos\b/gi, 'paragraphs'],
        [/\bparrafos\b/gi, 'paragraphs'],
        [/\benlaces\b/gi, 'links'],
        [/\btablas\b/gi, 'tables'],
        [/\blistas\b/gi, 'lists'],
        [/\bnivel\b/gi, 'level'],
        [/\bproyecto\b/gi, 'project'],
        [/\bprueba\b/gi, 'test'],
        [/\bsiguiente\b/gi, 'next'],
        [/\banterior\b/gi, 'previous'],
        [/\bcompletar\b/gi, 'complete'],
        [/\benunciado\b/gi, 'statement'],
        [/\bejemplo\b/gi, 'example'],
        [/\bcódigo\b/gi, 'code'],
        [/\bcodigo\b/gi, 'code'],
        [/\bobjetivo\b/gi, 'objective'],
        [/\bfase\b/gi, 'phase'],
        [/\berror común\b/gi, 'common mistake'],
        [/\berror comun\b/gi, 'common mistake'],
        [/\berror frecuente\b/gi, 'common mistake'],
        [/\bchecklist mental\b/gi, 'mental checklist'],
        [/\brespuesta incorrecta\b/gi, 'incorrect answer'],
        [/\bintenta nuevamente\b/gi, 'try again']
      ]

      let localized = source
      replacements.forEach(([pattern, value]) => {
        localized = localized.replace(pattern, value)
      })

      return localized
    },
    getLocalizedLevelTitle(level) {
      return this.localizeDynamicText(this.getShortLevelTitle(level))
    },
    async setUiLanguage(languageCode) {
      this.uiLanguage = languageCode === 'en' ? 'en' : 'es'
      this.showUiLanguageMenu = false
      try {
        localStorage.setItem('inicio-ui-language', this.uiLanguage)
      } catch (error) {
        console.warn('No se pudo persistir el idioma de interfaz', error)
      }

      // Recarga el temario activo desde backend en el idioma seleccionado.
      await this.loadLanguage(this.currentLanguage)
      await this.loadProgress(this.currentLanguage)
    },
    getActiveUserId() {
      return this.user?.userId || this.user?._id || ''
    },
    getLanguageStorageKey() {
      const userId = this.getActiveUserId()
      return userId ? `inicio-current-language-${userId}` : ''
    },
    persistCurrentLanguageSelection(languageName) {
      const key = this.getLanguageStorageKey()
      if (!key || !languageName) return

      try {
        localStorage.setItem(key, String(languageName))
      } catch (error) {
        console.warn('No se pudo persistir el idioma seleccionado', error)
      }
    },
    restoreCurrentLanguageSelection() {
      const key = this.getLanguageStorageKey()
      if (!key) return false

      try {
        const storedLanguage = localStorage.getItem(key)
        if (!storedLanguage) return false

        const languageMeta = this.languages.find((language) => language.name === storedLanguage)
        if (!languageMeta) return false

        this.currentLanguage = storedLanguage
        if (Array.isArray(languageMeta.tracks) && languageMeta.tracks.length > 0) {
          this.selectedLearningPath = languageMeta.tracks[0]
        }

        return true
      } catch (error) {
        console.warn('No se pudo restaurar el idioma seleccionado', error)
        return false
      }
    },
    initializeLanguageFromProgrammerType() {
      if (!this.user?.programmerType) return

      if (this.restoreCurrentLanguageSelection()) {
        return
      }

      const programmerType = this.user.programmerType.trim();
      // Normalize programmer type
      const typeMap = {
        'Front-end': { language: 'HTML', path: 'frontend' },
        'Front-end Developer': { language: 'HTML', path: 'frontend' },
        'Developer Front-end': { language: 'HTML', path: 'frontend' },
        'Frontend': { language: 'HTML', path: 'frontend' },
        'Desarrollador Front-End': { language: 'HTML', path: 'frontend' },
        'Front-End Developer': { language: 'HTML', path: 'frontend' },
        'Back-end': { language: 'Java', path: 'backend' },
        'Back-end Developer': { language: 'Java', path: 'backend' },
        'Developer Back-end': { language: 'Java', path: 'backend' },
        'Backend': { language: 'Java', path: 'backend' },
        'Desarrollador Back-End': { language: 'Java', path: 'backend' },
        'Back-End Developer': { language: 'Java', path: 'backend' },
        'Full-Stack': { language: 'HTML', path: 'fullstack' },
        'Full-Stack Developer': { language: 'HTML', path: 'fullstack' },
        'FullStack': { language: 'HTML', path: 'fullstack' },
        'Desarrollador Full-Stack': { language: 'HTML', path: 'fullstack' },
        'Full-Stack': { language: 'HTML', path: 'fullstack' },
        'Bases de Datos': { language: 'MySQL', path: 'data' },
        'Base de Datos': { language: 'MySQL', path: 'data' },
        'Database': { language: 'MySQL', path: 'data' },
        'Data Specialist': { language: 'MySQL', path: 'data' },
        'Otros': { language: 'Python', path: 'data' },
        'Other': { language: 'Python', path: 'data' }
      }

      const mapping = typeMap[programmerType]
      if (mapping) {
        this.currentLanguage = mapping.language
        this.selectedLearningPath = mapping.path
        this.persistCurrentLanguageSelection(mapping.language)
        console.log(`Programmer type '${programmerType}' mapped to language '${mapping.language}'`)
      } else {
        console.warn(`Programmer type '${programmerType}' not found in typeMap. Using default (HTML).`)
      }
    },
    async selectLearningPath(pathId) {
      this.selectedLearningPath = pathId

      const visibleLanguages = this.filteredLanguages
      if (!visibleLanguages.some((language) => language.name === this.currentLanguage)) {
        const defaultLanguage = visibleLanguages[0]
        if (defaultLanguage) {
          this.currentLanguage = defaultLanguage.name
          this.persistCurrentLanguageSelection(defaultLanguage.name)
          this.selectedLevel = null
          await this.loadLanguage(defaultLanguage.name)
          await this.loadProgress(defaultLanguage.name)
        }
      }
    },
    getLanguageBaseOptionPool() {
      const optionPoolByLanguage = {
        HTML: ['<div>', '<span>', '<input>', '<label>', '<form>', '<select>', '<option>', '<p>', '<h1>', '<h2>', '<a>', '<table>', '<tr>', '<th>', '<td>', '<ul>', '<li>'],
        CSS: ['display', 'color', 'font-size', 'padding', 'margin', 'background', '@media', 'justify-content', 'align-items', 'grid-template-columns'],
        JavaScript: ['const', 'let', 'if', 'else', 'for', 'function', 'return', 'console.log', 'fetch', 'document.querySelector'],
        Vue: ['new Vue', 'v-if', 'v-for', 'v-bind', 'v-on', 'data()', 'methods', 'computed', 'mounted', 'watch'],
        MySQL: ['SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING', 'INSERT INTO', 'VALUES', 'JOIN', 'ON'],
        Python: ['print', 'input', 'if', 'else', 'for', 'def', 'return', 'import', 'with', 'try'],
        Java: ['public', 'class', 'static', 'void', 'int', 'String', 'if', 'for', 'return', 'System.out.println'],
        PHP: ['<?php', '?>', '$', 'echo', 'if', 'else', 'function', 'return', '$_POST', '$_SESSION']
      }

      return optionPoolByLanguage[this.currentLanguage] || ['codigo', 'variable', 'funcion']
    },
    normalizeFillExercise(exercise) {
      const normalized = {
        instruction: String(exercise?.instruction || 'Completa los huecos para reconstruir el código.'),
        preview: String(exercise?.preview || this.selectedLevel?.content?.example || '').trim(),
        segments: Array.isArray(exercise?.segments) ? exercise.segments.map((segment) => String(segment)) : [],
        answers: Array.isArray(exercise?.answers) ? exercise.answers.map((answer) => String(answer)) : [],
        optionPool: Array.isArray(exercise?.optionPool) ? exercise.optionPool.map((option) => String(option)) : []
      }

      if (!normalized.preview) {
        normalized.preview = 'Ejemplo base:\n// completa los huecos con las piezas correctas'
      }

      const expectedSegments = normalized.answers.length + 1
      const hasValidSegments = normalized.segments.length === expectedSegments && normalized.segments.some((segment) => segment.trim().length > 0)
      if (!hasValidSegments) {
        let working = normalized.preview

        normalized.answers.forEach((answer, index) => {
          const escapedAnswer = answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const tagPattern = answer.startsWith('<') && answer.endsWith('>')
            ? new RegExp(escapedAnswer.replace('>', '[^>]*>'), 'i')
            : new RegExp(`\\b${escapedAnswer}\\b`, 'i')
          working = working.replace(tagPattern, `__BLANK_${index}__`)
        })

        const generatedSegments = working.split(/__BLANK_\d+__/)
        if (generatedSegments.length === expectedSegments) {
          normalized.segments = generatedSegments
        } else {
          const fallbackSegments = ['Código de referencia:\n' + normalized.preview + '\n\nHueco 1: ']
          for (let index = 1; index < normalized.answers.length; index++) {
            fallbackSegments.push(`\nHueco ${index + 1}: `)
          }
          fallbackSegments.push('')
          normalized.segments = fallbackSegments
        }
      }

      normalized.optionPool = [...new Set([...normalized.answers, ...normalized.optionPool, ...this.getLanguageBaseOptionPool()])]
      return normalized
    },
    getBackendLanguage(languageName = this.currentLanguage) {
      const map = {
        MySQL: 'SQL'
      }

      return map[languageName] || languageName
    },
    getLocalCurriculumFallback(languageName = this.currentLanguage) {
      const backendLanguage = this.getBackendLanguage(languageName)
      const key = String(backendLanguage || '').toLowerCase()

      const localMap = {
        html: htmlLocalData,
        css: cssData,
        javascript: javascriptData,
        'node.js': nodeData,
        node: nodeData,
        sql: sqlData,
        python: pythonData,
        java: javaData,
        php: phpData,
        vue: vueData
      }

      const candidate = localMap[key]
      if (candidate?.levels?.length) {
        return {
          ...candidate,
          language: languageName,
          levels: candidate.levels.map((level, index) => ({
            ...level,
            id: Number(level.id || index + 1)
          }))
        }
      }

      return {
        language: languageName,
        description: `Ruta base de ${languageName}`,
        levels: Array.from({ length: 30 }, (_, index) => {
          const id = index + 1
          const isExam = id % 10 === 0
          return {
            id,
            name: `${languageName} · Nivel ${id}`,
            description: `Nivel ${id} de ${languageName}`,
            difficulty: id <= 10 ? 'fácil' : id <= 20 ? 'medio' : 'difícil',
            points: id <= 10 ? 75 : id <= 20 ? 100 : 125,
            isExam,
            content: {
              title: `${languageName} · Nivel ${id}`,
              theory: [`Introducción al nivel ${id} de ${languageName}.`, 'Aplica la teoría en una práctica corta.'],
              example: ''
            },
            tests: []
          }
        })
      }
    },
    getShortLevelTitle(level) {
      const rawName = String(level?.name || level?.content?.title || '').trim()
      if (!rawName) return `Nivel ${level?.id || ''}`.trim()
      return rawName
        .replace(/\s*\(Práctica\s*\d*\)\s*/gi, ' ')
        .replace(/\s·\sN\d+(?:\s·\sV\d+)?$/i, '')
        .trim()
    },
    async loadLanguage(languageName) {
      const requestId = ++this.languageRequestId

      try {
        console.log(`Loading language: ${languageName}`)
        const backendLanguage = this.getBackendLanguage(languageName)
        const encodedLanguage = encodeURIComponent(backendLanguage)
        const response = await fetch(`${this.apiBaseUrl}/curricula/${encodedLanguage}?lang=${this.uiLanguage}`)
        const data = await response.json()

        if (requestId !== this.languageRequestId) {
          return
        }

        if (!response.ok) {
          throw new Error(data?.message || `Error ${response.status} al cargar el temario`)
        }

        if (!data?.curriculum) {
          throw new Error('No se recibió temario válido del servidor')
        }

        if (!Array.isArray(data.curriculum.levels) || data.curriculum.levels.length === 0) {
          throw new Error('Temario recibido sin niveles')
        }

        this.currentLanguageData = {
          ...data.curriculum,
          language: languageName
        }
        console.log(`Language '${languageName}' loaded successfully. Levels: ${data.curriculum.levels?.length || 0}`)
      } catch (error) {
        if (requestId !== this.languageRequestId) {
          return
        }

        console.error(`Error loading language '${languageName}':`, error.message)
        const fallbackCurriculum = this.getLocalCurriculumFallback(languageName)
        this.currentLanguageData = fallbackCurriculum
        console.warn(`Fallback local curriculum loaded for '${languageName}'. Levels: ${fallbackCurriculum.levels?.length || 0}`)
      }
    },
    async handleNavigateSection(section) {
      console.log(`Navegando a sección: ${section}`)
      await this.saveProgress() // Guardar progreso ANTES de cambiar de sección
      this.$emit('change-section', section)
    },
    async selectLanguage(language) {
      await this.saveProgress() // Guardar progreso ANTES de cambiar de lenguaje
      this.currentLanguage = language.name
      this.persistCurrentLanguageSelection(language.name)
      this.selectedLevel = null
      console.log(`Switched to language: ${language.name}`)
      await this.loadLanguage(language.name)
      await this.loadProgress(language.name)
      this.showLanguageModal = false
    },
    isLevelLocked(level) {
      if (level.id === 1) return false
      return !this.completedLevels.includes(level.id - 1)
    },
    getCodePracticeConfig(level) {
      if (this.currentTestData?.practice) {
        return this.currentTestData.practice
      }

      if (level?.practice) {
        return level.practice
      }

      const levelConfigs = {
        3: {
          instruction: 'Crea un fondo HTML con 3 títulos: uno en h1, otro en h2 y otro en h3.',
          requirements: ['<h1', '<h2', '<h3'],
          goalLines: ['<h1>Título Principal</h1>', '<h2>Subtítulo</h2>', '<h3>Detalle</h3>']
        },
        6: {
          instruction: 'Crea 2 enlaces: uno externo con target="_blank" y otro interno con ancla (#).',
          requirements: ['<a', 'href=', 'target="_blank"', '#'],
          goalLines: ['<a href="https://..." target="_blank">Sitio</a>', '<a href="#contacto">Ir a contacto</a>']
        },
        9: {
          instruction: 'Crea una tabla con encabezados Nombre y Edad y al menos una fila de datos.',
          requirements: ['<table', '<tr', '<th', '<td'],
          goalLines: ['<table>', '<tr><th>Nombre</th><th>Edad</th></tr>', '<tr><td>Ana</td><td>22</td></tr>']
        },
        10: {
          instruction: 'Examen práctico: crea una mini página con h1, un párrafo, una lista, un enlace y una tabla simple.',
          requirements: ['<h1', '<p', '__list__', '<a', '<table'],
          goalLines: ['<h1>Mi Perfil</h1>', '<p>Descripción breve</p>', '<ul><li>Habilidad</li></ul>', '<a href="#">Contacto</a>', '<table><tr><th>Dato</th></tr><tr><td>Valor</td></tr></table>']
        },
        12: {
          instruction: 'Escribe un bloque con atributos id, class y title en un elemento HTML.',
          requirements: ['id=', 'class=', 'title='],
          goalLines: ['<div id="card" class="destacado" title="tarjeta">', 'Contenido', '</div>']
        },
        15: {
          instruction: 'Crea un selector con etiqueta select, dos opciones option y una etiqueta label.',
          requirements: ['<label', '<select', '<option'],
          goalLines: ['<label for="pais">País</label>', '<select id="pais">', '<option>España</option>']
        },
        18: {
          instruction: 'Inserta un video o audio con controles usando etiquetas multimedia HTML5.',
          requirements: ['controls', '<video', '<audio'],
          goalLines: ['<video controls>', '<source src="video.mp4" type="video/mp4">', '</video>']
        },
        20: {
          instruction: 'Examen práctico: crea una landing con estructura semántica, formulario y multimedia.',
          requirements: ['<header', '<main', '<section', '<form', '<input', '<video'],
          goalLines: ['<header>Título del proyecto</header>', '<main><section>Contenido principal</section></main>', '<form><input type="email" required></form>', '<video controls></video>']
        },
        21: {
          instruction: 'Crea una sección accesible con texto alternativo y atributos aria básicos.',
          requirements: ['alt=', 'aria-'],
          goalLines: ['<img src="foto.jpg" alt="Descripción clara">', '<button aria-label="Abrir menú">☰</button>']
        },
        24: {
          instruction: 'Crea un formulario con validación HTML5 usando required y un tipo de input válido.',
          requirements: ['<form', 'required', '<input'],
          goalLines: ['<form>', '<input type="email" required>', '<button>Enviar</button>']
        },
        27: {
          instruction: 'Escribe una estructura HTML semántica limpia con header, main y footer.',
          requirements: ['<header', '<main', '<footer'],
          goalLines: ['<header>Cabecera</header>', '<main>Contenido</main>', '<footer>Pie</footer>']
        },
        30: {
          instruction: 'Examen final práctico: construye una página completa accesible con navegación, contenido, formulario y pie.',
          requirements: ['<nav', '<main', '<section', '<form', 'required', 'alt=', '<footer'],
          goalLines: ['<nav><a href="#inicio">Inicio</a></nav>', '<main><section id="inicio">Contenido</section></main>', '<form><input required></form>', '<img src="foto.jpg" alt="Descripción">', '<footer>Contacto</footer>']
        }
      }

      return levelConfigs[level.id] || {
        instruction: `Escribe código ${this.currentLanguage} aplicando el tema: ${level.name}.`,
        requirements: [],
        goalLines: ['Código limpio', 'Usa conceptos del tema', 'Resultado visible']
      }
    },
    getLanguageLearningResources() {
      const resources = {
        HTML: [
          'MDN HTML para semántica y estructura.',
          'web.dev Learn HTML para práctica guiada.',
          'freeCodeCamp Responsive Web Design con proyectos.'
        ],
        CSS: [
          'MDN CSS Reference para propiedades clave.',
          'Flexbox Froggy y Grid Garden para entrenar layout.',
          'web.dev CSS para responsive y rendimiento visual.'
        ],
        JavaScript: [
          'MDN JavaScript Guide con fundamentos y APIs.',
          'javascript.info para teoría progresiva.',
          'freeCodeCamp JavaScript Algorithms and Data Structures.'
        ],
        Vue: [
          'Documentación oficial de Vue.',
          'Vue School para flujos prácticos.',
          'Buenas prácticas Composition API y componentes.'
        ],
        Python: [
          'Tutorial oficial de Python.',
          'Real Python con ejemplos reales.',
          'Automate the Boring Stuff para automatización.'
        ],
        Java: [
          'Documentación oficial de Java.',
          'Baeldung para patrones y backend.',
          'JetBrains Academy Java Track.'
        ],
        MySQL: [
          'MySQL Reference Manual.',
          'SQLBolt para práctica interactiva.',
          'Mode SQL Tutorial para casos de negocio.'
        ],
        PHP: [
          'Manual oficial de PHP.',
          'Laracasts PHP Basics.',
          'PHP The Right Way para buenas prácticas.'
        ]
      }

      return resources[this.currentLanguage] || [
        'Documentación oficial del lenguaje.',
        'Curso práctico con proyectos.',
        'Ejercicios y katas de refuerzo.'
      ]
    },
    buildStableHash(text) {
      let hash = 0
      const value = String(text || '')
      for (let index = 0; index < value.length; index++) {
        hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
      }
      return Math.abs(hash)
    },
    stableShuffle(items, salt = '') {
      return [...items]
        .map((item, index) => ({
          item,
          score: this.buildStableHash(`${salt}-${index}-${typeof item === 'string' ? item : JSON.stringify(item)}`)
        }))
        .sort((a, b) => a.score - b.score)
        .map((entry) => entry.item)
    },
    prepareQuestionPresentation(question, questionIndex = 0) {
      const cacheKey = `${this.currentLanguage}-${this.selectedLevel?.id || 0}-${this.currentTestNumber}-${questionIndex}`
      if (this.questionPresentationCache[cacheKey]) {
        return this.questionPresentationCache[cacheKey]
      }

      if (!Array.isArray(question?.options) || question.type === 'true_false') {
        const fallback = {
          options: Array.isArray(question?.options) ? question.options : [],
          correct: question?.correct
        }
        this.questionPresentationCache[cacheKey] = fallback
        return fallback
      }

      const indexedOptions = question.options.map((option, index) => ({ option, originalIndex: index }))
      const shuffled = this.stableShuffle(indexedOptions, cacheKey)
      const presentation = {
        options: shuffled.map((entry) => entry.option),
        correct: shuffled.findIndex((entry) => entry.originalIndex === question.correct)
      }

      this.questionPresentationCache[cacheKey] = presentation
      return presentation
    },
    getFillFromExample(level) {
      const fallback = {
        instruction: 'Ordena las piezas para completar el fragmento correctamente.',
        preview: level?.content?.example || '',
        segments: ['', '', ''],
        answers: this.currentLanguage === 'HTML' ? ['<h1>', '<p>'] : ['if', 'return'],
        optionPool: this.getLanguageBaseOptionPool()
      }

      const example = String(level?.content?.example || '')
      if (!example) return fallback

      if (this.currentLanguage === 'HTML') {
        const tags = [...example.matchAll(/<([a-z][a-z0-9-]*)\b[^>]*>/gi)]
          .map((match) => `<${match[1].toLowerCase()}>`)
          .filter((tag) => !['<html>', '<head>', '<body>'].includes(tag))
        const answers = [...new Set(tags)].slice(0, 2)
        if (answers.length < 2) return fallback

        let working = example
        answers.forEach((tag, index) => {
          const regex = new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('>', '[^>]*>'), 'i')
          working = working.replace(regex, `__BLANK_${index}__`)
        })

        return {
          instruction: 'Completa el código colocando las etiquetas correctas en cada hueco.',
          preview: example,
          segments: working.split(/__BLANK_\d+__/),
          answers,
          optionPool: [...new Set([...answers, ...this.getLanguageBaseOptionPool()])]
        }
      }

      const words = [...example.matchAll(/[a-zA-Z_][a-zA-Z0-9_]*/g)].map((m) => m[0])
      const keywords = [...new Set(words)].slice(0, 2)
      if (keywords.length < 2) return fallback

      let working = example
      keywords.forEach((word, index) => {
        const regex = new RegExp(`\\b${word}\\b`)
        working = working.replace(regex, `__BLANK_${index}__`)
      })

      return {
        instruction: 'Reconstruye el fragmento ordenando las piezas correctas.',
        preview: example,
        segments: working.split(/__BLANK_\d+__/),
        answers: keywords,
        optionPool: [...new Set([...keywords, ...this.getLanguageBaseOptionPool()])]
      }
    },
    buildProgressivePractice(level, step) {
      const basePractice = this.getCodePracticeConfig(level)
      const baseRequirements = Array.isArray(basePractice.requirements) ? basePractice.requirements : []
      const normalizedRequirements = [...new Set(baseRequirements)]
      const partialCount = Math.max(2, Math.min(normalizedRequirements.length, 2 + step))
      const resources = this.getLanguageLearningResources()

      return {
        instruction: `${basePractice.instruction} Fase ${step + 1}/3.`,
        requirements: normalizedRequirements.slice(0, partialCount),
        goalLines: basePractice.goalLines,
        theoryBoost: [
          `Fase práctica ${step + 1}: primero estructura, luego detalle y por último calidad.`,
          `Referencia sugerida: ${resources[step % resources.length]}`
        ]
      }
    },
    generateNineSectionTests(level) {
      if (!level) return []

      if (level.id === 1) {
        return [
          {
            type: 'code_practice',
            theoryPoints: [
              'HTML , es un Hypertext Markup Language, es un lenguaje computacional que se usa para estructurar las paginas web',
              'Lo primero que vamos a hacer de html es agregar un botón',
              '<button>My Button</button>'
            ],
            practice: {
              instruction: 'Fase 1: crea tu primer button con el texto My Button en la terminal.',
              requirements: ['<button', '</button>'],
              goalLines: ['<button>My Button</button>']
            },
            theoryBoost: ['Fase 1 del Nivel 1: crea el botón base en la terminal.']
          },
          {
            type: 'fillBlanks',
            theoryPoints: [
              'HTML para crear el button usa un opening tag <button> y un closing tag </button>',
              '_Mybutton_      escribe los dos tags de apertura y cierre'
            ],
            fillBlanks: {
              instruction: 'Fase 2: escribe el opening tag y el closing tag correctos.',
              preview: '<button>My Button</button>',
              segments: ['', 'My Button', ''],
              answers: ['<button>', '</button>'],
              optionPool: ['<button>', '</button>', '<span>', '<a>', '<p>', '<div>']
            },
            theoryBoost: ['Fase 2 del Nivel 1: identifica opening y closing tag.']
          },
          {
            type: 'fillBlanks',
            theoryPoints: [
              'Entre el opening tag y el closing tag va el label que es lo que pondremos dentro del button',
              '<button>_</button>     escribe un nombre para el button'
            ],
            fillBlanks: {
              instruction: 'Fase 3: escribe el nombre del botón dentro de las etiquetas.',
              preview: '<button>My Button</button>',
              segments: ['<button>', '', '</button>'],
              answers: ['My Button'],
              optionPool: ['My Button', 'like', 'Hola', 'Click me']
            },
            theoryBoost: ['Fase 3 del Nivel 1: el label va dentro del button.']
          },
          {
            type: 'quiz',
            quiz: {
              type: 'multiple_choice',
              question: 'Que tipo de tag es este </button>',
              options: ['Opening tag', 'Closing tag'],
              correct: 1
            },
            theoryPoints: [
              '1- Que tipo de tag es este </button>',
              'A- Opening tag',
              'B- Closing tag'
            ],
            theoryBoost: ['Fase 4 del Nivel 1: verdadero/falso sobre closing tags.']
          },
          {
            type: 'quiz',
            quiz: {
              type: 'multiple_choice',
              question: 'Cual de estos tags esta incorrecto',
              options: ['<button>', '</button>', '<button/>'],
              correct: 2
            },
            theoryPoints: [
              'v/f( preguntas)',
              '2- Cual de estos tags esta incorrecto',
              'A- <button>',
              'B- </button>',
              'C- <button/>'
            ],
            theoryBoost: ['Fase 5 del Nivel 1: detecta el tag incorrecto.']
          },
          {
            type: 'puzzle',
            theoryPoints: [
              '1- Crea un button que ponga like'
            ],
            puzzle: {
              instruction: 'Fase 6: arma el button con "like" arrastrando las piezas en el orden correcto.',
              pieces: [
                { id: 1, value: '<', draggable: true },
                { id: 2, value: 'button', draggable: true },
                { id: 3, value: '>', draggable: true },
                { id: 4, value: 'like', draggable: true },
                { id: 5, value: '<', draggable: true },
                { id: 6, value: '/', draggable: true },
                { id: 7, value: 'button', draggable: true },
                { id: 8, value: '>', draggable: true }
              ],
              targetSequence: ['<', 'button', '>', 'like', '<', '/', 'button', '>'],
              targetCode: '<button>like</button>'
            },
            theoryBoost: ['Fase 6 del Nivel 1: construye el button like.']
          },
          {
            type: 'code_practice',
            theoryPoints: [
              '2- Crea un button con el label My Button'
            ],
            practice: {
              instruction: 'Fase 7: crea un button con el label My Button.',
              requirements: ['<button', '</button>'],
              goalLines: ['<button>My Button</button>']
            },
            theoryBoost: ['Fase 7 del Nivel 1: completa el botón My Button.']
          },
          {
            type: 'code_practice',
            theoryPoints: [
              '3- Por ultimo vamos a crear un button tu mismo'
            ],
            practice: {
              instruction: 'Fase 8: crea tu propio button en la terminal.',
              requirements: ['<button', '</button>'],
              goalLines: ['<button>Tu botón</button>']
            },
            theoryBoost: ['Fase 8 del Nivel 1: crea tu propio button.']
          }
        ]
      }

      if (level.isExam) {
        return [
          {
            type: 'code_practice',
            practice: this.getCodePracticeConfig(level),
            theoryBoost: ['Examen del módulo: integra teoría y práctica en una única entrega.']
          }
        ]
      }

      const baseTheory = Array.isArray(level?.content?.theory) ? level.content.theory : []
      const resources = this.getLanguageLearningResources()
      const baseQuiz = level?.quiz?.[0] || {
        type: 'multiple_choice',
        question: `¿Qué afirmación describe mejor el tema ${level.name}?`,
        options: ['Describe la base del tema', 'Ignora el contexto del tema', 'Evita buenas prácticas siempre'],
        correct: 0
      }
      const normalizedQuiz = {
        type: baseQuiz.type || 'multiple_choice',
        question: baseQuiz.question,
        options: Array.isArray(baseQuiz.options) ? baseQuiz.options : ['Opción A', 'Opción B', 'Opción C'],
        correct: Number.isInteger(baseQuiz.correct) ? baseQuiz.correct : 0
      }
      const fallbackTheory = baseTheory[0] || `En ${this.currentLanguage}, este nivel refuerza una habilidad esencial.`

      const theoryTests = [0, 1, 2].map((phase) => ({
        type: 'quiz',
        quiz: phase === 1
          ? {
              type: 'true_false',
              question: `Verdadero o falso: ${fallbackTheory}`,
              options: [true, false],
              correct: true
            }
          : {
              ...normalizedQuiz,
              question: phase === 0
                ? normalizedQuiz.question
                : `${normalizedQuiz.question} (fase ${phase + 1})`
            },
        theoryBoost: [
          `Fase ${phase + 1}/9: ${baseTheory[phase] || fallbackTheory}`,
          `Recurso recomendado: ${resources[phase % resources.length]}`
        ]
      }))

      const fillSource = level?.fillBlanks || this.getFillFromExample(level)
      const fillTests = [0, 1, 2].map((phase) => ({
        type: 'fillBlanks',
        fillBlanks: {
          ...fillSource,
          instruction: `${fillSource.instruction} Fase ${phase + 4}/9.`
        },
        theoryBoost: [
          `Fase puzzle ${phase + 1}: identifica piezas y orden correcto.`,
          'Comprueba apertura/cierre y sintaxis antes de validar.'
        ]
      }))

      const practiceTests = [0, 1, 2].map((phase) => ({
        type: 'code_practice',
        practice: this.buildProgressivePractice(level, phase),
        theoryBoost: [
          `Fase terminal ${phase + 1}: aplica teoría escribiendo una solución funcional.`,
          'Valida checklist y mejora legibilidad del código.'
        ]
      }))

      return [...theoryTests, ...fillTests, ...practiceTests]
    },
    resetQuestionAndPuzzleState() {
      this.currentQuizIndex = 0
      this.quizAnswers = {}
      this.errorMessage = ''
      this.quizAttempts = {}
      this.fillAnswers = {}
      this.fillPiecePool = []
      this.activeFillBlankIndex = 0
      this.editorCode = ''
      this.questionPresentationCache = {}

      if (this.levelMode === 'fill_blanks') {
        this.initializeFillPuzzleState()
      }
    },
    initializeFillPuzzleState() {
      const answers = Array.isArray(this.fillBlanksExercise?.answers) ? this.fillBlanksExercise.answers : []
      this.fillAnswers = answers.reduce((acc, _, index) => {
        acc[index] = ''
        return acc
      }, {})

      const uniqueDistractors = [...new Set(this.fillBlanksOptions.flat())]
        .filter((option) => !answers.includes(option))
        .slice(0, Math.max(4, answers.length + 1))

      const pieces = [
        ...answers.map((value, index) => ({ id: `answer-${index}-${value}`, value })),
        ...uniqueDistractors.map((value, index) => ({ id: `distractor-${index}-${value}`, value }))
      ]

      this.fillPiecePool = this.stableShuffle(
        pieces,
        `fill-${this.currentLanguage}-${this.selectedLevel?.id || 0}-${this.currentTestNumber}`
      )
      this.activeFillBlankIndex = 0
    },
    setActiveFillBlank(index) {
      if (typeof index !== 'number') return
      this.activeFillBlankIndex = index
    },
    placeFillPiece(pieceId) {
      const pieceIndex = this.fillPiecePool.findIndex((piece) => piece.id === pieceId)
      if (pieceIndex < 0) return

      const firstEmpty = Object.keys(this.fillAnswers).map(Number).find((idx) => !this.fillAnswers[idx])
      const targetIndex = this.fillAnswers[this.activeFillBlankIndex] ? firstEmpty : this.activeFillBlankIndex

      if (targetIndex === undefined) {
        this.errorMessage = this.uiLanguage === 'en'
          ? 'All blanks are filled. Clear one to change it.'
          : 'Todos los huecos están completos. Limpia uno para cambiarlo.'
        return
      }

      const [piece] = this.fillPiecePool.splice(pieceIndex, 1)

      if (this.fillAnswers[targetIndex]) {
        this.fillPiecePool.push({
          id: `returned-${targetIndex}-${Date.now()}`,
          value: this.fillAnswers[targetIndex]
        })
      }

      this.fillAnswers = {
        ...this.fillAnswers,
        [targetIndex]: piece.value
      }
      this.activeFillBlankIndex = targetIndex
      this.errorMessage = ''
    },
    clearActiveFillBlank() {
      const currentValue = this.fillAnswers[this.activeFillBlankIndex]
      if (!currentValue) return

      this.fillPiecePool.push({
        id: `returned-${this.activeFillBlankIndex}-${Date.now()}`,
        value: currentValue
      })

      this.fillAnswers = {
        ...this.fillAnswers,
        [this.activeFillBlankIndex]: ''
      }
    },
    getRequirementLabel(requirement) {
      const normalizedRequirement = (requirement || '').toLowerCase().replace('>', '')

      const requirementLabelsEn = {
        '__list__': 'Add a list (<ul> or <ol>)',
        '<h1': 'Create a main heading (<h1>)',
        '<p': 'Create at least one paragraph (<p>)',
        '<a': 'Create at least one link (<a>)',
        '<table': 'Create a table (<table>)',
        '<tr': 'Include a table row (<tr>)',
        '<th': 'Include table headers (<th>)',
        '<td': 'Include data cells (<td>)',
        'href=': 'Use href attribute in links',
        'target="_blank"': 'Use target="_blank" for external link',
        '#': 'Include an internal anchor (#)',
        '<form': 'Include a form (<form>)',
        '<input': 'Include an input field (<input>)',
        'required': 'Use required validation',
        '<header': 'Include semantic header (<header>)',
        '<main': 'Include main content (<main>)',
        '<section': 'Include a section (<section>)',
        '<footer': 'Include footer (<footer>)',
        '<nav': 'Include navigation (<nav>)',
        'alt=': 'Add alternative text (alt=)',
        'aria-': 'Add an ARIA attribute (aria-)',
        'id=': 'Use id attribute',
        'class=': 'Use class attribute',
        'title=': 'Use title attribute',
        '<label': 'Include form label (<label>)',
        '<select': 'Include selector (<select>)',
        '<option': 'Include options (<option>)',
        '<video': 'Include video (<video>)',
        '<audio': 'Include audio (<audio>)',
        'controls': 'Add media controls (controls)'
      }

      const requirementLabels = {
        '__list__': 'Añadir una lista (<ul> o <ol>)',
        '<h1': 'Crear un título principal (<h1>)',
        '<p': 'Crear al menos un párrafo (<p>)',
        '<a': 'Crear al menos un enlace (<a>)',
        '<table': 'Crear una tabla (<table>)',
        '<tr': 'Incluir una fila de tabla (<tr>)',
        '<th': 'Incluir encabezados de tabla (<th>)',
        '<td': 'Incluir celdas de datos (<td>)',
        'href=': 'Usar atributo href en enlaces',
        'target="_blank"': 'Usar target="_blank" en enlace externo',
        '#': 'Incluir un ancla interna (#)',
        '<form': 'Incluir un formulario (<form>)',
        '<input': 'Incluir un campo de entrada (<input>)',
        'required': 'Usar validación required',
        '<header': 'Incluir cabecera semántica (<header>)',
        '<main': 'Incluir contenido principal (<main>)',
        '<section': 'Incluir una sección (<section>)',
        '<footer': 'Incluir pie de página (<footer>)',
        '<nav': 'Incluir navegación (<nav>)',
        'alt=': 'Añadir texto alternativo (alt=)',
        'aria-': 'Añadir un atributo ARIA (aria-)',
        'id=': 'Usar atributo id',
        'class=': 'Usar atributo class',
        'title=': 'Usar atributo title',
        '<label': 'Incluir etiqueta de formulario (<label>)',
        '<select': 'Incluir selector (<select>)',
        '<option': 'Incluir opciones (<option>)',
        '<video': 'Incluir video (<video>)',
        '<audio': 'Incluir audio (<audio>)',
        'controls': 'Añadir controles multimedia (controls)'
      }

      if (this.uiLanguage === 'en') {
        return requirementLabelsEn[normalizedRequirement] || requirementLabelsEn[requirement] || `Include ${requirement}`
      }

      return requirementLabels[normalizedRequirement] || requirementLabels[requirement] || `Incluir ${requirement}`
    },
    isRequirementMet(requirement, rawCode) {
      const code = rawCode.toLowerCase()
      const normalizedRequirement = (requirement || '').toLowerCase()

      if (normalizedRequirement === '__list__') {
        return code.includes('<ul') || code.includes('<ol')
      }

      return code.includes(normalizedRequirement)
    },
    buildPracticeImageDataUri(title, lines) {
      const escapeXml = (value) => value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

      const safeTitle = escapeXml(title)
      const safeLines = (lines || []).slice(0, 4).map(line => escapeXml(line))
      const lineBlocks = safeLines.map((line, index) => {
        const y = 152 + (index * 58)
        return `<rect x="68" y="${y - 30}" width="724" height="42" rx="8" fill="#0B1E28" stroke="#3E7084"/>\n<text x="88" y="${y - 3}" font-family="Consolas, monospace" font-size="22" fill="#9EDFFF">${line}</text>`
      }).join('')

      const svg = `<svg width="860" height="420" viewBox="0 0 860 420" xmlns="http://www.w3.org/2000/svg">\n<defs>\n<linearGradient id="bg" x1="0" y1="0" x2="860" y2="420" gradientUnits="userSpaceOnUse">\n<stop stop-color="#102D39"/>\n<stop offset="1" stop-color="#071A24"/>\n</linearGradient>\n</defs>\n<rect width="860" height="420" fill="url(#bg)"/>\n<rect x="36" y="28" width="788" height="364" rx="14" fill="#123342" stroke="#4A8198" stroke-width="2"/>\n<text x="68" y="78" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#E9FBFF">Objetivo: ${safeTitle}</text>\n<text x="68" y="112" font-family="Arial, sans-serif" font-size="16" fill="#9FD0E3">Referencia visual de lo que debes construir</text>\n${lineBlocks}\n</svg>`

      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
    },
    openLevel(level) {
      this.selectedLevel = level
      this.showLevelModal = true
      this.currentTestNumber = 1
      this.showHtmlPreview = false
      this.terminalOutput = []
      
      if (!this.levelTestsCompleted[level.id]) {
        this.levelTestsCompleted[level.id] = new Set()
      }

      this.resetQuestionAndPuzzleState()
    },
    closeLevel() {
      this.showLevelModal = false
      this.selectedLevel = null
      this.showHtmlPreview = false
      this.quizAnswers = {}
      this.editorCode = ''
      this.projectFiles = { HTML: '', CSS: '', JavaScript: '' }
      this.activeProjectTab = 'HTML'
      this.errorMessage = ''
      this.quizAttempts = {}
      this.fillAnswers = {}
      this.fillPiecePool = []
      this.terminalOutput = []
      this.questionPresentationCache = {}
    },
    getQuestionType() {
      const question = this.currentQuestion
      return question.type || 'multiple_choice'
    },
    answerQuestion(value) {
      this.quizAnswers = Object.assign({}, this.quizAnswers, { [this.currentQuizIndex]: value })
    },
    checkAnswerCorrect(questionIndex = null) {
      const idx = questionIndex !== null ? questionIndex : this.currentQuizIndex
      if (idx < 0 || this.levelQuiz.length === 0 || idx >= this.levelQuiz.length) {
        return false
      }

      const question = this.levelQuiz[idx]
      const userAnswer = this.quizAnswers[idx]

      if (userAnswer === undefined) {
        return false
      }

      // For multiple choice and true/false: compare exact value
      if (question.type === 'multiple_choice' || question.type === 'true_false' || !question.type) {
        if (question.type === 'multiple_choice' || !question.type) {
          const prepared = this.prepareQuestionPresentation(question, idx)
          return userAnswer === prepared.correct
        }
        return userAnswer === question.correct
      }

      // For code/explanation: just check that something was written
      return userAnswer && userAnswer.toString().trim().length > 0
    },
    validateCurrentAnswer() {
      if (!this.checkAnswerCorrect()) {
        this.quizAttempts[this.currentQuizIndex] = (this.quizAttempts[this.currentQuizIndex] || 0) + 1
        this.errorMessage = this.quizAttempts[this.currentQuizIndex] > 1
          ? (this.uiLanguage === 'en' ? 'Try again. The concept is in the theory notes.' : 'Intenta nuevamente. El concepto está en la teoría.')
          : (this.uiLanguage === 'en' ? 'Incorrect answer. Try again.' : 'Respuesta incorrecta. Intenta nuevamente.')
        return false
      }
      this.errorMessage = ''
      return true
    },
    previousQuestion() {
      if (this.currentQuizIndex > 0) {
        this.currentQuizIndex--
        this.errorMessage = ''
      }
    },
    nextQuestion() {
      // Mostrar error si la respuesta es incorrecta, pero permitir avanzar de todas formas
      if (!this.checkAnswerCorrect()) {
        this.quizAttempts[this.currentQuizIndex] = (this.quizAttempts[this.currentQuizIndex] || 0) + 1
        this.errorMessage = this.quizAttempts[this.currentQuizIndex] > 1
          ? (this.uiLanguage === 'en' ? 'Try again. The concept is in the theory notes.' : 'Intenta nuevamente. El concepto está en la teoría.')
          : (this.uiLanguage === 'en' ? 'Incorrect answer. Try again.' : 'Respuesta incorrecta. Intenta nuevamente.')
      } else {
        this.errorMessage = ''
      }

      // Permitir avanzar siempre
      if (this.currentQuizIndex < this.levelQuiz.length - 1) {
        this.currentQuizIndex++
        this.errorMessage = ''
      } else {
        // En la última pregunta, verificar si todas las respuestas son correctas
        const allAnswersCorrect = this.levelQuiz.every((q, idx) => {
          return this.checkAnswerCorrect(idx)
        })

        if (!allAnswersCorrect) {
          this.errorMessage = this.uiLanguage === 'en'
            ? 'You must answer all questions correctly to complete the level'
            : 'Debes responder correctamente todas las preguntas para completar el nivel'
          return
        }

        this.completeLevel()
      }
    },
    async completeLevel() {
      if (this.levelMode === 'theory_test') {
        const allAnswersCorrect = this.levelQuiz.every((q, idx) => {
          return this.checkAnswerCorrect(idx)
        })

        if (!allAnswersCorrect) {
          this.errorMessage = this.uiLanguage === 'en'
            ? 'You must answer all questions correctly'
            : 'Debes responder correctamente todas las preguntas'
          return
        }
      }

      // Marcar prueba actual como completada
      if (!this.levelTestsCompleted[this.selectedLevel.id]) {
        this.levelTestsCompleted[this.selectedLevel.id] = new Set()
      }
      this.levelTestsCompleted[this.selectedLevel.id].add(this.currentTestNumber)

      // Si completó la última prueba del nivel, marcar nivel como completado
      if (this.isLastTestOfLevel) {
        if (!this.completedLevels.includes(this.selectedLevel.id)) {
          this.completedLevels.push(this.selectedLevel.id)
          this.totalPoints += this.pointsPerLevel
          await this.saveProgress()
        }
        this.closeLevel()
      } else {
        // Pasar a la siguiente prueba
        this.currentTestNumber++
        this.resetQuestionAndPuzzleState()
      }
    },
    async checkLanguageCompletion() {
      // Obtener el progreso actual del lenguaje desde el servidor
      const userId = this.getActiveUserId()
      if (!userId) {
        return
      }

      try {
        // Obtener datos actualizados de progreso
        const language = encodeURIComponent(this.getBackendLanguage())
        const response = await fetch(
          `${this.apiBaseUrl}/progress/${userId}/${language}`
        )

        if (!response.ok) {
          console.error(`Error obteniendo progreso para ${this.currentLanguage}`)
          return
        }

        const data = await response.json()
        const progressData = data.progress || data
        const completedCount = progressData.completedLevels?.length || 0
        const LEVELS_PER_LANGUAGE = 30  // Total de niveles en cualquier lenguaje
        const POINTS_PER_LEVEL = 2

        console.log(
          `📊 ${this.currentLanguage}: ${completedCount}/${LEVELS_PER_LANGUAGE} niveles completados`
        )

        // Solo marcar como completada si se completaron TODOS los 30 niveles
        if (completedCount === LEVELS_PER_LANGUAGE && completedCount > 0) {
          // El usuario completó todos los niveles de este lenguaje
          console.log(
            `🏆 ¡${this.currentLanguage} completado! ${completedCount}/${LEVELS_PER_LANGUAGE} niveles`
          )
          await this.notifyLessonCompletion(this.getBackendLanguage())
        }
      } catch (error) {
        console.error('Error verificando completitud del lenguaje:', error)
      }
    },
    async notifyLessonCompletion(language) {
      const userId = this.getActiveUserId()
      if (!userId) {
        return
      }

      try {
        const response = await fetch(
          `${this.apiBaseUrl}/complete-lesson/${userId}/${encodeURIComponent(language)}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Lección "${data.lessonId}" marcada como completada`)
          // Emitir evento para que otros componentes se actualicen
          this.$emit('lesson-completed', data.lessonId)
        }
      } catch (error) {
        console.error('Error notificando lección completada:', error)
      }
    },
    async saveProgress() {
      const userId = this.getActiveUserId()
      if (!userId) {
        console.warn('⚠️ Usuario no identificado, no se puede guardar progreso')
        return
      }

      try {
        const backendLanguage = this.getBackendLanguage()
        const encodedLanguage = encodeURIComponent(backendLanguage)
        const response = await fetch(`${this.apiBaseUrl}/progress/${userId}/${encodedLanguage}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            completedLevels: this.completedLevels,
            totalPoints: this.totalPoints
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error(`❌ Error guardando progreso: ${response.status}`, errorData)
          return
        }

        const data = await response.json()
        console.log(`✅ Progreso guardado para ${this.currentLanguage}:`, data.progress)

        // Después de guardar el progreso, verifica si se completó el lenguaje
        await this.checkLanguageCompletion()
      } catch (error) {
        console.error('❌ No se pudo guardar el progreso en servidor:', error)
      }
    },
    async loadProgress(languageName = this.currentLanguage) {
      const requestId = ++this.progressRequestId
      const userId = this.getActiveUserId()
      if (!userId) {
        this.completedLevels = []
        this.totalPoints = 0
        return
      }

      try {
        const backendLanguage = this.getBackendLanguage(languageName)
        const encodedLanguage = encodeURIComponent(backendLanguage)
        const response = await fetch(`${this.apiBaseUrl}/progress/${userId}/${encodedLanguage}`)

        if (requestId !== this.progressRequestId) {
          return
        }
        
        if (!response.ok) {
          console.error(`❌ Error cargando progreso: ${response.status}`)
          this.completedLevels = []
          this.totalPoints = 0
          return
        }
        
        const data = await response.json()

                if (requestId !== this.progressRequestId) {
                  return
                }

        if (!data?.progress) {
          console.warn('⚠️ No hay progreso en BD, empezando desde cero')
          this.completedLevels = []
          this.totalPoints = 0
          return
        }

        this.completedLevels = Array.isArray(data.progress.completedLevels) ? data.progress.completedLevels : []
        this.totalPoints = Number(data.progress.totalPoints || 0)
        
        console.log(`✅ Progreso cargado para ${languageName}:`, {
          completedLevels: this.completedLevels,
          totalPoints: this.totalPoints
        })
      } catch (error) {
        if (requestId !== this.progressRequestId) {
          return
        }

        console.error('❌ No se pudo cargar progreso desde servidor:', error)
        this.completedLevels = []
        this.totalPoints = 0
      }
    },
    getLaneClass(index) {
      const wave = ['lane-center', 'lane-right', 'lane-right', 'lane-center', 'lane-left', 'lane-left']
      return wave[index % wave.length]
    },
    getConnectorClass(levelId) {
      if (this.completedLevels.includes(levelId)) {
        return 'connector-completed'
      }
      if (this.currentLevel === levelId + 1) {
        return 'connector-current'
      }
      return 'connector-locked'
    },
    completeFillBlanksLevel() {
      const allCorrect = this.fillBlanksExercise.answers.every((answer, index) => {
        const userAnswer = this.normalizeFillBlankAnswer(this.fillAnswers[index] || '')
        const expectedAnswer = this.normalizeFillBlankAnswer(answer)
        return userAnswer === expectedAnswer
      })

      if (!allCorrect) {
        this.errorMessage = this.uiLanguage === 'en'
          ? 'Check the blanks: there are incorrect or empty answers.'
          : 'Revisa los huecos: hay respuestas incorrectas o vacías.'
        return
      }

      this.errorMessage = ''
      this.completeLevel()
    },
    normalizeFillBlankAnswer(value) {
      const normalizedValue = (value || '').trim().toLowerCase()
      if (!normalizedValue) return ''

      if (this.currentLanguage !== 'HTML') {
        return normalizedValue
      }

      const tagMatch = normalizedValue.match(/^<\/?\s*([a-z][a-z0-9-]*)\b[^>]*>?$/i)
      if (tagMatch) {
        return `<${tagMatch[1].toLowerCase()}>`
      }

      const plainTagMatch = normalizedValue.match(/^([a-z][a-z0-9-]*)$/i)
      if (plainTagMatch) {
        return `<${plainTagMatch[1].toLowerCase()}>`
      }

      return normalizedValue
    },
    completeCodingLevel() {
      const codeToTest = this.selectedLevel?.isProject 
        ? `${this.projectFiles.HTML} ${this.projectFiles.CSS} ${this.projectFiles.JavaScript}`
        : (this.editorCode || '');
      const code = codeToTest.trim().toLowerCase()
      if (!code) {
        this.errorMessage = this.uiLanguage === 'en'
          ? 'Write code before completing the level.'
          : 'Escribe código antes de completar el nivel.'
        return
      }
      const missingRequirements = this.practiceRequirements.filter((requirement) => {
        return !this.isRequirementMet(requirement, code)
      })

      if (missingRequirements.length > 0) {
        const readableMissing = missingRequirements.map((requirement) => this.getRequirementLabel(requirement))
        this.errorMessage = this.uiLanguage === 'en'
          ? `Missing required elements: ${readableMissing.join(', ')}`
          : `Faltan elementos requeridos: ${readableMissing.join(', ')}`
        return
      }

      this.errorMessage = ''
      this.completeLevel()
    },
    executeCode() {
      try {
        const codeToTest = this.selectedLevel?.isProject 
          ? `${this.projectFiles.HTML} ${this.projectFiles.CSS} ${this.projectFiles.JavaScript}`
          : (this.editorCode || '');
        const code = codeToTest.trim()
        if (!code) {
          this.errorMessage = this.uiLanguage === 'en'
            ? 'Write code in the terminal before running.'
            : 'Escribe código en la terminal antes de ejecutar.'
          return
        }

        const met = this.codingChecklist.filter((item) => item.met).length
        const total = this.codingChecklist.length
        const summary = total > 0
          ? (this.uiLanguage === 'en' ? `Checklist: ${met}/${total} requirements met.` : `Checklist: ${met}/${total} requisitos cumplidos.`)
          : (this.uiLanguage === 'en' ? 'Execution logged. Now validate to complete.' : 'Ejecución registrada. Ahora valida para completar.')

        this.terminalOutput = [
          ...this.terminalOutput,
          '$ run exercise',
          summary
        ].slice(-8)
        this.errorMessage = ''
      } catch(error) {
        console.error('Error executing code:', error)
        this.errorMessage = 'Error al ejecutar en terminal: ' + error.message
      }
    },
    showPreviewInBrowser() {
      this.showHtmlPreview = true
      this.errorMessage = ''
    },
    async registerDailyActivity() {
      const userId = this.getActiveUserId()
      if (!userId) return

      try {
        await fetch(`${this.socialApiBaseUrl}/activity/${userId}`, {
          method: 'POST'
        })
      } catch (error) {
        console.error('No se pudo registrar actividad diaria', error)
      }
    },
    async loadStreak() {
      const userId = this.getActiveUserId()
      if (!userId) {
        this.streakDays = 0
        this.maxStreakDays = 0
        this.canRestoreStreak = false
        this.calendarDays = []
        return
      }

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/streak/${userId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.message || 'No se pudo cargar racha')
        }

        this.streakDays = Number(data?.streak?.consecutiveActiveDays || 0)
        this.maxStreakDays = Number(data?.streak?.maxStreak || 0)
        this.canRestoreStreak = Boolean(data?.streak?.canRestore)
        this.calendarDays = Array.isArray(data?.calendar) ? data.calendar : []
      } catch (error) {
        console.error('No se pudo cargar racha', error)
      }
    },
    async openStreakCalendar() {
      this.showStreakCalendar = true
      await this.loadStreak()
    },
    async restoreStreak() {
      const userId = this.getActiveUserId()
      if (!userId || !this.canRestoreStreak) return

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/streak/restore/${userId}`, {
          method: 'POST'
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.message || 'No se pudo restaurar racha')
        }

        await this.loadStreak()
      } catch (error) {
        console.error('No se pudo restaurar racha', error)
      }
    }
  },
  async mounted() {
    try {
      const savedUiLanguage = localStorage.getItem('inicio-ui-language')
      if (savedUiLanguage === 'es' || savedUiLanguage === 'en') {
        this.uiLanguage = savedUiLanguage
      }
    } catch (error) {
      console.warn('No se pudo restaurar el idioma de interfaz', error)
    }

    const initialUserId = this.getActiveUserId()
    if (initialUserId) {
      this.lastHydratedUserId = String(initialUserId)
    }

    this.initializeLanguageFromProgrammerType()
    await this.registerDailyActivity()
    await this.loadLanguage(this.currentLanguage)
    await this.loadProgress()
    await this.loadStreak()
  },

}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.inicio-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1f3cff 0%, #2c49ff 100%);
  display: flex;
  flex-direction: column;
  padding-bottom: 80px;
  overflow-x: hidden;
}

.language-tab-container {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(166, 184, 255, 0.35);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.top-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.language-tab {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(22, 18, 118, 0.55);
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 12px;
  padding: 10px 14px;
  color: #e9f1ff;
  cursor: pointer;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
}

.streak-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(22, 18, 118, 0.55);
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 12px;
  padding: 8px 10px;
  min-width: 64px;
  height: 42px;
  color: #e9f1ff;
  cursor: pointer;
}

.ui-language-picker {
  position: relative;
}

.ui-language-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: rgba(22, 18, 118, 0.55);
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 12px;
  padding: 8px 9px;
  min-width: 64px;
  height: 42px;
  color: #e9f1ff;
  cursor: pointer;
}

.ui-flag-image {
  width: 20px;
  height: 14px;
  object-fit: cover;
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.ui-dropdown-icon {
  width: 14px;
  height: 14px;
}

.ui-language-menu {
  position: absolute;
  right: calc(100% + 8px);
  top: 0;
  z-index: 40;
  min-width: 120px;
  background: rgba(15, 16, 95, 0.98);
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 10px;
  padding: 6px;
  display: grid;
  gap: 4px;
  box-shadow: 0 8px 20px rgba(4, 8, 47, 0.45);
}

.ui-language-option {
  border: 1px solid rgba(166, 184, 255, 0.25);
  border-radius: 8px;
  background: rgba(30, 33, 130, 0.65);
  color: #e9f1ff;
  display: grid;
  grid-template-columns: 26px 1fr;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.ui-option-flag-image {
  width: 20px;
  height: 14px;
  object-fit: cover;
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.ui-language-option:hover {
  border-color: rgba(166, 184, 255, 0.6);
  background: rgba(37, 44, 163, 0.75);
}

.streak-flame {
  display: inline-block;
  filter: grayscale(1) brightness(0.7);
  transition: all 0.3s ease;
  font-size: 24px;
  line-height: 1;
}

.streak-flame.active {
  filter: grayscale(0) brightness(1);
  transform: scale(1.3) rotate(-5deg);
}

.streak-count {
  font-weight: 700;
  font-size: 14px;
}

.streak-calendar-modal {
  width: min(96vw, 760px);
  max-height: 88vh;
  overflow-y: auto;
}

.calendar-subtitle {
  color: #dce7ff;
  margin-bottom: 10px;
}

.restore-button {
  background: #0de28f;
  color: #06233d;
  border: none;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: 700;
  margin-bottom: 12px;
}

.restore-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.month-card {
  background: rgba(12, 25, 94, 0.65);
  border-radius: 10px;
  padding: 8px;
}

.month-title {
  font-size: 12px;
  font-weight: 700;
  margin: 0 0 6px;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 3px;
}

.day-dot {
  font-size: 9px;
  text-align: center;
  padding: 2px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.12);
  color: #d7e5ff;
}

.day-dot.active {
  background: #0de28f;
  color: #06233d;
  font-weight: 700;
}

@media (max-width: 820px) {
  .calendar-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .calendar-grid {
    grid-template-columns: 1fr;
  }

  .streak-calendar-modal {
    width: min(96vw, 96vw);
  }
}

.progress-section {
  padding: 16px;
}

.progress-section h1 {
  margin: 0 0 10px;
  font-size: 20px;
  color: #ffffff;
}

.progress-stats {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.stat {
  background: rgba(22, 18, 118, 0.55);
  border: 1px solid rgba(166, 184, 255, 0.35);
  border-radius: 10px;
  padding: 8px 10px;
  min-width: 105px;
}

.stat-label {
  display: block;
  font-size: 11px;
  color: #d6e4ff;
  margin-bottom: 4px;
}

.stat-value {
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
}

.top-progress {
  height: 12px;
  background: #8494bf;
  border-radius: 999px;
  overflow: hidden;
}

.top-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0de28f 0%, #15b870 100%);
  transition: width 0.35s ease;
}

.map-area {
  flex: 1;
  flex-direction: row;
  overflow-x: hidden;
  padding: 0 12px 20px;
}

.path-wrapper {
  width: 100%;
  gap: 0;
  margin: 0 auto;
}

.path-step {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 4px;
}

.path-step.lane-left {
  transform: translateX(-52px);
}

.path-step.lane-right {
  transform: translateX(52px);
}

.path-step.lane-center {
  transform: translateX(0px);
}

.level-node {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 3px solid #5f8ba3;
  background: radial-gradient(circle, #607b8b 0%, #486473 50%, #2d4553 100%);
  color: #d8ebf5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 26px;
  cursor: pointer;
  box-shadow: inset 0 4px 8px rgba(255, 255, 255, 0.12), 0 6px 16px rgba(0, 0, 0, 0.45);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.level-node:disabled {
  cursor: not-allowed;
}

.node-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 3px solid transparent;
  opacity: 0;
}

.level-node.current {
  border-color: #79ff2b;
  background: radial-gradient(circle, #84ff30 0%, #57cc0f 60%, #3b9809 100%);
  color: #f2fff0;
  box-shadow: inset 0 4px 8px rgba(255, 255, 255, 0.28), 0 0 0 5px rgba(104, 255, 26, 0.25), 0 0 24px rgba(111, 255, 56, 0.7);
}

.level-node.current .node-ring {
  opacity: 1;
  border-top-color: rgba(122, 255, 65, 0.9);
  border-right-color: rgba(122, 255, 65, 0.7);
  border-bottom-color: rgba(122, 255, 65, 0.2);
  animation: spin 2s linear infinite;
}

.level-node.completed {
  border-color: #8ff443;
  background: radial-gradient(circle, #9bff53 0%, #68d520 60%, #3ea80f 100%);
  color: #f3fff2;
  box-shadow: inset 0 4px 8px rgba(255, 255, 255, 0.26), 0 0 20px rgba(127, 248, 59, 0.7);
}

.level-node.completed .node-ring {
  opacity: 1;
  border-color: rgba(140, 251, 73, 0.8);
}

.level-node.locked {
  filter: grayscale(0.75);
  opacity: 0.6;
}

.level-node.exam {
  width: 176px;
  height: 74px;
  border-radius: 18px;
  border: 4px solid #111111;
  background: #f5f8ff;
  color: #101010;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4), 0 0 0 5px rgba(157, 243, 182, 0.28);
}

.level-node.exam .node-ring {
  border-radius: 14px;
}

.project-node-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 10px 0 12px;
  gap: 10px;
}

.project-node-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.project-node-title {
  font-size: 17px;
  font-weight: 800;
  line-height: 1;
  color: #0b0b0b;
}

.project-node-subtitle {
  margin-top: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #1f2a44;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 92px;
}

.project-node-icon-wrap {
  width: 52px;
  height: 42px;
  border-radius: 8px;
  background: #0f1118;
  border: 2px solid #08090d;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.project-node-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px;
  display: block;
}

.project-check {
  position: absolute;
  top: -9px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #39d353;
  color: #ffffff;
  border: 2px solid #ffffff;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
}

.level-node.exam.current {
  border-color: #0f1118;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.45), 0 0 0 6px rgba(126, 255, 59, 0.28);
}

.level-node.exam.completed {
  border-color: #0f1118;
  background: #eef8f0;
}

.level-node:not(.locked):hover {
  transform: translateY(-2px) scale(1.04);
}

.node-text,
.node-icon {
  position: relative;
  z-index: 1;
}

.lock-icon {
  position: absolute;
  bottom: -7px;
  right: -4px;
  font-size: 15px;
}

.step-info {
  text-align: center;
  margin-top: 8px;
  min-height: 38px;
}

.step-title {
  margin: 0;
  color: #d7f3ff;
  font-size: 13px;
  font-weight: 600;
}

.step-subtitle {
  margin: 2px 0 0;
  color: #9fc6d6;
  font-size: 11px;
}

.step-connector {
  position: relative;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.connector-line {
  width: 8px;
  height: 34px;
  border-radius: 999px;
  background: rgba(107, 139, 153, 0.45);
  transition: all 0.25s ease;
}

.connector-completed .connector-line {
  background: linear-gradient(180deg, #c6ff9a 0%, #69e11d 100%);
  box-shadow: 0 0 14px rgba(139, 253, 78, 0.7);
}

.connector-current .connector-line {
  background: linear-gradient(180deg, #a7ff76 0%, #4ecb0e 100%);
  box-shadow: 0 0 12px rgba(126, 255, 59, 0.6);
  animation: pulse-line 1.5s ease-in-out infinite;
}

.connector-tag {
  position: absolute;
  top: 10px;
  left: calc(50% + 16px);
  font-size: 10px;
  color: #dbffd0;
  background: rgba(58, 127, 19, 0.35);
  border: 1px solid rgba(133, 255, 96, 0.45);
  padding: 3px 6px;
  border-radius: 999px;
  white-space: nowrap;
}

/* FULL SCREEN LEVEL VIEW STYLES */
.level-fullscreen {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #1f3cff 0%, #2c49ff 100%);
  z-index: 200;
}

.level-header {
  flex: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(166, 184, 255, 0.35);
  background: rgba(15, 18, 94, 0.55);
}

.back-button {
  padding: 8px 12px;
  background: transparent;
  border: 1px solid rgba(166, 184, 255, 0.5);
  color: #e9f1ff;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: rgba(24, 36, 130, 0.7);
  border-color: #c6d7ff;
}

.header-info {
  flex: 1;
}

.header-info h2 {
  margin: 0;
  color: #e3f7ff;
  font-size: 18px;
}

.header-info p {
  margin: 0;
  color: #d0ddff;
  font-size: 12px;
}

.difficulty-badge {
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.difficulty-badge.fácil {
  background: rgba(118, 255, 82, 0.2);
  color: #cfffbe;
}

.difficulty-badge.medio {
  background: rgba(255, 195, 84, 0.2);
  color: #ffe4b3;
}

.difficulty-badge.difícil {
  background: rgba(255, 122, 122, 0.2);
  color: #ffd0d0;
}

.test-progress-bar {
  display: flex;
  gap: 6px;
  padding: 12px 16px;
  background: rgba(12, 25, 94, 0.6);
  border-bottom: 1px solid rgba(166, 184, 255, 0.25);
  overflow-x: auto;
  justify-content: center;
}

.test-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(156, 177, 255, 0.15);
  border: 2px solid rgba(156, 177, 255, 0.3);
  cursor: default;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.test-indicator.active {
  background: linear-gradient(135deg, #4ecb0e 0%, #a7ff76 100%);
  border-color: #69e11d;
  box-shadow: 0 0 12px rgba(126, 255, 59, 0.6);
}

.test-indicator.completed {
  background: linear-gradient(135deg, #69e11d 0%, #c6ff9a 100%);
  border-color: #4ecb0e;
}

.test-number {
  color: #ffffff;
  font-weight: 700;
  font-size: 13px;
}

.level-content {
  flex: 1;
  display: grid;
  grid-template-columns: 45% 55%;
  gap: 12px;
  padding: 12px;
  overflow: hidden;
}

.left-panel {
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(156, 177, 255, 0.5);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(15, 18, 94, 0.8);
}

.panel-tabs {
  display: flex;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid rgba(156, 177, 255, 0.35);
  flex-shrink: 0;
  background: rgba(12, 25, 94, 0.7);
}

.panel-tab {
  padding: 6px 10px;
  background: transparent;
  color: #cfe0ff;
  border: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  font-weight: 500;
}

.panel-tab:hover {
  color: #f3f8ff;
}

.panel-tab.active {
  color: #ffffff;
  border-bottom-color: #9dbbff;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.theory-content h3,
.example-content h3,
.quiz-content h3 {
  color: #e3f7ff;
  margin: 0 0 12px;
  font-size: 16px;
}

.practice-content h3,
.quiz-section h3 {
  color: #e3f7ff;
  margin: 0 0 12px;
  font-size: 16px;
}

.practice-task {
  margin: 0 0 12px;
  color: #cbe7f2;
  line-height: 1.5;
}

.goal-image-wrapper {
  border: 1px solid rgba(115, 169, 194, 0.35);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(10, 27, 36, 0.8);
}

.goal-image {
  width: 100%;
  display: block;
}

.goal-caption {
  margin: 0;
  padding: 8px 10px;
  color: #9ec1d0;
  font-size: 12px;
  border-top: 1px solid rgba(115, 169, 194, 0.25);
}

.theory-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.theory-list li {
  background: rgba(24, 36, 130, 0.7);
  border-left: 3px solid #7de8ff;
  border-radius: 8px;
  color: #e4ecff;
  padding: 10px;
  margin-bottom: 8px;
  line-height: 1.5;
}

.code-display {
  position: relative;
}

.code-display pre {
  background: #0a1b24;
  border: 1px solid rgba(115, 169, 194, 0.35);
  border-radius: 8px;
  overflow: auto;
  padding: 12px;
  margin: 0 0 8px;
}

.code-display code {
  color: #a8eeff;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
}

.copy-button {
  padding: 6px 10px;
  background: #7de8ff;
  color: #0d2440;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.copy-button:hover {
  background: #9cefff;
}

.right-panel {
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(156, 177, 255, 0.5);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(15, 18, 94, 0.8);
}

.editor-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 8px;
  padding: 8px;
  overflow-y: auto;
}

.terminal-card {
  border: 1px solid rgba(136, 160, 246, 0.45);
  border-radius: 8px;
  overflow: hidden;
  background: #08111c;
}

.terminal-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid rgba(136, 160, 246, 0.35);
  color: #a6c8ff;
  font-size: 11px;
  font-family: 'Courier New', monospace;
}

.terminal-body {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.terminal-line {
  color: #9df3b6;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.terminal-label {
  color: #8fb9ff;
  font-size: 11px;
  font-family: 'Courier New', monospace;
}

.terminal-input {
  width: 100%;
  min-height: 180px;
  resize: vertical;
  border: 1px solid rgba(136, 160, 246, 0.35);
  border-radius: 6px;
  background: #02070d;
  color: #a8eeff;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  padding: 10px;
}

.terminal-input:focus {
  outline: 1px solid #9dbbff;
}

.editor-container {
  display: flex;
  flex-direction: column;
  flex: 0 1 180px;
  border: 1px solid rgba(115, 169, 194, 0.25);
  border-radius: 6px;
  background: #0a1b24;
}

.editor-container label {
  padding: 6px 8px;
  font-size: 11px;
  color: #9ec1d0;
  font-weight: 600;
  border-bottom: 1px solid rgba(115, 169, 194, 0.25);
}

.monaco-wrapper {
  flex: 1;
  min-height: 160px;
}

textarea {
  flex: 1;
  border: none;
  background: #0a1b24;
  color: #a9f0ff;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  padding: 8px;
  resize: none;
  outline: none;
}

textarea::placeholder {
  color: #5a7a8a;
}

.run-button {
  padding: 8px 12px;
  background: linear-gradient(135deg, #8affb6 0%, #5cd8f2 100%);
  color: #0a1d2d;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
}

.run-button:hover {
  background: linear-gradient(135deg, #9affc2 0%, #73e0f8 100%);
  transform: translateY(-1px);
}

.requirements-card {
  border: 1px solid rgba(136, 160, 246, 0.45);
  border-radius: 8px;
  background: rgba(12, 25, 94, 0.7);
  padding: 10px;
}

.requirements-title {
  margin: 0 0 8px;
  color: #f3f8ff;
  font-size: 12px;
  font-weight: 700;
}

.requirements-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.requirements-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #cfe0ff;
  font-size: 12px;
}

.requirements-list li.met {
  color: #dbffd1;
}

.req-icon {
  width: 18px;
  text-align: center;
}

.preview-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  border: 1px solid rgba(115, 169, 194, 0.25);
  border-radius: 6px;
  overflow: hidden;
  background: white;
  min-height: 200px;
}

.preview-container label {
  padding: 6px 8px;
  font-size: 11px;
  color: #333;
  font-weight: 600;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.preview-iframe {
  flex: 1;
  border: none;
  background: white;
}

.quiz-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.quiz-progress {
  text-align: center;
  color: #98c1d1;
  font-size: 12px;
  margin-bottom: 12px;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.option-button {
  background: rgba(18, 28, 120, 0.75);
  border: 1px solid rgba(136, 163, 255, 0.5);
  color: #e4ecff;
  border-radius: 8px;
  padding: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
}

.option-button:hover {
  border-color: #c6d7ff;
  background: rgba(24, 36, 130, 0.8);
}

.option-button.selected {
  border-color: #9df3b6;
  background: rgba(141, 244, 174, 0.2);
  color: #e9fff1;
  box-shadow: 0 0 12px rgba(141, 244, 174, 0.28);
}

.option-button.incorrect {
  border-color: #ff6b6b;
  background: #5f2020;
  color: #ffcccc;
}

.quiz-code,
.quiz-explanation {
  margin-bottom: 14px;
}

.fill-title {
  margin-bottom: 10px;
}

.fill-preview {
  background: rgba(8, 19, 74, 0.8);
  border: 1px solid rgba(136, 160, 246, 0.45);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
}

.fill-preview-title {
  margin: 0 0 8px;
  color: #d6e7ff;
  font-size: 12px;
  font-weight: 700;
}

.fill-preview pre {
  margin: 0;
  background: #0a1b24;
  border: 1px solid rgba(115, 169, 194, 0.35);
  border-radius: 8px;
  overflow: auto;
  padding: 10px;
}

.fill-preview code {
  color: #a8eeff;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
}

.fill-template {
  background: rgba(12, 25, 94, 0.7);
  border: 1px solid rgba(136, 160, 246, 0.45);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 14px;
  color: #d6e7ff;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.fill-slot {
  min-width: 130px;
  max-width: 220px;
  margin: 0 4px;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px dashed rgba(136, 163, 255, 0.75);
  background: rgba(24, 36, 130, 0.55);
  color: #e4ecff;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  cursor: pointer;
}

.fill-slot.active {
  border-color: #9cefff;
  box-shadow: 0 0 0 2px rgba(156, 239, 255, 0.2);
}

.fill-slot.filled {
  border-style: solid;
  border-color: #9df3b6;
  background: rgba(141, 244, 174, 0.18);
}

.fill-pieces {
  border: 1px solid rgba(136, 160, 246, 0.45);
  border-radius: 8px;
  background: rgba(8, 19, 74, 0.75);
  padding: 10px;
  margin-bottom: 12px;
}

.pieces-title {
  margin: 0 0 8px;
  color: #d6e7ff;
  font-size: 12px;
  font-weight: 700;
}

.pieces-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.piece-button {
  border: 1px solid rgba(136, 163, 255, 0.65);
  border-radius: 999px;
  padding: 6px 10px;
  background: rgba(18, 28, 120, 0.7);
  color: #e4ecff;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  cursor: pointer;
}

.piece-button:hover {
  border-color: #c6d7ff;
  background: rgba(24, 36, 130, 0.85);
}

.clear-slot-button {
  margin-top: 10px;
  border: 1px solid rgba(255, 179, 179, 0.5);
  border-radius: 6px;
  padding: 6px 10px;
  background: rgba(95, 32, 32, 0.65);
  color: #ffdede;
  cursor: pointer;
  font-size: 12px;
}

.clear-slot-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.fill-input {
  min-width: 130px;
  max-width: 180px;
  margin: 0 4px;
  padding: 3px 6px;
  border-radius: 4px;
  border: 1px solid rgba(136, 163, 255, 0.65);
  background: rgba(24, 36, 130, 0.75);
  color: #e4ecff;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.fill-input:focus {
  outline: 1px solid #9dbbff;
}

.code-editor,
.explanation-editor {
  width: 100%;
  min-height: 120px;
  resize: vertical;
  background: rgba(12, 25, 94, 0.7);
  color: #d6e7ff;
  border: 1px solid rgba(136, 160, 246, 0.45);
  border-radius: 8px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.preview-card {
  width: 100%;
  border: 1px solid rgba(136, 160, 246, 0.35);
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
}

.preview-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: #f0f4f8;
  border-bottom: 1px solid #d0d7e5;
  color: #4a5568;
  font-size: 11px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

.preview-body {
  width: 100%;
  height: 200px;
  background: white;
}

.html-preview-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.error-message {
  background: rgba(255, 122, 122, 0.15);
  border: 1px solid rgba(255, 122, 122, 0.3);
  border-radius: 6px;
  color: #ff9999;
  padding: 10px;
  margin-bottom: 12px;
  font-size: 12px;
  font-weight: 500;
}

.quiz-navigation {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.nav-button {
  flex: 1;
  border: none;
  border-radius: 6px;
  padding: 10px;
  background: #7de8ff;
  color: #0d2440;
  font-weight: 600;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.nav-button.single-action {
  flex: 0 1 auto;
  align-self: center;
  width: min(240px, 100%);
}

.nav-button:hover:not(:disabled) {
  background: #9cefff;
  transform: translateY(-1px);
}

.nav-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Language selector modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: rgba(15, 18, 94, 0.98);
  border-radius: 20px;
  padding: 36px;
  border: 2px solid rgba(157, 243, 182, 0.3);
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  max-width: 700px;
  width: 95%;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  color: #cfe0ff;
  font-size: 22px;
  cursor: pointer;
}

.modal-content h2 {
  color: #e3f7ff;
  margin-top: 0;
}

.learning-path-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.path-option {
  border: 2px solid rgba(157, 243, 182, 0.3);
  background: rgba(74, 63, 168, 0.5);
  color: #fff;
  border-radius: 999px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.path-option:hover {
  border-color: rgba(157, 243, 182, 0.6);
  background: rgba(74, 63, 168, 0.7);
}

.path-option.active {
  border-color: #9df3b6;
  background: rgba(157, 243, 182, 0.2);
  color: #9df3b6;
}

.language-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.language-option {
  background: linear-gradient(135deg, rgba(74, 63, 168, 0.6) 0%, rgba(45, 31, 92, 0.6) 100%);
  color: #fff;
  border: 2px solid rgba(157, 243, 182, 0.2);
  border-radius: 16px;
  padding: 20px 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  min-height: 140px;
  justify-content: center;
}

.language-option:hover {
  border-color: rgba(157, 243, 182, 0.5);
  background: linear-gradient(135deg, rgba(85, 73, 184, 0.7) 0%, rgba(54, 35, 112, 0.7) 100%);
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(13, 226, 143, 0.2);
}

.language-option.active {
  border-color: #9df3b6;
  background: linear-gradient(135deg, rgba(157, 243, 182, 0.2) 0%, rgba(93, 243, 148, 0.15) 100%);
  color: #9df3b6;
}

.lang-icon {
  font-size: 36px;
}

.language-icon-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.lang-icon-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.lang-name {
  font-size: 12px;
  font-weight: 600;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #233dff;
  border-top: 1px solid #1a28cc;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 70px;
  z-index: 100;
}

.nav-item {
  flex: 1;
  height: 100%;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0;
  cursor: pointer;
  padding: 8px 12px;
  transition: all 0.3s ease;
}

.nav-item.has-alert {
  position: relative;
}

.menu-alert-badge {
  position: absolute;
  top: 8px;
  left: calc(50% + 6px);
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #ff4d4f;
  color: #fff;
  font-size: 10px;
  line-height: 16px;
  font-weight: 700;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.9);
}

.nav-item svg {
  width: 31px;
  height: 31px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: #fff;
  transform: scale(1.1);
}

.nav-item.active {
  color: #fff;
  background: rgba(0, 0, 0, 0.2);
}

.nav-item.active svg {
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse-line {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.35);
  }
}

/* Responsive: Tablet */
@media (max-width: 1024px) {
  .level-content {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(180px, 40vh) minmax(0, 1fr);
    min-height: 0;
  }

  .left-panel,
  .right-panel {
    min-height: 0;
  }

  .left-panel {
    max-height: 40vh;
  }

  .editor-container {
    flex: 0 1 150px;
  }

  .path-step.lane-left {
    transform: translateX(-36px);
  }

  .path-step.lane-right {
    transform: translateX(36px);
  }

  .level-node {
    width: 66px;
    height: 66px;
    font-size: 24px;
  }
}

/* Responsive: Mobile */
@media (max-width: 768px) {
  .path-step.lane-left {
    transform: translateX(-24px);
  }

  .path-step.lane-right {
    transform: translateX(24px);
  }

  .progress-section h1 {
    font-size: 18px;
  }

  .level-header {
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px;
  }

  .header-info {
    flex: 1;
  }

  .header-info h2 {
    font-size: 16px;
  }

  .level-content {
    grid-template-rows: minmax(160px, 36vh) minmax(0, 1fr);
    padding: 8px;
    gap: 8px;
  }

  .left-panel {
    max-height: 36vh;
  }

  .editor-container {
    flex: 0 1 100px;
  }

  .level-node {
    width: 62px;
    height: 62px;
    font-size: 22px;
  }

  .level-node.exam {
    width: 158px;
    height: 68px;
    border-radius: 12px;
  }

  .project-node-title {
    font-size: 15px;
  }

  .project-node-subtitle {
    font-size: 10px;
    max-width: 78px;
  }

  .project-node-icon-wrap {
    width: 44px;
    height: 36px;
  }

  .project-node-icon {
    border-radius: 4px;
  }

  .connector-tag {
    left: 50%;
    transform: translateX(-50%);
    top: 34px;
  }

  .level-modal {
    width: 95%;
    max-width: 500px;
  }

  .run-button,
  .nav-button {
    font-size: 11px;
    padding: 8px 10px;
  }

  .nav-button.single-action {
    width: min(210px, 100%);
  }
}

@media (max-width: 480px) {
  .bottom-nav {
    height: 60px;
  }

  .nav-item {
    gap: 0;
  }

  .nav-item svg {
    width: 26px;
    height: 26px;
  }
}

@media (max-width: 360px) {
  .run-button,
  .nav-button {
    font-size: 10px;
    padding: 7px 8px;
  }

  .nav-button.single-action {
    width: min(180px, 100%);
  }

  .level-node.exam {
    width: 142px;
    height: 62px;
  }
}
</style>
