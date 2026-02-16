<template>
  <ion-page>
    <ion-content :fullscreen="true" class="login-content">
      <div class="login-container">
        <!-- Logo -->
        <div class="logo-section">
          <img src="@/assets/logo.png" alt="Coding 404" class="logo" v-if="false" />
          <h1 class="app-title">Coding 404</h1>
          <p class="app-subtitle">Aprende a programar jugando</p>
        </div>

        <!-- Formulario de Login -->
        <form @submit.prevent="handleLogin" class="login-form">
          <ion-item lines="none" class="input-item">
            <ion-icon :icon="mailOutline" slot="start" color="primary"></ion-icon>
            <ion-input
              v-model="form.email"
              type="email"
              placeholder="Email"
              required
            ></ion-input>
          </ion-item>

          <ion-item lines="none" class="input-item">
            <ion-icon :icon="lockClosedOutline" slot="start" color="primary"></ion-icon>
            <ion-input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Contraseña"
              required
            ></ion-input>
            <ion-icon
              :icon="showPassword ? eyeOffOutline : eyeOutline"
              slot="end"
              @click="showPassword = !showPassword"
              class="password-toggle"
            ></ion-icon>
          </ion-item>

          <ion-button
            expand="block"
            type="submit"
            class="login-button"
            :disabled="loading"
          >
            <ion-spinner v-if="loading" name="crescent"></ion-spinner>
            <span v-else>Iniciar Sesión</span>
          </ion-button>

          <div class="register-link">
            <p>¿No tienes cuenta? 
              <router-link to="/register">Regístrate</router-link>
            </p>
          </div>
        </form>

        <!-- Toast para errores -->
        <ion-toast
          :is-open="showToast"
          :message="toastMessage"
          :duration="3000"
          color="danger"
          @didDismiss="showToast = false"
        ></ion-toast>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  IonToast
} from '@ionic/vue';
import { mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'LoginView',
  components: {
    IonPage,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    IonToast
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    
    const form = ref({
      email: '',
      password: ''
    });
    
    const loading = ref(false);
    const showPassword = ref(false);
    const showToast = ref(false);
    const toastMessage = ref('');

    const handleLogin = async () => {
      loading.value = true;
      
      try {
        await authStore.login(form.value);
        router.push('/home');
      } catch (error) {
        toastMessage.value = error.response?.data?.message || 'Error al iniciar sesión';
        showToast.value = true;
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      loading,
      showPassword,
      showToast,
      toastMessage,
      handleLogin,
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline
    };
  }
};
</script>

<style scoped>
.login-content {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.logo-section {
  text-align: center;
  margin-bottom: 3rem;
}

.logo {
  width: 100px;
  height: 100px;
  margin-bottom: 1rem;
}

.app-title {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.app-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  margin-top: 0.5rem;
}

.login-form {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.input-item {
  --background: #f8f9fa;
  --border-radius: 12px;
  margin-bottom: 1rem;
  --padding-start: 1rem;
}

.password-toggle {
  cursor: pointer;
  padding: 0 0.5rem;
}

.login-button {
  --border-radius: 12px;
  margin-top: 1.5rem;
  height: 50px;
  font-weight: 600;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
}

.register-link p {
  color: #666;
  margin: 0;
}

.register-link a {
  color: var(--ion-color-primary);
  text-decoration: none;
  font-weight: 600;
}
</style>
