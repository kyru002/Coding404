<template>
  <ion-page>
    <ion-content :fullscreen="true" class="register-content">
      <div class="register-container">
        <!-- Header -->
        <div class="header-section">
          <ion-icon :icon="arrowBackOutline" class="back-icon" @click="$router.push('/login')"></ion-icon>
          <h1 class="page-title">Crear Cuenta</h1>
          <p class="page-subtitle">Únete a miles de estudiantes</p>
        </div>

        <!-- Formulario de Registro -->
        <form @submit.prevent="handleRegister" class="register-form">
          <ion-item lines="none" class="input-item">
            <ion-icon :icon="personOutline" slot="start" color="primary"></ion-icon>
            <ion-input
              v-model="form.username"
              type="text"
              placeholder="Nombre de usuario"
              required
            ></ion-input>
          </ion-item>

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
              placeholder="Contraseña (min. 6 caracteres)"
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
            class="register-button"
            :disabled="loading"
          >
            <ion-spinner v-if="loading" name="crescent"></ion-spinner>
            <span v-else>Registrarse</span>
          </ion-button>

          <div class="login-link">
            <p>¿Ya tienes cuenta? 
              <router-link to="/login">Inicia Sesión</router-link>
            </p>
          </div>
        </form>

        <!-- Toast para mensajes -->
        <ion-toast
          :is-open="showToast"
          :message="toastMessage"
          :duration="3000"
          :color="toastColor"
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
import {
  personOutline,
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  arrowBackOutline
} from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'RegisterView',
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
      username: '',
      email: '',
      password: ''
    });
    
    const loading = ref(false);
    const showPassword = ref(false);
    const showToast = ref(false);
    const toastMessage = ref('');
    const toastColor = ref('danger');

    const handleRegister = async () => {
      loading.value = true;
      
      try {
        await authStore.register(form.value);
        toastMessage.value = '¡Cuenta creada exitosamente!';
        toastColor.value = 'success';
        showToast.value = true;
        
        setTimeout(() => {
          router.push('/home');
        }, 1500);
      } catch (error) {
        toastMessage.value = error.response?.data?.message || 'Error al registrar';
        toastColor.value = 'danger';
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
      toastColor,
      handleRegister,
      personOutline,
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      arrowBackOutline
    };
  }
};
</script>

<style scoped>
.register-content {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  width: 100%;
  max-width: 400px;
}

.back-icon {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 2rem;
  color: white;
  cursor: pointer;
}

.page-title {
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  margin-top: 0.5rem;
}

.register-form {
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

.register-button {
  --border-radius: 12px;
  margin-top: 1.5rem;
  height: 50px;
  font-weight: 600;
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
}

.login-link p {
  color: #666;
  margin: 0;
}

.login-link a {
  color: var(--ion-color-primary);
  text-decoration: none;
  font-weight: 600;
}
</style>
