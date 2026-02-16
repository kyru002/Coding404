<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/courses"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ course?.title || 'Curso' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <div v-else-if="course" class="course-container">
        <!-- Header del curso -->
        <div class="course-header" :style="{ backgroundColor: course.color }">
          <div class="course-icon-hero">
            <ion-icon :icon="codeSlashOutline"></ion-icon>
          </div>
          <h1>{{ course.title }}</h1>
          <p>{{ course.description }}</p>
          
          <div class="course-stats">
            <div class="stat">
              <ion-icon :icon="bookOutline"></ion-icon>
              <span>{{ course.totalLessons }} lecciones</span>
            </div>
            <div class="stat">
              <ion-icon :icon="timeOutline"></ion-icon>
              <span>{{ course.estimatedTime }}</span>
            </div>
            <div class="stat">
              <ion-icon :icon="barChartOutline"></ion-icon>
              <span>{{ course.difficulty }}</span>
            </div>
          </div>
        </div>

        <!-- Lecciones -->
        <div class="lessons-section">
          <h2>Lecciones</h2>
          
          <div class="lessons-list">
            <div
              v-for="(lesson, index) in course.lessons"
              :key="lesson._id"
              class="lesson-item"
              :class="{ locked: lesson.isLocked }"
              @click="!lesson.isLocked && $router.push(`/lesson/${lesson._id}`)"
            >
              <div class="lesson-number">
                <span v-if="!lesson.isLocked">{{ index + 1 }}</span>
                <ion-icon v-else :icon="lockClosedOutline"></ion-icon>
              </div>
              
              <div class="lesson-content">
                <h3>{{ lesson.title }}</h3>
                <p>{{ lesson.description }}</p>
                
                <div class="lesson-footer">
                  <ion-badge :color="getLessonTypeColor(lesson.type)">
                    {{ formatLessonType(lesson.type) }}
                  </ion-badge>
                  <span class="xp-reward">
                    <ion-icon :icon="trophyOutline"></ion-icon>
                    +{{ lesson.xpReward }} XP
                  </span>
                </div>
              </div>
              
              <ion-icon
                v-if="!lesson.isLocked"
                :icon="chevronForwardOutline"
                class="arrow-icon"
              ></ion-icon>
            </div>
          </div>
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
  IonSpinner
} from '@ionic/vue';
import {
  codeSlashOutline,
  bookOutline,
  timeOutline,
  barChartOutline,
  lockClosedOutline,
  chevronForwardOutline,
  trophyOutline
} from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCourseStore } from '@/stores/course';

export default {
  name: 'CourseDetailView',
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
    IonSpinner
  },
  setup() {
    const route = useRoute();
    const courseStore = useCourseStore();
    
    const course = ref(null);
    const loading = ref(true);

    const getLessonTypeColor = (type) => {
      const colors = {
        lesson: 'primary',
        practice: 'success',
        quiz: 'warning',
        challenge: 'danger'
      };
      return colors[type] || 'medium';
    };

    const formatLessonType = (type) => {
      const types = {
        lesson: 'Lección',
        practice: 'Práctica',
        quiz: 'Quiz',
        challenge: 'Desafío'
      };
      return types[type] || type;
    };

    onMounted(async () => {
      const courseId = route.params.id;
      try {
        course.value = await courseStore.fetchCourseById(courseId);
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        loading.value = false;
      }
    });

    return {
      course,
      loading,
      getLessonTypeColor,
      formatLessonType,
      codeSlashOutline,
      bookOutline,
      timeOutline,
      barChartOutline,
      lockClosedOutline,
      chevronForwardOutline,
      trophyOutline
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

.course-header {
  color: white;
  padding: 2rem 1.5rem;
  text-align: center;
}

.course-icon-hero {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.course-icon-hero ion-icon {
  font-size: 3rem;
  color: white;
}

.course-header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.course-header p {
  margin: 0.75rem 0;
  opacity: 0.9;
  line-height: 1.5;
}

.course-stats {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.stat ion-icon {
  font-size: 1.25rem;
}

.lessons-section {
  padding: 1.5rem;
}

.lessons-section h2 {
  margin: 0 0 1rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.lesson-item {
  background: white;
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.lesson-item:active {
  transform: scale(0.98);
}

.lesson-item.locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.lesson-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.lesson-number ion-icon {
  font-size: 1.25rem;
}

.lesson-content {
  flex: 1;
}

.lesson-content h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.lesson-content p {
  margin: 0.25rem 0 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.lesson-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.xp-reward {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #f59e0b;
  font-weight: 600;
}

.xp-reward ion-icon {
  font-size: 1rem;
}

.arrow-icon {
  font-size: 1.5rem;
  color: #9ca3af;
  flex-shrink: 0;
}
</style>
