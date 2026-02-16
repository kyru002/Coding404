<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Inicio</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$router.push('/profile')">
            <ion-icon :icon="personCircleOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Sección de bienvenida -->
      <div class="welcome-section">
        <h1>¡Hola, {{ user?.username }}! 👋</h1>
        <p>Continúa tu viaje de aprendizaje</p>
      </div>

      <!-- Estadísticas del usuario -->
      <div class="stats-container">
        <div class="stat-card">
          <ion-icon :icon="flameOutline" class="stat-icon fire"></ion-icon>
          <div class="stat-content">
            <h3>{{ user?.streak || 0 }}</h3>
            <p>Días de racha</p>
          </div>
        </div>
        
        <div class="stat-card">
          <ion-icon :icon="trophyOutline" class="stat-icon trophy"></ion-icon>
          <div class="stat-content">
            <h3>{{ user?.xp || 0 }}</h3>
            <p>XP Total</p>
          </div>
        </div>
        
        <div class="stat-card">
          <ion-icon :icon="rocketOutline" class="stat-icon rocket"></ion-icon>
          <div class="stat-content">
            <h3>Nivel {{ user?.level || 1 }}</h3>
            <p>Tu nivel</p>
          </div>
        </div>
      </div>

      <!-- Cursos disponibles -->
      <div class="courses-section">
        <div class="section-header">
          <h2>Tus Cursos</h2>
          <ion-button fill="clear" @click="$router.push('/courses')">
            Ver todos
          </ion-button>
        </div>

        <ion-spinner v-if="loading" name="crescent"></ion-spinner>

        <div v-else class="courses-grid">
          <div
            v-for="course in courses.slice(0, 4)"
            :key="course._id"
            class="course-card"
            @click="$router.push(`/course/${course._id}`)"
          >
            <div class="course-icon" :style="{ backgroundColor: course.color }">
              <ion-icon :icon="codeSlashOutline"></ion-icon>
            </div>
            <div class="course-info">
              <h3>{{ course.title }}</h3>
              <p>{{ course.difficulty }}</p>
              <ion-badge>{{ course.totalLessons }} lecciones</ion-badge>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensaje de motivación -->
      <div class="motivation-card">
        <ion-icon :icon="bulbOutline" class="motivation-icon"></ion-icon>
        <p>"El código es como el humor. Cuando tienes que explicarlo, es malo." - Cory House</p>
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
  IonButton,
  IonButtons,
  IonIcon,
  IonBadge,
  IonSpinner
} from '@ionic/vue';
import {
  personCircleOutline,
  flameOutline,
  trophyOutline,
  rocketOutline,
  codeSlashOutline,
  bulbOutline
} from 'ionicons/icons';
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useCourseStore } from '@/stores/course';

export default {
  name: 'HomeView',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonBadge,
    IonSpinner
  },
  setup() {
    const authStore = useAuthStore();
    const courseStore = useCourseStore();
    
    const loading = ref(false);
    
    const user = computed(() => authStore.user);
    const courses = computed(() => courseStore.courses);

    onMounted(async () => {
      authStore.loadUserFromStorage();
      loading.value = true;
      try {
        await courseStore.fetchCourses();
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        loading.value = false;
      }
    });

    return {
      user,
      courses,
      loading,
      personCircleOutline,
      flameOutline,
      trophyOutline,
      rocketOutline,
      codeSlashOutline,
      bulbOutline
    };
  }
};
</script>

<style scoped>
.welcome-section {
  padding: 2rem 1.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.welcome-section h1 {
  font-size: 1.8rem;
  margin: 0;
  font-weight: 700;
}

.welcome-section p {
  margin: 0.5rem 0 0;
  opacity: 0.9;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1.5rem;
  margin-top: -1rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-icon.fire {
  color: #f59e0b;
}

.stat-icon.trophy {
  color: #fbbf24;
}

.stat-icon.rocket {
  color: #8b5cf6;
}

.stat-content h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-content p {
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
  color: #6b7280;
}

.courses-section {
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.course-card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.course-card:active {
  transform: scale(0.98);
}

.course-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.course-icon ion-icon {
  font-size: 1.5rem;
  color: white;
}

.course-info h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.course-info p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.motivation-card {
  margin: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.motivation-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.motivation-card p {
  margin: 0;
  font-style: italic;
  font-size: 0.9rem;
  line-height: 1.5;
}
</style>
