<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Lección</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <div v-else-if="lesson" class="lesson-container">
        <!-- Header -->
        <div class="lesson-header">
          <ion-badge :color="lesson.course?.color || 'primary'">
            {{ lesson.course?.language }}
          </ion-badge>
          <h1>{{ lesson.title }}</h1>
          <p>{{ lesson.description }}</p>
        </div>

        <!-- Contenido teórico -->
        <div v-if="lesson.content?.theory" class="theory-section">
          <h2>📚 Teoría</h2>
          <p class="theory-text">{{ lesson.content.theory }}</p>
        </div>

        <!-- Puntos clave -->
        <div v-if="lesson.content?.keyPoints?.length" class="key-points-section">
          <h2>💡 Puntos Clave</h2>
          <ul class="key-points-list">
            <li v-for="(point, index) in lesson.content.keyPoints" :key="index">
              {{ point }}
            </li>
          </ul>
        </div>

        <!-- Ejemplos -->
        <div v-if="lesson.content?.examples?.length" class="examples-section">
          <h2>🧪 Ejemplos</h2>
          <div
            v-for="(example, index) in lesson.content.examples"
            :key="index"
            class="example-card"
          >
            <pre class="code-block"><code>{{ example.code }}</code></pre>
            <p class="explanation">{{ example.explanation }}</p>
          </div>
        </div>

        <!-- Ejercicios -->
        <div v-if="currentExercise" class="exercise-section">
          <h2>✏️ Ejercicio {{ currentExerciseIndex + 1 }}/{{ exercises.length }}</h2>
          
          <div class="exercise-card">
            <p class="question">{{ currentExercise.question }}</p>

            <!-- Opciones múltiples -->
            <div v-if="currentExercise.type === 'multiple-choice'" class="options-list">
              <div
                v-for="(option, index) in currentExercise.options"
                :key="index"
                class="option-item"
                :class="{ selected: selectedAnswer === option.text }"
                @click="selectAnswer(option.text)"
              >
                <div class="option-circle">
                  <div v-if="selectedAnswer === option.text" class="option-dot"></div>
                </div>
                <span>{{ option.text }}</span>
              </div>
            </div>

            <!-- Completar código -->
            <div v-else-if="currentExercise.type === 'fill-blank'" class="fill-blank">
              <pre class="code-template">{{ currentExercise.codeTemplate }}</pre>
              <ion-input
                v-model="userAnswer"
                placeholder="Escribe tu respuesta aquí"
                class="answer-input"
              ></ion-input>
            </div>

            <!-- Botones de acción -->
            <div class="exercise-actions">
              <ion-button
                v-if="!answerSubmitted"
                expand="block"
                @click="checkAnswer"
                :disabled="!selectedAnswer && !userAnswer"
              >
                Verificar
              </ion-button>

              <div v-else class="result-container">
                <div class="result-message" :class="{ correct: isCorrect, incorrect: !isCorrect }">
                  <ion-icon :icon="isCorrect ? checkmarkCircleOutline : closeCircleOutline"></ion-icon>
                  <span>{{ isCorrect ? '¡Correcto!' : 'Incorrecto' }}</span>
                </div>

                <p v-if="exerciseResult?.explanation" class="explanation-text">
                  {{ exerciseResult.explanation }}
                </p>

                <ion-button
                  expand="block"
                  @click="nextExercise"
                  :color="isCorrect ? 'success' : 'primary'"
                >
                  {{ hasMoreExercises ? 'Siguiente Ejercicio' : 'Completar Lección' }}
                </ion-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón para iniciar ejercicios o completar -->
        <div v-else-if="exercises.length > 0" class="start-exercises">
          <ion-button expand="block" size="large" @click="startExercises">
            <ion-icon :icon="playOutline" slot="start"></ion-icon>
            Comenzar Ejercicios
          </ion-button>
        </div>

        <div v-else class="no-exercises">
          <p>Esta lección no tiene ejercicios todavía.</p>
          <ion-button @click="$router.back()">Volver</ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonBadge,
  IonButton,
  IonInput,
  IonSpinner
} from '@ionic/vue';
import {
  playOutline,
  checkmarkCircleOutline,
  closeCircleOutline
} from 'ionicons/icons';
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { lessonService, exerciseService } from '@/services/api';
import { useProgressStore } from '@/stores/progress';
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'LessonView',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonBadge,
    IonButton,
    IonInput,
    IonSpinner
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const progressStore = useProgressStore();
    const authStore = useAuthStore();
    
    const lesson = ref(null);
    const exercises = ref([]);
    const loading = ref(true);
    const currentExerciseIndex = ref(-1);
    const selectedAnswer = ref('');
    const userAnswer = ref('');
    const answerSubmitted = ref(false);
    const exerciseResult = ref(null);
    const isCorrect = ref(false);

    const currentExercise = computed(() => {
      if (currentExerciseIndex.value >= 0 && currentExerciseIndex.value < exercises.value.length) {
        return exercises.value[currentExerciseIndex.value];
      }
      return null;
    });

    const hasMoreExercises = computed(() => {
      return currentExerciseIndex.value < exercises.value.length - 1;
    });

    const selectAnswer = (answer) => {
      if (!answerSubmitted.value) {
        selectedAnswer.value = answer;
      }
    };

    const startExercises = () => {
      currentExerciseIndex.value = 0;
      resetExercise();
    };

    const resetExercise = () => {
      selectedAnswer.value = '';
      userAnswer.value = '';
      answerSubmitted.value = false;
      exerciseResult.value = null;
      isCorrect.value = false;
    };

    const checkAnswer = async () => {
      const answer = selectedAnswer.value || userAnswer.value;
      if (!answer) return;

      try {
        const response = await exerciseService.checkAnswer(currentExercise.value._id, answer);
        exerciseResult.value = response.data;
        isCorrect.value = response.data.isCorrect;
        answerSubmitted.value = true;

        // Guardar progreso
        if (authStore.user) {
          await progressStore.saveProgress({
            userId: authStore.user.id,
            courseId: lesson.value.course._id,
            lessonId: lesson.value._id,
            exerciseId: currentExercise.value._id,
            isCorrect: isCorrect.value
          });
        }
      } catch (error) {
        console.error('Error checking answer:', error);
      }
    };

    const nextExercise = () => {
      if (hasMoreExercises.value) {
        currentExerciseIndex.value++;
        resetExercise();
      } else {
        // Marcar lección como completada
        router.back();
      }
    };

    onMounted(async () => {
      const lessonId = route.params.id;
      try {
        const [lessonResponse, exercisesResponse] = await Promise.all([
          lessonService.getById(lessonId),
          lessonService.getExercises(lessonId)
        ]);
        
        lesson.value = lessonResponse.data.data;
        exercises.value = exercisesResponse.data.data;
      } catch (error) {
        console.error('Error loading lesson:', error);
      } finally {
        loading.value = false;
      }
    });

    return {
      lesson,
      exercises,
      loading,
      currentExercise,
      currentExerciseIndex,
      selectedAnswer,
      userAnswer,
      answerSubmitted,
      exerciseResult,
      isCorrect,
      hasMoreExercises,
      selectAnswer,
      startExercises,
      checkAnswer,
      nextExercise,
      playOutline,
      checkmarkCircleOutline,
      closeCircleOutline
    };
  }
};
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
}

.lesson-container {
  padding-bottom: 2rem;
}

.lesson-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 1.5rem;
}

.lesson-header h1 {
  margin: 0.75rem 0 0.5rem;
  font-size: 1.8rem;
  font-weight: 700;
}

.lesson-header p {
  margin: 0;
  opacity: 0.9;
}

.theory-section,
.key-points-section,
.examples-section,
.exercise-section {
  padding: 1.5rem;
}

.theory-section h2,
.key-points-section h2,
.examples-section h2,
.exercise-section h2 {
  margin: 0 0 1rem;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1f2937;
}

.theory-text {
  line-height: 1.7;
  color: #4b5563;
}

.key-points-list {
  margin: 0;
  padding-left: 1.5rem;
}

.key-points-list li {
  margin-bottom: 0.75rem;
  line-height: 1.6;
  color: #4b5563;
}

.example-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.code-block {
  background: #1f2937;
  color: #10b981;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  margin: 0 0 0.75rem;
}

.explanation {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.exercise-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.question {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem;
  line-height: 1.6;
}

.options-list {
  margin-bottom: 1.5rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.option-item.selected {
  background: #ede9fe;
  border: 2px solid #8b5cf6;
}

.option-circle {
  width: 24px;
  height: 24px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-item.selected .option-circle {
  border-color: #8b5cf6;
}

.option-dot {
  width: 12px;
  height: 12px;
  background: #8b5cf6;
  border-radius: 50%;
}

.fill-blank {
  margin-bottom: 1.5rem;
}

.code-template {
  background: #1f2937;
  color: #10b981;
  padding: 1rem;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  margin: 0 0 1rem;
}

.answer-input {
  --background: #f9fafb;
  --border-radius: 8px;
  --padding-start: 1rem;
  --padding-end: 1rem;
}

.result-container {
  margin-top: 1rem;
}

.result-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  font-weight: 600;
}

.result-message.correct {
  background: #d1fae5;
  color: #065f46;
}

.result-message.incorrect {
  background: #fee2e2;
  color: #991b1b;
}

.result-message ion-icon {
  font-size: 2rem;
}

.explanation-text {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  margin: 0 0 1rem;
  color: #4b5563;
  line-height: 1.6;
}

.start-exercises {
  padding: 1.5rem;
}

.no-exercises {
  padding: 3rem 1.5rem;
  text-align: center;
}

.no-exercises p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}
</style>
