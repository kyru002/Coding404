<template>
  <div class="login-container">
    <!-- Logo -->
    <div class="logo-container">
      <img src="/images/Coding-404-logo.png" alt="Coding 404" class="logo-image" />
    </div>

    <div class="login-card">
      <!-- Formulario -->
      <form class="login-form" @submit.prevent="handleLogin">
        <!-- Input Usuario -->
        <div class="input-group">
          <div class="input-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <input 
            type="text" 
            v-model="username" 
            placeholder="Usuario" 
            class="login-input"
            required
          />
        </div>

        <!-- Input Contraseña -->
        <div class="input-group">
          <div class="input-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/>
            </svg>
          </div>
          <input 
            type="password" 
            v-model="password" 
            placeholder="Contraseña" 
            class="login-input"
            required
          />
        </div>

        <!-- Botón Iniciar Sesión -->
        <button type="submit" class="btn-login">
          Iniciar Sesión
        </button>

        <!-- Link Registrarse -->
        <a class="link-register" @click="goToRegister">
          ¿No tienes cuenta? Regístrate
        </a>

        <div v-if="errorMessage" class="login-error">
          {{ errorMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { API_BASE_URL } from '../config/api'

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '',
      isSubmitting: false
    }
  },
  methods: {
    async handleLogin() {
      if (this.isSubmitting) {
        return;
      }

      this.errorMessage = '';
      const identifier = this.username.trim();
      const password = this.password;

      if (!identifier || !password) {
        this.errorMessage = 'Completa usuario y contrasena.';
        return;
      }

      this.isSubmitting = true;

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ identifier, password })
        });

        const data = await response.json();

        if (!response.ok) {
          this.errorMessage = data.message || 'No se pudo iniciar sesion.';
          this.isSubmitting = false;
          return;
        }

        const sessionUser = {
          userId: data.userId,
          username: data.username,
          programmerType: data.programmerType,
          learningPath: data.learningPath || {},
          role: data.role || 'user',
          isAdmin: Boolean(data.isAdmin)
        };

        // Los datos se guardan en memoria, sincronizados con la BD
        this.$emit('show-home', sessionUser);
      } catch (error) {
        this.errorMessage = 'Error de conexion con el servidor.';
      } finally {
        this.isSubmitting = false;
      }
    },
    goToRegister() {
      this.$emit('show-register');
    }
  }
}

//js que una vez se inicie  compruebe el local storage para ver si hay un usuario logueado, si lo hay, mostrar la home directamente

</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #233dff;
  padding: 20px;
}

.login-card {
  background: #1800ad;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Logo */
.logo-container {
  text-align: center;
  margin-bottom: 10px;
  animation: fadeIn 0.8s ease-out;
  display: flex;
    justify-content: flex-start;
  align-items: center;
  width: 100%;
    max-width: 400px;
  padding-left: 28px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes floatLogo {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
  100% {
    transform: translateY(0);
  }
}

.logo-image {
  width: 100%;
  max-width: 320px;
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
  display: block;
  animation: floatLogo 2.6s ease-in-out infinite;
}

/* Formulario */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 15px;
  width: 20px;
  height: 20px;
  color: #999;
  pointer-events: none;
}

.login-input {
  width: 100%;
  padding: 15px 15px 15px 45px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.login-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.login-input::placeholder {
  color: #999;
  opacity: 0.7;
}

.btn-login {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #000000;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-top: 10px;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-login:active {
  transform: translateY(0);
}

.link-register {
  width: 100%;
  padding: 15px;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  border: none;
  font-size: 15px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  font-family: 'Georgia', 'Times New Roman', serif;
  text-decoration: none;
  display: block;
  border-radius: 12px;
  box-shadow: 0 0 0 rgba(255, 255, 255, 0);
}

.link-register:hover {
  color: #ffffff;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
}

.link-register:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.45);
}

.login-error {
  color: #ffb3b3;
  font-size: 13px;
  text-align: center;
}

/* Responsive para móvil */
@media (max-width: 480px) {
  .login-card {
    padding: 25px 20px;
    max-width: 340px;
  }

  .logo-image {
    max-width: 280px;
  }

  .login-input {
    font-size: 14px;
    padding: 12px 12px 12px 40px;
  }

  .btn-login,
  .link-register {
    padding: 12px;
    font-size: 14px;
  }
}
</style>
