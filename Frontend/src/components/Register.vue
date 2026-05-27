<template>
  <div class="terminal-page">
    <div class="terminal-window">
      <div class="terminal-topbar">
        <div class="terminal-title">Coding404 Power Shell</div>
        <button type="button" class="terminal-back" @click="goToLogin">
          Volver al login
        </button>
      </div>

      <div class="terminal-body">
        <div class="terminal-line">
          Copyright (C) Coding404 Corporation. Todos los derechos reservados.
        </div>

        <div class="terminal-output">
          <div v-for="(line, index) in lines" :key="index" class="terminal-line">
            {{ line }}
          </div>
        </div>

        <form class="terminal-input" @submit.prevent="submitCurrent">
          <span class="prompt">&gt;</span>
          <span class="terminal-caret" aria-hidden="true">_</span>
          <input
            ref="inputRef"
            v-model="currentInput"
            :type="currentInputType"
            :placeholder="currentPlaceholder"
            class="terminal-input-field"
            autocomplete="off"
            :disabled="isSubmitting"
          />
        </form>

        <div v-if="errorMessage" class="terminal-error">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { API_BASE_URL } from '../config/api'

export default {
  name: 'Register',
  data() {
    return {
      lines: [
        '>_ Hola, buenas bienvenido a Coding404',
        '>_ Como te llamas ?'
      ],
      currentInput: '',
      errorMessage: '',
      step: 'fullName',
      isSubmitting: false,
      form: {
        fullName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        github: {
          hasAccount: false,
          username: ''
        },
        programmerType: ''
      }
    }
  },
  computed: {
    currentInputType() {
      if (this.step === 'password' || this.step === 'confirmPassword') {
        return 'password';
      }
      return 'text';
    },
    currentPlaceholder() {
      const placeholders = {
        fullName: 'Escribe tu nombre',
        email: 'Escribe tu correo',
        username: 'Tu usuario de programador',
        password: 'Crea una contrasena segura',
        confirmPassword: 'Repite la contrasena',
        githubHas: 'si / no',
        githubUsername: 'Tu usuario de GitHub',
        programmerType: 'Front-end / Back-end / Full-Stack / Bases de Datos / Otros'
      };
      return placeholders[this.step] || '';
    }
  },
  mounted() {
    this.focusInput();
  },
  methods: {
    focusInput() {
      this.$nextTick(() => {
        if (this.$refs.inputRef) {
          this.$refs.inputRef.focus();
        }
      });
    },
    pushSystemLine(text) {
      this.lines.push(`>_ ${text}`);
    },
    pushUserLine(text, mask = false) {
      const value = mask ? '*'.repeat(Math.max(text.length, 8)) : text;
      this.lines.push(`>_ ${value}`);
    },
    isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    isStrongPassword(value) {
      const hasMinLength = value.length >= 8;
      const hasUppercase = /[A-Z]/.test(value);
      const hasNumber = /\d/.test(value);
      return hasMinLength && hasUppercase && hasNumber;
    },
    normalizeYesNo(value) {
      const clean = value.toLowerCase().trim();
      if (clean === 'si' || clean === 's' || clean === 'yes' || clean === 'y') {
        return true;
      }
      if (clean === 'no' || clean === 'n') {
        return false;
      }
      return null;
    },
    normalizeProgrammerType(value) {
      const clean = value.toLowerCase().trim();
      if (clean === '1' || clean.includes('front')) {
        return 'Front-end';
      }
      if (clean === '2' || clean.includes('back')) {
        return 'Back-end';
      }
      if (clean === '3' || clean.includes('full')) {
        return 'Full-Stack';
      }
      if (clean === '4' || clean.includes('base') || clean.includes('dato') || clean.includes('database')) {
        return 'Bases de Datos';
      }
      if (clean === '5' || clean.includes('otro')) {
        return 'Otros';
      }
      return null;
    },
    async checkAvailability(payload) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          return { emailTaken: false, usernameTaken: false };
        }

        return await response.json();
      } catch (error) {
        return { emailTaken: false, usernameTaken: false };
      }
    },
    async submitCurrent() {
      if (this.isSubmitting) {
        return;
      }

      const value = this.currentInput.trim();
      if (!value) {
        this.errorMessage = 'Por favor, escribe una respuesta.';
        return;
      }

      this.errorMessage = '';

      switch (this.step) {
        case 'fullName': {
          if (value.length < 2) {
            this.errorMessage = 'El nombre debe tener al menos 2 caracteres.';
            return;
          }
          this.pushUserLine(value);
          this.form.fullName = value;
          this.pushSystemLine('Cual es tu correo electronico?');
          this.step = 'email';
          break;
        }
        case 'email': {
          if (!this.isValidEmail(value)) {
            this.errorMessage = 'Correo no valido. Intenta de nuevo.';
            return;
          }

          this.pushUserLine(value);
          this.isSubmitting = true;
          const availability = await this.checkAvailability({ email: value });
          this.isSubmitting = false;

          if (availability.emailTaken) {
            this.errorMessage = 'Este correo ya esta registrado. Usa otro.';
            return;
          }

          this.form.email = value;
          this.pushSystemLine('Que nombre quieres tener como programador?');
          this.step = 'username';
          break;
        }
        case 'username': {
          if (value.length < 3) {
            this.errorMessage = 'El usuario debe tener al menos 3 caracteres.';
            return;
          }

          this.pushUserLine(value);
          this.isSubmitting = true;
          const availability = await this.checkAvailability({ username: value });
          this.isSubmitting = false;

          if (availability.usernameTaken) {
            this.errorMessage = 'Este usuario ya existe. Prueba otro.';
            return;
          }

          this.form.username = value;
          this.pushSystemLine(
            'Crea una contrasena segura (min 8, 1 mayuscula y 1 numero).'
          );
          this.step = 'password';
          break;
        }
        case 'password': {
          if (!this.isStrongPassword(value)) {
            this.errorMessage = 'La contraseña no cumple los requisitos.';
            return;
          }
          this.pushUserLine(value, true);
          this.form.password = value;
          this.pushSystemLine('Repite la contraseña para confirmar.');
          this.step = 'confirmPassword';
          break;
        }
        case 'confirmPassword': {
          if (value !== this.form.password) {
            this.errorMessage = 'Las contraseñas no coinciden.';
            return;
          }
          this.pushUserLine(value, true);
          this.form.confirmPassword = value;
          this.pushSystemLine('Tienes cuenta en GitHub? (si/no)');
          this.step = 'githubHas';
          break;
        }
        case 'githubHas': {
          const hasAccount = this.normalizeYesNo(value);
          if (hasAccount === null) {
            this.errorMessage = 'Responde con si o no.';
            return;
          }
          this.pushUserLine(value);
          this.form.github.hasAccount = hasAccount;
          if (hasAccount) {
            this.pushSystemLine('Como te llamas en GitHub?');
            this.step = 'githubUsername';
          } else {
            this.pushSystemLine(
              'Que tipo de programador quieres ser? (Front-end / Back-end / Full-Stack / Bases de Datos / Otros)'
            );
            this.step = 'programmerType';
          }
          break;
        }
        case 'githubUsername': {
          if (value.length < 2) {
            this.errorMessage = 'El usuario de GitHub debe tener al menos 2 caracteres.';
            return;
          }

          this.pushUserLine(value);
          this.isSubmitting = true;
          const availability = await this.checkAvailability({ githubUsername: value });
          this.isSubmitting = false;

          if (availability.githubUsernameTaken) {
            this.errorMessage = 'Ese usuario de GitHub ya esta registrado.';
            return;
          }

          this.form.github.username = value;
          this.step = 'programmerType';
          break;
        }
        case 'programmerType': {
          const normalized = this.normalizeProgrammerType(value);
          if (!normalized) {
            this.errorMessage = 'Elige una opcion valida o escribe Otros.';
            return;
          }
          this.pushUserLine(value);
          this.form.programmerType = normalized;
          await this.registerUser();
          return;
        }
        default:
          break;
      }

      this.currentInput = '';
      this.focusInput();
    },
    async registerUser() {
      this.isSubmitting = true;
      this.currentInput = '';

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fullName: this.form.fullName,
            email: this.form.email,
            username: this.form.username,
            password: this.form.password,
            programmerType: this.form.programmerType,
            github: {
              hasAccount: this.form.github.hasAccount,
              username: this.form.github.username
            }
          })
        });

        const data = await response.json();

        if (!response.ok) {
          this.pushSystemLine(`Error: ${data.message || 'No se pudo registrar.'}`);
          this.isSubmitting = false;
          this.focusInput();
          return;
        }

        const sessionUser = {
          userId: data.userId,
          username: data.username,
          programmerType: data.programmerType || this.form.programmerType,
          learningPath: data.learningPath || {},
          role: data.role || 'user',
          isAdmin: Boolean(data.isAdmin)
        };

        // Mostrar mensaje de éxito
        this.pushSystemLine('');
        this.pushSystemLine(`Coding 404 te da la bienvenida  ${this.form.fullName}!`);
        this.pushSystemLine('Redirigiendo al inicio...');

        // Los datos se guardan en memoria, sincronizados con la BD
        setTimeout(() => {
          this.$emit('show-home', sessionUser);
        }, 1500);
      } catch (error) {
        this.pushSystemLine('Error: no se pudo conectar con el servidor.');
      } finally {
        this.isSubmitting = false;
      }
    },
    goToLogin() {
      this.$emit('show-login');
    }
  }
}
</script>

<style scoped>
.terminal-page {
  min-height: 100vh;
  background: #000000;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 20px;
  color: #e5e5e5;
  font-family: 'Consolas', 'Courier New', monospace;
}

.terminal-window {
  width: 100%;
  max-width: 900px;
  background: #000000;
  display: flex;
  flex-direction: column;
  min-height: 80vh;
}

.terminal-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #0f0f0f;
}

.terminal-title {
  font-size: 16px;
  color: #ffffff;
  letter-spacing: 0.5px;
}

.terminal-back {
  background: transparent;
  color: #9ad1ff;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  transition: color 0.2s ease;
}

.terminal-back:hover {
  color: #ffffff;
}

.terminal-body {
  padding: 18px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
}

.terminal-output {
  display: flex;
  flex-direction: column;
  gap: 6px;
  white-space: pre-wrap;
}

.terminal-line {
  color: #e5e5e5;
  font-size: 15px;
  line-height: 1.5;
}

.terminal-input {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  padding: 10px 0;
}

.prompt {
  color: #8bd38b;
  font-weight: 600;
}

.terminal-input-field {
  flex: 1;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 15px;
  font-family: inherit;
  outline: none;
  padding: 4px 0 6px;
  caret-color: transparent;
}

.terminal-input-field::placeholder {
  color: #6f6f6f;
}

.terminal-error {
  color: #ff7b7b;
  font-size: 13px;
}

.terminal-caret {
  color: #8bd38b;
  font-weight: 700;
  animation: blink 1s steps(2, start) infinite;
}

@keyframes blink {
  to {
    visibility: hidden;
  }
}

@media (max-width: 600px) {
  .terminal-window {
    min-height: 90vh;
  }

  .terminal-title {
    font-size: 14px;
  }

  .terminal-line {
    font-size: 14px;
  }

  .terminal-input-field {
    font-size: 14px;
  }
}
</style>
