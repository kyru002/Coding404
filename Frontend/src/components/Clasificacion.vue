<template>
  <div class="clasificacion-container">
    <div class="content-area">
      <h1>{{ t('title') }}</h1>
      <p class="subtitle">{{ t('subtitle') }}</p>

      <div class="scope-tabs">
        <button class="scope-tab" :class="{ active: leaderboardScope === 'global' }" @click="changeScope('global')">{{ t('globalLeague') }}</button>
        <button class="scope-tab" :class="{ active: leaderboardScope === 'friends' }" @click="changeScope('friends')">{{ t('friendsLeague') }}</button>
      </div>

      <div class="leagues-sections">
        <section v-for="league in completedLeagues" :key="league.order" class="league-section">
          <!-- Liga Header -->
          <div class="league-header">
            <img :src="league.image" :alt="league.name" class="league-header-icon">
            <div class="league-header-info">
              <h2>{{ league.name }}</h2>
              <p class="league-timer">{{ leagueTimer }}</p>
            </div>
          </div>

          <!-- Ranking users -->
          <div class="league-ranking">
            <div v-if="filteredLeaderboard(league).length === 0" class="ranking-empty">
              {{ t('noUsersInLeague') }}
            </div>
            <div v-else class="ranking-items">
              <div 
                v-for="(user, index) in filteredLeaderboard(league)" 
                :key="user.userId" 
                class="ranking-item"
                :class="{ 'ranking-item-current': isCurrentUser(user) }"
                @click="openUserProfile(user)">
                <span class="rank-number">{{ index + 1 }}</span>
                
                <div class="user-avatar-wrapper">
                  <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.username" class="ranking-avatar">
                  <div v-else class="ranking-avatar ranking-avatar-default">
                    {{ (user.fullName || user.username)[0].toUpperCase() }}
                  </div>
                </div>

                <div class="ranking-user-info">
                  <span class="ranking-name">{{ user.fullName || user.username }}</span>
                </div>

                <span class="ranking-xp">⚡ {{ user.totalPoints }}</span>
              </div>
            </div>
          </div>
        </section>

        <div v-if="completedLeagues.length === 0" class="no-leagues">
          <p>{{ t('noLeaguesYet') }}</p>
        </div>
      </div>
    </div>

    <nav class="bottom-nav">
      <button class="nav-item" :class="{ active: activeSection === 'inicio' }" @click="$emit('change-section', 'inicio')" :title="t('navHome')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
      </button>
      <button class="nav-item" :class="{ active: activeSection === 'comunidad' }" @click="$emit('change-section', 'comunidad')" :title="t('navCommunity')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
      </button>
      <button class="nav-item" :class="{ active: activeSection === 'clasificacion' }" @click="$emit('change-section', 'clasificacion')" :title="t('navRanking')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3H8v2H5v3c0 2.97 2.16 5.43 5 5.91V17H7v2h10v-2h-3v-3.09c2.84-.48 5-2.94 5-5.91V5h-3V3zm-9 5V7h1v4.82C7.16 11.4 7 9.54 7 8zm10 0c0 1.54-.16 3.4-1 3.82V7h1v1z"/></svg>
      </button>
      <button class="nav-item" :class="{ active: activeSection === 'lecciones' }" @click="$emit('change-section', 'lecciones')" :title="t('navLessons')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 4.5C5 3.67 5.67 3 6.5 3H18v14H7c-.55 0-1 .45-1 1s.45 1 1 1h11v2H7c-1.66 0-3-1.34-3-3V4.5z"/>
          <path d="M14.06 8.19l1.75 1.75-4.93 4.94H9.13v-1.75l4.93-4.94zm2.47-.72l.94-.94a1 1 0 011.41 0l.59.59a1 1 0 010 1.41l-.94.94-2-2z"/>
        </svg>
      </button>
      <button class="nav-item" :class="{ active: activeSection === 'perfil' }" @click="$emit('change-section', 'perfil')" :title="t('navProfile')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
      </button>
    </nav>

    <div v-if="showUserProfileModal && selectedLeaderboardUser" class="friend-profile-modal" @click="closeUserProfile">
      <div class="friend-profile-card" @click.stop>
        <button class="modal-close-friend" @click="closeUserProfile">&times;</button>

        <div class="friend-profile-header">
          <img
            v-if="selectedLeaderboardUser.avatarUrl"
            :src="selectedLeaderboardUser.avatarUrl"
            :alt="selectedLeaderboardUser.fullName || selectedLeaderboardUser.username"
            class="friend-profile-avatar">
          <div v-else class="friend-profile-avatar friend-profile-avatar-default">👤</div>
        </div>

        <div class="friend-profile-content">
          <h3 class="friend-profile-name">{{ selectedLeaderboardUser.fullName || selectedLeaderboardUser.username }}</h3>
          <p class="friend-profile-username">@{{ selectedLeaderboardUser.username }}</p>
          <p v-if="selectedLeaderboardUser.bio" class="friend-profile-bio">{{ selectedLeaderboardUser.bio }}</p>

          <div v-if="selectedLeaderboardUser.league" class="friend-profile-league">
            <img :src="selectedLeaderboardUser.league.image" :alt="selectedLeaderboardUser.league.name" class="friend-profile-league-img">
            <span class="friend-profile-league-name">{{ selectedLeaderboardUser.league.name }}</span>
          </div>

          <div class="friend-profile-type">
            <span class="type-label">{{ t('points') }}:</span>
            <span class="type-value">{{ selectedLeaderboardUser.totalPoints || 0 }}</span>
          </div>

          <div class="friend-profile-stats">
            <button class="friend-profile-stat" type="button" @click="openUserSocialList('followers')">
              <span class="friend-profile-stat-value">{{ selectedLeaderboardUser.followersCount || 0 }}</span>
              <span class="friend-profile-stat-label">{{ t('followers') }}</span>
            </button>
            <button class="friend-profile-stat" type="button" @click="openUserSocialList('following')">
              <span class="friend-profile-stat-value">{{ selectedLeaderboardUser.followingCount || 0 }}</span>
              <span class="friend-profile-stat-label">{{ t('following') }}</span>
            </button>
          </div>

          <div class="friend-profile-divider"></div>

          <div v-if="selectedLeaderboardUser.certificates && selectedLeaderboardUser.certificates.length > 0" class="friend-profile-certs">
            <h4 class="certs-title">{{ t('certificates') }}</h4>
            <div class="friend-cert-list">
              <div v-for="cert in selectedLeaderboardUser.certificates" :key="cert.title" class="friend-cert-item">
                <span class="friend-cert-title">{{ cert.title }}</span>
                <span class="friend-cert-percent">{{ cert.percentage }}%</span>
              </div>
            </div>
          </div>

          <div v-if="!isCurrentUser(selectedLeaderboardUser)" class="friend-actions-row">
            <button
              class="send-friend-request-btn"
              :disabled="isSendingFriendRequest || isPendingFriendRequest(selectedLeaderboardUser)"
              @click="sendFriendRequestFromRanking">
              {{ isSendingFriendRequest ? t('sending') : (isPendingFriendRequest(selectedLeaderboardUser) ? t('requestPending') : t('sendFriendRequest')) }}
            </button>

            <button
              class="send-friend-request-btn"
              :class="{ following: selectedLeaderboardUser.isFollowing }"
              :disabled="isTogglingFollow"
              @click="toggleFollowSelectedUser"
            >
              {{ isTogglingFollow ? t('sending') : (selectedLeaderboardUser.isFollowing ? t('followingBtn') : t('follow')) }}
            </button>
          </div>

          <button
            class="send-friend-request-btn projects-btn"
            :disabled="isLoadingUserProjects"
            @click="openUserProjects"
          >
            {{ isLoadingUserProjects ? t('loadingProjects') : t('viewProjects') }}
          </button>

          <p v-if="friendRequestFeedback" class="friend-request-feedback">{{ friendRequestFeedback }}</p>
        </div>
      </div>
    </div>

    <div v-if="showUserProjectsModal && selectedLeaderboardUser" class="projects-modal" @click="closeUserProjects">
      <div class="projects-card" @click.stop>
        <button class="modal-close-friend" @click="closeUserProjects">&times;</button>
        <h3 class="projects-title">{{ t('projectsFromUser') }} @{{ selectedLeaderboardUser.username }}</h3>

        <p v-if="selectedUserProjects.length === 0" class="projects-empty">{{ t('noProjectsYet') }}</p>

        <div v-else class="projects-list">
          <article v-for="post in selectedUserProjects" :key="post.id" class="project-post-item">
            <p class="project-post-meta">{{ post.type }} · {{ formatDate(post.createdAt) }}</p>
            <p class="project-post-text">{{ post.text }}</p>
            <div v-if="post.project && (post.project.title || post.project.url)" class="project-post-card">
              <p class="project-post-category">{{ post.project.category }}</p>
              <h4 class="project-post-title">{{ post.project.title }}</h4>
              <p v-if="post.project.description" class="project-post-description">{{ post.project.description }}</p>
              <a v-if="post.project.url" class="project-post-link" :href="post.project.url" target="_blank" rel="noopener noreferrer">{{ t('viewProjectRepo') }}</a>
            </div>
          </article>
        </div>
      </div>
    </div>

    <div v-if="showUserSocialListModal" class="projects-modal" @click="closeUserSocialList">
      <div class="projects-card" @click.stop>
        <button class="modal-close-friend" @click="closeUserSocialList">&times;</button>
        <h3 class="projects-title">{{ userSocialListTitle }}</h3>

        <p v-if="userSocialListItems.length === 0" class="projects-empty">{{ t('noUsersInList') }}</p>

        <div v-else class="social-list-grid">
          <article
            v-for="person in userSocialListItems"
            :key="person.userId"
            class="social-list-item"
            @click="openUserProfile(person)"
          >
            <img v-if="person.avatarUrl" :src="person.avatarUrl" :alt="person.fullName || person.username" class="social-list-avatar">
            <div v-else class="social-list-avatar social-list-avatar-default">👤</div>
            <div class="social-list-meta">
              <h4>{{ person.fullName || person.username }}</h4>
              <p>@{{ person.username }}</p>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { API_BASE_URL } from '../config/api'

export default {
  name: 'Clasificacion',
  props: {
    activeSection: {
      type: String,
      default: 'clasificacion'
    },
    user: {
      type: Object,
      default: null
    },
    pendingRequestsCount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      apiBaseUrl: `${API_BASE_URL}/api/learning`,
      socialApiBaseUrl: `${API_BASE_URL}/api/social`,
      uiLanguage: 'es',
      leagues: [
          { order: 1, name: 'Junior Explorer', image: '/images/1.png' },
          { order: 2, name: 'Code Builder', image: '/images/2.png' },
          { order: 3, name: 'Stack Crafter', image: '/images/3.png' },
          { order: 4, name: 'Software Engineer', image: '/images/4.png' },
          { order: 5, name: 'Tech Architect', image: '/images/5.png' },
          { order: 6, name: 'Legendary Lead', image: '/images/6.png' }
      ],
      leaderboardScope: 'global',
      leaderboard: [],
      leagueTimer: '6d 22h 58m',
      showUserProfileModal: false,
      selectedLeaderboardUser: null,
      isSendingFriendRequest: false,
      isTogglingFollow: false,
      isLoadingUserProjects: false,
      showUserProjectsModal: false,
      selectedUserProjects: [],
      selectedUserFollowers: [],
      selectedUserFollowing: [],
      showUserSocialListModal: false,
      userSocialListTitle: '',
      userSocialListItems: [],
      friendRequestFeedback: '',
      pendingFriendRequests: new Set(),
      followingUserIds: new Set()
    }
  },
  computed: {
    completedLeagues() {
      // Mostrar solo ligas que tengan usuarios
      if (this.leaderboard.length === 0) return []
      
      const leaguesWithUsers = new Set()
      this.leaderboard.forEach(user => {
        if (user.league && user.league.order) {
          leaguesWithUsers.add(user.league.order)
        }
      })
      
      return this.leagues
        .filter(league => leaguesWithUsers.has(league.order))
        .sort((a, b) => b.order - a.order)
    }
  },
  watch: {
    user: {
      immediate: true,
      handler() {
        this.refreshUiLanguageFromStorage()
        this.fetchLeaderboard()
        this.loadFollowingUsers()
      }
    }
  },
  methods: {
    getCurrentUserId() {
      return this.user?.userId || this.user?._id || ''
    },
    refreshUiLanguageFromStorage() {
      try {
        const lang = localStorage.getItem('inicio-ui-language')
        this.uiLanguage = lang === 'en' ? 'en' : 'es'
      } catch (error) {
        this.uiLanguage = 'es'
      }
    },
    t(key) {
      const dict = {
        es: {
          title: 'Clasificacion',
          subtitle: 'Sube de liga completando cursos y niveles',
          globalLeague: 'Liga global',
          friendsLeague: 'Liga de amigos',
          noUsersInLeague: 'No hay usuarios en esta liga aun.',
          noLeaguesYet: 'Aun no has completado ninguna liga. Comienza a aprender para desbloquear ligas.',
          navHome: 'Inicio',
          navCommunity: 'Comunidad',
          navRanking: 'Clasificacion',
          navLessons: 'Lecciones',
          navProfile: 'Perfil',
          points: 'Puntos',
          followers: 'Seguidores',
          following: 'Siguiendo',
          followingBtn: 'Siguiendo',
          follow: 'Seguir',
          certificates: 'Certificados',
          viewProjects: 'Proyectos',
          loadingProjects: 'Cargando proyectos...',
          projectsFromUser: 'Publicaciones de',
          noProjectsYet: 'Este usuario aun no tiene publicaciones.',
          viewProjectRepo: 'Ver repositorio',
          noUsersInList: 'No hay usuarios para mostrar.',
          sending: 'Enviando...',
          requestPending: 'Solicitud pendiente',
          sendFriendRequest: 'Enviar solicitud de amistad'
        },
        en: {
          title: 'Ranking',
          subtitle: 'Climb leagues by completing courses and levels',
          globalLeague: 'Global league',
          friendsLeague: 'Friends league',
          noUsersInLeague: 'There are no users in this league yet.',
          noLeaguesYet: 'You have not completed any league yet. Start learning to unlock leagues.',
          navHome: 'Home',
          navCommunity: 'Community',
          navRanking: 'Ranking',
          navLessons: 'Lessons',
          navProfile: 'Profile',
          points: 'Points',
          followers: 'Followers',
          following: 'Following',
          followingBtn: 'Following',
          follow: 'Follow',
          certificates: 'Certificates',
          viewProjects: 'Projects',
          loadingProjects: 'Loading projects...',
          projectsFromUser: 'Posts from',
          noProjectsYet: 'This user has no posts yet.',
          viewProjectRepo: 'View repository',
          noUsersInList: 'No users to show yet.',
          sending: 'Sending...',
          requestPending: 'Request pending',
          sendFriendRequest: 'Send friend request'
        }
      }

      const pack = dict[this.uiLanguage] || dict.es
      return pack[key] || key
    },
    async fetchSummary(scope) {
      const userId = this.user?.userId
      const params = new URLSearchParams()
      params.set('scope', scope)
      if (userId) {
        params.set('userId', userId)
      }

      const response = await fetch(`${this.apiBaseUrl}/leaderboard?${params.toString()}`)
      const data = await response.json()
      if (!response.ok) {
        console.error('Error:', data?.message || 'No se pudo cargar clasificación')
        return { leaderboard: [], userSummary: {} }
      }

      return data
    },
    async fetchLeaderboard() {
      try {
        const summary = await this.fetchSummary(this.leaderboardScope)
        this.leaderboard = Array.isArray(summary.leaderboard) ? summary.leaderboard : []
        if (Array.isArray(summary.leagues) && summary.leagues.length > 0) {
          this.leagues = summary.leagues
        }
      } catch (error) {
        console.error('Error cargando clasificación', error)
      }
    },
    filteredLeaderboard(league) {
      return this.leaderboard.filter(user => user.league && user.league.order === league.order)
    },
    isCurrentUser(leaderboardUser) {
      if (!this.user || !leaderboardUser) return false

      const currentId = String(this.user.userId || this.user._id || '')
      const rowId = String(leaderboardUser.userId || leaderboardUser._id || '')
      return currentId.length > 0 && currentId === rowId
    },
    async openUserProfile(user) {
      this.selectedLeaderboardUser = {
        ...user,
        certificates: [],
        followersCount: 0,
        followingCount: 0,
        isFollowing: this.followingUserIds.has(String(user?.userId || user?._id || ''))
      }
      this.showUserProfileModal = true
      document.body.style.overflow = 'hidden'
      await this.loadSelectedUserDetails(this.selectedLeaderboardUser.userId)
    },
    closeUserProfile() {
      this.showUserProfileModal = false
      this.showUserProjectsModal = false
      this.showUserSocialListModal = false
      this.selectedUserProjects = []
      this.selectedUserFollowers = []
      this.selectedUserFollowing = []
      this.userSocialListTitle = ''
      this.userSocialListItems = []
      this.selectedLeaderboardUser = null
      this.isSendingFriendRequest = false
      this.isTogglingFollow = false
      document.body.style.overflow = 'auto'
    },
    async loadFollowingUsers() {
      const userId = this.getCurrentUserId()
      if (!userId) {
        this.followingUserIds = new Set()
        return
      }

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/following/${userId}`)
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          this.followingUserIds = new Set()
          return
        }

        const ids = Array.isArray(data.following)
          ? data.following.map((item) => String(item.userId || ''))
          : []
        this.followingUserIds = new Set(ids)
      } catch (error) {
        this.followingUserIds = new Set()
      }
    },
    async toggleFollowSelectedUser() {
      const userId = this.getCurrentUserId()
      const targetUserId = String(this.selectedLeaderboardUser?.userId || '')
      if (!userId || !targetUserId || this.isCurrentUser(this.selectedLeaderboardUser) || this.isTogglingFollow) return

      this.isTogglingFollow = true
      try {
        const alreadyFollowing = this.followingUserIds.has(targetUserId)
        const response = await fetch(`${this.socialApiBaseUrl}/follow`, {
          method: alreadyFollowing ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, targetUserId })
        })

        if (response.ok) {
          if (alreadyFollowing) {
            this.followingUserIds.delete(targetUserId)
          } else {
            this.followingUserIds.add(targetUserId)
          }
          this.selectedLeaderboardUser.isFollowing = !alreadyFollowing
          this.selectedLeaderboardUser.followersCount = Math.max(
            0,
            Number(this.selectedLeaderboardUser.followersCount || 0) + (alreadyFollowing ? -1 : 1)
          )
        }
      } catch (error) {
        // noop
      } finally {
        this.isTogglingFollow = false
      }
    },
    isPendingFriendRequest(user) {
      return user && this.pendingFriendRequests.has(user.username)
    },
    async loadSelectedUserDetails(targetUserId) {
      if (!targetUserId || !this.selectedLeaderboardUser) return

      try {
        const [profileRes, summaryRes, certsRes, followersRes, followingRes] = await Promise.all([
          fetch(`${this.socialApiBaseUrl}/profile/${targetUserId}?viewerUserId=${encodeURIComponent(this.user?.userId || '')}`),
          fetch(`${this.apiBaseUrl}/leaderboard?userId=${encodeURIComponent(targetUserId)}`),
          fetch(`${this.socialApiBaseUrl}/certificates/${targetUserId}`),
          fetch(`${this.socialApiBaseUrl}/followers/${targetUserId}`),
          fetch(`${this.socialApiBaseUrl}/following/${targetUserId}`)
        ])

        const profileData = await profileRes.json().catch(() => ({}))
        const summaryData = await summaryRes.json().catch(() => ({}))
        const certsData = await certsRes.json().catch(() => ({}))
        const followersData = await followersRes.json().catch(() => ({}))
        const followingData = await followingRes.json().catch(() => ({}))

        if (!this.selectedLeaderboardUser || String(this.selectedLeaderboardUser.userId) !== String(targetUserId)) {
          return
        }

        this.selectedLeaderboardUser = {
          ...this.selectedLeaderboardUser,
          fullName: profileData?.profile?.fullName || this.selectedLeaderboardUser.fullName,
          username: profileData?.profile?.username || this.selectedLeaderboardUser.username,
          avatarUrl: profileData?.profile?.avatarUrl || this.selectedLeaderboardUser.avatarUrl,
          bio: profileData?.profile?.bio || '',
          league: summaryData?.userSummary?.league || this.selectedLeaderboardUser.league,
          totalPoints: Number(summaryData?.userSummary?.totalPoints || this.selectedLeaderboardUser.totalPoints || 0),
          certificates: Array.isArray(certsData?.certificates) ? certsData.certificates : [],
          followersCount: Number(followersData?.count || 0),
          followingCount: Array.isArray(followingData?.following) ? followingData.following.length : 0,
          isFollowing: this.followingUserIds.has(String(targetUserId))
        }
        this.selectedUserFollowers = Array.isArray(followersData?.followers) ? followersData.followers : []
        this.selectedUserFollowing = Array.isArray(followingData?.following) ? followingData.following : []
      } catch (error) {
        // noop
      }
    },
    openUserSocialList(type) {
      if (type === 'followers') {
        this.userSocialListTitle = this.t('followers')
        this.userSocialListItems = this.selectedUserFollowers
      } else {
        this.userSocialListTitle = this.t('following')
        this.userSocialListItems = this.selectedUserFollowing
      }

      this.showUserSocialListModal = true
    },
    closeUserSocialList() {
      this.showUserSocialListModal = false
      this.userSocialListTitle = ''
      this.userSocialListItems = []
    },
    async openUserProjects() {
      const targetUserId = String(this.selectedLeaderboardUser?.userId || '')
      if (!targetUserId || this.isLoadingUserProjects) return

      this.isLoadingUserProjects = true
      try {
        const viewerUserId = this.getCurrentUserId()
        const response = await fetch(
          `${this.socialApiBaseUrl}/community/posts/user/${targetUserId}?userId=${encodeURIComponent(viewerUserId)}`
        )
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          this.selectedUserProjects = []
          return
        }

        this.selectedUserProjects = Array.isArray(data.posts) ? data.posts : []
        this.showUserProjectsModal = true
      } catch (error) {
        this.selectedUserProjects = []
      } finally {
        this.isLoadingUserProjects = false
      }
    },
    closeUserProjects() {
      this.showUserProjectsModal = false
      this.selectedUserProjects = []
    },
    formatDate(value) {
      if (!value) return ''
      try {
        return new Date(value).toLocaleDateString(this.uiLanguage === 'en' ? 'en-US' : 'es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      } catch (error) {
        return ''
      }
    },
    async sendFriendRequestFromRanking() {
      if (this.isSendingFriendRequest || !this.user?.userId || !this.selectedLeaderboardUser?.username) return

      this.isSendingFriendRequest = true
      this.friendRequestFeedback = ''

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/friend-requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: this.user.userId,
            targetUsername: this.selectedLeaderboardUser.username
          })
        })

        const data = await response.json().catch(() => ({}))

        if (response.ok) {
          this.pendingFriendRequests.add(this.selectedLeaderboardUser.username)
          this.friendRequestFeedback = data?.message || 'Solicitud enviada.'
          return
        }

        this.friendRequestFeedback = data?.message || 'No se pudo enviar la solicitud.'
      } catch (error) {
        this.friendRequestFeedback = 'Error de conexión al enviar la solicitud.'
      } finally {
        this.isSendingFriendRequest = false
      }
    },
    changeScope(scope) {
      this.leaderboardScope = scope
      this.fetchLeaderboard()
    }
  }
}
</script>

<style scoped>
.clasificacion-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1f3cff 0%, #2c49ff 100%);
  display: flex;
  flex-direction: column;
  padding-bottom: 80px;
}

.content-area {
  flex: 1;
  padding: 16px 14px;
  color: #fff;
}

.content-area h1 {
  font-size: 30px;
  margin: 0 0 6px;
}

.subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 12px;
}

.scope-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.scope-tab {
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 10px;
  background: rgba(12, 25, 94, 0.55);
  color: #dce7ff;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.scope-tab.active {
  background: #0de28f;
  color: #08244d;
  font-weight: 700;
  border-color: #0de28f;
}

.scope-tab:hover {
  border-color: rgba(166, 184, 255, 0.7);
}

.leagues-sections {
  display: grid;
  gap: 20px;
}

.league-section {
  background: rgba(18, 28, 120, 0.8);
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 16px;
  padding: 16px;
  overflow: hidden;
}

.league-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(166, 184, 255, 0.3);
}

.league-header-icon {
  width: 80px;
  height: 80px;
  object-fit: contain;
  flex-shrink: 0;
}

.league-header-info {
  flex: 1;
}

.league-header-info h2 {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 700;
  color: #f3f8ff;
}

.league-timer {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.league-score-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(12, 25, 94, 0.6);
  border-radius: 10px;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.score-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  margin-bottom: 4px;
}

.score-value {
  font-size: 20px;
  font-weight: 700;
  color: #0de28f;
}

.league-ranking {
  display: grid;
  gap: 8px;
}

.rank-progress {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(130, 150, 220, 0.35);
  margin: 6px 0 4px;
}

.rank-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #0de28f 0%, #0fa8ff 100%);
  transition: width 0.25s ease;
}

.rank-progress-text {
  font-size: 12px;
  color: #d7e7ff;
}

.ranking-state {
  display: grid;
  gap: 12px;
}

.my-summary,
.ranking-list {
  background: rgba(18, 28, 120, 0.7);
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 14px;
  padding: 12px;
}

.my-summary {
  display: flex;
  gap: 12px;
  align-items: center;
}

.my-summary h3 {
  margin: 0 0 4px;
  color: #f3f8ff;
}

.my-summary p {
  margin: 2px 0;
  color: #dce7ff;
  font-size: 13px;
}

.my-league-image {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.ranking-list h3 {
  margin: 0 0 8px;
}

.ranking-empty {
  color: #dce7ff;
  font-size: 13px;
  padding: 20px;
  text-align: center;
  background: rgba(12, 25, 94, 0.4);
  border-radius: 8px;
}

.ranking-items {
  display: grid;
  gap: 8px;
}

.ranking-item {
  display: grid;
  grid-template-columns: 32px 48px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: rgba(12, 25, 94, 0.65);
  border-radius: 10px;
  border: 1px solid rgba(166, 184, 255, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
}

.ranking-item-current {
  border: 2px solid #0de28f;
  box-shadow: 0 0 0 2px rgba(13, 226, 143, 0.2);
}

.ranking-item:hover {
  background: rgba(12, 25, 94, 0.85);
  border-color: rgba(166, 184, 255, 0.4);
  transform: translateX(4px);
}

.rank-number {
  font-weight: 700;
  font-size: 16px;
  color: #9df3b6;
  text-align: center;
  min-width: 32px;
}

.user-avatar-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.rank {
  font-weight: 700;
  color: #9df3b6;
  font-size: 20px;
  text-align: center;
}

.rank.gold {
  color: #ffd700;
}

.rank.silver {
  color: #c0c0c0;
}

.rank.bronze {
  color: #cd7f32;
}

.ranking-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.ranking-avatar-default {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #233dff 0%, #0de28f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.ranking-user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.ranking-name {
  color: #f4f8ff;
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ranking-type {
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
}

.ranking-league {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ranking-league-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.ranking-xp {
  color: #cde0ff;
  font-size: 13px;
  font-weight: 700;
  text-align: right;
  white-space: nowrap;
}

.no-leagues {
  text-align: center;
  padding: 40px 20px;
  background: rgba(18, 28, 120, 0.8);
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 16px;
}

.no-leagues p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #233dff;
  border-top: 1px solid #1a28cc;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 70px;
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  gap: 0;
  padding: 8px 12px;
  transition: all 0.3s ease;
  flex: 1;
  height: 100%;
}

.nav-item.has-alert {
  position: relative;
}

.menu-alert-badge {
  position: absolute;
  top: 8px;
  left: calc(50% + 6px);
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #ff4d4f;
  color: #fff;
  font-size: 10px;
  line-height: 16px;
  font-weight: 700;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.9);
}

.nav-item svg {
  width: 31px;
  height: 31px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: #fff;
  transform: scale(1.1);
}

.nav-item.active {
  color: #fff;
  background: rgba(0, 0, 0, 0.2);
}

.nav-item.active svg {
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
}

.friend-profile-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 16px;
}

.friend-profile-card {
  width: 100%;
  max-width: 400px;
  background: linear-gradient(180deg, #382b79 0%, #2c2262 100%);
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 24px;
  padding: 22px 18px;
  position: relative;
}

.modal-close-friend {
  position: absolute;
  top: 10px;
  right: 12px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 26px;
  cursor: pointer;
}

.friend-profile-header {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.friend-profile-avatar,
.friend-profile-avatar-default {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.35);
  object-fit: cover;
}

.friend-profile-avatar-default {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  background: linear-gradient(135deg, #233dff 0%, #0de28f 100%);
}

.friend-profile-content {
  text-align: center;
}

.friend-profile-name {
  margin: 0;
  font-size: 20px;
}

.friend-profile-username {
  margin: 6px 0 10px;
  color: rgba(255, 255, 255, 0.75);
}

.friend-profile-bio {
  margin: 0 0 10px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  line-height: 1.4;
}

.friend-profile-league {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 10px;
}

.friend-profile-league-img {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.friend-profile-league-name {
  font-weight: 700;
}

.friend-profile-type {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 14px;
}

.friend-profile-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.friend-profile-divider {
  height: 1px;
  background: rgba(166, 184, 255, 0.35);
  margin: 0 0 14px;
}

.friend-profile-stat {
  border: 1px solid rgba(166, 184, 255, 0.35);
  border-radius: 10px;
  padding: 8px;
  background: rgba(12, 25, 94, 0.45);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
}

.friend-profile-stat-value {
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
}

.friend-profile-stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.72);
}

.friend-profile-certs {
  margin-bottom: 14px;
}

.certs-title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  color: #9df3b6;
}

.friend-cert-list {
  display: grid;
  gap: 8px;
}

.friend-cert-item {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(166, 184, 255, 0.35);
  border-radius: 10px;
  padding: 8px;
  background: rgba(12, 25, 94, 0.45);
}

.friend-cert-title {
  font-size: 11px;
  font-weight: 700;
  color: #f3f8ff;
}

.friend-cert-percent {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(140, 157, 255, 0.5);
  font-size: 11px;
  font-weight: 800;
  color: #081e6f;
}

.type-label {
  color: rgba(255, 255, 255, 0.72);
}

.type-value {
  font-weight: 700;
}

.send-friend-request-btn {
  width: auto;
  flex: 1;
  min-width: 0;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #0de28f 0%, #00d887 100%);
  color: #08244d;
  font-weight: 700;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.friend-actions-row {
  display: flex;
  gap: 8px;
}

.send-friend-request-btn:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(13, 226, 143, 0.4);
}

.send-friend-request-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: linear-gradient(135deg, #8a9bff 0%, #6b7cff 100%);
  color: #dce7ff;
}

.send-friend-request-btn.following {
  background: rgba(13, 226, 143, 0.15);
  color: #9df3b6;
  border: 1px solid rgba(13, 226, 143, 0.7);
}

.projects-btn {
  margin-top: 8px;
  width: 100%;
  background: linear-gradient(135deg, #6a86ff 0%, #4f6df2 100%);
  color: #eef3ff;
}

.friend-request-feedback {
  margin-top: 10px;
  font-size: 12px;
  color: #dce7ff;
}

.projects-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1300;
  padding: 16px;
}

.projects-card {
  width: min(94vw, 720px);
  max-height: 86vh;
  overflow-y: auto;
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 20px;
  padding: 18px;
  position: relative;
  background: linear-gradient(180deg, #1a2eb8 0%, #14237f 100%);
}

.projects-title {
  margin: 0 0 12px;
  color: #f3f8ff;
  font-size: 20px;
  font-weight: 800;
}

.projects-empty {
  margin: 0;
  color: rgba(255, 255, 255, 0.75);
}

.projects-list {
  display: grid;
  gap: 10px;
}

.social-list-grid {
  display: grid;
  gap: 10px;
}

.social-list-item {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 10px;
  align-items: center;
  border: 1px solid rgba(166, 184, 255, 0.35);
  border-radius: 12px;
  padding: 9px;
  background: rgba(12, 25, 94, 0.55);
  cursor: pointer;
}

.social-list-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.social-list-avatar-default {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(90, 115, 255, 0.4);
  font-size: 20px;
}

.social-list-meta h4 {
  margin: 0;
  font-size: 13px;
}

.social-list-meta p {
  margin: 2px 0 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.72);
}

.project-post-item {
  border: 1px solid rgba(166, 184, 255, 0.35);
  border-radius: 12px;
  padding: 10px;
  background: rgba(12, 25, 94, 0.55);
}

.project-post-meta {
  margin: 0 0 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
}

.project-post-text {
  margin: 0 0 8px;
  font-size: 13px;
  color: #f3f8ff;
  line-height: 1.4;
}

.project-post-card {
  border: 1px solid rgba(13, 226, 143, 0.45);
  border-radius: 10px;
  padding: 10px;
  background: rgba(12, 25, 94, 0.45);
}

.project-post-category {
  margin: 0 0 4px;
  color: #9df3b6;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.project-post-title {
  margin: 0 0 4px;
  color: #f3f8ff;
  font-size: 13px;
  font-weight: 700;
}

.project-post-description {
  margin: 0 0 6px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

.project-post-link {
  color: #0de28f;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 480px) {
  .content-area {
    padding: 12px;
  }

  .league-header {
    gap: 12px;
  }

  .league-header-icon {
    width: 64px;
    height: 64px;
  }

  .league-header-info h2 {
    font-size: 20px;
  }

  .ranking-item {
    grid-template-columns: 28px 40px 1fr auto;
    gap: 10px;
    padding: 10px;
  }

  .ranking-avatar {
    width: 40px;
    height: 40px;
  }

  .ranking-avatar-default {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .ranking-name {
    font-size: 12px;
  }

  .ranking-xp {
    font-size: 12px;
  }

  .bottom-nav {
    height: 60px;
  }

  .nav-item {
    gap: 0;
  }

  .nav-item svg {
    width: 26px;
    height: 26px;
  }
}
</style>
