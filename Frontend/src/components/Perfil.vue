<template>
  <div class="perfil-container">
    <div class="content-area">
      <section class="top-panel">
        <div class="buttons-column">
          <button class="settings-btn" @click="openSettingsModal" title="Configuración">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94c.04,-0.3 .06,-0.61 .06,-0.94c0,-0.32 -0.02,-0.64 -0.07,-0.94l2.03,-1.58c.18,-0.14 .23,-0.41 .12,-0.64l-1.92,-3.32c-0.12,-0.22 -0.37,-0.29 -0.59,-0.22l-2.39,0.96c-0.5,-0.38 -1.03,-0.7 -1.62,-0.94L14.4,2.81c-0.04,-0.24 -0.24,-0.41 -0.48,-0.41h-3.84c-0.24,0 -0.43,0.17 -0.47,0.41L9.25,5.35C8.66,5.59 8.12,5.92 7.63,6.29L5.24,5.33c-0.22,-0.08 -0.47,0 -0.59,0.22L2.74,8.87C2.62,9.08 2.66,9.34 2.86,9.48l2.03,1.58C4.84,11.36 4.8,11.69 4.8,12s0.02,0.64 0.07,0.94l-2.03,1.58c-0.18,0.14 -0.23,0.41 -0.12,0.64l1.92,3.32c0.12,0.22 0.37,0.29 0.59,0.22l2.39,-0.96c0.5,0.38 1.03,0.7 1.62,0.94l0.36,2.54c0.05,0.24 0.24,0.41 0.48,0.41h3.84c0.24,0 0.44,-0.17 0.47,-0.41l0.36,-2.54c0.59,-0.24 1.13,-0.56 1.62,-0.94l2.39,0.96c0.22,0.08 0.47,0 0.59,-0.22l1.92,-3.32c0.12,-0.22 0.07,-0.5 -0.12,-0.64L19.14,12.94zM12,15.6c-1.98,0 -3.6,-1.62 -3.6,-3.6s1.62,-3.6 3.6,-3.6s3.6,1.62 3.6,3.6S13.98,15.6 12,15.6z"/></svg>
          </button>
          <button class="exit-btn" @click="logout" title="Cerrar sesión">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
          </button>
        </div>

        <div class="avatar-section">
          <div class="avatar-container">
            <img v-if="profile.avatarUrl" :src="profile.avatarUrl" :alt="profile.username" class="avatar-image" @click="openPhotoModal" title="Ver foto">
            <div v-else class="avatar-default">👤</div>
            <div class="streak-box" title="Racha actual">
              <span class="fire" :class="{ active: streak.consecutiveActiveDays > 1 }">🔥</span>
              <p>{{ streak.consecutiveActiveDays }}</p>
            </div>
            <button class="avatar-upload-btn" @click="$refs.avatarInput.click()" title="Subir foto">+</button>
          </div>
          <span class="username">{{ profile.username || user?.username || 'usuario' }}</span>
          <p v-if="profile.bio" class="profile-bio">{{ profile.bio }}</p>
          <span v-if="profile.programmerType" class="profile-programmer-role">{{ profile.programmerType }}</span>
          <div class="profile-social-stats">
            <button class="social-stat-card" type="button" @click="openProfileSocialList('followers')">
              <span class="social-stat-value">{{ followers.length }}</span>
              <span class="social-stat-label">Seguidores</span>
            </button>
            <button class="social-stat-card" type="button" @click="openProfileSocialList('following')">
              <span class="social-stat-value">{{ following.length }}</span>
              <span class="social-stat-label">Siguiendo</span>
            </button>
          </div>
          <span class="league-name">{{ league.name }}</span>
          <input ref="avatarInput" type="file" accept="image/*" class="hidden-input" @change="onAvatarSelected">
        </div>
      </section>

      <section class="section-block">
        <h2>AMIGOS</h2>
        <div class="friends-list">
          <p v-if="friends.length === 0" class="empty">Todavía no tienes amigos.</p>
          <div v-else class="friends-grid">
            <div v-for="friend in friends" :key="friend.userId" class="friend-card">
              <img v-if="friend.avatarUrl" :src="friend.avatarUrl" :alt="friend.fullName" class="friend-avatar" @click="openFriendProfile(friend)" title="Ver perfil">
              <div v-else class="friend-avatar friend-avatar-default" @click="openFriendProfile(friend)">👤</div>
              <div class="friend-info" @click="openFriendProfile(friend)">
                <h4>{{ friend.fullName || friend.username }}</h4>
                <p class="friend-username">@{{ friend.username }}</p>
                <p v-if="friend.bio" class="friend-bio">{{ friend.bio }}</p>
                <div v-if="friend.league" class="friend-league">
                  <img :src="assetUrl(friend.league.image)" :alt="friend.league.name" class="friend-league-img">
                  <span>{{ friend.league.name }}</span>
                </div>
              </div>
              <div class="friend-card-actions">
                <button class="friend-battle-btn" @click.stop="openBattleLanguageModal(friend)">Batalla amistosa</button>
                <button class="friend-projects-btn" @click.stop="openFriendPosts(friend)">Ver posts</button>
              </div>
            </div>
          </div>
        </div>

        <div class="add-friend">
          <input v-model="friendUsername" placeholder="Agregar por nombre de usuario">
          <button @click="sendRequest">Enviar</button>
        </div>
      </section>

      <section class="section-block">
        <h2>SOLICITUDES</h2>
        <div v-if="requests.length === 0" class="empty">No tienes solicitudes pendientes.</div>
        <div v-else class="requests-list">
          <div v-for="request in requests" :key="request.requestId" class="request-card">
            <img v-if="request.avatarUrl" :src="request.avatarUrl" :alt="request.fullName" class="request-avatar">
            <div v-else class="request-avatar request-avatar-default">👤</div>
            <div class="request-info">
              <h4>{{ request.fullName || request.username }}</h4>
              <p class="request-username">@{{ request.username }}</p>
              <div v-if="request.league" class="request-league">
                <img :src="assetUrl(request.league.image)" :alt="request.league.name" class="request-league-img">
                <span>{{ request.league.name }}</span>
              </div>
            </div>
            <div class="request-actions">
              <button class="accept" @click="respondRequest(request.requestId, true)">Aceptar</button>
              <button class="reject" @click="respondRequest(request.requestId, false)">Rechazar</button>
            </div>
          </div>
        </div>
      </section>

      <section class="section-block">
        <h2>MIS PROYECTOS</h2>
        <div class="projects-list">
          <p v-if="myProjects.length === 0" class="empty">Aún no has subido proyectos.</p>
          <article v-for="projectPost in myProjects" :key="projectPost.id" class="project-card">
            <div class="project-card-head">
              <h3 class="project-title">{{ projectPost.project.title || 'Proyecto sin titulo' }}</h3>
              <span class="project-date">{{ formatDate(projectPost.createdAt) }}</span>
            </div>
            <p v-if="projectPost.project.description" class="project-description">{{ projectPost.project.description }}</p>
            <p v-if="projectPost.text" class="project-text">{{ projectPost.text }}</p>
            <a
              v-if="projectPost.project.url"
              :href="projectPost.project.url"
              target="_blank"
              rel="noopener noreferrer"
              class="project-link"
            >
              Ver proyecto
            </a>
            <div class="project-actions">
              <button class="project-delete-btn" @click="deleteMyPost(projectPost.id)">Borrar</button>
            </div>
          </article>
        </div>
      </section>

      <section class="section-block">
        <h2>MIS POSTS</h2>
        <div class="projects-list">
          <p v-if="myPosts.length === 0" class="empty">Aún no has publicado posts.</p>
          <article v-for="post in myPosts" :key="post.id" class="project-card">
            <div class="project-card-head">
              <h3 class="project-title">{{ post.type || 'Post' }}</h3>
              <span class="project-date">{{ formatDate(post.createdAt) }}</span>
            </div>
            <p v-if="post.text" class="project-text">{{ post.text }}</p>
            <div class="project-actions">
              <button class="project-delete-btn" @click="deleteMyPost(post.id)">Borrar</button>
            </div>
          </article>
        </div>
      </section>

      <section class="section-block">
        <h2>NOTIFICACIONES</h2>
        <div class="projects-list">
          <p v-if="notifications.length === 0" class="empty">No tienes notificaciones nuevas.</p>
          <article v-for="notification in notifications" :key="notification.id" class="notification-card" :class="{ unread: !notification.isRead }">
            <div class="notification-main">
              <p class="notification-text">{{ notification.text }}</p>
              <span class="notification-date">{{ formatDate(notification.createdAt) }}</span>
            </div>
            <button
              v-if="!notification.isRead"
              class="notification-read-btn"
              @click="markNotificationAsRead(notification.id)"
            >
              Marcar leida
            </button>
          </article>
        </div>
      </section>

      <section class="section-block certs">
        <h2>CERTIFICADOS</h2>
        <div class="cert-list">
          <div v-for="cert in certificates" :key="cert.title" class="cert-item">
            <span class="cert-title">{{ cert.title }}</span>
            <span class="cert-percent">{{ cert.percentage }}%</span>
          </div>
        </div>
      </section>

      <div v-if="showProfileSocialListModal" class="projects-modal" @click="closeProfileSocialList">
        <div class="projects-card" @click.stop>
          <button class="modal-close-friend" @click="closeProfileSocialList">&times;</button>
          <h3 class="projects-title">{{ profileSocialListTitle }}</h3>

          <p v-if="profileSocialListItems.length === 0" class="projects-empty">No hay usuarios para mostrar.</p>

          <div v-else class="social-list-grid">
            <article
              v-for="person in profileSocialListItems"
              :key="person.userId"
              class="social-list-item"
              @click="openFriendProfile(person)"
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

    <!-- Lightbox Modal para ver foto en grande -->
    <div v-if="showPhotoModal" class="photo-modal" @click="closePhotoModal">
      <div class="photo-modal-content" @click.stop>
        <button class="modal-close" @click="closePhotoModal">&times;</button>
        <img :src="profile.avatarUrl" :alt="profile.username" class="modal-photo">
      </div>
    </div>

    <div v-if="showAvatarEditor" class="avatar-editor-modal" @click="closeAvatarEditor">
      <div class="avatar-editor-card" @click.stop>
        <h3>Editar foto de perfil</h3>
        <p>Ajusta el encuadre como prefieras antes de guardar.</p>

        <div
          class="avatar-editor-preview"
          @pointerdown="onAvatarPointerDown"
          @pointermove="onAvatarPointerMove"
          @pointerup="onAvatarPointerUp"
          @pointercancel="onAvatarPointerUp"
          @pointerleave="onAvatarPointerUp"
        >
          <img
            :src="avatarEditorSource"
            alt="Preview"
            class="avatar-editor-image"
            :style="getAvatarEditorImageStyle()"
          >
        </div>

        <div class="avatar-editor-controls">
          <label>
            Zoom
            <input v-model.number="avatarZoom" type="range" min="1" max="2.5" step="0.05">
          </label>
          <small class="avatar-editor-help">Arrastra la foto para colocarla. Funciona en móvil y PC.</small>
        </div>

        <div class="avatar-editor-actions">
          <button class="avatar-btn-cancel" @click="closeAvatarEditor">Cancelar</button>
          <button class="avatar-btn-save" :disabled="isUploadingAvatar" @click="saveEditedAvatar">
            {{ isUploadingAvatar ? 'Guardando...' : 'Guardar foto' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Configuración (Settings) -->
    <div v-if="showSettingsModal" class="settings-modal" @click="closeSettingsModal">
      <div class="settings-card" @click.stop>
        <button class="modal-close" @click="closeSettingsModal">&times;</button>
        <h3>Configuración de Perfil</h3>

        <!-- Errores y Éxitos -->
        <div v-if="profileError" class="alert alert-error">{{ profileError }}</div>
        <div v-if="profileSuccess" class="alert alert-success">{{ profileSuccess }}</div>

        <!-- Campos Editables -->
        <div class="settings-section">
          <!-- Nombre de Usuario -->
          <div class="settings-field">
            <div v-if="editingField !== 'username'" class="field-display">
              <span class="field-label">Usuario:</span>
              <span class="field-value">@{{ accountProfile.username || 'No especificado' }}</span>
              <button class="edit-btn" @click="startEditingField('username')" title="Editar">✏️</button>
            </div>
            <div v-else class="field-edit">
              <input v-model="editValues.username" type="text" placeholder="Nombre de usuario" class="edit-input">
              <div class="edit-actions">
                <button @click="saveProfileField('username')" :disabled="isSavingProfile" class="btn-save">Guardar</button>
                <button @click="cancelEditingField" class="btn-cancel">Cancelar</button>
              </div>
            </div>
          </div>

          <!-- Email -->
          <div class="settings-field">
            <div v-if="editingField !== 'email'" class="field-display">
              <span class="field-label">Email:</span>
              <span class="field-value">{{ accountProfile.email || 'No especificado' }}</span>
              <button class="edit-btn" @click="startEditingField('email')" title="Editar">✏️</button>
            </div>
            <div v-else class="field-edit">
              <input v-model="editValues.email" type="email" placeholder="Correo electrónico" class="edit-input">
              <div class="edit-actions">
                <button @click="saveProfileField('email')" :disabled="isSavingProfile" class="btn-save">Guardar</button>
                <button @click="cancelEditingField" class="btn-cancel">Cancelar</button>
              </div>
            </div>
          </div>

          <!-- Teléfono -->
          <div class="settings-field">
            <div v-if="editingField !== 'phone'" class="field-display">
              <span class="field-label">Teléfono:</span>
              <span class="field-value">{{ accountProfile.phone || 'No especificado' }}</span>
              <button class="edit-btn" @click="startEditingField('phone')" title="Editar">✏️</button>
            </div>
            <div v-else class="field-edit">
              <input v-model="editValues.phone" type="tel" placeholder="Número de teléfono" class="edit-input">
              <div class="edit-actions">
                <button @click="saveProfileField('phone')" :disabled="isSavingProfile" class="btn-save">Guardar</button>
                <button @click="cancelEditingField" class="btn-cancel">Cancelar</button>
              </div>
            </div>
          </div>

          <!-- GitHub -->
          <div class="settings-field">
            <div v-if="editingField !== 'github'" class="field-display">
              <span class="field-label">GitHub:</span>
              <span class="field-value">{{ accountProfile.github?.username || 'No vinculado' }}</span>
              <button class="edit-btn" @click="startEditingField('github')" title="Editar">✏️</button>
            </div>
            <div v-else class="field-edit">
              <label><input v-model="editValues.github.hasAccount" type="checkbox"> Tengo cuenta en GitHub</label>
              <input v-if="editValues.github.hasAccount" v-model="editValues.github.username" type="text" placeholder="Usuario de GitHub" class="edit-input">
              <div class="edit-actions">
                <button @click="saveProfileField('github')" :disabled="isSavingProfile" class="btn-save">Guardar</button>
                <button @click="cancelEditingField" class="btn-cancel">Cancelar</button>
              </div>
            </div>
          </div>

          <!-- Bio -->
          <div class="settings-field">
            <div v-if="editingField !== 'bio'" class="field-display">
              <span class="field-label">Bio:</span>
              <span class="field-value">{{ accountProfile.bio || 'No especificado' }}</span>
              <button class="edit-btn" @click="startEditingField('bio')" title="Editar">✏️</button>
            </div>
            <div v-else class="field-edit">
              <textarea v-model="editValues.bio" placeholder="Cuéntanos algo sobre ti" class="edit-input"></textarea>
              <div class="edit-actions">
                <button @click="saveProfileField('bio')" :disabled="isSavingProfile" class="btn-save">Guardar</button>
                <button @click="cancelEditingField" class="btn-cancel">Cancelar</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Cambiar Contraseña -->
        <div class="settings-section">
          <h4>Cambiar Contraseña</h4>
          <div v-if="passwordError" class="alert alert-error">{{ passwordError }}</div>
          <div v-if="passwordSuccess" class="alert alert-success">{{ passwordSuccess }}</div>

          <div class="password-fields">
            <div class="password-field">
              <label>Contraseña actual:</label>
              <input v-model="passwordData.current" type="password" placeholder="Tu contraseña actual" class="edit-input">
            </div>
            <div class="password-field">
              <label>Nueva contraseña:</label>
              <input v-model="passwordData.new" type="password" placeholder="Mínimo 8 caracteres, con mayúscula y número" class="edit-input">
            </div>
            <div class="password-field">
              <label>Confirmar nueva contraseña:</label>
              <input v-model="passwordData.confirm" type="password" placeholder="Repite tu nueva contraseña" class="edit-input">
            </div>
            <div class="password-hint">
              <small>La contraseña debe tener: mínimo 8 caracteres, al menos 1 mayúscula y 1 número</small>
            </div>
            <button @click="changePassword" :disabled="isChangingPassword" class="btn-change-password">
              {{ isChangingPassword ? 'Cambiando...' : 'Cambiar Contraseña' }}
            </button>
          </div>
        </div>

        <!-- Botón Cerrar -->
        <div class="settings-footer">
          <button @click="closeSettingsModal" class="btn-close-settings">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Modal para perfil de amigos -->
    <div v-if="showFriendProfile && selectedFriend" class="friend-profile-modal" @click="closeFriendProfile">
      <div class="friend-profile-card" @click.stop>
        <button class="modal-close-friend" @click="closeFriendProfile">&times;</button>
  
        <div class="friend-profile-header">
          <img v-if="selectedFriend.avatarUrl" :src="selectedFriend.avatarUrl" :alt="selectedFriend.fullName" class="friend-profile-avatar" @click.stop="openFriendPhoto(selectedFriend)">
          <div v-else class="friend-profile-avatar friend-profile-avatar-default">👤</div>
        </div>

        <div v-if="showFriendPhotoModal" class="friend-photo-overlay" @click="closeFriendPhoto">
          <button class="friend-photo-close" @click.stop="closeFriendPhoto">&times;</button>
          <img :src="selectedFriendPhoto.url" :alt="selectedFriendPhoto.name" class="friend-photo-large" @click.stop>
        </div>
  
        <div class="friend-profile-content">
          <h3 class="friend-profile-name">{{ selectedFriend.fullName || selectedFriend.username }}</h3>
          <p class="friend-profile-username">@{{ selectedFriend.username }}</p>
          <p v-if="selectedFriend.bio" class="friend-profile-bio">{{ selectedFriend.bio }}</p>
    
          <div v-if="selectedFriend.league" class="friend-profile-league">
            <img :src="assetUrl(selectedFriend.league.image)" :alt="selectedFriend.league.name" class="friend-profile-league-img">
            <span class="friend-profile-league-name">{{ selectedFriend.league.name }}</span>
          </div>
    
          <div v-if="selectedFriend.programmerType" class="friend-profile-type">
            <span class="type-label">Nivel:</span>
            <span class="type-value">{{ selectedFriend.programmerType }}</span>
          </div>

          <div v-if="selectedFriendCertificates.length > 0" class="friend-profile-certs">
            <h4 class="certs-title">Certificados</h4>
            <div class="friend-cert-list">
              <div v-for="cert in selectedFriendCertificates" :key="cert.title" class="friend-cert-item">
                <span class="friend-cert-title">{{ cert.title }}</span>
                <span class="friend-cert-percent">{{ cert.percentage }}%</span>
              </div>
            </div>
          </div>

          <button class="friend-battle-btn friend-battle-btn-modal" @click="openBattleLanguageModal(selectedFriend)">Batalla amistosa</button>
          <button class="friend-projects-btn friend-projects-btn-modal" @click="openFriendPosts(selectedFriend)">Ver posts y proyectos</button>
        </div>
      </div>
    </div>

    <div v-if="showFriendPostsModal && friendPostsTarget" class="projects-modal" @click="closeFriendPosts">
      <div class="projects-card" @click.stop>
        <button class="modal-close-friend" @click="closeFriendPosts">&times;</button>
        <h3 class="projects-title">Posts de @{{ friendPostsTarget.username }}</h3>

        <p v-if="selectedFriendPosts.length === 0" class="projects-empty">Este amigo aún no tiene posts.</p>
        <div v-else class="projects-list">
          <article v-for="post in selectedFriendPosts" :key="post.id" class="project-card">
            <div class="project-card-head">
              <h3 class="project-title">{{ post.project?.title || post.type || 'Post' }}</h3>
              <span class="project-date">{{ formatDate(post.createdAt) }}</span>
            </div>
            <p v-if="post.project?.description" class="project-description">{{ post.project.description }}</p>
            <p v-if="post.text" class="project-text">{{ post.text }}</p>
            <a v-if="post.project?.url" :href="post.project.url" target="_blank" rel="noopener noreferrer" class="project-link">Ver repositorio</a>
          </article>
        </div>
      </div>
    </div>

    <div v-if="showBattleLanguageModal && battleTargetFriend" class="battle-language-modal" @click="closeBattleLanguageModal">
      <div class="battle-language-card" @click.stop>
        <button class="modal-close-friend" @click="closeBattleLanguageModal">&times;</button>
        <h3>Reto amistoso</h3>
        <p>Selecciona el lenguaje para retar a @{{ battleTargetFriend.username }}.</p>

        <div class="battle-language-list">
          <button
            v-for="language in battleLanguages"
            :key="language"
            class="battle-language-btn"
            :class="{ active: selectedBattleLanguage === language }"
            @click="selectedBattleLanguage = language"
          >
            {{ language }}
          </button>
        </div>

        <button class="battle-send-btn" :disabled="isSendingBattleRequest || !selectedBattleLanguage" @click="sendBattleRequest">
          {{ isSendingBattleRequest ? 'Enviando...' : 'Enviar reto' }}
        </button>

        <p v-if="battleRequestFeedback" class="battle-feedback">{{ battleRequestFeedback }}</p>
      </div>
    </div>

    <nav class="bottom-nav">
      <button class="nav-item" :class="{ active: activeSection === 'inicio' }" @click="$emit('change-section', 'inicio')" title="Inicio">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
      </button>
      <button class="nav-item" :class="{ active: activeSection === 'comunidad' }" @click="$emit('change-section', 'comunidad')" title="Comunidad">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
      </button>
      <button class="nav-item" :class="{ active: activeSection === 'clasificacion' }" @click="$emit('change-section', 'clasificacion')" title="Clasificación">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3H8v2H5v3c0 2.97 2.16 5.43 5 5.91V17H7v2h10v-2h-3v-3.09c2.84-.48 5-2.94 5-5.91V5h-3V3zm-9 5V7h1v4.82C7.16 11.4 7 9.54 7 8zm10 0c0 1.54-.16 3.4-1 3.82V7h1v1z"/></svg>
      </button>
      <button class="nav-item" :class="{ active: activeSection === 'lecciones' }" @click="$emit('change-section', 'lecciones')" title="Lecciones">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 4.5C5 3.67 5.67 3 6.5 3H18v14H7c-.55 0-1 .45-1 1s.45 1 1 1h11v2H7c-1.66 0-3-1.34-3-3V4.5z"/>
          <path d="M14.06 8.19l1.75 1.75-4.93 4.94H9.13v-1.75l4.93-4.94zm2.47-.72l.94-.94a1 1 0 011.41 0l.59.59a1 1 0 010 1.41l-.94.94-2-2z"/>
        </svg>
      </button>
      <button class="nav-item" :class="{ active: activeSection === 'perfil', 'has-alert': (requests.length || pendingRequestsCount) > 0 }" @click="$emit('change-section', 'perfil')" title="Perfil">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        <span v-if="(requests.length || pendingRequestsCount) > 0" class="menu-alert-badge">{{ (requests.length || pendingRequestsCount) > 9 ? '9+' : (requests.length || pendingRequestsCount) }}</span>
      </button>
    </nav>
  </div>
</template>

<script>
import { API_BASE_URL } from '../config/api'
import { assetUrl } from '../utils/assets'

export default {
  name: 'Perfil',
  props: {
    activeSection: {
      type: String,
      default: 'perfil'
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
      socialApiBaseUrl: `${API_BASE_URL}/api/social`,
      learningApiBaseUrl: `${API_BASE_URL}/api/learning`,
      authApiBaseUrl: `${API_BASE_URL}/api/auth`,
      showPhotoModal: false,
      showAvatarEditor: false,
      isUploadingAvatar: false,
      showFriendPhotoModal: false,
      showFriendProfile: false,
      selectedFriend: null,
      selectedFriendPhoto: {
        url: '',
        name: ''
      },
      avatarEditorSource: '',
      avatarZoom: 1,
      avatarOffsetX: 0,
      avatarOffsetY: 0,
      isAvatarDragging: false,
      avatarDragStartX: 0,
      avatarDragStartY: 0,
      avatarDragStartOffsetX: 0,
      avatarDragStartOffsetY: 0,
      avatarEditorImageMeta: null,
      profile: {
        username: '',
        avatarUrl: '',
        programmerType: ''
      },
      accountProfile: {
        username: '',
        email: '',
        phone: '',
        bio: '',
        github: {
          hasAccount: false,
          username: ''
        }
      },
      league: {
        name: 'Junior Explorer',
        image: assetUrl('/images/1.png')
      },
      streak: {
        consecutiveActiveDays: 0
      },
      friends: [],
      followers: [],
      following: [],
      showProfileSocialListModal: false,
      profileSocialListTitle: '',
      profileSocialListItems: [],
      myProjects: [],
      myPosts: [],
      showFriendPostsModal: false,
      isLoadingFriendPosts: false,
      friendPostsTarget: null,
      selectedFriendPosts: [],
      requests: [],
      notifications: [],
      certificates: [],
      selectedFriendCertificates: [],
      friendUsername: '',
      showBattleLanguageModal: false,
      battleTargetFriend: null,
      selectedBattleLanguage: 'Python',
      battleLanguages: ['Python', 'Java', 'SQL', 'HTML/CSS'],
      isSendingBattleRequest: false,
      battleRequestFeedback: '',
      // Settings modal
      showSettingsModal: false,
      editingField: null,
      editValues: {
        username: '',
        email: '',
        phone: '',
        bio: '',
        github: { hasAccount: false, username: '' }
      },
      isSavingProfile: false,
      profileError: '',
      profileSuccess: '',
      // Password change
      showPasswordChange: false,
      passwordData: {
        current: '',
        new: '',
        confirm: ''
      },
      isChangingPassword: false,
      passwordError: '',
      passwordSuccess: ''
    }
  },
  watch: {
    user: {
      immediate: true,
      handler() {
        this.loadAll()
      }
    },
    avatarZoom() {
      this.clampAvatarOffsets()
    }
  },
  methods: {
    getCurrentUserId() {
      return this.user?.userId || this.user?._id || ''
    },
    async loadAll() {
      const currentUserId = this.getCurrentUserId()
      if (!currentUserId) return

      await Promise.allSettled([
        this.loadProfile(),
        this.loadAccountProfile(),
        this.loadLeague(),
        this.loadStreak(),
        this.loadFriends(),
        this.loadFollowers(),
        this.loadFollowing(),
        this.loadMyProjects(),
        this.loadRequests(),
        this.loadNotifications(),
        this.loadCertificates()
      ])
    },
    async loadAccountProfile() {
      const currentUserId = this.getCurrentUserId()
      if (!currentUserId) return

      try {
        const response = await fetch(`${this.authApiBaseUrl}/user/${currentUserId}`)
        const data = await response.json().catch(() => ({}))
        if (response.ok && data?.user) {
          this.accountProfile = {
            username: data.user.username || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
            bio: data.user.bio || '',
            github: {
              hasAccount: Boolean(data.user.github?.hasAccount),
              username: data.user.github?.username || ''
            }
          }
        }
      } catch (error) {
        // Silencioso
      }
    },
    async loadProfile() {
      const currentUserId = this.getCurrentUserId()
      if (!currentUserId) return

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/profile/${currentUserId}?viewerUserId=${encodeURIComponent(currentUserId)}`)
        const data = await response.json().catch(() => ({}))
        if (response.ok && data?.profile) {
          this.profile = data.profile
        }
      } catch (error) {
        // Silencioso para no romper la carga del perfil
      }
    },
    async loadLeague() {
      const currentUserId = this.getCurrentUserId()
      if (!currentUserId) return

      try {
        const response = await fetch(`${this.learningApiBaseUrl}/leaderboard?userId=${encodeURIComponent(currentUserId)}`)
        const data = await response.json().catch(() => ({}))
        if (response.ok && data?.userSummary?.league) {
          this.league = data.userSummary.league
        }
      } catch (error) {
        // Silencioso
      }
    },
    async loadStreak() {
      const currentUserId = this.getCurrentUserId()
      if (!currentUserId) return

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/streak/${currentUserId}`)
        const data = await response.json().catch(() => ({}))
        if (response.ok && data?.streak) {
          this.streak = data.streak
        }
      } catch (error) {
        // Silencioso
      }
    },
    async loadFriends() {
      const currentUserId = this.getCurrentUserId()
      if (!currentUserId) return

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/friends/${currentUserId}`)
        const data = await response.json().catch(() => ({}))
        if (response.ok) {
          this.friends = Array.isArray(data.friends) ? data.friends : []
        }
      } catch (error) {
        this.friends = []
      }
    },
    async loadFollowers() {
      const currentUserId = this.getCurrentUserId()
      if (!currentUserId) return

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/followers/${currentUserId}`)
        const data = await response.json().catch(() => ({}))
        if (response.ok) {
          this.followers = Array.isArray(data.followers) ? data.followers : []
        }
      } catch (error) {
        this.followers = []
      }
    },
    async loadFollowing() {
      const currentUserId = this.getCurrentUserId()
      if (!currentUserId) return

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/following/${currentUserId}`)
        const data = await response.json().catch(() => ({}))
        if (response.ok) {
          this.following = Array.isArray(data.following) ? data.following : []
        }
      } catch (error) {
        this.following = []
      }
    },
    async loadMyProjects() {
      const currentUserId = this.getCurrentUserId()
      if (!currentUserId) return

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/community/posts/user/${currentUserId}?userId=${encodeURIComponent(currentUserId)}`)
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          this.myProjects = []
          return
        }

        const posts = Array.isArray(data.posts) ? data.posts : []
        this.myProjects = posts.filter((post) => {
          const hasProjectTitle = Boolean(post?.project?.title)
          const hasProjectDescription = Boolean(post?.project?.description)
          const hasProjectUrl = Boolean(post?.project?.url)
          return hasProjectTitle || hasProjectDescription || hasProjectUrl
        })
        this.myPosts = posts.filter((post) => {
          const hasProjectTitle = Boolean(post?.project?.title)
          const hasProjectDescription = Boolean(post?.project?.description)
          const hasProjectUrl = Boolean(post?.project?.url)
          return !hasProjectTitle && !hasProjectDescription && !hasProjectUrl
        })
      } catch (error) {
        this.myProjects = []
        this.myPosts = []
      }
    },
    async loadRequests() {
      const currentUserId = this.getCurrentUserId()
      if (!currentUserId) return

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/friend-requests/${currentUserId}`)
        const data = await response.json().catch(() => ({}))
        if (response.ok) {
          this.requests = Array.isArray(data.requests) ? data.requests : []
        }
      } catch (error) {
        this.requests = []
      }
    },
    async loadCertificates() {
      const currentUserId = this.getCurrentUserId()
      if (!currentUserId) return

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/certificates/${currentUserId}`)
        const data = await response.json().catch(() => ({}))
        if (response.ok) {
          this.certificates = Array.isArray(data.certificates) ? data.certificates : []
        }
      } catch (error) {
        this.certificates = []
      }
    },
    async loadNotifications() {
      const currentUserId = this.getCurrentUserId()
      if (!currentUserId) {
        this.notifications = []
        return
      }

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/notifications/${currentUserId}`)
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          this.notifications = []
          return
        }

        this.notifications = Array.isArray(data.notifications) ? data.notifications : []
      } catch (error) {
        this.notifications = []
      }
    },
    async markNotificationAsRead(notificationId) {
      const currentUserId = this.getCurrentUserId()
      if (!currentUserId || !notificationId) return

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/notifications/${notificationId}/read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: currentUserId })
        })

        if (!response.ok) return

        this.notifications = this.notifications.map((item) => {
          if (String(item.id) !== String(notificationId)) return item
          return {
            ...item,
            isRead: true
          }
        })
      } catch (error) {
        // silencioso
      }
    },
    async onAvatarSelected(event) {
      const file = event.target.files?.[0]
      if (!file) return

      try {
        const source = await this.readFileAsDataUrl(file)
        const image = await this.loadImage(source)

        this.avatarEditorSource = source
        this.avatarEditorImageMeta = {
          width: image.width,
          height: image.height
        }
        this.avatarZoom = 1
        this.avatarOffsetX = 0
        this.avatarOffsetY = 0
        this.showAvatarEditor = true
        document.body.style.overflow = 'hidden'
      } catch (error) {
        console.error('No se pudo procesar avatar', error)
      } finally {
        event.target.value = ''
      }
    },
    closeAvatarEditor() {
      this.showAvatarEditor = false
      this.avatarEditorSource = ''
      this.avatarEditorImageMeta = null
      this.avatarZoom = 1
      this.avatarOffsetX = 0
      this.avatarOffsetY = 0
      this.isAvatarDragging = false
      this.applyBodyScrollLock()
    },
    async saveEditedAvatar() {
      if (!this.avatarEditorSource || !this.avatarEditorImageMeta || this.isUploadingAvatar) return

      this.isUploadingAvatar = true
      try {
        const avatarUrl = await this.buildEditedAvatarDataUrl()
        await this.updateAvatar(avatarUrl)
        this.closeAvatarEditor()
      } catch (error) {
        console.error('No se pudo guardar avatar', error)
      } finally {
        this.isUploadingAvatar = false
      }
    },
    getAvatarEditorImageStyle() {
      const previewSize = 220
      const bounds = this.getAvatarBounds(previewSize)

      return {
        width: `${bounds.displayWidth}px`,
        height: `${bounds.displayHeight}px`,
        transform: `translate(calc(-50% + ${this.avatarOffsetX}px), calc(-50% + ${this.avatarOffsetY}px))`
      }
    },
    getAvatarBounds(previewSize = 220) {
      if (!this.avatarEditorImageMeta) {
        return {
          displayWidth: previewSize,
          displayHeight: previewSize,
          maxOffsetX: 0,
          maxOffsetY: 0
        }
      }

      const imageWidth = this.avatarEditorImageMeta.width || previewSize
      const imageHeight = this.avatarEditorImageMeta.height || previewSize
      const baseScale = Math.max(previewSize / imageWidth, previewSize / imageHeight)
      const scaled = baseScale * this.avatarZoom
      const displayWidth = imageWidth * scaled
      const displayHeight = imageHeight * scaled

      return {
        displayWidth,
        displayHeight,
        maxOffsetX: Math.max(0, (displayWidth - previewSize) / 2),
        maxOffsetY: Math.max(0, (displayHeight - previewSize) / 2)
      }
    },
    clampAvatarOffsets() {
      const { maxOffsetX, maxOffsetY } = this.getAvatarBounds(220)
      this.avatarOffsetX = Math.min(maxOffsetX, Math.max(-maxOffsetX, this.avatarOffsetX))
      this.avatarOffsetY = Math.min(maxOffsetY, Math.max(-maxOffsetY, this.avatarOffsetY))
    },
    onAvatarPointerDown(event) {
      if (!this.avatarEditorSource) return

      this.isAvatarDragging = true
      this.avatarDragStartX = event.clientX
      this.avatarDragStartY = event.clientY
      this.avatarDragStartOffsetX = this.avatarOffsetX
      this.avatarDragStartOffsetY = this.avatarOffsetY
      event.currentTarget?.setPointerCapture?.(event.pointerId)
    },
    onAvatarPointerMove(event) {
      if (!this.isAvatarDragging) return

      const deltaX = event.clientX - this.avatarDragStartX
      const deltaY = event.clientY - this.avatarDragStartY
      this.avatarOffsetX = this.avatarDragStartOffsetX + deltaX
      this.avatarOffsetY = this.avatarDragStartOffsetY + deltaY
      this.clampAvatarOffsets()
    },
    onAvatarPointerUp() {
      this.isAvatarDragging = false
    },
    readFileAsDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ''))
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    },
    loadImage(source) {
      return new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = reject
        image.src = source
      })
    },
    async buildEditedAvatarDataUrl() {
      const image = await this.loadImage(this.avatarEditorSource)
      const canvas = document.createElement('canvas')
      const size = 320
      const previewSize = 220
      canvas.width = size
      canvas.height = size
      const context = canvas.getContext('2d')

      const baseScale = Math.max(size / image.width, size / image.height)
      const zoomedScale = baseScale * this.avatarZoom
      const drawWidth = image.width * zoomedScale
      const drawHeight = image.height * zoomedScale

      const centeredX = (size - drawWidth) / 2
      const centeredY = (size - drawHeight) / 2

      const scaledOffsetX = this.avatarOffsetX * (size / previewSize)
      const scaledOffsetY = this.avatarOffsetY * (size / previewSize)

      const minX = size - drawWidth
      const minY = size - drawHeight

      const drawX = Math.min(0, Math.max(minX, centeredX + scaledOffsetX))
      const drawY = Math.min(0, Math.max(minY, centeredY + scaledOffsetY))

      context.drawImage(image, drawX, drawY, drawWidth, drawHeight)
      return canvas.toDataURL('image/jpeg', 0.85)
    },
    async updateAvatar(avatarUrl) {
      const currentUserId = this.getCurrentUserId()
      if (!currentUserId) return

      const response = await fetch(`${this.socialApiBaseUrl}/profile/${currentUserId}/avatar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl })
      })
      const data = await response.json()
      if (response.ok && data?.profile) {
        this.profile = data.profile
        this.$emit('user-updated', {
          ...this.user,
          avatarUrl: data.profile.avatarUrl
        })
      }
    },
    async sendRequest() {
      const currentUserId = this.getCurrentUserId()
      const username = this.friendUsername.trim()
      if (!username || !currentUserId) return

      await fetch(`${this.socialApiBaseUrl}/friend-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          targetUsername: username
        })
      })

      this.friendUsername = ''
      await this.loadRequests()
      await this.loadFriends()
    },
    async respondRequest(requestId, accept) {
      const currentUserId = this.getCurrentUserId()
      if (!currentUserId) return

      await fetch(`${this.socialApiBaseUrl}/friend-requests/${requestId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, accept })
      })

      await this.loadRequests()
      await this.loadFriends()
    },
    openPhotoModal() {
      this.showPhotoModal = true
      this.applyBodyScrollLock()
    },
    closePhotoModal() {
      this.showPhotoModal = false
      this.applyBodyScrollLock()
    },
    openFriendPhoto(friend) {
      if (!friend?.avatarUrl) return

      this.selectedFriendPhoto = {
        url: friend.avatarUrl,
        name: friend.fullName || friend.username || 'Amigo'
      }
      this.showFriendPhotoModal = true
    },
    closeFriendPhoto() {
      this.showFriendPhotoModal = false
      this.selectedFriendPhoto = {
        url: '',
        name: ''
      }
    },
    async openFriendProfile(friend) {
      this.selectedFriend = friend
      this.showFriendProfile = true
      this.applyBodyScrollLock()
      await this.loadFriendCertificates(friend.userId)
    },
    async openFriendPosts(friend) {
      const targetUserId = String(friend?.userId || '')
      if (!targetUserId || this.isLoadingFriendPosts) return

      this.friendPostsTarget = friend
      this.showFriendPostsModal = true
      this.applyBodyScrollLock()

      this.isLoadingFriendPosts = true
      try {
        const viewerUserId = this.getCurrentUserId()
        const response = await fetch(
          `${this.socialApiBaseUrl}/community/posts/user/${targetUserId}?userId=${encodeURIComponent(viewerUserId)}`
        )
        const data = await response.json().catch(() => ({}))
        this.selectedFriendPosts = response.ok && Array.isArray(data.posts) ? data.posts : []
      } catch (error) {
        this.selectedFriendPosts = []
      } finally {
        this.isLoadingFriendPosts = false
      }
    },
    closeFriendPosts() {
      this.showFriendPostsModal = false
      this.friendPostsTarget = null
      this.selectedFriendPosts = []
      this.applyBodyScrollLock()
    },
    closeFriendProfile() {
      this.showFriendProfile = false
      this.showFriendPhotoModal = false
      this.selectedFriend = null
      this.selectedFriendCertificates = []
      this.selectedFriendPhoto = {
        url: '',
        name: ''
      }
      this.closeBattleLanguageModal()
      this.applyBodyScrollLock()
    },
    async deleteMyPost(postId) {
      const userId = this.getCurrentUserId()
      if (!userId || !postId) return

      const accepted = window.confirm('¿Seguro que quieres borrar esta publicación?')
      if (!accepted) return

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/community/posts/${postId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        })

        if (!response.ok) return

        this.myProjects = this.myProjects.filter((post) => String(post.id) !== String(postId))
        this.myPosts = this.myPosts.filter((post) => String(post.id) !== String(postId))
      } catch (error) {
        // noop
      }
    },
    openBattleLanguageModal(friend) {
      if (!friend?.userId) return
      this.battleTargetFriend = friend
      this.selectedBattleLanguage = this.selectedBattleLanguage || 'Python'
      this.showBattleLanguageModal = true
      this.battleRequestFeedback = ''
      this.applyBodyScrollLock()
    },
    closeBattleLanguageModal() {
      this.showBattleLanguageModal = false
      this.battleTargetFriend = null
      this.isSendingBattleRequest = false
      this.battleRequestFeedback = ''
      this.applyBodyScrollLock()
    },
    async sendBattleRequest() {
      const currentUserId = this.getCurrentUserId()
      if (this.isSendingBattleRequest || !currentUserId || !this.battleTargetFriend?.userId || !this.selectedBattleLanguage) {
        return
      }

      this.isSendingBattleRequest = true
      this.battleRequestFeedback = ''
      try {
        const response = await fetch(`${this.socialApiBaseUrl}/battles/challenge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromUserId: currentUserId,
            toUserId: this.battleTargetFriend.userId,
            language: this.selectedBattleLanguage
          })
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          this.battleRequestFeedback = data?.message || 'No se pudo enviar el reto.'
          return
        }

        this.battleRequestFeedback = data?.message || 'Reto enviado.'
        setTimeout(() => {
          this.closeBattleLanguageModal()
        }, 800)
      } catch (error) {
        this.battleRequestFeedback = 'Error de conexión al enviar el reto.'
      } finally {
        this.isSendingBattleRequest = false
      }
    },
    applyBodyScrollLock() {
      const hasOpenModal = this.showPhotoModal || this.showFriendPhotoModal || this.showAvatarEditor || this.showFriendProfile || this.showFriendPostsModal || this.showBattleLanguageModal || this.showSettingsModal || this.showProfileSocialListModal
      document.body.style.overflow = hasOpenModal ? 'hidden' : 'auto'
    },
    openProfileSocialList(type) {
      if (type === 'followers') {
        this.profileSocialListTitle = 'Seguidores'
        this.profileSocialListItems = this.followers
      } else {
        this.profileSocialListTitle = 'Siguiendo'
        this.profileSocialListItems = this.following
      }

      this.showProfileSocialListModal = true
      this.applyBodyScrollLock()
    },
    closeProfileSocialList() {
      this.showProfileSocialListModal = false
      this.profileSocialListTitle = ''
      this.profileSocialListItems = []
      this.applyBodyScrollLock()
    },
    async loadFriendCertificates(userId) {
      const response = await fetch(`${this.socialApiBaseUrl}/certificates/${userId}`)
      const data = await response.json()
      if (response.ok) {
        this.selectedFriendCertificates = Array.isArray(data.certificates) ? data.certificates : []
      }
    },
    formatDate(value) {
      if (!value) return ''
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return ''

      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$emit('logout')
    },
    openSettingsModal() {
      this.editValues = {
        username: this.accountProfile.username || this.user?.username || '',
        email: this.accountProfile.email || this.user?.email || '',
        phone: this.accountProfile.phone || this.user?.phone || '',
        bio: this.accountProfile.bio || this.profile?.bio || this.user?.bio || '',
        github: {
          hasAccount: this.accountProfile.github?.hasAccount || this.user?.github?.hasAccount || false,
          username: this.accountProfile.github?.username || this.user?.github?.username || ''
        }
      }
      this.profileError = ''
      this.profileSuccess = ''
      this.passwordError = ''
      this.passwordSuccess = ''
      this.passwordData = { current: '', new: '', confirm: '' }
      this.showSettingsModal = true
      this.applyBodyScrollLock()
    },
    closeSettingsModal() {
      this.showSettingsModal = false
      this.editingField = null
      this.profileError = ''
      this.profileSuccess = ''
      this.passwordError = ''
      this.passwordSuccess = ''
      this.applyBodyScrollLock()
    },
    startEditingField(fieldName) {
      this.editingField = fieldName
      this.profileError = ''
      this.profileSuccess = ''
    },
    cancelEditingField() {
      this.editingField = null
      this.profileError = ''
      this.profileSuccess = ''
    },
    async saveProfileField(fieldName) {
      const userId = this.getCurrentUserId()
      if (!userId) {
        this.profileError = 'Usuario no identificado'
        return
      }

      this.isSavingProfile = true
      this.profileError = ''
      this.profileSuccess = ''

      try {
        const updateData = {}
        if (fieldName === 'username') updateData.username = this.editValues.username
        if (fieldName === 'email') updateData.email = this.editValues.email
        if (fieldName === 'phone') updateData.phone = this.editValues.phone
        if (fieldName === 'bio') updateData.bio = this.editValues.bio
        if (fieldName === 'github') updateData.github = this.editValues.github

        const response = await fetch(`${this.authApiBaseUrl}/user/${userId}/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })

        const data = await response.json().catch(() => ({}))

        if (response.ok) {
          this.profileSuccess = `${fieldName === 'username' ? 'Usuario' : fieldName === 'email' ? 'Email' : fieldName === 'phone' ? 'Teléfono' : fieldName === 'bio' ? 'Bio' : 'GitHub'} actualizado correctamente`
          if (fieldName === 'username') this.accountProfile.username = this.editValues.username
          if (fieldName === 'email') this.accountProfile.email = this.editValues.email
          if (fieldName === 'phone') this.accountProfile.phone = this.editValues.phone
          if (fieldName === 'bio') {
            this.accountProfile.bio = this.editValues.bio
            this.profile = {
              ...this.profile,
              bio: this.editValues.bio
            }
          }
          if (fieldName === 'github') {
            this.accountProfile.github = {
              hasAccount: Boolean(this.editValues.github?.hasAccount),
              username: this.editValues.github?.username || ''
            }
          }

          const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
          const mergedUser = {
            ...storedUser,
            username: this.accountProfile.username || storedUser.username || '',
            email: this.accountProfile.email || storedUser.email || '',
            phone: this.accountProfile.phone || storedUser.phone || '',
            bio: this.accountProfile.bio || storedUser.bio || '',
            github: this.accountProfile.github || storedUser.github || { hasAccount: false, username: '' }
          }
          localStorage.setItem('user', JSON.stringify(mergedUser))

          setTimeout(() => { this.editingField = null }, 1500)
        } else {
          this.profileError = data.message || 'Error al guardar'
        }
      } catch (error) {
        console.error('Error guardando perfil:', error)
        this.profileError = 'Error de conexión'
      } finally {
        this.isSavingProfile = false
      }
    },
    async changePassword() {
      const userId = this.getCurrentUserId()
      if (!userId) {
        this.passwordError = 'Usuario no identificado'
        return
      }

      if (!this.passwordData.current || !this.passwordData.new || !this.passwordData.confirm) {
        this.passwordError = 'Todos los campos son obligatorios'
        return
      }

      if (this.passwordData.new !== this.passwordData.confirm) {
        this.passwordError = 'Las contraseñas no coinciden'
        return
      }

      const hasMinLength = this.passwordData.new.length >= 8
      const hasUppercase = /[A-Z]/.test(this.passwordData.new)
      const hasNumber = /\d/.test(this.passwordData.new)

      if (!hasMinLength || !hasUppercase || !hasNumber) {
        this.passwordError = 'La contraseña debe tener mínimo 8 caracteres, 1 mayúscula y 1 número'
        return
      }

      this.isChangingPassword = true
      this.passwordError = ''
      this.passwordSuccess = ''

      try {
        const response = await fetch(`${this.authApiBaseUrl}/user/${userId}/change-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword: this.passwordData.current,
            newPassword: this.passwordData.new,
            confirmPassword: this.passwordData.confirm
          })
        })

        const data = await response.json().catch(() => ({}))

        if (response.ok) {
          this.passwordSuccess = 'Contraseña cambiada correctamente'
          this.passwordData = { current: '', new: '', confirm: '' }
          setTimeout(() => { this.passwordSuccess = '' }, 3000)
        } else {
          this.passwordError = data.message || 'Error al cambiar contraseña'
        }
      } catch (error) {
        console.error('Error cambiando contraseña:', error)
        this.passwordError = 'Error de conexión'
      } finally {
        this.isChangingPassword = false
      }
    }
  }
}
</script>

<style scoped>
.perfil-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1f3cff 0%, #2c49ff 100%);
  display: flex;
  flex-direction: column;
  padding-bottom: 80px;
}

.content-area {
  flex: 1;
  padding: 14px;
  color: #fff;
}

.top-panel {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 6px;
  margin-bottom: 12px;
}

.buttons-column {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  z-index: 2;
}

.exit-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(241, 90, 98, 0.15);
  border: 2px solid rgba(241, 90, 98, 0.3);
  color: #f15a62;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 24px;
}

.exit-btn:hover {
  background: rgba(241, 90, 98, 0.25);
  border-color: rgba(241, 90, 98, 0.5);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(241, 90, 98, 0.3);
}

.exit-btn svg {
  width: 24px;
  height: 24px;
}

.league-box,
.streak-box {
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.league-image {
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.streak-box {
  position: absolute;
  top: -8px;
  right: -10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 3px;
  z-index: 3;
}

.streak-box .fire {
  font-size: 20px;
  line-height: 1;
}

.streak-box p {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.avatar-container {
  position: relative;
  width: 82px;
  height: 82px;
  margin-bottom: 8px;
}

.avatar-image,
.avatar-default {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.avatar-image:hover {
  border-color: rgba(157, 243, 182, 0.7);
  transform: scale(1.05);
}

.avatar-default {
  background: linear-gradient(135deg, #6366ff 0%, #a855f7 100%);
  font-size: 36px;
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.avatar-upload-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0de28f 0%, #15b870 100%);
  color: #0a1f14;
  border: 2px solid #fff;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.avatar-upload-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(13, 226, 143, 0.4);
}

.username {
  margin-top: 6px;
  font-size: 16px;
  font-weight: 800;
}

.profile-bio {
  margin: 4px 0 0;
  max-width: 280px;
  text-align: center;
  font-size: 12px;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.86);
}

.profile-programmer-role {
  margin-top: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: #d9ffe9;
  background: rgba(13, 226, 143, 0.14);
  border: 1px solid rgba(13, 226, 143, 0.35);
}

.profile-social-stats {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  width: 100%;
  max-width: 260px;
}

.social-stat-card {
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(8, 23, 90, 0.45);
  border-radius: 12px;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.social-stat-card:hover {
  border-color: rgba(13, 226, 143, 0.7);
  background: rgba(8, 23, 90, 0.72);
}

.social-stat-value {
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
}

.social-stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.82);
}

.league-name {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.hidden-input {
  display: none;
}

.photo-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  animation: fadeIn 0.3s ease;
}

.avatar-editor-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 16px;
}

.avatar-editor-card {
  width: 100%;
  max-width: 360px;
  background: linear-gradient(135deg, #2c1f60 0%, #3d2e8f 100%);
  border: 1px solid rgba(157, 243, 182, 0.28);
  border-radius: 18px;
  padding: 16px;
  color: #fff;
}

.avatar-editor-card h3 {
  margin: 0 0 6px;
  font-size: 18px;
}

.avatar-editor-card p {
  margin: 0 0 14px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
}

.avatar-editor-preview {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 14px;
  border: 3px solid rgba(157, 243, 182, 0.5);
  background: rgba(5, 10, 35, 0.85);
  position: relative;
  touch-action: none;
  cursor: grab;
}

.avatar-editor-preview:active {
  cursor: grabbing;
}

.avatar-editor-image {
  position: absolute;
  top: 50%;
  left: 50%;
  user-select: none;
  -webkit-user-drag: none;
}

.avatar-editor-controls {
  display: grid;
  gap: 10px;
}

.avatar-editor-controls label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  display: grid;
  gap: 6px;
}

.avatar-editor-help {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.75);
}

.avatar-editor-controls input[type='range'] {
  width: 100%;
}

.avatar-editor-actions {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.avatar-btn-cancel,
.avatar-btn-save {
  border: none;
  border-radius: 10px;
  padding: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.avatar-btn-cancel {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.avatar-btn-save {
  background: linear-gradient(135deg, #0de28f 0%, #15b870 100%);
  color: #062b1a;
}

.friend-battle-btn {
  margin-top: 8px;
  border: 1px solid rgba(157, 243, 182, 0.45);
  background: rgba(13, 226, 143, 0.15);
  color: #d9ffe9;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.friend-battle-btn:hover {
  border-color: rgba(157, 243, 182, 0.8);
}

.friend-projects-btn {
  margin-top: 8px;
  border: 1px solid rgba(166, 184, 255, 0.45);
  background: rgba(166, 184, 255, 0.16);
  color: #e9f0ff;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.friend-projects-btn-modal {
  width: 100%;
}

.friend-battle-btn-modal {
  width: 100%;
  margin-top: 14px;
}

.friend-card-actions {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}

.battle-language-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.74);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2200;
  padding: 18px;
}

.battle-language-card {
  width: min(92vw, 360px);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(38, 56, 185, 0.96) 0%, rgba(25, 39, 138, 0.96) 100%);
  border: 1px solid rgba(166, 184, 255, 0.45);
  box-shadow: 0 18px 34px rgba(2, 8, 53, 0.55);
  padding: 16px;
  position: relative;
  color: #fff;
}

.battle-language-card h3 {
  margin: 0 0 6px;
}

.battle-language-card p {
  margin: 0 0 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.82);
}

.battle-language-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.battle-language-btn {
  border: 1px solid rgba(166, 184, 255, 0.45);
  background: rgba(18, 28, 120, 0.75);
  color: #dce7ff;
  border-radius: 10px;
  padding: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.battle-language-btn.active {
  border-color: #0de28f;
  color: #0de28f;
}

.battle-send-btn {
  margin-top: 12px;
  width: 100%;
  border: none;
  border-radius: 10px;
  padding: 10px;
  background: linear-gradient(135deg, #0de28f 0%, #15b870 100%);
  color: #062b1a;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.battle-send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.battle-feedback {
  margin-top: 10px;
  font-size: 12px;
  color: #d9ffe9;
}

.avatar-btn-save:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.photo-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 16px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.modal-photo {
  width: 100%;
  height: auto;
  max-height: 85vh;
  object-fit: contain;
  display: block;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.friend-photo-overlay {
  position: absolute;
  inset: 12px;
  background: rgba(24, 0, 173, 0.96);
  border: 1px solid rgba(157, 243, 182, 0.24);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  padding: 14px;
}

.friend-photo-large {
  width: 100%;
  max-height: 360px;
  object-fit: contain;
  border-radius: 12px;
}

.friend-photo-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.friend-profile-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  animation: fadeIn 0.3s ease;
}

.friend-profile-card {
  background: linear-gradient(135deg, #2c1f60 0%, #3d2e8f 100%);
  border: 1px solid rgba(157, 243, 182, 0.2);
  border-radius: 24px;
  padding: 24px 20px;
  max-width: 320px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 60px rgba(13, 226, 143, 0.2);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close-friend {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.modal-close-friend:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.friend-profile-header {
  text-align: center;
  margin-bottom: 20px;
}

.friend-profile-avatar,
.friend-profile-avatar-default {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid rgba(157, 243, 182, 0.4);
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 48px;
  background: linear-gradient(135deg, #6366ff 0%, #a855f7 100%);
}

.friend-profile-content {
  text-align: center;
}

.friend-profile-name {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.friend-profile-username {
  margin: 0 0 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
}

.friend-profile-bio {
  margin: 0 0 14px;
  font-size: 12px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.84);
}

.friend-profile-league {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 12px 0 16px;
  background: rgba(13, 226, 143, 0.1);
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid rgba(157, 243, 182, 0.2);
}

.friend-profile-league-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.friend-profile-league-name {
  font-size: 12px;
  font-weight: 600;
  color: #9df3b6;
}

.friend-profile-type {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 12px 0 16px;
  font-size: 13px;
}

.type-label {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.type-value {
  color: #d0e0ff;
  font-weight: 600;
}

.friend-profile-certs {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(157, 243, 182, 0.2);
}

.certs-title {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 700;
  color: #9df3b6;
  text-align: center;
  letter-spacing: 0.5px;
}

.friend-cert-list {
  display: grid;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.friend-cert-item {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;
  background: rgba(13, 226, 143, 0.05);
  border-radius: 10px;
  padding: 8px;
  border: 1px solid rgba(157, 243, 182, 0.15);
}

.friend-cert-title {
  font-weight: 700;
  font-size: 11px;
  color: #fff;
}

.friend-cert-percent {
  background: rgba(140, 157, 255, 0.5);
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 800;
  color: #081e6f;
  font-size: 12px;
}


.fire {
  display: inline-block;
  filter: grayscale(1) brightness(0.7);
  transition: all 0.3s ease;
  font-size: 28px;
}

.fire.active {
  filter: grayscale(0) brightness(1);
  transform: scale(1.2);
}

.section-block {
  margin-top: 10px;
}

.section-block h2 {
  margin: 0 0 8px;
  font-size: 28px;
  letter-spacing: 1px;
}

.friends-list {
  min-height: 90px;
  border: 2px dashed rgba(3, 19, 76, 0.6);
  border-radius: 10px;
  padding: 8px;
  background: rgba(12, 25, 94, 0.25);
}

.followers-list {
  min-height: 90px;
  border: 2px dashed rgba(3, 19, 76, 0.6);
  border-radius: 10px;
  padding: 8px;
  background: rgba(12, 25, 94, 0.25);
}

.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.followers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.friend-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: rgba(12, 25, 94, 0.6);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.follower-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: rgba(12, 25, 94, 0.6);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
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

.friend-card:hover {
  background: rgba(12, 25, 94, 0.9);
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(35, 61, 255, 0.3);
}

.follower-card:hover {
  background: rgba(12, 25, 94, 0.9);
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(35, 61, 255, 0.3);
}

.friend-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 8px;
}

.follower-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 8px;
}

.friend-avatar-default {
  background: rgba(35, 61, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.follower-avatar-default {
  background: rgba(35, 61, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.friend-info {
  text-align: center;
  width: 100%;
}

.follower-info {
  text-align: center;
  width: 100%;
}

.friend-info h4 {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.follower-info h4 {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-username {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 8px;
}

.follower-username {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 8px;
}

.friend-bio {
  margin: 0 0 8px;
  font-size: 11px;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.76);
  max-height: 30px;
  overflow: hidden;
}

.follower-bio {
  margin: 0 0 8px;
  font-size: 11px;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.76);
  max-height: 30px;
  overflow: hidden;
}

.friend-league {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
}

.friend-league-img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.friend-item,
.empty {
  font-size: 13px;
  margin: 2px 0;
}

.add-friend {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.add-friend input {
  flex: 1;
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 10px;
  padding: 8px 10px;
  background: rgba(12, 25, 94, 0.6);
  color: #fff;
}

.add-friend button,
.request-actions button {
  border: none;
  border-radius: 10px;
  padding: 8px 10px;
  background: #0de28f;
  color: #072647;
  font-weight: 700;
  cursor: pointer;
}

.projects-list {
  min-height: 90px;
  border: 2px dashed rgba(3, 19, 76, 0.6);
  border-radius: 10px;
  padding: 10px;
  background: rgba(12, 25, 94, 0.25);
  display: grid;
  gap: 10px;
}

.project-card {
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(8, 20, 82, 0.62);
  border-radius: 12px;
  padding: 10px;
}

.project-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.project-title {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
}

.project-date {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

.project-description {
  margin: 8px 0 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.88);
}

.project-text {
  margin: 0 0 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.74);
}

.project-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  text-decoration: none;
  font-size: 11px;
  font-weight: 700;
  color: #00123f;
  background: #0de28f;
}

.project-actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}

.project-delete-btn {
  border: 1px solid rgba(255, 120, 130, 0.7);
  background: rgba(255, 90, 102, 0.18);
  color: #ffd5d9;
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.project-delete-btn:hover {
  border-color: rgba(255, 120, 130, 1);
  color: #fff;
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

.requests-list {
  display: grid;
  gap: 12px;
}

.request-card {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(12, 25, 94, 0.6);
  transition: all 0.3s ease;
}

.request-card:hover {
  background: rgba(12, 25, 94, 0.9);
}

.request-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.request-avatar-default {
  background: rgba(35, 61, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.request-info {
  min-width: 0;
}

.request-info h4 {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.request-username {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 6px;
}

.request-league {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
}

.request-league-img {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-radius: 10px;
  background: rgba(12, 25, 94, 0.6);
}

.request-actions {
  display: flex;
  gap: 6px;
}

.request-actions .reject {
  background: #f15a62;
  color: #fff;
}

.notification-card {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(12, 25, 94, 0.55);
  border: 1px solid rgba(166, 184, 255, 0.2);
}

.notification-card.unread {
  border-color: rgba(13, 226, 143, 0.55);
  background: rgba(9, 30, 108, 0.65);
}

.notification-main {
  min-width: 0;
}

.notification-text {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #f4f8ff;
}

.notification-date {
  display: inline-block;
  margin-top: 4px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.65);
}

.notification-read-btn {
  border: 1px solid rgba(13, 226, 143, 0.45);
  background: rgba(13, 226, 143, 0.16);
  color: #d9ffe9;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.cert-list {
  display: grid;
  gap: 8px;
}

.cert-item {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;
  background: rgba(12, 25, 94, 0.65);
  border-radius: 14px;
  padding: 10px;
}

.cert-title {
  font-weight: 700;
  font-size: 13px;
}

.cert-percent {
  background: rgba(140, 157, 255, 0.5);
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 800;
  color: #081e6f;
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

@media (max-width: 480px) {
  .content-area {
    padding: 10px;
  }

  .top-panel {
    padding-top: 4px;
  }

  .buttons-column {
    top: 0;
    left: 0;
    gap: 6px;
  }

  .settings-btn,
  .exit-btn {
    width: 42px;
    height: 42px;
  }

  .avatar-image,
  .avatar-default {
    width: 72px;
    height: 72px;
  }

  .username {
    font-size: 14px;
  }

  .add-friend {
    flex-direction: column;
  }

  .request-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
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

  .section-block h2 {
    font-size: 21px;
  }
}

/* Settings Button */
.settings-btn {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: rgba(100, 150, 255, 0.25);
  border: 2px solid rgba(157, 243, 182, 0.3);
  color: #9df3b6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 24px;
}

.settings-btn:hover {
  background: rgba(100, 150, 255, 0.4);
  border-color: rgba(157, 243, 182, 0.6);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(157, 243, 182, 0.3);
}

.settings-btn svg {
  width: 24px;
  height: 24px;
}

/* Settings Modal */
.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 16px;
  animation: fadeIn 0.3s ease;
}

.settings-card {
  width: 100%;
  max-width: 500px;
  background: linear-gradient(135deg, #2c1f60 0%, #3d2e8f 100%);
  border: 1px solid rgba(157, 243, 182, 0.28);
  border-radius: 18px;
  padding: 24px;
  color: #fff;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.settings-card h3 {
  margin: 0 0 20px;
  font-size: 22px;
  color: #9df3b6;
}

.settings-card h4 {
  margin: 16px 0 12px;
  font-size: 16px;
  color: #9df3b6;
  border-bottom: 1px solid rgba(157, 243, 182, 0.2);
  padding-bottom: 8px;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: #fff;
  font-size: 28px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  color: #9df3b6;
  transform: scale(1.2);
}

/* Alert Messages */
.alert {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 13px;
  animation: slideDown 0.3s ease;
}

.alert-error {
  background: rgba(241, 90, 98, 0.2);
  border: 1px solid rgba(241, 90, 98, 0.5);
  color: #ff6b7a;
}

.alert-success {
  background: rgba(13, 226, 143, 0.2);
  border: 1px solid rgba(13, 226, 143, 0.5);
  color: #0de28f;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Settings Section */
.settings-section {
  margin-bottom: 24px;
}

.settings-field {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(157, 243, 182, 0.15);
}

.field-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 40px;
}

.field-label {
  font-weight: 600;
  color: #9df3b6;
  min-width: 100px;
}

.field-value {
  flex: 1;
  color: rgba(255, 255, 255, 0.8);
  word-break: break-word;
}

.edit-btn {
  background: none;
  border: none;
  color: #9df3b6;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.edit-btn:hover {
  transform: scale(1.2);
  color: #fff;
}

.field-edit {
  display: grid;
  gap: 10px;
}

.field-edit input,
.field-edit label {
  display: block;
}

.field-edit label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.field-edit input[type="checkbox"] {
  margin-right: 6px;
  cursor: pointer;
}

.edit-input {
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(157, 243, 182, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 14px;
  transition: all 0.2s ease;
  font-family: inherit;
}

.edit-input:focus {
  outline: none;
  border-color: rgba(157, 243, 182, 0.8);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 8px rgba(157, 243, 182, 0.2);
}

.edit-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.edit-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
}

.btn-save,
.btn-cancel {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save {
  background: linear-gradient(135deg, #0de28f 0%, #15b870 100%);
  color: #062b1a;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 226, 143, 0.3);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Password Change Section */
.password-fields {
  display: grid;
  gap: 12px;
}

.password-field {
  display: grid;
  gap: 6px;
}

.password-field label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.password-hint {
  background: rgba(255, 255, 100, 0.1);
  border-left: 3px solid rgba(255, 255, 100, 0.5);
  padding: 10px;
  border-radius: 6px;
  font-size: 12px;
  color: rgba(255, 255, 150, 0.9);
  margin-top: 8px;
}

.btn-change-password {
  padding: 12px;
  background: linear-gradient(135deg, #1f3cff 0%, #3d7aff 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.btn-change-password:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(31, 60, 255, 0.4);
}

.btn-change-password:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Settings Footer */
.settings-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(157, 243, 182, 0.15);
  display: flex;
  justify-content: flex-end;
}

.btn-close-settings {
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border: 1px solid rgba(157, 243, 182, 0.3);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close-settings:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(157, 243, 182, 0.6);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
