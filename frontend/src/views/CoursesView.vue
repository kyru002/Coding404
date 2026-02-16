<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Cursos</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="courses-container">
        <div class="header-section">
          <h1>Explora nuestros cursos</h1>
          <p>Aprende programación desde cero</p>
        </div>

        <ion-spinner v-if="loading" name="crescent" class="centered-spinner"></ion-spinner>

        <div v-else class="courses-list">
          <div
            v-for="course in courses"
            :key="course._id"
            class="course-item"
            @click="$router.push(`/course/${course._id}`)"
          >
            <div class="course-left">
              <div class="course-icon-large" :style="{ backgroundColor: course.color }">
                <ion-icon :icon="codeSlashOutline"></ion-icon>
              </div>
              
              <div class="course-details">
                <h2>{{ course.title }}</h2>
                <p>{{ course.description }}</p>
                
                <div class="course-meta">
                  <ion-badge :color="getDifficultyColor(course.difficulty)">
                    {{ course.difficulty }}
                  </ion-badge>
                  <span class="meta-item">
                    <ion-icon :icon="bookOutline"></ion-icon>
                    {{ course.totalLessons }} lecciones
                  </span>
                  <span class="meta-item">
                    <ion-icon :icon="timeOutline"></ion-icon>
                    {{ course.estimatedTime }}
                  </span>
                </div>
              </div>
            </div>
            
            <ion-icon :icon="chevronForwardOutline" class="arrow-icon"></ion-icon>
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
  chevronForwardOutline,
  bookOutline,
  timeOutline
} from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useCourseStore } from '@/stores/course';

export default {
  name: 'CoursesView',
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
    const courseStore = useCourseStore();
    const loading = ref(false);
    
    const courses = computed(() => courseStore.courses);

    const getDifficultyColor = (difficulty) => {
      const colors = {
        'Principiante': 'success',
        'Intermedio': 'warning',
        'Avanzado': 'danger'
      };
      return colors[difficulty] || 'primary';
    };

    onMounted(async () => {
      if (courses.value.length === 0) {
        loading.value = true;
        try {
          await courseStore.fetchCourses();
        } finally {
          loading.value = false;
        }
      }
    });

    return {
      courses,
      loading,
      getDifficultyColor,
      codeSlashOutline,
      chevronForwardOutline,
      bookOutline,
      timeOutline
    };
  }
};
</script>

<style scoped>
.courses-container {
  min-height: 100%;
}

.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 1.5rem;
}

.header-section h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.header-section p {
  margin: 0.5rem 0 0;
  opacity: 0.9;
}

.centered-spinner {
  display: block;
  margin: 3rem auto;
}

.courses-list {
  padding: 1rem;
}

.course-item {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.course-item:active {
  transform: scale(0.98);
}

.course-left {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.course-icon-large {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.course-icon-large ion-icon {
  font-size: 2rem;
  color: white;
}

.course-details {
  flex: 1;
}

.course-details h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
}

.course-details p {
  margin: 0.25rem 0 0.75rem;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.course-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.meta-item ion-icon {
  font-size: 1rem;
}

.arrow-icon {
  font-size: 1.5rem;
  color: #9ca3af;
  flex-shrink: 0;
}
</style>
