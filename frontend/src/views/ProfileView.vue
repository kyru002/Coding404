<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Perfil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="profile-container">
        <!-- Header del perfil -->
        <div class="profile-header">
          <div class="avatar-container">
            <ion-icon :icon="personCircleOutline" class="avatar-icon"></ion-icon>
          </div>
          <h1>{{ user?.username }}</h1>
          <p>{{ user?.email }}</p>
        </div>

        <!-- Estadísticas -->
        <div class="stats-grid">
          <div class="stat-card-large">
            <ion-icon :icon="flameOutline" class="stat-icon fire"></ion-icon>
            <h2>{{ user?.streak || 0 }}</h2>
            <p>Días de racha</p>
          </div>
          
          <div class="stat-card-large">
            <ion-icon :icon="trophyOutline" class="stat-icon trophy"></ion-icon>
            <h2>{{ user?.xp || 0 }}</h2>
            <p>XP Total</p>
          </div>
          
          <div class="stat-card-large">
            <ion-icon :icon="rocketOutline" class="stat-icon rocket"></ion-icon>
            <h2>Nivel {{ user?.level || 1 }}</h2>
            <p>Tu nivel actual</p>
          </div>
        </div>

        <!-- Progreso por curso -->
        <div class="progress-section">
          <h2>Tu Progreso</h2>
          <p class="section-subtitle">Sigue aprendiendo cada día</p>
          
          <div v-if="userProgress.length === 0" class="empty-state">
            <ion-icon :icon="bookOutline"></ion-icon>
            <p>Aún no has comenzado ningún curso</p>
            <ion-button @click="$router.push('/courses')">
              Explorar Cursos
            </ion-button>
          </div>
          
          <div v-else class="progress-list">
            <div
              v-for="progress in userProgress"
              :key="progress._id"
              class="progress-item"
            >
              <div class="progress-info">
                <h3>{{ progress.course?.title }}</h3>
                <div class="progress-bar-container">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: calculateProgress(progress) + '%' }"
                    ></div>
                  </div>
                  <span class="progress-percent">{{ calculateProgress(progress) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Opciones -->
        <div class="options-section">
          <ion-list>
            <ion-item button @click="showSettings">
              <ion-icon :icon="settingsOutline" slot="start"></ion-icon>
              <ion-label>Configuración</ion-label>
            </ion-item>
            
            <ion-item button @click="showAbout">
              <ion-icon :icon="informationCircleOutline" slot="start"></ion-icon>
              <ion-label>Acerca de</ion-label>
            </ion-item>
            
            <ion-item button @click="confirmLogout" lines="none">
              <ion-icon :icon="logOutOutline" slot="start" color="danger"></ion-icon>
              <ion-label color="danger">Cerrar Sesión</ion-label>
            </ion-item>
          </ion-list>
        </div>
      </div>

      <!-- Alert de confirmación -->
      <ion-alert
        :is-open="showLogoutAlert"
        header="Cerrar Sesión"
        message="¿Estás seguro de que quieres cerrar sesión?"
        :buttons="alertButtons"
        @didDismiss="showLogoutAlert = false"
      ></ion-alert>
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
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonAlert
} from '@ionic/vue';
import {
  personCircleOutline,
  flameOutline,
  trophyOutline,
  rocketOutline,
  bookOutline,
  settingsOutline,
  informationCircleOutline,
  logOutOutline
} from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useProgressStore } from '@/stores/progress';

export default {
  name: 'ProfileView',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonAlert
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const progressStore = useProgressStore();
    
    const showLogoutAlert = ref(false);
    
    const user = computed(() => authStore.user);
    const userProgress = computed(() => progressStore.userProgress);

    const calculateProgress = (progress) => {
      // Calcular porcentaje de completado basado en ejercicios completados
      return Math.round((progress.completedExercises?.length || 0) * 10);
    };

    const confirmLogout = () => {
      showLogoutAlert.value = true;
    };

    const handleLogout = () => {
      authStore.logout();
      router.replace('/login');
    };

    const showSettings = () => {
      // TODO: Implementar vista de configuración
      alert('Configuración - Próximamente');
    };

    const showAbout = () => {
      // TODO: Implementar vista de acerca de
      alert('Coding404 v1.0.0\nAprende programación de forma interactiva');
    };

    const alertButtons = [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Cerrar Sesión',
        role: 'confirm',
        handler: handleLogout
      }
    ];

    onMounted(async () => {
      if (user.value) {
        await progressStore.fetchUserProgress(user.value.id);
      }
    });

    return {
      user,
      userProgress,
      showLogoutAlert,
      alertButtons,
      calculateProgress,
      confirmLogout,
      showSettings,
      showAbout,
      personCircleOutline,
      flameOutline,
      trophyOutline,
      rocketOutline,
      bookOutline,
      settingsOutline,
      informationCircleOutline,
      logOutOutline
    };
  }
};
</script>

<style scoped>
.profile-container {
  padding-bottom: 2rem;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 1.5rem 2rem;
  text-align: center;
}

.avatar-container {
  margin-bottom: 1rem;
}

.avatar-icon {
  font-size: 6rem;
  color: white;
}

.profile-header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.profile-header p {
  margin: 0.5rem 0 0;
  opacity: 0.9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1.5rem;
  margin-top: -1rem;
}

.stat-card-large {
  background: white;
  border-radius: 16px;
  padding: 1.25rem 0.75rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2.5rem;
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

.stat-card-large h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-card-large p {
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
  color: #6b7280;
}

.progress-section {
  padding: 1.5rem;
}

.progress-section h2 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.section-subtitle {
  margin: 0 0 1.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state ion-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.progress-list {
  background: white;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.progress-item {
  padding: 1rem 0;
}

.progress-item:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}

.progress-info h3 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.progress-percent {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  min-width: 40px;
  text-align: right;
}

.options-section {
  padding: 0 1.5rem 1.5rem;
}

.options-section ion-list {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.options-section ion-item {
  --padding-start: 1rem;
}
</style>
