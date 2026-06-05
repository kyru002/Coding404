<script setup>
import { ref, onBeforeUnmount, onMounted, defineAsyncComponent } from 'vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import Carga from './components/Carga.vue'
import Inicio from './components/Inicio.vue'
import Comunidad from './components/Comunidad.vue'
const Clasificacion = defineAsyncComponent(() => import('./components/Clasificacion.vue'))
const Lecciones = defineAsyncComponent(() => import('./components/Lecciones.vue'))
const Perfil = defineAsyncComponent(() => import('./components/Perfil.vue'))
import { API_BASE_URL } from './config/api'

const currentView = ref('login')
const activeSection = ref('inicio')
const currentUser = ref(null)
const pendingRequestsCount = ref(0)
const incomingBattleInvite = ref(null)
const activeBattleLaunch = ref(null)
const uiLanguage = ref('es')
let battleInvitePollingTimer = null
const lastLaunchedBattleMatchId = ref('')

const refreshUiLanguage = () => {
  try {
    const language = localStorage.getItem('inicio-ui-language')
    uiLanguage.value = language === 'en' ? 'en' : 'es'
  } catch (error) {
    uiLanguage.value = 'es'
  }
}

const t = (key) => {
  const dict = {
    es: {
      userFallback: 'usuario',
      inviteText: 'te ha retado a un desafio de codigo.',
      language: 'Lenguaje',
      accept: 'Aceptar',
      reject: 'Rechazar'
    },
    en: {
      userFallback: 'user',
      inviteText: 'challenged you to a coding battle.',
      language: 'Language',
      accept: 'Accept',
      reject: 'Decline'
    }
  }
  const pack = dict[uiLanguage.value] || dict.es
  return pack[key] || key
}

const refreshPendingRequestsCount = async (user = currentUser.value) => {
  const userId = user?.userId || user?._id
  if (!userId) {
    pendingRequestsCount.value = 0
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/social/friend-requests/${userId}`)
    const data = await response.json()
    if (!response.ok) {
      pendingRequestsCount.value = 0
      return
    }

    pendingRequestsCount.value = Array.isArray(data?.requests) ? data.requests.length : 0
  } catch (error) {
    pendingRequestsCount.value = 0
  }
}

const showLogin = () => {
  stopBattleInvitePolling()
  incomingBattleInvite.value = null
  currentView.value = 'login'
}

const showRegister = () => {
  currentView.value = 'register'
}

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 días en ms

const showHome = (user = null) => {
  if (user) {
    currentUser.value = user
    refreshPendingRequestsCount(user)
    startBattleInvitePolling(user)
    // Guardar sesión con timestamp de expiración (7 días)
    try {
      const sessionData = {
        user,
        loginTimestamp: Date.now()
      }
      localStorage.setItem('coding404_session', JSON.stringify(sessionData))
    } catch (error) {
      console.error('Error saving session:', error)
    }
  }

  if (user?.isAdmin) {
    activeSection.value = 'comunidad'
  }

  currentView.value = 'home'
}

const showInicio = () => {
  refreshUiLanguage()
  currentView.value = 'app'
  activeSection.value = currentUser.value?.isAdmin ? 'comunidad' : 'inicio'
  refreshPendingRequestsCount()
  startBattleInvitePolling()
}

const changeSection = (section) => {
  // Permitir cambio de sección para todos los usuarios
  activeSection.value = section
  refreshPendingRequestsCount()
}

const checkIncomingBattleInvite = async (user = currentUser.value) => {
  const userId = user?.userId || user?._id
  if (!userId || user?.isAdmin) {
    incomingBattleInvite.value = null
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/social/battles/incoming/${userId}`)
    const data = await response.json()
    if (!response.ok) {
      incomingBattleInvite.value = null
      return
    }

    incomingBattleInvite.value = data?.invite || null
  } catch (error) {
    // Silencioso para no interrumpir navegación
  }
}

const checkActiveBattle = async (user = currentUser.value) => {
  const userId = user?.userId || user?._id
  if (!userId || user?.isAdmin) {
    activeBattleLaunch.value = null
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/social/battles/active/${userId}`)
    const data = await response.json()
    if (!response.ok || !data?.battle?.matchId || !data?.battle?.language || !data?.battle?.opponent?.userId) {
      activeBattleLaunch.value = null
      return
    }

    const battle = data.battle
    if (lastLaunchedBattleMatchId.value === battle.matchId) {
      return
    }

    lastLaunchedBattleMatchId.value = battle.matchId
    activeBattleLaunch.value = {
      nonce: Date.now(),
      matchId: battle.matchId,
      language: battle.language,
      opponent: battle.opponent,
      mySubmitted: Boolean(battle.mySubmitted),
      opponentSubmitted: Boolean(battle.opponentSubmitted)
    }

    currentView.value = 'app'
    activeSection.value = 'comunidad'
  } catch (error) {
    // Silencioso
  }
}

const startBattleInvitePolling = (user = currentUser.value) => {
  stopBattleInvitePolling()

  const userId = user?.userId || user?._id
  if (!userId || user?.isAdmin) return

  checkIncomingBattleInvite(user)
  checkActiveBattle(user)
  battleInvitePollingTimer = setInterval(() => {
    checkIncomingBattleInvite(user)
    checkActiveBattle(user)
  }, 3500)
}

const stopBattleInvitePolling = () => {
  if (battleInvitePollingTimer) {
    clearInterval(battleInvitePollingTimer)
    battleInvitePollingTimer = null
  }
}

const rejectBattleInvite = async () => {
  const invite = incomingBattleInvite.value
  const userId = currentUser.value?.userId || currentUser.value?._id
  if (!invite?.battleRequestId || !userId) return

  try {
    await fetch(`${API_BASE_URL}/api/social/battles/${invite.battleRequestId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, accept: false })
    })
  } catch (error) {
    // Silencioso
  } finally {
    incomingBattleInvite.value = null
    checkActiveBattle()
  }
}

const acceptBattleInvite = async () => {
  const invite = incomingBattleInvite.value
  const userId = currentUser.value?.userId || currentUser.value?._id
  if (!invite?.battleRequestId || !userId) return

  try {
    const response = await fetch(`${API_BASE_URL}/api/social/battles/${invite.battleRequestId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, accept: true })
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data?.accepted || !data?.battle?.challenger) {
      incomingBattleInvite.value = null
      return
    }
    incomingBattleInvite.value = null
    checkActiveBattle()
  } catch (error) {
    incomingBattleInvite.value = null
  }
}

const handleUserUpdated = (updatedUser) => {
  currentUser.value = updatedUser
  refreshPendingRequestsCount(updatedUser)
}

const handleLessonCompleted = async () => {
  // Recargar el usuario desde el servidor para obtener el learningPath actualizado
  if (currentUser.value?.userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/user/${currentUser.value.userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          currentUser.value = data.user
        }
      }
    } catch (error) {
      console.error('Error reloadng user:', error)
    }
  }
}

const handleLogout = () => {
  stopBattleInvitePolling()
  currentUser.value = null
  pendingRequestsCount.value = 0
  incomingBattleInvite.value = null
  activeBattleLaunch.value = null
  lastLaunchedBattleMatchId.value = ''
  currentView.value = 'login'
  // Limpiar sesión persistente
  localStorage.removeItem('coding404_session')
  localStorage.removeItem('currentUser') // compatibilidad con sesiones antiguas
}

const restoreSessionFromStorage = () => {
  try {
    // Intentar con el nuevo formato con timestamp
    const storedSession = localStorage.getItem('coding404_session')
    if (storedSession) {
      const { user, loginTimestamp } = JSON.parse(storedSession)
      const age = Date.now() - (loginTimestamp || 0)
      if (user?.userId && age < SESSION_DURATION_MS) {
        // Sesión válida: restaurar sin reiniciar el timestamp
        currentUser.value = user
        refreshPendingRequestsCount(user)
        startBattleInvitePolling(user)
        if (user?.isAdmin) activeSection.value = 'comunidad'
        currentView.value = 'home'
        return true
      } else {
        // Sesión expirada (más de 7 días)
        localStorage.removeItem('coding404_session')
      }
    }

    // Compatibilidad con sesiones antiguas sin timestamp
    const legacyStored = localStorage.getItem('currentUser')
    if (legacyStored) {
      const user = JSON.parse(legacyStored)
      localStorage.removeItem('currentUser') // migrar formato antiguo
      if (user?.userId) {
        showHome(user) // se guardará con el nuevo formato
        return true
      }
    }
  } catch (error) {
    console.error('Error restoring session:', error)
    localStorage.removeItem('coding404_session')
    localStorage.removeItem('currentUser')
  }
  return false
}

onMounted(() => {
  refreshUiLanguage()
  if (!restoreSessionFromStorage()) {
    currentView.value = 'login'
  }
})



onBeforeUnmount(() => {
  stopBattleInvitePolling()
})
</script>

<template>
  <div id="app">
    <Login v-if="currentView === 'login'" @show-register="showRegister" @show-home="showHome" />
    <Register v-if="currentView === 'register'" @show-login="showLogin" @show-home="showHome" />
    <Carga v-if="currentView === 'home'" @show-inicio="showInicio" />
    
    <template v-if="currentView === 'app'">
      <template v-if="currentUser?.isAdmin">
        <Comunidad
          v-if="activeSection === 'comunidad'"
          @change-section="changeSection"
          @logout="handleLogout"
          :activeSection="activeSection"
          :user="currentUser"
          :battleLaunchRequest="activeBattleLaunch"
          :pendingRequestsCount="pendingRequestsCount" />
      </template>
      <template v-else>
        <Inicio v-show="activeSection === 'inicio'" @change-section="changeSection" :activeSection="activeSection" :user="currentUser" :pendingRequestsCount="pendingRequestsCount" @lesson-completed="handleLessonCompleted" />
        <Comunidad v-if="activeSection === 'comunidad'" @change-section="changeSection" :activeSection="activeSection" :user="currentUser" :battleLaunchRequest="activeBattleLaunch" :pendingRequestsCount="pendingRequestsCount" />
        <Clasificacion v-if="activeSection === 'clasificacion'" @change-section="changeSection" :activeSection="activeSection" :user="currentUser" :pendingRequestsCount="pendingRequestsCount" />
        <Lecciones
          v-if="activeSection === 'lecciones'"
          @change-section="changeSection"
          @user-updated="handleUserUpdated"
          :activeSection="activeSection"
          :user="currentUser"
          :pendingRequestsCount="pendingRequestsCount" />
        <Perfil v-if="activeSection === 'perfil'" @change-section="changeSection" :activeSection="activeSection" :user="currentUser" :pendingRequestsCount="pendingRequestsCount" @user-updated="handleUserUpdated" @logout="handleLogout" />
      </template>
    </template>

    <div v-if="currentView === 'app' && incomingBattleInvite" class="battle-invite-overlay" @click.self="rejectBattleInvite">
      <div class="battle-invite-card">
        <img
          v-if="incomingBattleInvite.challenger?.avatarUrl"
          :src="incomingBattleInvite.challenger.avatarUrl"
          :alt="incomingBattleInvite.challenger.fullName || incomingBattleInvite.challenger.username"
          class="battle-invite-avatar"
        >
        <div v-else class="battle-invite-avatar battle-invite-avatar-default">👤</div>

        <p class="battle-invite-text">
          <strong>{{ incomingBattleInvite.challenger?.username || t('userFallback') }}</strong>
          {{ t('inviteText') }}
        </p>
        <p class="battle-invite-language">{{ t('language') }}: {{ incomingBattleInvite.language }}</p>

        <div class="battle-invite-actions">
          <button class="battle-accept" @click="acceptBattleInvite">{{ t('accept') }}</button>
          <button class="battle-reject" @click="rejectBattleInvite">{{ t('reject') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  min-height: 100vh;
}

.battle-invite-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.52);
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.battle-invite-card {
  width: min(92vw, 360px);
  background: linear-gradient(180deg, rgba(30, 63, 255, 0.96) 0%, rgba(20, 43, 188, 0.96) 100%);
  border: 1px solid rgba(190, 205, 255, 0.45);
  border-radius: 20px;
  padding: 18px;
  color: #ffffff;
  text-align: center;
  box-shadow: 0 20px 44px rgba(5, 16, 80, 0.56);
}

.battle-invite-avatar {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.4);
  margin: 0 auto 12px;
}

.battle-invite-avatar-default {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  background: rgba(255, 255, 255, 0.14);
}

.battle-invite-text {
  margin: 0;
  font-size: 15px;
  line-height: 1.45;
}

.battle-invite-language {
  margin: 8px 0 14px;
  font-size: 13px;
  color: rgba(230, 240, 255, 0.92);
}

.battle-invite-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.battle-accept,
.battle-reject {
  border: none;
  border-radius: 10px;
  padding: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.battle-accept {
  background: linear-gradient(135deg, #0de28f 0%, #15b870 100%);
  color: #072214;
}

.battle-reject {
  background: linear-gradient(135deg, #ff646f 0%, #f23e52 100%);
  color: #ffffff;
}
</style>
