<template>
  <div class="comunidad-container">
    <div class="content-area">
      <div v-if="showCodingChallenge" class="challenge-workspace">
        <div class="workspace-header">
          <button class="workspace-back" @click="closeCodingChallenge">← {{ t('back') }}</button>
          <h2>{{ showChallengeResult ? t('challengeResult') : challengeWorkspaceTitle }}</h2>
        </div>

        <div v-if="showChallengeResult" class="challenge-result-screen">
          <template v-if="challengePendingOpponent">
            <div class="result-badge">{{ t('waiting') }}</div>
            <h3 class="result-title">{{ t('waitingFriend') }}</h3>
            <p class="result-subtitle">{{ t('progress') }}: {{ challengeSubmissionProgressLabel }}</p>
            <p class="result-subtitle">{{ challengePendingMessage || 'Tu resultado ya está enviado. Falta que tu amigo termine.' }}</p>
            <div class="result-actions">
              <button class="result-back-btn" @click="goBackToChallenges">{{ t('back') }}</button>
            </div>
          </template>

          <template v-else-if="challengeResult">
          <div class="result-badge" :class="{ win: challengeResult.winnerIsUser, lose: !challengeResult.winnerIsUser }">
            {{ challengeResult.winnerIsUser ? t('victory') : t('defeat') }}
          </div>

          <h3 class="result-title">{{ challengeResult.winnerName }} ganó el desafío</h3>
          <p class="result-subtitle">{{ challengeResult.summary }}</p>

          <div class="result-scores">
            <div class="result-score-card">
              <span>Tu fidelidad</span>
              <strong>{{ challengeResult.userScore }}%</strong>
            </div>
            <div class="result-score-card">
              <span>{{ challengeResult.opponentName }}</span>
              <strong>{{ challengeResult.rivalScore }}%</strong>
            </div>
          </div>

          <div class="result-actions">
            <button
              v-if="challengeResult.winnerIsUser"
              class="result-share-btn"
              :disabled="isSharingVictory"
              @click="shareVictory"
            >
              {{ isSharingVictory ? t('sharing') : t('shareVictory') }}
            </button>
            <button class="result-back-btn" @click="goBackToChallenges">{{ t('backChallenges') }}</button>
          </div>
          </template>

          <template v-else>
            <div class="result-badge">{{ t('processing') }}</div>
            <h3 class="result-title">{{ t('calculatingResult') }}</h3>
            <p class="result-subtitle">Estamos sincronizando el desafío entre ambos jugadores.</p>
            <div class="result-actions">
              <button class="result-back-btn" @click="goBackToChallenges">{{ t('back') }}</button>
            </div>
          </template>
        </div>

        <div v-else class="workspace-grid">
          <aside class="workspace-left">
            <img
              v-if="isHtmlCssChallenge"
              src="/images/Proyecto_html_css.png"
              alt="Ejercicio HTML/CSS"
              class="workspace-image"
            >
            <img
              v-else-if="isJavaChallenge"
              src="/images/proyecto%20java.png"
              alt="Ejercicio Java"
              class="workspace-image"
            >
            <div class="workspace-statement">
              <h3>{{ t('statement') }}</h3>
              <template v-if="isHtmlCssChallenge">
                <p>{{ t('htmlCssStatement') }}</p>
              </template>
              <template v-else-if="isJavaChallenge">
                <p>{{ t('javaStatement') }}</p>
              </template>
              <template v-else-if="isPythonChallenge">
                <p>{{ t('pythonStatement1') }}</p>
                <p>{{ t('pythonStatement2') }}</p>
                <p>{{ t('pythonStatement3') }}</p>
                <p>{{ t('pythonStatement4') }}</p>
                <p>{{ t('pythonStatement5') }}</p>
                <pre class="python-example-output">Turno 1:
Coche Rayo: 7
Coche Trueno: 5
Coche Veloz: 6

...

Ganador: Coche Rayo con 55 de distancia</pre>
              </template>
              <template v-else-if="isSqlChallenge">
                <p class="sql-statement-intro">{{ t('sqlStatementIntro') }}</p>
                <ul class="sql-statement-list">
                  <li>{{ t('sqlStatement1') }}</li>
                  <li>{{ t('sqlStatement2') }}</li>
                  <li>{{ t('sqlStatement3') }}</li>
                  <li>{{ t('sqlStatement4') }}</li>
                  <li>{{ t('sqlStatement5') }}</li>
                </ul>
              </template>
            </div>
          </aside>

          <section class="workspace-editor">
            <div class="vscode-topbar" :class="{ 'mysql-topbar': isSqlChallenge, 'java-topbar': isJavaChallenge, 'python-topbar': isPythonChallenge }">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
              <span class="vscode-title">{{ challengeEditorTitle }}</span>
            </div>

            <div class="editor-tabs" :class="{ 'mysql-tabs': isSqlChallenge, 'java-tabs': isJavaChallenge, 'python-tabs': isPythonChallenge }">
              <template v-if="isHtmlCssChallenge">
                <button class="editor-tab" :class="{ active: currentCodeTab === 'html' }" @click="currentCodeTab = 'html'">index.html</button>
                <button class="editor-tab" :class="{ active: currentCodeTab === 'css' }" @click="currentCodeTab = 'css'">styles.css</button>
              </template>
              <template v-else-if="isJavaChallenge">
                <button
                  v-for="file in javaChallengeFiles"
                  :key="file.key"
                  class="editor-tab"
                  :class="{ active: currentJavaFileKey === file.key }"
                  @click="currentJavaFileKey = file.key"
                >
                  {{ file.label }}
                </button>
              </template>
              <template v-else-if="isSqlChallenge">
                <span class="mysql-tab-label">script.sql</span>
              </template>
              <template v-else-if="isPythonChallenge">
                <span class="python-tab-label">main.py</span>
              </template>
              <button class="run-code-btn" @click="runChallengeCode">{{ t('run') }}</button>
              <button class="finish-code-btn" @click="finishChallenge">{{ t('finish') }}</button>
            </div>

            <textarea
              v-if="isHtmlCssChallenge && currentCodeTab === 'html'"
              v-model="challengeCodeHtml"
              class="code-editor"
              spellcheck="false"
            ></textarea>
            <textarea
              v-else-if="isHtmlCssChallenge"
              v-model="challengeCodeCss"
              class="code-editor"
              spellcheck="false"
            ></textarea>
            <textarea
              v-else-if="isSqlChallenge"
              v-model="challengeCodeSql"
              class="code-editor mysql-editor"
              spellcheck="false"
              :placeholder="t('sqlPlaceholder')"
            ></textarea>
            <textarea
              v-else-if="isPythonChallenge"
              v-model="challengeCodePython"
              class="code-editor python-editor"
              spellcheck="false"
              :placeholder="t('pythonPlaceholder')"
            ></textarea>
            <textarea
              v-else-if="isJavaChallenge"
              :value="currentJavaFileContent"
              class="code-editor java-editor"
              spellcheck="false"
              @input="updateCurrentJavaFileContent($event.target.value)"
              :placeholder="t('javaPlaceholder')"
            ></textarea>

            <div class="preview-panel" :class="{ 'mysql-panel': isSqlChallenge, 'java-panel': isJavaChallenge, 'python-panel': isPythonChallenge }">
              <div class="preview-title">{{ challengeOutputTitle }}</div>
              <iframe
                v-if="isHtmlCssChallenge"
                class="preview-frame"
                :srcdoc="challengePreviewDoc"
                title="Preview HTML/CSS"
              ></iframe>
              <pre v-else-if="isSqlChallenge" class="mysql-output">{{ challengeSqlOutput }}</pre>
              <pre v-else-if="isPythonChallenge" class="python-output">{{ challengePythonOutput }}</pre>
              <pre v-else-if="isJavaChallenge" class="java-output">{{ challengeJavaOutput }}</pre>
            </div>
          </section>
        </div>
      </div>

      <template v-else>
      <!-- Tabs de Práctica/Comunidad -->
      <div class="scope-tabs">
        <button 
          class="scope-tab" 
          :class="{ active: activeTab === 'practica' }" 
          @click="activeTab = 'practica'">
          {{ t('practice') }}
        </button>
        <button 
          class="scope-tab" 
          :class="{ active: activeTab === 'comunidad' }" 
          @click="activeTab = 'comunidad'">
          {{ t('community') }}
        </button>
      </div>

      <!-- PESTAÑA PRÁCTICA -->
      <div v-if="activeTab === 'practica'" class="tab-content">
        <!-- Desafíos de Código -->
        <section v-if="!isAdminMode" class="practica-section">
          <div class="challenge-block">
            <h2>{{ t('challengeTitle') }}</h2>
            <p class="section-desc">{{ t('challengeDesc') }}</p>

            <div class="challenge-arena">
              <div class="vs-stage" aria-label="Vista previa del versus">
                <div class="language-picker">
                  <button class="language-picker-btn" @click="toggleLanguageMenu">
                    {{ selectedChallengeLanguage || t('chooseLanguage') }}
                  </button>
                  <div v-if="showLanguageMenu" class="language-picker-menu">
                    <button
                      v-for="lang in challengeLanguages"
                      :key="lang"
                      class="language-option"
                      @click="selectChallengeLanguage(lang)"
                    >
                      {{ lang }}
                    </button>
                  </div>
                </div>

                <div class="vs-piece">
                  <div class="vs-circle vs-circle-user">
                    <img
                      v-if="currentUserAvatar"
                      :src="currentUserAvatar"
                      :alt="currentUsername"
                      class="vs-circle-photo"
                    >
                    <span v-else>{{ (currentUsername || 'U')[0]?.toUpperCase() || 'U' }}</span>
                  </div>
                  <div class="vs-circle vs-circle-opponent" :class="{ searching: isSearchingOpponent }">
                    <img
                      v-if="displayedOpponent && displayedOpponent.avatarUrl"
                      :src="displayedOpponent.avatarUrl"
                      :alt="displayedOpponent.fullName"
                      class="vs-circle-photo"
                    >
                    <span v-else>{{ displayedOpponent ? getOpponentInitial(displayedOpponent.fullName) : '?' }}</span>
                  </div>
                </div>

                <div class="vs-burst">VS</div>

                <button class="vs-start-btn" :disabled="!canStartChallenge" @click="startChallenge">
                  {{ isSearchingOpponent ? t('searchingOpponent') : t('start') }}
                </button>
              </div>

              <p v-if="challengeStatusMessage" class="challenge-status-live">{{ challengeStatusMessage }}</p>
            </div>
          </div>
        </section>

        <!-- Repositorio -->
        <section class="practica-section">
          <div class="community-block">
            <div class="repo-header">
              <h2>{{ t('byCommunity') }}</h2>
              <button class="btn-upload" @click="showUploadModal = true">{{ t('upload') }}</button>
            </div>
            <p class="section-desc">{{ t('shareAndDownload') }}</p>

            <div class="repo-categories-circles">
              <button
                v-for="cat in categoryCards"
                :key="cat.name"
                class="category-circle-item"
                :class="{ active: selectedCategory === cat.name }"
                @click="selectedCategory = cat.name"
              >
                <span class="category-circle-icon">
                  <img :src="cat.icon" :alt="cat.name" class="category-circle-image">
                </span>
                <span class="category-circle-name">{{ cat.name }}</span>
              </button>
            </div>

            <div class="repo-grid">
              <div v-for="item in filteredRepoItems" :key="item.id" class="repo-item">
                <div class="repo-info">
                  <h4>{{ item.title }}</h4>
                  <p class="repo-desc">{{ item.description }}</p>
                  <div class="repo-meta">
                    <span class="repo-author">{{ t('by') }} {{ item.author }}</span>
                    <span class="repo-date">{{ formatDate(item.createdAt) }}</span>
                  </div>
                </div>
                <div class="repo-actions">
                  <a :href="item.link" target="_blank" rel="noopener noreferrer" class="repo-link">{{ t('viewCode') }} →</a>
                  <button
                    v-if="isAdminMode"
                    class="repo-delete"
                    @click="removeRepoItem(item.id)"
                  >
                    {{ t('delete') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- PESTAÑA COMUNIDAD -->
      <div v-if="activeTab === 'comunidad'" class="tab-content">
        <section v-if="isAdminMode" class="admin-mode-banner">
          <p>{{ t('adminMode') }}</p>
          <button class="admin-logout-btn" @click="$emit('logout')">{{ t('logout') }}</button>
        </section>

        <div class="community-scope-tabs">
          <button class="community-scope-tab" :class="{ active: communityViewScope === 'all' }" @click="communityViewScope = 'all'">{{ t('all') }}</button>
          <button v-if="!isAdminMode" class="community-scope-tab" :class="{ active: communityViewScope === 'for_you' }" @click="communityViewScope = 'for_you'">{{ t('forYou') }}</button>
          <button v-if="!isAdminMode" class="community-scope-tab" :class="{ active: communityViewScope === 'saved' }" @click="communityViewScope = 'saved'">{{ t('saved') }}</button>
          <button v-if="!isAdminMode" class="community-scope-tab" :class="{ active: communityViewScope === 'mine' }" @click="communityViewScope = 'mine'">{{ t('myPosts') }}</button>
        </div>

        <section v-if="!isAdminMode" class="comunidad-feed">
          <div class="post-composer">
            <img 
              v-if="currentUserAvatar" 
              :src="currentUserAvatar" 
              :alt="currentUsername"
              class="composer-avatar">
            <div v-else class="composer-avatar composer-avatar-default">👤</div>
            <textarea 
              v-model="newPost"
              :placeholder="t('whatLearning')"
              class="composer-input"></textarea>
          </div>
          <div class="composer-actions">
            <button class="btn-project" @click="showProjectPostModal = true">{{ t('uploadProject') }}</button>
            <button v-if="newPost.trim()" class="btn-publish" @click="publishPost">{{ t('publish') }}</button>
          </div>
        </section>

        <div class="feed-container">
          <div v-if="displayedCommunityPosts.length === 0" class="empty-state">
            <p>{{ t('noPosts') }}</p>
            <p class="empty-hint">{{ t('beFirst') }}</p>
          </div>
          <div v-else class="feed">
            <article v-for="post in displayedCommunityPosts" :key="post.id" class="community-post">
              <div class="post-header">
                <img 
                  v-if="post.avatar" 
                  :src="post.avatar" 
                  :alt="post.username"
                  class="post-avatar"
                  @click="openPostUserProfile(post)">
                <div v-else class="post-avatar post-avatar-default" @click="openPostUserProfile(post)">👤</div>
                <div class="post-user-info" @click="openPostUserProfile(post)">
                  <h4>{{ post.fullName || post.username }}</h4>
                  <p v-if="post.bio" class="post-user-bio">{{ post.bio }}</p>
                  <p class="post-meta">{{ post.type }} · {{ formatDate(post.createdAt) }}</p>
                </div>
              </div>

              <div class="post-content">
                <p class="post-text">{{ getPostDisplayText(post) }}</p>
                <button
                  v-if="isLongPostText(post.text)"
                  class="post-expand-btn"
                  @click="togglePostExpand(post.id)"
                >
                  {{ isPostExpanded(post.id) ? t('viewLess') : t('viewMore') }}
                </button>
                <div v-if="post.project && (post.project.title || post.project.url)" class="post-project-card">
                  <p class="post-project-category">{{ post.project.category || t('projects') }}</p>
                  <h5 class="post-project-title">{{ post.project.title }}</h5>
                  <p v-if="post.project.description" class="post-project-description">{{ post.project.description }}</p>
                  <a
                    class="post-project-link"
                    :href="post.project.url"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ t('viewRepo') }}
                  </a>
                </div>
              </div>

              <div class="post-actions">
                <button class="action-btn like-btn" :class="{ active: post.likedByMe }" @click="toggleLike(post)">
                  <img
                    class="action-icon"
                    :src="post.likedByMe ? '/images/corazon.png' : '/images/me-gusta.png'"
                    alt="Like"
                  >
                  {{ post.likes }}
                </button>
                <button class="action-btn" :class="{ active: isCommentsOpen(post.id) }" @click="toggleComments(post)">
                  <img
                    class="action-icon"
                    src="/images/comentario.png"
                    alt="Comentarios"
                  >
                  {{ post.commentsCount }}
                </button>
                <button class="action-btn" :class="{ active: post.savedByMe }" @click="toggleSave(post)">
                  <img
                    class="action-icon"
                    :src="post.savedByMe ? '/images/guardar-instagram%20%281%29.png' : '/images/guardar-instagram.png'"
                    alt="Guardar"
                  >
                  {{ t('save') }}{{ post.savedCount ? ` (${post.savedCount})` : '' }}
                </button>
                <button class="action-btn" :class="{ active: isPostShared(post.id) }" @click="sharePost(post)">
                  <img
                    class="action-icon"
                    :src="isPostShared(post.id) ? '/images/compartir%20%281%29.png' : '/images/compartir.png'"
                    alt="Compartir"
                  >
                  {{ t('share') }}{{ post.shareCount ? ` (${post.shareCount})` : '' }}
                </button>
                <button
                  v-if="isAdminMode"
                  class="action-btn action-btn-danger"
                  :disabled="isPostUnderModeration(post.id)"
                  @click="deletePostAsAdmin(post)"
                >
                  {{ t('deletePost') }}
                </button>
                <button
                  v-if="isAdminMode && !post.isAuthorAdmin"
                  class="action-btn action-btn-warning"
                  :disabled="isPostUnderModeration(post.id)"
                  @click="banPostAuthor(post)"
                >
                  {{ t('banUser') }}
                </button>
              </div>

              <p v-if="isAdminMode && moderationFeedback[post.id]" class="admin-feedback">{{ moderationFeedback[post.id] }}</p>

              <div v-if="isCommentsOpen(post.id)" class="comments-panel">
                <p v-if="post.commentsCount === 0" class="comments-empty">{{ t('noComments') }}</p>
                <div v-else class="comments-list">
                  <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
                    <img
                      v-if="comment.avatar"
                      :src="comment.avatar"
                      :alt="comment.username"
                      class="comment-avatar"
                    >
                    <div v-else class="comment-avatar comment-avatar-default">👤</div>
                    <div class="comment-content">
                      <p class="comment-author">{{ comment.fullName || comment.username }}</p>
                      <p class="comment-text">{{ comment.text }}</p>
                    </div>
                  </div>
                </div>

                <div class="comment-composer">
                  <input
                    v-model="postCommentsDraft[post.id]"
                    type="text"
                    class="comment-input"
                    :placeholder="t('writeComment')"
                    @keyup.enter="submitComment(post)"
                  >
                  <button class="comment-send" @click="submitComment(post)">{{ t('send') }}</button>
                </div>
              </div>
            </article>
          </div>
        </div>

        <div v-if="showPostUserProfile && selectedPostUser" class="friend-profile-modal" @click="closePostUserProfile">
          <div class="friend-profile-card" @click.stop>
            <button class="modal-close-friend" @click="closePostUserProfile">&times;</button>

            <div class="friend-profile-header">
              <img
                v-if="selectedPostUser.avatarUrl"
                :src="selectedPostUser.avatarUrl"
                :alt="selectedPostUser.fullName || selectedPostUser.username"
                class="friend-profile-avatar"
              >
              <div v-else class="friend-profile-avatar friend-profile-avatar-default">👤</div>
            </div>

            <div class="friend-profile-content">
              <h3 class="friend-profile-name">{{ selectedPostUser.fullName || selectedPostUser.username }}</h3>
              <p class="friend-profile-username">@{{ selectedPostUser.username }}</p>
              <p v-if="selectedPostUser.bio" class="friend-profile-bio">{{ selectedPostUser.bio }}</p>

              <div v-if="selectedPostUser.league" class="friend-profile-league">
                <img :src="selectedPostUser.league.image" :alt="selectedPostUser.league.name" class="friend-profile-league-img">
                <span class="friend-profile-league-name">{{ selectedPostUser.league.name }}</span>
              </div>

              <div class="friend-profile-type">
                <span class="type-label">{{ t('points') }}:</span>
                <span class="type-value">{{ selectedPostUser.totalPoints || 0 }}</span>
              </div>

              <div class="friend-profile-stats">
                <button class="friend-profile-stat" type="button" @click="openPostUserSocialList('followers')">
                  <span class="friend-profile-stat-value">{{ selectedPostUserFollowersCount }}</span>
                  <span class="friend-profile-stat-label">{{ t('followers') }}</span>
                </button>
                <button class="friend-profile-stat" type="button" @click="openPostUserSocialList('following')">
                  <span class="friend-profile-stat-value">{{ selectedPostUserFollowingCount }}</span>
                  <span class="friend-profile-stat-label">{{ t('following') }}</span>
                </button>
              </div>

              <div class="friend-profile-divider"></div>

              <div v-if="selectedPostUserCertificates.length > 0" class="friend-profile-certs">
                <h4 class="certs-title">{{ t('certificates') }}</h4>
                <div class="friend-cert-list">
                  <div v-for="cert in selectedPostUserCertificates" :key="cert.title" class="friend-cert-item">
                    <span class="friend-cert-title">{{ cert.title }}</span>
                    <span class="friend-cert-percent">{{ cert.percentage }}%</span>
                  </div>
                </div>
              </div>

              <div v-if="!isCurrentPostUser" class="friend-actions-row">
                <button
                  class="send-friend-request-btn"
                  :disabled="isSendingPostFriendRequest || isPendingPostFriendRequest(selectedPostUser.username)"
                  @click="sendFriendRequestFromPostUser"
                >
                  {{ isSendingPostFriendRequest ? t('sending') : (isPendingPostFriendRequest(selectedPostUser.username) ? t('pendingRequest') : t('sendFriendRequest')) }}
                </button>

                <button
                  class="send-friend-request-btn"
                  :class="{ active: selectedPostUser.isFollowing }"
                  :disabled="isTogglingFollow"
                  @click="toggleFollowSelectedUser"
                >
                  {{ isTogglingFollow ? t('sending') : (selectedPostUser.isFollowing ? t('following') : t('follow')) }}
                </button>
              </div>

              <button
                class="send-friend-request-btn projects-btn"
                :disabled="isLoadingPostUserProjects"
                @click="openPostUserProjects"
              >
                {{ isLoadingPostUserProjects ? t('loadingProjects') : t('viewProjects') }}
              </button>

              <p v-if="postFriendRequestFeedback" class="friend-request-feedback">{{ postFriendRequestFeedback }}</p>
            </div>
          </div>
        </div>

        <div v-if="showPostUserProjectsModal && selectedPostUser" class="projects-modal" @click="closePostUserProjects">
          <div class="projects-card" @click.stop>
            <button class="modal-close-friend" @click="closePostUserProjects">&times;</button>
            <h3 class="projects-title">{{ t('projectsFromUser') }} @{{ selectedPostUser.username }}</h3>

            <p v-if="selectedPostUserProjects.length === 0" class="projects-empty">{{ t('noProjectsYet') }}</p>

            <div v-else class="projects-list">
              <article v-for="post in selectedPostUserProjects" :key="post.id" class="project-post-item">
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

        <div v-if="showPostUserSocialListModal" class="projects-modal" @click="closePostUserSocialList">
          <div class="projects-card" @click.stop>
            <button class="modal-close-friend" @click="closePostUserSocialList">&times;</button>
            <h3 class="projects-title">{{ postUserSocialListTitle }}</h3>

            <p v-if="postUserSocialListItems.length === 0" class="projects-empty">{{ t('noUsersInList') }}</p>

            <div v-else class="social-list-grid">
              <article
                v-for="person in postUserSocialListItems"
                :key="person.userId"
                class="social-list-item"
                @click="openPostUserProfile(person)"
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
    </div>

    <!-- Modal de carga de archivos -->
    <transition name="modal">
      <div v-if="showUploadModal" class="modal-overlay" @click="showUploadModal = false">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="showUploadModal = false">✕</button>
          <h2>{{ t('uploadToCommunity') }}</h2>
          
          <div class="upload-form">
            <div class="form-group">
              <label>{{ t('contentType') }}</label>
              <select v-model="uploadForm.category" class="form-select">
                <option value="Proyectos">{{ t('projects') }}</option>
                <option value="Algoritmos">{{ t('algorithms') }}</option>
                <option value="Estructuras">{{ t('structures') }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>{{ t('title') }}</label>
              <input v-model="uploadForm.title" type="text" class="form-input" :placeholder="t('uploadTitlePlaceholder')">
            </div>

            <div class="form-group">
              <label>{{ t('description') }}</label>
              <textarea v-model="uploadForm.description" class="form-textarea" :placeholder="t('uploadDescriptionPlaceholder')"></textarea>
            </div>

            <div class="form-group">
              <label>{{ t('repositoryLink') }}</label>
              <input v-model="uploadForm.link" type="url" class="form-input" placeholder="https://github.com/...">
            </div>

            <button class="btn-upload-submit" @click="uploadContent">{{ t('uploadContent') }}</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal">
      <div v-if="showProjectPostModal" class="modal-overlay" @click="closeProjectPostModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closeProjectPostModal">✕</button>
          <h2>{{ t('publishProjectTitle') }}</h2>

          <div class="upload-form">
            <div class="form-group">
              <label>{{ t('category') }}</label>
              <select v-model="projectPostForm.category" class="form-select">
                <option value="Proyectos">{{ t('projects') }}</option>
                <option value="Algoritmos">{{ t('algorithms') }}</option>
                <option value="Estructuras">{{ t('structures') }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>{{ t('projectTitleLabel') }}</label>
              <input v-model="projectPostForm.title" type="text" class="form-input" :placeholder="t('projectTitlePlaceholder')">
            </div>

            <div class="form-group">
              <label>{{ t('description') }}</label>
              <textarea v-model="projectPostForm.description" class="form-textarea" :placeholder="t('projectDescriptionPlaceholder')"></textarea>
            </div>

            <div class="form-group">
              <label>{{ t('repositoryLinkOnly') }}</label>
              <input v-model="projectPostForm.url" type="url" class="form-input" placeholder="https://github.com/...">
            </div>

            <button class="btn-upload-submit" @click="publishProjectPost">{{ t('publishProjectButton') }}</button>
          </div>
        </div>
      </div>
    </transition>

    <nav v-if="!isAdminMode" class="bottom-nav">
      <button class="nav-item" :class="{ active: activeSection === 'inicio' }" @click="$emit('change-section', 'inicio')" :title="t('navHome')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
      </button>
      <button class="nav-item" :class="{ active: activeSection === 'comunidad' }" @click="$emit('change-section', 'comunidad')" :title="t('navCommunity')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
        <span v-if="notificationsUnreadCount > 0" class="menu-alert-badge">{{ notificationsUnreadCount > 9 ? '9+' : notificationsUnreadCount }}</span>
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
      <button class="nav-item" :class="{ active: activeSection === 'perfil', 'has-alert': pendingRequestsCount > 0 }" @click="$emit('change-section', 'perfil')" :title="t('navProfile')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        <span v-if="pendingRequestsCount > 0" class="menu-alert-badge">{{ pendingRequestsCount > 9 ? '9+' : pendingRequestsCount }}</span>
      </button>
    </nav>
  </div>
</template>

<script>
import { API_BASE_URL } from '../config/api'
import { io } from 'socket.io-client';

export default {
  name: 'Comunidad',
  props: {
    activeSection: {
      type: String,
      default: 'comunidad'
    },
    user: {
      type: Object,
      default: null
    },
    battleLaunchRequest: {
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
      uiLanguage: 'es',
      activeTab: 'practica',
      selectedChallengeLanguage: '',
      challengeLanguages: ['Python', 'Java', 'SQL', 'HTML/CSS'],
      challengeOpponentsFallback: [
        { id: 'laura', fullName: 'Laura Front' },
        { id: 'mario', fullName: 'Mario Back' },
        { id: 'nora', fullName: 'Nora Data' },
        { id: 'santi', fullName: 'Santi Dev' }
      ],
      challengeOpponents: [],
      showLanguageMenu: false,
      isSearchingOpponent: false,
      searchingOpponent: null,
      selectedOpponent: null,
      challengeStatusMessage: '',
      searchIntervalId: null,
      searchTimeoutId: null,
      showCodingChallenge: false,
      showChallengeResult: false,
      challengeResult: null,
      currentBattleMatchId: '',
      battleSyncData: null,
      challengeSubmissionAttempted: false,
      battleStatusPollingTimer: null,
      isSharingVictory: false,
      challengeWorkspaceMode: 'htmlcss',
      currentCodeTab: 'html',
      challengeCodeHtml: '<!DOCTYPE html>\n<html lang="es">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Desafio</title>\n</head>\n<body>\n\n</body>\n</html>',
      challengeCodeCss: '',
      challengePreviewDoc: '<!DOCTYPE html><html><head><style></style></head><body></body></html>',
      challengeCodeSql: '',
      challengeSqlOutput: 'mysql> -- Ejecuta tu script SQL para ver resultados\nQuery OK, 0 rows affected (0.00 sec)',
      challengeCodePython: '',
      challengePythonOutput: 'python main.py\n\nEscribe tu solucion del reto y pulsa Ejecutar.',
      javaChallengeFiles: [
        { key: 'main', label: 'Main.java' },
        { key: 'objeto', label: 'Objeto.java' },
        { key: 'personaje', label: 'Personaje.java' }
      ],
      currentJavaFileKey: 'main',
      challengeCodeJavaFiles: {
        main: '',
        objeto: '',
        personaje: ''
      },
      challengeJavaOutput: 'javac Main.java Objeto.java Personaje.java\n\nEscribe codigo en Main.java y pulsa Ejecutar.',
      selectedCategory: 'Proyectos',
      categories: ['Estructuras', 'Proyectos', 'Git', 'Algoritmos'],
      categoryCards: [
        { name: 'Estructuras', icon: '/images/Estructuras.png' },
        { name: 'Proyectos', icon: '/images/Proyectos.png' },
        { name: 'Git', icon: '/images/git.png' },
        { name: 'Algoritmos', icon: '/images/Algoritmos.png' }
      ],
      showUploadModal: false,
      showProjectPostModal: false,
      communityViewScope: 'all',
      showNotificationsPanel: false,
      savedPosts: [],
      forYouPosts: [],
      notifications: [],
      notificationsUnreadCount: 0,
      followingUsers: [],
      followingUserIds: new Set(),
      isTogglingFollow: false,
      newPost: '',
      currentUsername: 'usuario',
      currentUserAvatar: '',
      uploadForm: {
        category: 'Proyectos',
        title: '',
        description: '',
        link: ''
      },
      projectPostForm: {
        category: 'Proyectos',
        title: '',
        description: '',
        url: ''
      },
      communityPosts: [],
      sharedPostIds: [],
      expandedPostIds: [],
      showPostUserProfile: false,
      selectedPostUser: null,
      selectedPostUserCertificates: [],
      selectedPostUserFollowersCount: 0,
      selectedPostUserFollowingCount: 0,
      selectedPostUserFollowers: [],
      selectedPostUserFollowing: [],
      showPostUserProjectsModal: false,
      selectedPostUserProjects: [],
      isLoadingPostUserProjects: false,
      showPostUserSocialListModal: false,
      postUserSocialListTitle: '',
      postUserSocialListItems: [],
      isSendingPostFriendRequest: false,
      postFriendRequestFeedback: '',
      pendingPostFriendRequests: new Set(),
      friendUsernames: new Set(),
      postCommentsDraft: {},
      openCommentsPostIds: [],
      repoItems: [],
      isLoadingPosts: false,
      isSubmittingPost: false,
      moderationBusyPostIds: [],
      moderationFeedback: {}
    }
  },
  computed: {
    isAdminMode() {
      return Boolean(this.user?.isAdmin || this.user?.role === 'admin')
    },
    displayedOpponent() {
      return this.isSearchingOpponent ? this.searchingOpponent : this.selectedOpponent
    },
    isSqlChallenge() {
      return this.challengeWorkspaceMode === 'sql'
    },
    isHtmlCssChallenge() {
      return this.challengeWorkspaceMode === 'htmlcss'
    },
    isPythonChallenge() {
      return this.challengeWorkspaceMode === 'python'
    },
    isJavaChallenge() {
      return this.challengeWorkspaceMode === 'java'
    },
    challengeWorkspaceTitle() {
      if (this.isSqlChallenge) return 'Desafío SQL'
      if (this.isPythonChallenge) return 'Desafío Python'
      if (this.isJavaChallenge) return 'Desafío Java'
      return 'Desafío HTML/CSS'
    },
    challengeEditorTitle() {
      if (this.isSqlChallenge) return 'MySQL Shell - Desafio SQL'
      if (this.isPythonChallenge) return 'Python Console - Desafio Python'
      if (this.isJavaChallenge) return 'IntelliJ IDEA - Desafio Java'
      return 'Visual Studio Code - Desafio'
    },
    challengeOutputTitle() {
      if (this.isSqlChallenge) return 'Salida MySQL'
      if (this.isPythonChallenge) return 'Consola Python'
      if (this.isJavaChallenge) return 'Consola Java'
      return 'Vista previa'
    },
    challengePendingOpponent() {
      return this.showChallengeResult && this.battleSyncData?.waiting === true
    },
    challengePendingMessage() {
      return this.battleSyncData?.message || ''
    },
    challengeSubmissionCount() {
      const mySubmitted = Boolean(this.battleSyncData?.mySubmitted)
      const opponentSubmitted = Boolean(this.battleSyncData?.opponentSubmitted)
      return Number(mySubmitted) + Number(opponentSubmitted)
    },
    challengeSubmissionProgressLabel() {
      const count = this.challengeSubmissionCount
      return `${count}/2`
    },
    currentJavaFileContent() {
      return this.challengeCodeJavaFiles[this.currentJavaFileKey] ?? ''
    },
    canStartChallenge() {
      return Boolean(this.selectedChallengeLanguage && !this.isSearchingOpponent && this.challengeOpponents.length > 0)
    },
    filteredRepoItems() {
      return this.repoItems.filter(item => item.category === this.selectedCategory)
    },
    displayedCommunityPosts() {
      if (this.communityViewScope === 'saved') {
        return this.savedPosts
      }

      if (this.communityViewScope === 'for_you') {
        return this.forYouPosts
      }

      if (this.communityViewScope === 'mine') {
        const currentUserId = String(this.getCurrentUserId() || '')
        return this.communityPosts.filter((post) => String(post.userId || '') === currentUserId)
      }

      return this.communityPosts
    },
    isCurrentPostUser() {
      const currentUserId = String(this.getCurrentUserId() || '')
      const selectedUserId = String(this.selectedPostUser?.userId || '')
      return currentUserId.length > 0 && currentUserId === selectedUserId
    }
  },
  watch: {
    user: {
      immediate: true,
      handler() {
        if (this.isAdminMode) {
          this.communityViewScope = 'all'
        }

        this.loadUserData()
        this.loadCommunityPosts()
        this.loadSavedPosts()
        this.loadForYouPosts()
        this.loadNotifications()
        this.loadFollowingUsers()
        this.loadFriendUsernames()
        this.loadChallengeOpponents()
      }
    },
    battleLaunchRequest: {
      immediate: true,
      handler(newRequest) {
        if (!newRequest?.nonce) return
        this.launchFriendlyBattle(newRequest)
      }
    }
  },
  mounted() {
    this.refreshUiLanguageFromStorage()
    this.loadRepositoryItems()
    window.addEventListener('storage', this.onStorageLanguageChanged)
  },
  beforeUnmount() {
    this.clearChallengeSearchTimers()
    this.clearBattleStatusPolling()
    window.removeEventListener('storage', this.onStorageLanguageChanged)
  },
  methods: {
    t(key) {
      const dict = {
        es: {
          back: 'Volver',
          challengeResult: 'Resultado del Desafio',
          waiting: 'En espera',
          waitingFriend: 'Waiting for your friend',
          progress: 'Progress',
          backChallenges: 'Back to challenges',
          victory: 'Victoria',
          defeat: 'Derrota',
          shareVictory: 'Share victory',
          sharing: 'Sharing...',
          processing: 'Processing',
          calculatingResult: 'Calculating result...',
          statement: 'Statement',
          run: 'Run',
          finish: 'Finish',
          practice: 'Practice',
          community: 'Community',
          challengeTitle: 'Desafio de Codigo',
          challengeDesc: 'Elige tu lenguaje de programacion y presiona iniciar para probar tu poder',
          chooseLanguage: 'Choose language',
          searchingOpponent: 'Searching opponent...',
          start: 'Iniciar',
          byCommunity: 'From the Community',
          upload: '+ Upload',
          shareAndDownload: 'Share and download projects, algorithms, git and data structures',
          by: 'by',
          viewCode: 'View code',
          delete: 'Delete',
          adminMode: 'Admin mode: you can moderate posts and ban users.',
          logout: 'Log out',
          all: 'All',
          forYou: 'For You',
          saved: 'Saved',
          myPosts: 'My posts',
          notifications: 'Notifications',
          noNotifications: 'You have no notifications yet.',
          whatLearning: 'Que estas aprendiendo hoy?',
          uploadProject: '+ Upload project',
          publish: 'Publish',
          noPosts: 'There are no community posts yet.',
          beFirst: 'Be the first to share your progress!',
          viewLess: 'Show less',
          viewMore: 'Show more...',
          projects: 'Projects',
          viewRepo: 'View repository',
          viewProjects: 'Projects',
          loadingProjects: 'Loading projects...',
          projectsFromUser: 'Posts from',
          noProjectsYet: 'This user has no posts yet.',
          viewProjectRepo: 'View repository',
          noUsersInList: 'No hay usuarios para mostrar.',
          save: 'Save',
          share: 'Share',
          deletePost: 'Delete post',
          banUser: 'Ban user',
          noComments: 'No comments yet.',
          writeComment: 'Write a comment...',
          send: 'Send',
          sending: 'Sending...',
          points: 'Points',
          follow: 'Follow',
          followers: 'Followers',
          following: 'Following',
          certificates: 'Certificates',
          unfollow: 'Unfollow',
          pendingRequest: 'Request pending',
          sendFriendRequest: 'Send friend request',
          uploadToCommunity: 'Upload to Community',
          contentType: 'Content type',
          algorithms: 'Algorithms',
          structures: 'Data Structures',
          title: 'Title',
          uploadTitlePlaceholder: 'Ex: JWT Login System',
          description: 'Description',
          uploadDescriptionPlaceholder: 'Describe your project...',
          repositoryLink: 'Repository link (GitHub, GitLab, etc.)',
          uploadContent: 'Upload content',
          publishProjectTitle: 'Publish Project',
          category: 'Category',
          projectTitleLabel: 'Project title',
          projectTitlePlaceholder: 'Ex: API de tareas con Node.js',
          projectDescriptionPlaceholder: 'What does the project include?',
          repositoryLinkOnly: 'Repository link',
          publishProjectButton: 'Publish project',
          navHome: 'Home',
          navCommunity: 'Community',
          navRanking: 'Ranking',
          navLessons: 'Lessons',
          navProfile: 'Profile',
          htmlCssStatement: 'Replica la pagina web solo usando html y css.'
          ,javaStatement: 'Replica este menu y hazlo funcional usando solo java.'
          ,pythonStatement1: 'Crea 3 a 5 coches con nombres distintos.'
          ,pythonStatement2: 'Simula 10 turnos de carrera.'
          ,pythonStatement3: 'En cada turno, cada coche avanza.'
          ,pythonStatement4: 'Muestra la distancia recorrida de cada coche en cada turno.'
          ,pythonStatement5: 'Al final, anuncia el ganador (el coche con mas distancia).'
          ,sqlStatementIntro: 'Nos piden organizar la base de datos de una app de citas (Tinder). Tenemos que poder manejar:'
          ,sqlStatement1: 'Usuarios: nombre, email, edad, genero (Masculino, Femenino u Otro), genero de preferencia (Masculino, Femenino, Otro o Todos), autodescripcion, ciudad y fecha de alta.'
          ,sqlStatement2: 'Intereses predefinidos que cada usuario pueda seleccionar.'
          ,sqlStatement3: 'Swipes (like/dislike) entre usuarios, guardando fecha y hora, sin permitir swipe a uno mismo.'
          ,sqlStatement4: 'Matches entre usuarios con fecha, sin permitir match consigo mismo.'
          ,sqlStatement5: 'Mensajes dentro de un match, guardando contenido, fecha/hora y autor del mensaje.'
          ,sqlPlaceholder: 'Escribe tu script SQL aqui'
          ,pythonPlaceholder: 'Escribe tu codigo Python aqui'
          ,javaPlaceholder: 'Escribe tu codigo Java aqui'
        },
        en: {
          back: 'Back',
          challengeResult: 'Challenge Result',
          waiting: 'Waiting',
          waitingFriend: 'Waiting for your friend',
          progress: 'Progress',
          backChallenges: 'Back to challenges',
          victory: 'Victory',
          defeat: 'Defeat',
          shareVictory: 'Share victory',
          sharing: 'Sharing...',
          processing: 'Processing',
          calculatingResult: 'Calculating result...',
          statement: 'Statement',
          run: 'Run',
          finish: 'Finish',
          practice: 'Practice',
          community: 'Community',
          challengeTitle: 'Coding Challenge',
          challengeDesc: 'Choose your programming language and press start to test your skills',
          chooseLanguage: 'Choose language',
          searchingOpponent: 'Searching opponent...',
          start: 'Start',
          byCommunity: 'From the Community',
          upload: '+ Upload',
          shareAndDownload: 'Share and download projects, algorithms, git and data structures',
          by: 'by',
          viewCode: 'View code',
          delete: 'Delete',
          adminMode: 'Admin mode: you can moderate posts and ban users.',
          logout: 'Log out',
          all: 'All',
          forYou: 'For You',
          saved: 'Saved',
          myPosts: 'My posts',
          notifications: 'Notifications',
          noNotifications: 'You have no notifications yet.',
          whatLearning: 'What are you learning today?',
          uploadProject: '+ Upload project',
          publish: 'Publish',
          noPosts: 'There are no community posts yet.',
          beFirst: 'Be the first to share your progress!',
          viewLess: 'Show less',
          viewMore: 'Show more...',
          projects: 'Projects',
          viewRepo: 'View repository',
          viewProjects: 'Projects',
          loadingProjects: 'Loading projects...',
          projectsFromUser: 'Posts from',
          noProjectsYet: 'This user has no posts yet.',
          viewProjectRepo: 'View repository',
          noUsersInList: 'No hay usuarios para mostrar.',
          save: 'Save',
          share: 'Share',
          deletePost: 'Delete post',
          banUser: 'Ban user',
          noComments: 'No comments yet.',
          writeComment: 'Write a comment...',
          send: 'Send',
          sending: 'Sending...',
          points: 'Points',
          follow: 'Follow',
          followers: 'Followers',
          following: 'Following',
          certificates: 'Certificates',
          unfollow: 'Unfollow',
          pendingRequest: 'Request pending',
          sendFriendRequest: 'Send friend request',
          uploadToCommunity: 'Upload to Community',
          contentType: 'Content type',
          algorithms: 'Algorithms',
          structures: 'Data Structures',
          title: 'Title',
          uploadTitlePlaceholder: 'Ex: JWT Login System',
          description: 'Description',
          uploadDescriptionPlaceholder: 'Describe your project...',
          repositoryLink: 'Repository link (GitHub, GitLab, etc.)',
          uploadContent: 'Upload content',
          publishProjectTitle: 'Publish Project',
          category: 'Category',
          projectTitleLabel: 'Project title',
          projectTitlePlaceholder: 'Ex: API de tareas con Node.js',
          projectDescriptionPlaceholder: 'What does the project include?',
          repositoryLinkOnly: 'Repository link',
          publishProjectButton: 'Publish project',
          navHome: 'Home',
          navCommunity: 'Community',
          navRanking: 'Ranking',
          navLessons: 'Lessons',
          navProfile: 'Profile',
          htmlCssStatement: 'Replica la pagina web solo usando html y css.'
          ,javaStatement: 'Replica este menu y hazlo funcional usando solo java.'
          ,pythonStatement1: 'Crea 3 a 5 coches con nombres distintos.'
          ,pythonStatement2: 'Simula 10 turnos de carrera.'
          ,pythonStatement3: 'En cada turno, cada coche avanza.'
          ,pythonStatement4: 'Muestra la distancia recorrida de cada coche en cada turno.'
          ,pythonStatement5: 'Al final, anuncia el ganador (el coche con mas distancia).'
          ,sqlStatementIntro: 'You need to design the database for a dating app. It must support:'
          ,sqlStatement1: 'Users: name, email, age, gender, preferred gender, bio, city and signup date.'
          ,sqlStatement2: 'Predefined interests that each user can select.'
          ,sqlStatement3: 'Swipes (like/dislike) between users with timestamp, without allowing self-swipes.'
          ,sqlStatement4: 'Matches between users with date, without allowing self-matches.'
          ,sqlStatement5: 'Messages inside a match, storing content, timestamp and author.'
          ,sqlPlaceholder: 'Write your SQL script here'
          ,pythonPlaceholder: 'Write your Python code here'
          ,javaPlaceholder: 'Write your Java code here'
        }
      }

      const pack = dict[this.uiLanguage] || dict.es
      return pack[key] || key
    },
    refreshUiLanguageFromStorage() {
      try {
        const language = localStorage.getItem('inicio-ui-language')
        this.uiLanguage = language === 'en' ? 'en' : 'es'
      } catch (error) {
        this.uiLanguage = 'es'
      }
    },
    onStorageLanguageChanged(event) {
      if (event?.key === 'inicio-ui-language') {
        this.refreshUiLanguageFromStorage()
        this.loadRepositoryItems()
      }
    },
    clearChallengeSearchTimers() {
      if (this.searchIntervalId) {
        clearInterval(this.searchIntervalId)
        this.searchIntervalId = null
      }

      if (this.searchTimeoutId) {
        clearTimeout(this.searchTimeoutId)
        this.searchTimeoutId = null
      }
    },
    clearBattleStatusPolling() {
      if (this.battleStatusPollingTimer) {
        clearInterval(this.battleStatusPollingTimer)
        this.battleStatusPollingTimer = null
      }
    },
    isFriendlyBattleActive() {
      return Boolean(this.currentBattleMatchId)
    },
    async syncBattleContextFromServer() {
      const userId = this.getCurrentUserId()
      if (!userId) return null

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/battles/active/${userId}`)
        const data = await response.json().catch(() => ({}))
        const battle = data?.battle
        if (!response.ok || !battle?.matchId) return null

        this.currentBattleMatchId = String(battle.matchId)

        if (battle?.opponent?.userId) {
          this.selectedOpponent = {
            id: String(battle.opponent.userId),
            fullName: battle.opponent.fullName || battle.opponent.username || 'Rival',
            avatarUrl: battle.opponent.avatarUrl || ''
          }
        }

        return battle
      } catch (error) {
        return null
      }
    },
    normalizeBattleSyncPayload(data, fallbackWaitingMessage = 'Esperando a que tu amigo termine su desafío...') {
      const source = data?.status && typeof data.status === 'object' ? data.status : data
      if (!source || typeof source !== 'object') return null

      const waiting = Boolean(source.waiting)
      const directResult = source.result && typeof source.result === 'object' ? source.result : null

      if (waiting) {
        return {
          waiting: true,
          mySubmitted: Boolean(source.mySubmitted),
          opponentSubmitted: Boolean(source.opponentSubmitted),
          message: source.message || fallbackWaitingMessage,
          result: null
        }
      }

      const legacyResult = directResult || (
        Object.prototype.hasOwnProperty.call(source, 'winnerIsUser')
          ? {
            winnerIsUser: Boolean(source.winnerIsUser),
            winnerName: source.winnerName || '',
            opponentName: source.opponentName || '',
            userScore: Number(source.userScore || 0),
            rivalScore: Number(source.rivalScore || 0),
            summary: source.summary || 'Desafío finalizado.'
          }
          : null
      )

      if (!legacyResult) return null

      return {
        waiting: false,
        mySubmitted: true,
        opponentSubmitted: true,
        message: '',
        result: legacyResult
      }
    },
    async pollBattleStatusUntilResolved() {
      if (!this.currentBattleMatchId) {
        const battle = await this.syncBattleContextFromServer()
        if (!battle?.matchId) {
          this.battleSyncData = {
            waiting: true,
            mySubmitted: true,
            opponentSubmitted: false,
            message: 'Sincronizando partida...'
          }
          return
        }
      }

      const userId = this.getCurrentUserId()
      if (!userId) return

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/battles/${this.currentBattleMatchId}/status/${userId}`)
        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          this.battleSyncData = {
            waiting: true,
            mySubmitted: true,
            opponentSubmitted: false,
            message: 'Esperando actualización del resultado...'
          }
          return
        }

        const normalized = this.normalizeBattleSyncPayload(data)
        if (!normalized) {
          this.battleSyncData = {
            waiting: true,
            mySubmitted: true,
            opponentSubmitted: false,
            message: 'Sincronizando resultado...'
          }
          return
        }

        this.battleSyncData = {
          waiting: normalized.waiting,
          mySubmitted: normalized.mySubmitted || true,
          opponentSubmitted: normalized.opponentSubmitted,
          message: normalized.message
        }

        if (normalized.waiting) return

        const result = normalized.result
        this.challengeResult = {
          winnerIsUser: Boolean(result.winnerIsUser),
          winnerName: result.winnerName || (this.currentUsername || 'Tú'),
          opponentName: result.opponentName || this.selectedOpponent?.fullName || 'Rival',
          userScore: Number(result.userScore || 0),
          rivalScore: Number(result.rivalScore || 0),
          summary: result.summary || 'Desafío finalizado.'
        }
        this.clearBattleStatusPolling()
      } catch (error) {
        this.battleSyncData = {
          waiting: true,
          mySubmitted: true,
          opponentSubmitted: false,
          message: 'Conexión inestable. Reintentando...'
        }
      }
    },
    async submitBattleScoreIfNeeded(score) {
      if (this.challengeSubmissionAttempted) return

      if (!this.currentBattleMatchId) {
        const battle = await this.syncBattleContextFromServer()
        if (!battle?.matchId) {
          this.battleSyncData = {
            waiting: true,
            mySubmitted: true,
            opponentSubmitted: false,
            message: 'No encontramos la partida activa. Reintentando...'
          }
          this.clearBattleStatusPolling()
          this.battleStatusPollingTimer = setInterval(() => {
            this.pollBattleStatusUntilResolved()
          }, 2500)
          return
        }
      }

      const userId = this.getCurrentUserId()
      if (!userId) return

      this.challengeSubmissionAttempted = true

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/battles/${this.currentBattleMatchId}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            score
          })
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          this.challengeSubmissionAttempted = false
          this.battleSyncData = {
            waiting: true,
            mySubmitted: true,
            opponentSubmitted: false,
            message: data?.message || 'No se pudo enviar el resultado. Reintentando...'
          }
          this.clearBattleStatusPolling()
          this.battleStatusPollingTimer = setInterval(() => {
            this.pollBattleStatusUntilResolved()
          }, 2500)
          return
        }

        const normalized = this.normalizeBattleSyncPayload(data)
        if (!normalized) {
          this.challengeSubmissionAttempted = false
          this.battleSyncData = {
            waiting: true,
            mySubmitted: true,
            opponentSubmitted: false,
            message: 'Resultado enviado. Esperando confirmación del servidor...'
          }
          this.clearBattleStatusPolling()
          this.battleStatusPollingTimer = setInterval(() => {
            this.pollBattleStatusUntilResolved()
          }, 2500)
          return
        }

        this.battleSyncData = {
          waiting: normalized.waiting,
          mySubmitted: normalized.mySubmitted || true,
          opponentSubmitted: normalized.opponentSubmitted,
          message: normalized.message
        }

        if (normalized.waiting) {
          this.challengeResult = null
          this.clearBattleStatusPolling()
          this.pollBattleStatusUntilResolved()
          this.battleStatusPollingTimer = setInterval(() => {
            this.pollBattleStatusUntilResolved()
          }, 2500)
          return
        }

        const result = normalized.result
        if (!result) {
          this.challengeSubmissionAttempted = false
          return
        }

        this.challengeResult = {
          winnerIsUser: Boolean(result.winnerIsUser),
          winnerName: result.winnerName || (this.currentUsername || 'Tú'),
          opponentName: result.opponentName || this.selectedOpponent?.fullName || 'Rival',
          userScore: Number(result.userScore || 0),
          rivalScore: Number(result.rivalScore || 0),
          summary: result.summary || 'Desafío finalizado.'
        }
      } catch (error) {
        this.challengeSubmissionAttempted = false
        this.battleSyncData = {
          waiting: true,
          mySubmitted: true,
          opponentSubmitted: false,
          message: 'Error de red. Reintentando sincronización...'
        }
        this.clearBattleStatusPolling()
        this.battleStatusPollingTimer = setInterval(() => {
          this.pollBattleStatusUntilResolved()
        }, 2500)
      }
    },
    toggleLanguageMenu() {
      this.showLanguageMenu = !this.showLanguageMenu
    },
    selectChallengeLanguage(language) {
      this.selectedChallengeLanguage = language
      this.showLanguageMenu = false
    },
    openChallengeByLanguage(language) {
      const normalizedLanguage = String(language || '').toLowerCase()
      if (normalizedLanguage.includes('html') || normalizedLanguage.includes('css')) {
        this.openHtmlCssChallenge()
        return
      }

      if (normalizedLanguage.includes('python')) {
        this.openPythonChallenge()
        return
      }

      if (normalizedLanguage.includes('java')) {
        this.openJavaChallenge()
        return
      }

      if (normalizedLanguage.includes('sql')) {
        this.openSqlChallenge()
      }
    },
    launchFriendlyBattle(request) {
      const opponent = request?.opponent
      const language = request?.language
      if (!opponent?.userId || !language) return

      this.clearChallengeSearchTimers()
      this.clearBattleStatusPolling()
      this.activeTab = 'practica'
      this.showChallengeResult = false
      this.challengeResult = null
      this.battleSyncData = null
      this.challengeSubmissionAttempted = false
      this.currentBattleMatchId = String(request?.matchId || '')
      this.isSearchingOpponent = false
      this.searchingOpponent = null
      this.selectedOpponent = {
        id: String(opponent.userId),
        fullName: opponent.fullName || opponent.username || 'Rival',
        avatarUrl: opponent.avatarUrl || ''
      }
      this.selectedChallengeLanguage = language
      this.challengeStatusMessage = `Reto amistoso con ${this.selectedOpponent.fullName}`

      const mySubmitted = Boolean(request?.mySubmitted)
      const opponentSubmitted = Boolean(request?.opponentSubmitted)
      if (mySubmitted) {
        this.showCodingChallenge = true
        this.showChallengeResult = true
        this.challengeResult = null
        this.battleSyncData = {
          waiting: !opponentSubmitted,
          mySubmitted: true,
          opponentSubmitted,
          message: opponentSubmitted
            ? 'Sincronizando resultado final...'
            : 'Ya terminaste. Esperando a que tu amigo termine su desafío...'
        }
        this.clearBattleStatusPolling()
        this.pollBattleStatusUntilResolved()
        this.battleStatusPollingTimer = setInterval(() => {
          this.pollBattleStatusUntilResolved()
        }, 2500)
        return
      }

      this.openChallengeByLanguage(language)
    },
    openHtmlCssChallenge() {
      this.showCodingChallenge = true
      this.showChallengeResult = false
      this.challengeResult = null
      this.challengeWorkspaceMode = 'htmlcss'
      this.currentCodeTab = 'html'
      this.runChallengeCode()
    },
    openSqlChallenge() {
      this.showCodingChallenge = true
      this.showChallengeResult = false
      this.challengeResult = null
      this.challengeWorkspaceMode = 'sql'
      this.runChallengeCode()
    },
    openPythonChallenge() {
      this.showCodingChallenge = true
      this.showChallengeResult = false
      this.challengeResult = null
      this.challengeWorkspaceMode = 'python'
      this.runChallengeCode()
    },
    openJavaChallenge() {
      this.showCodingChallenge = true
      this.showChallengeResult = false
      this.challengeResult = null
      this.challengeWorkspaceMode = 'java'
      this.currentJavaFileKey = 'main'
      this.runChallengeCode()
    },
    closeCodingChallenge() {
      this.goBackToChallenges()
    },
    runChallengeCode() {
      if (this.isJavaChallenge) {
        this.runJavaChallenge()
        return
      }

      if (this.isPythonChallenge) {
        this.runPythonChallenge()
        return
      }

      if (this.isSqlChallenge) {
        this.runSqlChallenge()
        return
      }

      const html = String(this.challengeCodeHtml || '')
      const css = String(this.challengeCodeCss || '')

      if (!html.trim()) {
        this.challengePreviewDoc = '<!DOCTYPE html><html><head><style></style></head><body></body></html>'
        return
      }

      if (html.includes('</head>')) {
        this.challengePreviewDoc = html.replace('</head>', `<style>${css}</style></head>`)
        return
      }

      this.challengePreviewDoc = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}</body></html>`
    },
    runPythonChallenge() {
      const pythonCode = String(this.challengeCodePython || '').trim()

      if (!pythonCode) {
        this.challengePythonOutput = [
          'python main.py',
          '',
          'No hay codigo para ejecutar.',
          'Escribe tu solucion del reto y pulsa Ejecutar.'
        ].join('\n')
        return
      }

      const lines = []
      lines.push('python main.py')
      lines.push('')

      const carNames = []
      const carRegex = /Coche\s*\(\s*["']([^"']+)["']/gi
      let carMatch = carRegex.exec(pythonCode)
      while (carMatch) {
        const name = String(carMatch[1] || '').trim()
        if (name) carNames.push(name)
        carMatch = carRegex.exec(pythonCode)
      }

      const uniqueCarNames = [...new Set(carNames)]
      const hasCars = uniqueCarNames.length >= 3 || (/(coche|carro|car)/i.test(pythonCode) && /\[|list\(/.test(pythonCode))

      const turnsMatch = pythonCode.match(/turnos\s*=\s*(\d{1,2})/i)
      const turnsFromVar = turnsMatch ? Number(turnsMatch[1]) : null
      const hasRangeLoop = /for\s+\w+\s+in\s+range\s*\(/i.test(pythonCode)
      const hasTurns = (Number.isFinite(turnsFromVar) && turnsFromVar >= 10) || hasRangeLoop || /while\s+/i.test(pythonCode)
      const hasWinner = /(max\(|ganador|winner)/i.test(pythonCode)

      if (hasCars && hasTurns) {
        const turns = Math.max(10, Number.isFinite(turnsFromVar) ? turnsFromVar : 10)
        const racers = uniqueCarNames.length > 0 ? uniqueCarNames.slice(0, 5) : ['Rayo', 'Trueno', 'Veloz']
        const distances = racers.map(() => 0)

        lines.push('Turno 1:')
        racers.forEach((name, idx) => {
          const advance = 5 + ((name.length + idx * 3 + 1) % 4)
          distances[idx] += advance
          lines.push(`Coche ${name}: ${distances[idx]}`)
        })
        lines.push('')
        lines.push('...')
        lines.push('')

        for (let turn = 2; turn <= turns; turn += 1) {
          racers.forEach((name, idx) => {
            const advance = 5 + ((turn + name.length + idx * 2) % 5)
            distances[idx] += advance
          })
        }

        const winnerIndex = distances.reduce((bestIdx, value, idx, arr) => (value > arr[bestIdx] ? idx : bestIdx), 0)
        const winnerText = `Ganador: Coche ${racers[winnerIndex]} con ${distances[winnerIndex]} de distancia`
        lines.push(hasWinner ? winnerText : `Aviso: calcula y muestra el ganador al final. Sugerencia: ${winnerText}`)
      } else {
        lines.push('Aviso: define coches y simula 10 turnos para completar el reto.')
      }

      this.challengePythonOutput = lines.join('\n')
    },
    updateCurrentJavaFileContent(value) {
      this.challengeCodeJavaFiles = {
        ...this.challengeCodeJavaFiles,
        [this.currentJavaFileKey]: value
      }
    },
    runJavaChallenge() {
      const mainCode = String(this.challengeCodeJavaFiles.main || '').trim()
      const objetoCode = String(this.challengeCodeJavaFiles.objeto || '').trim()
      const personajeCode = String(this.challengeCodeJavaFiles.personaje || '').trim()
      const allJavaCode = [mainCode, objetoCode, personajeCode].join('\n\n')

      if (!allJavaCode.trim()) {
        this.challengeJavaOutput = [
          'javac Main.java Objeto.java Personaje.java',
          '',
          'No hay codigo para compilar.',
          'Escribe tu codigo Java en cualquiera de los 3 ficheros y pulsa Ejecutar.'
        ].join('\n')
        return
      }

      const hasMainMethod = /public\s+static\s+void\s+main\s*\(/.test(allJavaCode)
      const classMatch = allJavaCode.match(/class\s+([A-Za-z_][A-Za-z0-9_]*)/)
      const runClassName = classMatch?.[1] || 'Main'

      const hasSwitch = /switch\s*\(/.test(allJavaCode)
      const hasLoop = /(while\s*\(|for\s*\()/.test(allJavaCode)
      const hasScanner = /scanner|nextLine\s*\(/i.test(allJavaCode)
      const menuFilesCreated = this.javaChallengeFiles.filter((file) => file.key !== 'main').filter((file) => String(this.challengeCodeJavaFiles[file.key] || '').trim().length > 0).length

      const lines = []
      lines.push('javac Main.java Objeto.java Personaje.java')
      lines.push('Compilation successful.')
      lines.push(`java ${runClassName}`)
      lines.push('')
      if (hasMainMethod) {
        lines.push('Programa ejecutado correctamente.')
      } else {
        lines.push('Aviso: no se detectó metodo main, por lo que el programa no pudo iniciarse.')
      }
      lines.push('')
      if (hasSwitch && hasLoop && hasScanner) {
        lines.push('Menu funcional detectado.')
      } else {
        lines.push('Aviso: completa switch, loop y lectura de entrada para un menu totalmente funcional.')
      }
      lines.push(`Ficheros auxiliares completados: ${menuFilesCreated}/2`)

      this.challengeJavaOutput = lines.join('\n')
    },
    runSqlChallenge() {
      const sql = String(this.challengeCodeSql || '').trim()

      if (!sql) {
        this.challengeSqlOutput = 'mysql> -- No hay consultas para ejecutar\nEmpty script (0.00 sec)'
        return
      }

      const normalizedSql = sql.replace(/\r\n/g, '\n')
      const semicolonCount = (normalizedSql.match(/;/g) || []).length
      const openParens = (normalizedSql.match(/\(/g) || []).length
      const closeParens = (normalizedSql.match(/\)/g) || []).length

      if (/\bcreat\s+table\b/i.test(normalizedSql) || /\bselct\b/i.test(normalizedSql) || /\binsret\b/i.test(normalizedSql)) {
        this.challengeSqlOutput = [
          'mysql> -- Ejecutando script SQL...',
          "ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near statement 1"
        ].join('\n')
        return
      }

      if (openParens !== closeParens) {
        this.challengeSqlOutput = [
          'mysql> -- Ejecutando script SQL...',
          "ERROR 1064 (42000): You have an error in your SQL syntax; unbalanced parentheses detected"
        ].join('\n')
        return
      }

      const endsWithSemicolon = /;\s*$/.test(normalizedSql)
      if (semicolonCount === 0 || !endsWithSemicolon) {
        this.challengeSqlOutput = [
          'mysql> -- Ejecutando script SQL...',
          "ERROR 1064 (42000): You have an error in your SQL syntax; check the ';' delimiter near the end of the script"
        ].join('\n')
        return
      }

      const statements = normalizedSql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(Boolean)

      const allowedStart = /^(create\s+table|alter\s+table|insert\s+into|select|update|delete\s+from|drop\s+table|truncate\s+table|set\s+|use\s+)/i
      const invalidStatement = statements.find(stmt => !allowedStart.test(stmt))
      if (invalidStatement) {
        const preview = invalidStatement.replace(/\s+/g, ' ').slice(0, 40)
        this.challengeSqlOutput = [
          'mysql> -- Ejecutando script SQL...',
          `ERROR 1064 (42000): You have an error in your SQL syntax near '${preview}'`
        ].join('\n')
        return
      }

      const outputLines = []
      outputLines.push('mysql> -- Ejecutando script SQL...')

      if (/create\s+table\s+usuarios/i.test(sql)) outputLines.push('Query OK, 0 rows affected (0.01 sec)')
      if (/create\s+table\s+intereses/i.test(sql)) outputLines.push('Query OK, 0 rows affected (0.01 sec)')
      if (/create\s+table\s+swipes/i.test(sql)) outputLines.push('Query OK, 0 rows affected (0.01 sec)')
      if (/create\s+table\s+matches/i.test(sql)) outputLines.push('Query OK, 0 rows affected (0.01 sec)')
      if (/create\s+table\s+mensajes/i.test(sql)) outputLines.push('Query OK, 0 rows affected (0.01 sec)')

      if (/check\s*\(\s*usuario1?_id\s*<>\s*usuario2?_id\s*\)/i.test(sql) || /check\s*\(\s*user_id\s*<>\s*target_user_id\s*\)/i.test(sql)) {
        outputLines.push('Constraint created: no self swipe/match')
      }

      if (/select\s+/i.test(sql)) {
        outputLines.push('+----+--------------------------+')
        outputLines.push('| ok | estado                   |')
        outputLines.push('+----+--------------------------+')
        outputLines.push('|  1 | Script SQL procesado     |')
        outputLines.push('+----+--------------------------+')
        outputLines.push('1 row in set (0.00 sec)')
      }

      if (outputLines.length === 1) {
        outputLines.push('Query OK, script accepted (0.01 sec)')
      }

      this.challengeSqlOutput = outputLines.join('\n')
    },
    getChallengeCompletionScore() {
      if (this.isPythonChallenge) {
        const code = String(this.challengeCodePython || '')
        const lowerCode = code.toLowerCase()
        let score = 0

        if (code.trim().length > 0) score += 10
        if (/(coche|carro|car)/i.test(code)) score += 20
        if (/range\(\s*10\s*\)/.test(code) || /while/.test(lowerCode)) score += 20
        if (/(\+=|=\s*\w+\s*\+\s*\w+)/.test(code) && /(distancia|distance)/i.test(code)) score += 20
        if (/(print\(|f"|f'|format\()/.test(code)) score += 15
        if (/(max\(|ganador|winner)/i.test(code)) score += 15

        return Math.max(0, Math.min(100, Math.round(score)))
      }

      if (this.isJavaChallenge) {
        const mainCode = String(this.challengeCodeJavaFiles.main || '')
        let score = 0

        if (mainCode.trim().length > 0) score += 15
        if (/class\s+Main/.test(mainCode)) score += 10
        if (/public\s+static\s+void\s+main\s*\(/.test(mainCode)) score += 20
        if (/switch\s*\(/.test(mainCode)) score += 15
        if (/(while\s*\(|for\s*\()/.test(mainCode)) score += 10
        if (/scanner|nextLine\s*\(/i.test(mainCode)) score += 10

        const extraFilesCompleted = this.javaChallengeFiles
          .filter((file) => file.key !== 'main')
          .reduce((acc, file) => acc + (String(this.challengeCodeJavaFiles[file.key] || '').trim().length > 0 ? 1 : 0), 0)
        score += extraFilesCompleted * 7

        return Math.max(0, Math.min(100, Math.round(score)))
      }

      if (this.isSqlChallenge) {
        const sql = String(this.challengeCodeSql || '')
        const lowerSql = sql.toLowerCase()
        let score = 0

        if (sql.trim().length > 0) score += 10

        const requiredTables = ['usuarios', 'intereses', 'swipes', 'matches', 'mensajes']
        const tablesCovered = requiredTables.reduce((acc, table) => acc + (new RegExp(`create\\s+table\\s+${table}`, 'i').test(sql) ? 1 : 0), 0)
        score += tablesCovered * 12

        if (/enum\s*\(\s*'masculino'\s*,\s*'femenino'\s*,\s*'otro'\s*\)/i.test(lowerSql)) score += 8
        if (/enum\s*\(\s*'masculino'\s*,\s*'femenino'\s*,\s*'otro'\s*,\s*'todos'\s*\)/i.test(lowerSql)) score += 8
        if (/check\s*\(\s*[^\)]*<>[^\)]*\)/i.test(sql)) score += 14
        if (/foreign\s+key/i.test(sql)) score += 10

        return Math.max(0, Math.min(100, Math.round(score)))
      }

      const html = String(this.challengeCodeHtml || '')
      const css = String(this.challengeCodeCss || '')
      const lowerHtml = html.toLowerCase()
      const lowerCss = css.toLowerCase()

      let score = 0

      if (html.trim().length > 0) score += 10
      if (css.trim().length > 0) score += 10

      if (/(<header|<main|<section|<article|<footer)/i.test(html)) score += 20
      if (/(class=|id=)/i.test(html)) score += 10
      if (/(<img|<button|<a\s)/i.test(html)) score += 10

      const cssRuleBlocks = (css.match(/{/g) || []).length
      score += Math.min(20, cssRuleBlocks * 4)

      const keyStyles = ['display', 'flex', 'grid', 'background', 'color', 'padding', 'margin', 'border', 'border-radius', 'box-shadow']
      const styleHits = keyStyles.reduce((hits, styleName) => hits + (lowerCss.includes(styleName) ? 1 : 0), 0)
      score += Math.min(20, styleHits * 2)

      return Math.max(0, Math.min(100, Math.round(score)))
    },
    async finishChallenge() {
      if (!this.selectedOpponent) {
        return
      }

      this.runChallengeCode()

      const targetScore = 90
      const userScore = this.getChallengeCompletionScore()
      this.showChallengeResult = true

      if (this.isFriendlyBattleActive()) {
        await this.submitBattleScoreIfNeeded(userScore)
        return
      }

      const rivalScore = 55 + Math.floor(Math.random() * 41)
      const userDistance = Math.abs(targetScore - userScore)
      const rivalDistance = Math.abs(targetScore - rivalScore)
      const winnerIsUser = userDistance <= rivalDistance

      this.challengeResult = {
        winnerIsUser,
        winnerName: winnerIsUser ? (this.currentUsername || 'Tú') : (this.selectedOpponent.fullName || 'Rival'),
        opponentName: this.selectedOpponent.fullName || 'Rival',
        userScore,
        rivalScore,
        summary: winnerIsUser
          ? `Tu codigo se acercó más al resultado esperado en ${this.selectedChallengeLanguage || 'el desafío'}.`
          : `${this.selectedOpponent.fullName || 'Tu rival'} estuvo más cerca del resultado esperado esta vez.`
      }
    },
    sanitizeCodeForShare(code, maxChars = 700) {
      const cleanCode = String(code || '').trim()
      if (!cleanCode) return '(sin contenido)'
      if (cleanCode.length <= maxChars) return cleanCode

      return `${cleanCode.slice(0, maxChars)}\n... (recortado)`
    },
    isLongPostText(text = '') {
      return String(text || '').length > 420
    },
    isPostExpanded(postId) {
      return this.expandedPostIds.includes(postId)
    },
    isPostShared(postId) {
      return this.sharedPostIds.includes(postId)
    },
    togglePostExpand(postId) {
      if (!postId) return

      if (this.isPostExpanded(postId)) {
        this.expandedPostIds = this.expandedPostIds.filter((id) => id !== postId)
        return
      }

      this.expandedPostIds.push(postId)
    },
    getPostDisplayText(post) {
      const text = String(post?.text || '')
      if (!this.isLongPostText(text)) return text
      if (this.isPostExpanded(post?.id)) return text
      return `${text.slice(0, 420)}...`
    },
    buildVictoryShareText(languageLabel) {
      const baseText = `Gané el desafío de ${languageLabel} contra ${this.challengeResult.opponentName} con ${this.challengeResult.userScore}% de fidelidad al resultado.`

      if (this.isPythonChallenge) {
        const pythonSnippet = String(this.challengeCodePython || '').trim() || '(sin contenido)'
        return `${baseText}\n\nCodigo del desafio:\n\nPYTHON:\n${pythonSnippet}`
      }

      if (this.isJavaChallenge) {
        const javaFilesText = this.javaChallengeFiles
          .map((file) => {
            const fileContent = String(this.challengeCodeJavaFiles[file.key] || '').trim() || '(vacio)'
            return `${file.label}:\n${fileContent}`
          })
          .join('\n\n')

        return `${baseText}\n\nCodigo del desafio:\n\n${javaFilesText}`
      }

      if (this.isSqlChallenge) {
        const header = '\n\nCodigo del desafio:\n\nSQL:\n'
        const sqlSnippet = String(this.challengeCodeSql || '').trim() || '(sin contenido)'
        return `${baseText}${header}${sqlSnippet}`
      }

      const header = '\n\nCodigo del desafio:\n'
      const htmlSnippet = String(this.challengeCodeHtml || '').trim() || '(sin contenido)'
      const cssSnippet = String(this.challengeCodeCss || '').trim() || '(sin contenido)'

      return `${baseText}${header}\nHTML:\n${htmlSnippet}\n\nCSS:\n${cssSnippet}`
    },
    async shareVictory() {
      if (!this.challengeResult?.winnerIsUser) {
        return
      }

      const userId = this.ensureLoggedUser()
      if (!userId) return

      this.isSharingVictory = true
      try {
        const languageLabel = this.selectedChallengeLanguage || 'Desafío de Código'
        const shareText = this.buildVictoryShareText(languageLabel)
        const response = await fetch(`${this.socialApiBaseUrl}/community/posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            type: 'Victoria',
            text: shareText
          })
        })

        const data = await response.json()
        if (!response.ok || !data?.post) {
          return
        }

        this.communityPosts.unshift(data.post)
        this.goBackToChallenges()
      } catch (error) {
        // Silencioso: no mostramos popups en UI
      } finally {
        this.isSharingVictory = false
      }
    },
    goBackToChallenges() {
      this.clearBattleStatusPolling()
      this.showCodingChallenge = false
      this.showChallengeResult = false
      this.challengeResult = null
      this.battleSyncData = null
      this.challengeSubmissionAttempted = false
      this.currentBattleMatchId = ''
      this.challengeWorkspaceMode = 'htmlcss'
      this.currentJavaFileKey = 'main'
      this.activeTab = 'practica'
    },
    pickRandomOpponent() {
      if (this.challengeOpponents.length === 0) return null

      const randomIndex = Math.floor(Math.random() * this.challengeOpponents.length)
      return this.challengeOpponents[randomIndex]
    },
    getOpponentInitial(name) {
      return String(name || '?')[0]?.toUpperCase() || '?'
    },
    async loadChallengeOpponents() {
      const userId = this.getCurrentUserId()

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/users`)
        const data = await response.json()

        if (!response.ok) {
          this.challengeOpponents = [...this.challengeOpponentsFallback]
          return
        }

        const users = Array.isArray(data?.users) ? data.users : []
        const filteredUsers = userId
          ? users.filter((candidate) => String(candidate.userId || candidate._id || '') !== String(userId))
          : users

        this.challengeOpponents = filteredUsers.length > 0
          ? filteredUsers.map((candidate) => ({
            id: String(candidate.userId || candidate._id || candidate.username),
            fullName: candidate.fullName || candidate.username || 'Rival',
            avatarUrl: candidate.avatarUrl || ''
          }))
          : [...this.challengeOpponentsFallback]
      } catch (error) {
        this.challengeOpponents = [...this.challengeOpponentsFallback]
      }
    },
    getCurrentUserId() {
      return this.user?.userId || this.user?._id || ''
    },
    ensureLoggedUser() {
      const userId = this.getCurrentUserId()
      if (!userId) {
        return ''
      }

      return userId
    },
    replacePost(updatedPost) {
      const index = this.communityPosts.findIndex(item => item.id === updatedPost.id)
      if (index === -1) {
        this.communityPosts.unshift(updatedPost)
        return
      }

      this.communityPosts.splice(index, 1, updatedPost)
    },
    isCommentsOpen(postId) {
      return this.openCommentsPostIds.includes(postId)
    },
    toggleComments(post) {
      if (!post?.id) return

      if (this.isCommentsOpen(post.id)) {
        this.openCommentsPostIds = this.openCommentsPostIds.filter(id => id !== post.id)
        return
      }

      this.openCommentsPostIds.push(post.id)
    },
    async loadUserData() {
      if (!this.user) return

      this.currentUsername = this.user.username || 'usuario'
      this.currentUserAvatar = this.user.avatarUrl || ''

      const userId = this.getCurrentUserId()
      if (!userId) return

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/profile/${userId}?viewerUserId=${encodeURIComponent(userId)}`)
        const data = await response.json()

        if (response.ok && data?.profile) {
          this.currentUsername = data.profile.username || this.currentUsername
          this.currentUserAvatar = data.profile.avatarUrl || ''
        }
      } catch (error) {
        // Si falla, mantenemos los datos disponibles en memoria
      }
    },
    async loadCommunityPosts() {
      this.isLoadingPosts = true
      try {
        const userId = this.getCurrentUserId()
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : ''
        const response = await fetch(`${this.socialApiBaseUrl}/community/posts${query}`)
        const data = await response.json()

        if (!response.ok) {
          this.communityPosts = []
          return
        }

        this.communityPosts = Array.isArray(data.posts) ? data.posts : []
        if (this.communityPosts.length === 0) {
          this.communityPosts = this.getSampleCommunityPosts()
        }
      } catch (error) {
        this.communityPosts = this.getSampleCommunityPosts()
      } finally {
        this.isLoadingPosts = false
      }
    },
    getSampleCommunityPosts() {
      const now = Date.now()
      return [
        {
          id: 'sample-es-post-1',
          userId: 'sample-es-1',
          username: 'laura_front',
          fullName: 'Laura Front',
          avatar: '',
          type: 'Post',
          text: 'Hoy terminé la autenticación con JWT + refresh token y añadí rate limiting. Mañana voy con tests de integración.',
          createdAt: new Date(now - 60 * 60 * 1000).toISOString(),
          likes: 9,
          commentsCount: 1,
          comments: [{ id: 'sample-es-c1', username: 'mario_back', fullName: 'Mario Back', avatar: '', text: 'Buenísimo, prueba también casos de token expirado.' }],
          likedByMe: false,
          savedByMe: false,
          savedCount: 0,
          shareCount: 0,
          isAuthorAdmin: false
        },
        {
          id: 'sample-en-post-1',
          userId: 'sample-en-1',
          username: 'alexdev',
          fullName: 'Alex Dev',
          avatar: '',
          type: 'Post',
          text: 'Today I finished a clean auth flow with refresh tokens and role-based guards. Next step: audit logs and rate limiting.',
          createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
          likes: 12,
          commentsCount: 1,
          comments: [{ id: 'sample-en-c1', username: 'nora', fullName: 'Nora Data', avatar: '', text: 'Great architecture! Add tests for expired tokens.' }],
          likedByMe: false,
          savedByMe: false,
          savedCount: 0,
          shareCount: 0,
          isAuthorAdmin: false
        },
        {
          id: 'sample-es-project',
          userId: 'sample-es-2',
          username: 'nora_data',
          fullName: 'Nora Data',
          avatar: '',
          type: 'Proyecto',
          text: 'Publiqué una app de seguimiento de hábitos con dashboard y recordatorios.',
          createdAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
          likes: 16,
          commentsCount: 0,
          comments: [],
          project: {
            category: 'Proyectos',
            title: 'Habit Tracker Dashboard',
            description: 'Panel con progreso semanal, rachas y calendario de hábitos.',
            url: 'https://github.com/example/habit-tracker-dashboard'
          },
          likedByMe: false,
          savedByMe: false,
          savedCount: 0,
          shareCount: 0,
          isAuthorAdmin: false
        },
        {
          id: 'sample-en-project',
          userId: 'sample-en-2',
          username: 'lucybuilds',
          fullName: 'Lucy Builds',
          avatar: '',
          type: 'Project',
          text: 'I published a production-ready portfolio with Lighthouse 100/100 and CI checks.',
          createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
          likes: 24,
          commentsCount: 0,
          comments: [],
          project: {
            category: 'Projects',
            title: 'Portfolio Performance Blueprint',
            description: 'A fast portfolio with image optimization, route-based splitting and accessibility checks.',
            url: 'https://github.com/example/portfolio-performance-blueprint'
          },
          likedByMe: false,
          savedByMe: false,
          savedCount: 0,
          shareCount: 0,
          isAuthorAdmin: false
        }
      ]
    },
    async loadSavedPosts() {
      const userId = this.getCurrentUserId()
      if (!userId) {
        this.savedPosts = []
        return
      }

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/community/saved/${userId}`)
        const data = await response.json()

        if (!response.ok) {
          this.savedPosts = []
          return
        }

        this.savedPosts = Array.isArray(data.posts) ? data.posts : []
      } catch (error) {
        this.savedPosts = []
      }
    },
    getNotificationIcon(type) {
      if (type === 'like') return '❤️'
      if (type === 'comment') return '💬'
      if (type === 'share') return '🔁'
      return '🔔'
    },
    notificationText(notification) {
      const actorName = notification?.actor?.fullName || notification?.actor?.username || ''
      if (notification?.type === 'like') {
        const count = Number(notification?.count || 1)
        if (count > 1) {
          return this.uiLanguage === 'en'
            ? `${actorName || 'Someone'} and ${count - 1} more liked your post.`
            : `${actorName || 'Alguien'} y ${count - 1} más le dieron like a tu publicación.`
        }
      }

      return notification?.text || ''
    },
    toggleNotificationsPanel() {
      this.showNotificationsPanel = !this.showNotificationsPanel
      if (this.showNotificationsPanel) {
        this.loadNotifications()
      }
    },
    async loadNotifications() {
      const userId = this.getCurrentUserId()
      if (!userId) {
        this.notifications = []
        this.notificationsUnreadCount = 0
        return
      }

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/notifications/${userId}`)
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          this.notifications = []
          this.notificationsUnreadCount = 0
          return
        }

        this.notifications = Array.isArray(data.notifications) ? data.notifications : []
        this.notificationsUnreadCount = Number(data.unreadCount || 0)
      } catch (error) {
        this.notifications = []
        this.notificationsUnreadCount = 0
      }
    },
    async markNotificationAsRead(notification) {
      const userId = this.getCurrentUserId()
      if (!userId || !notification?.id || notification.isRead) return

      try {
        await fetch(`${this.socialApiBaseUrl}/notifications/${notification.id}/read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        })
      } catch (error) {
        // noop
      }

      notification.isRead = true
      this.notificationsUnreadCount = Math.max(0, this.notificationsUnreadCount - 1)
    },
    async loadFollowingUsers() {
      const userId = this.getCurrentUserId()
      if (!userId) {
        this.followingUsers = []
        this.followingUserIds = new Set()
        return
      }

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/following/${userId}`)
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          this.followingUsers = []
          this.followingUserIds = new Set()
          return
        }

        this.followingUsers = Array.isArray(data.following) ? data.following : []
        this.followingUserIds = new Set(this.followingUsers.map((item) => String(item.userId || '')))
      } catch (error) {
        this.followingUsers = []
        this.followingUserIds = new Set()
      }
    },
    async toggleFollowSelectedUser() {
      const userId = this.getCurrentUserId()
      const targetUserId = String(this.selectedPostUser?.userId || '')
      if (!userId || !targetUserId || this.isCurrentPostUser || this.isTogglingFollow) return

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
          this.selectedPostUser.isFollowing = !alreadyFollowing
          this.loadFollowingUsers()
          this.loadForYouPosts()
        }
      } catch (error) {
        // noop
      } finally {
        this.isTogglingFollow = false
      }
    },
    async loadForYouPosts() {
      const userId = this.getCurrentUserId()
      if (!userId) {
        this.forYouPosts = []
        return
      }

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/community/posts/foryou?userId=${encodeURIComponent(userId)}`)
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          this.forYouPosts = []
          return
        }

        this.forYouPosts = Array.isArray(data.posts) ? data.posts : []
      } catch (error) {
        this.forYouPosts = []
      }
    },
    async loadFriendUsernames() {
      const userId = this.getCurrentUserId()
      if (!userId) {
        this.friendUsernames = new Set()
        return
      }

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/friends/${userId}`)
        const data = await response.json()
        if (!response.ok) {
          this.friendUsernames = new Set()
          return
        }

        const usernames = Array.isArray(data.friends)
          ? data.friends.map((friend) => String(friend.username || '').trim()).filter(Boolean)
          : []
        this.friendUsernames = new Set(usernames)
      } catch (error) {
        this.friendUsernames = new Set()
      }
    },
    async openPostUserProfile(post) {
      if (this.isAdminMode) return
      if (!post) return

      this.selectedPostUser = {
        userId: String(post.userId || ''),
        username: post.username || 'usuario',
        fullName: post.fullName || post.username || 'usuario',
        avatarUrl: post.avatar || '',
        bio: post.bio || '',
        league: null,
        totalPoints: 0,
        isFollowing: this.followingUserIds.has(String(post.userId || ''))
      }
      this.selectedPostUserCertificates = []
      this.selectedPostUserFollowersCount = 0
      this.selectedPostUserFollowingCount = 0
      this.postFriendRequestFeedback = ''
      this.showPostUserProfile = true
      document.body.style.overflow = 'hidden'
      await this.loadSelectedPostUserDetails(this.selectedPostUser.userId)
    },
    async loadSelectedPostUserDetails(targetUserId) {
      if (!targetUserId || !this.selectedPostUser) return

      try {
        const [profileRes, summaryRes, certsRes, followersRes, followingRes] = await Promise.all([
          fetch(`${this.socialApiBaseUrl}/profile/${targetUserId}?viewerUserId=${encodeURIComponent(this.getCurrentUserId() || '')}`),
          fetch(`${this.learningApiBaseUrl}/leaderboard?userId=${encodeURIComponent(targetUserId)}`),
          fetch(`${this.socialApiBaseUrl}/certificates/${targetUserId}`),
          fetch(`${this.socialApiBaseUrl}/followers/${targetUserId}`),
          fetch(`${this.socialApiBaseUrl}/following/${targetUserId}`)
        ])

        const profileData = await profileRes.json().catch(() => ({}))
        const summaryData = await summaryRes.json().catch(() => ({}))
        const certsData = await certsRes.json().catch(() => ({}))
        const followersData = await followersRes.json().catch(() => ({}))
        const followingData = await followingRes.json().catch(() => ({}))

        if (!this.selectedPostUser || String(this.selectedPostUser.userId) !== String(targetUserId)) {
          return
        }

        this.selectedPostUser = {
          ...this.selectedPostUser,
          fullName: profileData?.profile?.fullName || this.selectedPostUser.fullName,
          username: profileData?.profile?.username || this.selectedPostUser.username,
          avatarUrl: profileData?.profile?.avatarUrl || this.selectedPostUser.avatarUrl,
          bio: profileData?.profile?.bio || this.selectedPostUser.bio || '',
          league: summaryData?.userSummary?.league || this.selectedPostUser.league,
          totalPoints: Number(summaryData?.userSummary?.totalPoints || this.selectedPostUser.totalPoints || 0)
        }
        this.selectedPostUserCertificates = Array.isArray(certsData?.certificates) ? certsData.certificates : []
        this.selectedPostUserFollowers = Array.isArray(followersData?.followers) ? followersData.followers : []
        this.selectedPostUserFollowing = Array.isArray(followingData?.following) ? followingData.following : []
        this.selectedPostUserFollowersCount = Number(followersData?.count || 0)
        this.selectedPostUserFollowingCount = this.selectedPostUserFollowing.length
      } catch (error) {
        // noop
      }
    },
    async openPostUserProjects() {
      const targetUserId = String(this.selectedPostUser?.userId || '')
      if (!targetUserId || this.isLoadingPostUserProjects) return

      this.isLoadingPostUserProjects = true
      try {
        const viewerUserId = this.getCurrentUserId()
        const response = await fetch(
          `${this.socialApiBaseUrl}/community/posts/user/${targetUserId}?userId=${encodeURIComponent(viewerUserId)}`
        )
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          this.selectedPostUserProjects = []
          return
        }

        this.selectedPostUserProjects = Array.isArray(data.posts) ? data.posts : []
        this.showPostUserProjectsModal = true
      } catch (error) {
        this.selectedPostUserProjects = []
      } finally {
        this.isLoadingPostUserProjects = false
      }
    },
    closePostUserProjects() {
      this.showPostUserProjectsModal = false
      this.selectedPostUserProjects = []
    },
    openPostUserSocialList(type) {
      const followers = Array.isArray(this.selectedPostUserFollowers) ? this.selectedPostUserFollowers : []
      const following = Array.isArray(this.selectedPostUserFollowing) ? this.selectedPostUserFollowing : []

      if (type === 'followers') {
        this.postUserSocialListTitle = this.t('followers')
        this.postUserSocialListItems = followers
      } else {
        this.postUserSocialListTitle = this.t('following')
        this.postUserSocialListItems = following
      }

      this.showPostUserSocialListModal = true
    },
    closePostUserSocialList() {
      this.showPostUserSocialListModal = false
      this.postUserSocialListTitle = ''
      this.postUserSocialListItems = []
    },
    closePostUserProfile() {
      this.showPostUserProfile = false
      this.showPostUserProjectsModal = false
      this.showPostUserSocialListModal = false
      this.selectedPostUser = null
      this.selectedPostUserCertificates = []
      this.selectedPostUserFollowersCount = 0
      this.selectedPostUserFollowingCount = 0
      this.selectedPostUserFollowers = []
      this.selectedPostUserFollowing = []
      this.selectedPostUserProjects = []
      this.postUserSocialListTitle = ''
      this.postUserSocialListItems = []
      this.isSendingPostFriendRequest = false
      this.postFriendRequestFeedback = ''
      document.body.style.overflow = 'auto'
    },
    isPendingPostFriendRequest(username = '') {
      if (!username) return false
      if (this.friendUsernames.has(username)) return true
      return this.pendingPostFriendRequests.has(username)
    },
    async sendFriendRequestFromPostUser() {
      const userId = this.getCurrentUserId()
      const targetUsername = String(this.selectedPostUser?.username || '').trim()
      if (!userId || !targetUsername || this.isCurrentPostUser || this.isSendingPostFriendRequest) return

      this.isSendingPostFriendRequest = true
      this.postFriendRequestFeedback = ''
      try {
        const response = await fetch(`${this.socialApiBaseUrl}/friend-requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId, targetUsername })
        })

        const data = await response.json().catch(() => ({}))
        if (response.ok) {
          this.pendingPostFriendRequests.add(targetUsername)
          this.postFriendRequestFeedback = data?.message || 'Solicitud enviada.'
          return
        }

        this.postFriendRequestFeedback = data?.message || 'No se pudo enviar la solicitud.'
      } catch (error) {
        this.postFriendRequestFeedback = 'Error de conexión al enviar la solicitud.'
      } finally {
        this.isSendingPostFriendRequest = false
      }
    },
    async loadRepositoryItems() {
      this.repoItems = [
        {
          id: 1,
          category: 'Proyectos',
          title: 'Sistema de Login con JWT',
          description: 'Implementación completa de autenticación con JSON Web Tokens',
          author: 'Laura Front',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          link: 'https://github.com/example/jwt-login'
        },
        {
          id: 2,
          category: 'Algoritmos',
          title: 'Búsqueda Binaria Optimizada',
          description: 'Algoritmo de búsqueda binaria con ejemplos prácticos',
          author: 'Mario Back',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          link: 'https://github.com/example/binary-search'
        },
        {
          id: 3,
          category: 'Estructuras',
          title: 'Árbol Binario de Búsqueda',
          description: 'Estructura de datos completa con operaciones básicas',
          author: 'Nora Data',
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
          link: 'https://github.com/example/bst'
        },
        {
          id: 4,
          category: 'Git',
          title: 'Flujo Git para equipos',
          description: 'Guía práctica de ramas, pull requests y resolución de conflictos',
          author: 'Santi Dev',
          createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000),
          link: 'https://github.com/example/git-workflow'
        },
        {
          id: 5,
          category: 'Proyectos',
          title: 'E-commerce con React',
          description: 'Tienda online completa con carrito de compras',
          author: 'Kike Demo',
          createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
          link: 'https://github.com/example/ecommerce'
        },
        {
          id: 6,
          category: 'Algoritmos',
          title: 'Dijkstra desde cero',
          description: 'Implementación comentada con visualización de pasos en grafos ponderados',
          author: 'Nora Data',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          link: 'https://github.com/example/dijkstra-guide'
        },
        {
          id: 7,
          category: 'Estructuras',
          title: 'Tabla Hash con colisiones',
          description: 'Ejemplo práctico de hashing con encadenamiento y pruebas de carga',
          author: 'Mario Back',
          createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000),
          link: 'https://github.com/example/hash-table-lab'
        },
        {
          id: 8,
          category: 'Git',
          title: 'Git rebase visual',
          description: 'Guía visual para usar rebase interactivo, squash y fixup sin miedo',
          author: 'Santi Dev',
          createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
          link: 'https://github.com/example/git-rebase-visual'
        },
        {
          id: 9,
          category: 'Proyectos',
          title: 'Chat en tiempo real con sockets',
          description: 'App de chat con salas, presencia de usuarios y mensajes persistidos',
          author: 'Laura Front',
          createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
          link: 'https://github.com/example/realtime-chat'
        },
        {
          id: 10,
          category: 'Algoritmos',
          title: 'Merge Sort paso a paso',
          description: 'Divide y vencerás explicado con trazas completas y tests',
          author: 'Kike Demo',
          createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
          link: 'https://github.com/example/merge-sort-lab'
        },
        {
          id: 11,
          category: 'Estructuras',
          title: 'Árbol AVL interactivo',
          description: 'Inserciones, rotaciones y recorrido en un mini playground',
          author: 'Nora Data',
          createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
          link: 'https://github.com/example/avl-playground'
        },
        {
          id: 12,
          category: 'Git',
          title: 'Plantilla PR + convenciones',
          description: 'Checklist para pull requests y convención de commits para equipos',
          author: 'Laura Front',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          link: 'https://github.com/example/pr-conventions'
        },
        {
          id: 13,
          category: 'Proyectos',
          title: 'Kanban de estudio',
          description: 'Tablero drag and drop para organizar tareas y objetivos semanales',
          author: 'Santi Dev',
          createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
          link: 'https://github.com/example/study-kanban'
        },
        {
          id: 14,
          category: 'Algoritmos',
          title: 'Backtracking: Sudoku Solver',
          description: 'Resolución de sudoku con poda y visualización de decisiones',
          author: 'Mario Back',
          createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000),
          link: 'https://github.com/example/sudoku-backtracking'
        },
        {
          id: 15,
          category: 'Estructuras',
          title: 'Heap de prioridad para tareas',
          description: 'Cola de prioridad implementada desde cero para scheduler simple',
          author: 'Kike Demo',
          createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000),
          link: 'https://github.com/example/priority-heap'
        },
        {
          id: 16,
          category: 'Git',
          title: 'Resolución de conflictos guiada',
          description: 'Repositorio de práctica con conflictos reales y pasos de solución',
          author: 'Santi Dev',
          createdAt: new Date(Date.now() - 32 * 60 * 60 * 1000),
          link: 'https://github.com/example/git-conflicts-lab'
        },
        {
          id: 201,
          category: 'Proyectos',
          title: 'TaskFlow Project Board',
          description: 'A full-stack project board with auth, drag and drop, and activity logs.',
          author: 'Luna Stack',
          createdAt: new Date(Date.now() - 34 * 60 * 60 * 1000),
          link: 'https://github.com/example/taskflow-board'
        },
        {
          id: 202,
          category: 'Proyectos',
          title: 'Realtime Notes App',
          description: 'Collaborative note-taking app with sockets and optimistic updates.',
          author: 'Chris Builder',
          createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
          link: 'https://github.com/example/realtime-notes'
        },
        {
          id: 203,
          category: 'Algoritmos',
          title: 'A* Pathfinding Visualizer',
          description: 'Step-by-step pathfinding with grid heuristics and performance metrics.',
          author: 'Ethan Algo',
          createdAt: new Date(Date.now() - 38 * 60 * 60 * 1000),
          link: 'https://github.com/example/astar-visualizer'
        },
        {
          id: 204,
          category: 'Algoritmos',
          title: 'Sliding Window Patterns',
          description: 'Common window techniques with benchmarks and edge-case tests.',
          author: 'Mia Logic',
          createdAt: new Date(Date.now() - 40 * 60 * 60 * 1000),
          link: 'https://github.com/example/sliding-window-patterns'
        },
        {
          id: 205,
          category: 'Estructuras',
          title: 'Red-Black Tree Playground',
          description: 'Insertion, balancing and traversal examples with animated states.',
          author: 'Nora Data',
          createdAt: new Date(Date.now() - 42 * 60 * 60 * 1000),
          link: 'https://github.com/example/rbt-playground'
        },
        {
          id: 206,
          category: 'Estructuras',
          title: 'Trie Autocomplete Engine',
          description: 'Prefix-based search with ranked suggestions and typo tolerance.',
          author: 'Ava Struct',
          createdAt: new Date(Date.now() - 44 * 60 * 60 * 1000),
          link: 'https://github.com/example/trie-autocomplete'
        },
        {
          id: 207,
          category: 'Git',
          title: 'Team Git Strategy Kit',
          description: 'Practical branch strategy, release flow and conflict resolution guide.',
          author: 'Sam Repo',
          createdAt: new Date(Date.now() - 46 * 60 * 60 * 1000),
          link: 'https://github.com/example/team-git-strategy'
        },
        {
          id: 208,
          category: 'Git',
          title: 'Conventional Commits Workflow',
          description: 'Commit conventions, changelog automation and release tagging.',
          author: 'Nina Merge',
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
          link: 'https://github.com/example/conventional-commits-workflow'
        }
      ]
    },
    formatDate(date) {
      const now = new Date()
      const diff = now - new Date(date)
      const hours = Math.floor(diff / (1000 * 60 * 60))
      
      if (hours < 1) return this.uiLanguage === 'en' ? 'a few minutes ago' : 'hace unos minutos'
      if (hours < 24) return this.uiLanguage === 'en' ? `${hours}h ago` : `hace ${hours}h`
      
      const days = Math.floor(hours / 24)
      if (days < 7) return this.uiLanguage === 'en' ? `${days}d ago` : `hace ${days}d`
      
      return new Date(date).toLocaleDateString(this.uiLanguage === 'en' ? 'en-GB' : 'es-ES')
    },
    startChallenge() {
      if (!this.selectedChallengeLanguage) {
        return
      }

      if (this.challengeOpponents.length === 0) {
        return
      }

      this.clearChallengeSearchTimers()
      this.showChallengeResult = false
      this.challengeResult = null
      this.selectedOpponent = null
      this.challengeStatusMessage = 'Buscando oponente...'
      this.isSearchingOpponent = true
      this.searchingOpponent = this.pickRandomOpponent()

      this.searchIntervalId = setInterval(() => {
        this.searchingOpponent = this.pickRandomOpponent()
      }, 180)

      this.searchTimeoutId = setTimeout(() => {
        this.clearChallengeSearchTimers()
        this.selectedOpponent = this.searchingOpponent || this.pickRandomOpponent()
        this.searchingOpponent = null
        this.isSearchingOpponent = false

        if (this.selectedOpponent) {
          this.challengeStatusMessage = `Rival encontrado: ${this.selectedOpponent.fullName}`
          setTimeout(() => {
            this.openChallengeByLanguage(this.selectedChallengeLanguage)
          }, 350)
        } else {
          this.challengeStatusMessage = 'No se encontró rival. Intenta de nuevo.'
        }
      }, 5000)
    },
    async publishPost() {
      if (this.isAdminMode) return
      if (!this.newPost.trim()) return

      const userId = this.ensureLoggedUser()
      if (!userId) return

      this.isSubmittingPost = true
      try {
        const response = await fetch(`${this.socialApiBaseUrl}/community/posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            text: this.newPost,
            type: 'Compartio'
          })
        })

        const data = await response.json()
        if (!response.ok || !data?.post) {
          return
        }

        this.communityPosts.unshift(data.post)
        this.newPost = ''
      } catch (error) {
        // Silencioso: no mostramos popups en UI
      } finally {
        this.isSubmittingPost = false
      }
    },
    async toggleLike(post) {
      if (this.isAdminMode) return
      const userId = this.ensureLoggedUser()
      if (!userId || !post?.id) return

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/community/posts/${post.id}/like`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        })

        const data = await response.json()
        if (!response.ok || !data?.post) {
          return
        }

        this.replacePost(data.post)
        if (!this.sharedPostIds.includes(post.id)) {
          this.sharedPostIds.push(post.id)
        }
      } catch (error) {
        // Silencioso: no mostramos popups en UI
      }
    },
    async toggleSave(post) {
      if (this.isAdminMode) return
      const userId = this.ensureLoggedUser()
      if (!userId || !post?.id) return

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/community/posts/${post.id}/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        })

        const data = await response.json()
        if (!response.ok || !data?.post) {
          return
        }

        this.replacePost(data.post)
        if (data.post.savedByMe) {
          this.savedPosts = [data.post, ...this.savedPosts.filter((item) => item.id !== data.post.id)]
        } else {
          this.savedPosts = this.savedPosts.filter((item) => item.id !== data.post.id)
        }
      } catch (error) {
        // Silencioso
      }
    },
    async submitComment(post) {
      if (this.isAdminMode) return
      const userId = this.ensureLoggedUser()
      if (!userId || !post?.id) return

      const text = String(this.postCommentsDraft[post.id] || '').trim()
      if (!text) return

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/community/posts/${post.id}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId, text })
        })

        const data = await response.json()
        if (!response.ok || !data?.post) {
          return
        }

        this.replacePost(data.post)
        this.postCommentsDraft = {
          ...this.postCommentsDraft,
          [post.id]: ''
        }
      } catch (error) {
        // Silencioso: no mostramos popups en UI
      }
    },
    async sharePost(post) {
      if (this.isAdminMode) return
      if (!post?.id) return

      try {
        const userId = this.getCurrentUserId()
        const response = await fetch(`${this.socialApiBaseUrl}/community/posts/${post.id}/share`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        })

        const data = await response.json()
        if (!response.ok || !data?.post) {
          return
        }

        this.replacePost(data.post)

        const shareLink = `${window.location.origin}${data.shareUrl || `/comunidad/post/${post.id}`}`
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareLink)
        }
      } catch (error) {
        // Silencioso: no mostramos popups en UI
      }
    },
    closeProjectPostModal() {
      this.showProjectPostModal = false
      this.projectPostForm = {
        category: 'Proyectos',
        title: '',
        description: '',
        url: ''
      }
    },
    async publishProjectPost() {
      if (this.isAdminMode) return
      const userId = this.ensureLoggedUser()
      if (!userId) return

      const title = String(this.projectPostForm.title || '').trim()
      const url = String(this.projectPostForm.url || '').trim()
      const description = String(this.projectPostForm.description || '').trim()

      if (!title || !url) {
        return
      }

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/community/posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            type: 'Proyecto',
            text: description || `Comparto mi proyecto: ${title}`,
            project: {
              title,
              description,
              url,
              category: this.projectPostForm.category || 'Proyectos'
            }
          })
        })

        const data = await response.json()
        if (!response.ok || !data?.post) {
          return
        }

        this.communityPosts.unshift(data.post)
        this.closeProjectPostModal()
      } catch (error) {
        // Silencioso: no mostramos popups en UI
      }
    },
    uploadContent() {
      if (this.isAdminMode) return
      if (!this.uploadForm.title.trim() || !this.uploadForm.link.trim()) {
        return
      }
      
      const newItem = {
        id: this.repoItems.length + 1,
        category: this.uploadForm.category,
        title: this.uploadForm.title,
        description: this.uploadForm.description,
        author: this.currentUsername,
        createdAt: new Date(),
        link: this.uploadForm.link
      }
      
      this.repoItems.unshift(newItem)
      this.uploadForm = { category: 'Proyectos', title: '', description: '', link: '' }
      this.showUploadModal = false
    },
    removeRepoItem(itemId) {
      if (!this.isAdminMode) return
      this.repoItems = this.repoItems.filter((item) => item.id !== itemId)
    },
    isPostUnderModeration(postId) {
      return this.moderationBusyPostIds.includes(postId)
    },
    setModerationBusy(postId, isBusy) {
      if (!postId) return
      if (isBusy) {
        if (!this.moderationBusyPostIds.includes(postId)) {
          this.moderationBusyPostIds.push(postId)
        }
        return
      }

      this.moderationBusyPostIds = this.moderationBusyPostIds.filter((id) => id !== postId)
    },
    async deletePostAsAdmin(post) {
      const adminUserId = this.ensureLoggedUser()
      if (!this.isAdminMode || !adminUserId || !post?.id) return

      this.setModerationBusy(post.id, true)
      this.moderationFeedback = { ...this.moderationFeedback, [post.id]: '' }

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/community/posts/${post.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ adminUserId })
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          this.moderationFeedback = {
            ...this.moderationFeedback,
            [post.id]: data?.message || 'No se pudo eliminar la publicación.'
          }
          return
        }

        this.communityPosts = this.communityPosts.filter((item) => item.id !== post.id)
      } catch (error) {
        this.moderationFeedback = {
          ...this.moderationFeedback,
          [post.id]: 'Error de conexión durante la moderación.'
        }
      } finally {
        this.setModerationBusy(post.id, false)
      }
    },
    async banPostAuthor(post) {
      const adminUserId = this.ensureLoggedUser()
      const targetUserId = post?.userId
      if (!this.isAdminMode || !adminUserId || !targetUserId || !post?.id) return

      const reason = window.prompt('Motivo del baneo (opcional):', 'Contenido inadecuado')
      if (reason === null) return

      this.setModerationBusy(post.id, true)
      this.moderationFeedback = { ...this.moderationFeedback, [post.id]: '' }

      try {
        const response = await fetch(`${this.socialApiBaseUrl}/moderation/users/${targetUserId}/ban`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            adminUserId,
            reason,
            removePosts: true
          })
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          this.moderationFeedback = {
            ...this.moderationFeedback,
            [post.id]: data?.message || 'No se pudo banear al usuario.'
          }
          return
        }

        this.communityPosts = this.communityPosts.filter((item) => String(item.userId) !== String(targetUserId))
      } catch (error) {
        this.moderationFeedback = {
          ...this.moderationFeedback,
          [post.id]: 'Error de conexión durante el baneo.'
        }
      } finally {
        this.setModerationBusy(post.id, false)
      }
    }
  }
}
</script>

<style scoped>
.comunidad-container {
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

.challenge-workspace {
  display: grid;
  gap: 10px;
  max-width: 1080px;
  margin: 0 auto;
}

.workspace-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.workspace-header h2 {
  margin: 0;
  font-size: 18px;
}

.workspace-back {
  border: 1px solid rgba(166, 184, 255, 0.45);
  background: rgba(12, 25, 94, 0.75);
  color: #e9f0ff;
  border-radius: 8px;
  padding: 6px 9px;
  font-size: 11px;
  cursor: pointer;
}

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(200px, 29%) 1fr;
  gap: 10px;
}

.workspace-left {
  background: rgba(12, 25, 94, 0.68);
  border: 1px solid rgba(166, 184, 255, 0.4);
  border-radius: 12px;
  padding: 9px;
  display: grid;
  gap: 8px;
  align-content: start;
}

.workspace-image {
  width: 100%;
  border-radius: 8px;
  border: 1px solid rgba(166, 184, 255, 0.35);
}

.workspace-statement {
  background: rgba(8, 18, 82, 0.72);
  border: 1px solid rgba(166, 184, 255, 0.32);
  border-radius: 8px;
  padding: 9px;
}

.workspace-statement h3 {
  margin: 0 0 6px;
  font-size: 13px;
}

.workspace-statement p {
  margin: 0;
  font-size: 11px;
  line-height: 1.4;
  color: rgba(235, 242, 255, 0.9);
}

.workspace-editor {
  border: 1px solid rgba(166, 184, 255, 0.35);
  border-radius: 12px;
  overflow: hidden;
  background: #1e1e1e;
  min-height: 440px;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
}

.vscode-topbar {
  height: 30px;
  background: #252526;
  border-bottom: 1px solid #3a3a3a;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 8px;
}

.mysql-topbar {
  background: #141414;
}

.java-topbar {
  background: #1a1f2b;
}

.python-topbar {
  background: #182636;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.dot.red { background: #ff5f57; }
.dot.yellow { background: #febc2e; }
.dot.green { background: #28c840; }

.vscode-title {
  margin-left: 8px;
  font-size: 10px;
  color: #c6c6c6;
}

.editor-tabs {
  display: flex;
  background: #2d2d2d;
  border-bottom: 1px solid #3a3a3a;
}

.mysql-tabs {
  background: #161616;
  border-bottom-color: #2a2a2a;
}

.java-tabs {
  background: #1f2633;
  border-bottom-color: #2c3444;
}

.python-tabs {
  background: #1b2a3c;
  border-bottom-color: #2d3f54;
}

.mysql-tab-label {
  color: #85e89d;
  font-size: 11px;
  padding: 8px 10px;
  font-family: Consolas, 'Courier New', monospace;
}

.python-tab-label {
  color: #9ad0ff;
  font-size: 11px;
  padding: 8px 10px;
  font-family: Consolas, 'Courier New', monospace;
}

.editor-tab {
  border: none;
  background: transparent;
  color: #b8b8b8;
  padding: 8px 10px;
  font-size: 11px;
  cursor: pointer;
}

.editor-tab.active {
  color: #fff;
  background: #1e1e1e;
  border-bottom: 2px solid #007acc;
}

.run-code-btn {
  margin-left: auto;
  margin-right: 6px;
  align-self: center;
  border: 1px solid #2ea043;
  background: #238636;
  color: #fff;
  border-radius: 6px;
  padding: 4px 9px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.run-code-btn:hover {
  background: #2ea043;
}

.finish-code-btn {
  margin-right: 8px;
  align-self: center;
  border: 1px solid #d97706;
  background: #f59e0b;
  color: #1e293b;
  border-radius: 6px;
  padding: 4px 9px;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

.finish-code-btn:hover {
  background: #fbbf24;
}

.challenge-result-screen {
  background: rgba(12, 25, 94, 0.68);
  border: 1px solid rgba(166, 184, 255, 0.4);
  border-radius: 12px;
  padding: 16px;
  display: grid;
  gap: 12px;
}

.result-badge {
  width: fit-content;
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.result-badge.win {
  background: rgba(13, 226, 143, 0.18);
  color: #0de28f;
  border: 1px solid rgba(13, 226, 143, 0.4);
}

.result-badge.lose {
  background: rgba(255, 159, 67, 0.16);
  color: #ffc76f;
  border: 1px solid rgba(255, 199, 111, 0.45);
}

.result-title {
  margin: 0;
  font-size: 22px;
}

.result-subtitle {
  margin: 0;
  font-size: 13px;
  color: rgba(235, 242, 255, 0.9);
}

.result-scores {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.result-score-card {
  background: rgba(8, 18, 82, 0.72);
  border: 1px solid rgba(166, 184, 255, 0.32);
  border-radius: 10px;
  padding: 10px;
  display: grid;
  gap: 4px;
}

.result-score-card span {
  font-size: 11px;
  color: rgba(226, 236, 255, 0.8);
}

.result-score-card strong {
  font-size: 24px;
}

.result-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.result-share-btn,
.result-back-btn {
  border: none;
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.result-share-btn {
  background: linear-gradient(135deg, #0de28f 0%, #00d887 100%);
  color: #08244d;
}

.result-share-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result-back-btn {
  background: rgba(21, 34, 120, 0.9);
  border: 1px solid rgba(166, 184, 255, 0.45);
  color: #e9f0ff;
}

.code-editor {
  width: 100%;
  height: 100%;
  min-height: 300px;
  border: none;
  outline: none;
  resize: none;
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  padding: 10px;
}

.mysql-editor {
  background: #0f0f0f;
  color: #d7ffd8;
}

.java-editor {
  background: #1a1f2b;
  color: #d9e6ff;
}

.python-editor {
  background: #132131;
  color: #d7eeff;
}

.preview-panel {
  border-top: 1px solid #3a3a3a;
  background: #1a1a1a;
}

.mysql-panel {
  background: #101010;
  border-top-color: #262626;
}

.java-panel {
  background: #131a24;
  border-top-color: #2a3548;
}

.python-panel {
  background: #0f1b29;
  border-top-color: #27405a;
}

.preview-title {
  height: 24px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  font-size: 10px;
  color: #c4c4c4;
  border-bottom: 1px solid #2d2d2d;
}

.preview-frame {
  width: 100%;
  height: 170px;
  border: none;
  background: #fff;
}

.mysql-output {
  margin: 0;
  padding: 10px;
  height: 170px;
  overflow: auto;
  background: #0c0c0c;
  color: #9afc9e;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 11px;
  line-height: 1.5;
  white-space: pre;
}

.java-output {
  margin: 0;
  padding: 10px;
  height: 170px;
  overflow: auto;
  background: #0f131b;
  color: #c6f6d5;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 11px;
  line-height: 1.5;
  white-space: pre;
}

.python-output {
  margin: 0;
  padding: 10px;
  height: 170px;
  overflow: auto;
  background: #0d1724;
  color: #bce3ff;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 11px;
  line-height: 1.5;
  white-space: pre;
}

.python-example-output {
  margin: 8px 0 0;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid rgba(166, 184, 255, 0.28);
  background: rgba(9, 17, 34, 0.65);
  color: #d4e8ff;
  font-size: 10px;
  line-height: 1.45;
  white-space: pre;
  overflow-x: auto;
}

.sql-statement-intro {
  margin: 0 0 8px;
}

.sql-statement-list {
  margin: 0;
  padding-left: 16px;
  display: grid;
  gap: 6px;
  font-size: 11px;
  line-height: 1.35;
  color: rgba(235, 242, 255, 0.9);
}

.scope-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.scope-tab {
  flex: 1;
  border: 2px solid rgba(166, 184, 255, 0.45);
  border-radius: 10px;
  background: rgba(12, 25, 94, 0.55);
  color: #dce7ff;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.scope-tab.active {
  background: #0de28f;
  color: #08244d;
  border-color: #0de28f;
  font-weight: 700;
}

.scope-tab:hover {
  border-color: rgba(166, 184, 255, 0.7);
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.practica-section {
  margin-bottom: 24px;
}

.challenge-block {
  background: rgba(11, 22, 92, 0.75);
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 14px;
  box-shadow: 0 10px 20px rgba(7, 16, 72, 0.35);
  padding: 16px 12px 8px;
}

.challenge-block .section-desc {
  margin-bottom: 34px;
}

.practica-section h2 {
  font-size: 22px;
  margin-bottom: 6px;
  font-weight: 700;
}

.section-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12px;
}

.challenge-arena {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  margin-top: 0;
}

.vs-stage {
  position: relative;
  width: 100%;
  margin: 0;
  display: block;
}

.language-picker {
  position: absolute;
  left: 0;
  top: 0;
  transform: translateY(-100%);
  z-index: 8;
}

.language-picker-btn {
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 999px;
  background: rgba(9, 16, 65, 0.92);
  color: #edf4ff;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 10px;
  cursor: pointer;
}

.language-picker-menu {
  margin-top: 6px;
  background: rgba(7, 13, 52, 0.97);
  border: 1px solid rgba(166, 184, 255, 0.4);
  border-radius: 10px;
  padding: 6px;
  display: grid;
  gap: 4px;
  min-width: 160px;
}

.language-option {
  background: rgba(20, 32, 110, 0.85);
  border: 1px solid rgba(166, 184, 255, 0.35);
  color: #eff4ff;
  border-radius: 8px;
  font-size: 11px;
  text-align: left;
  padding: 6px 8px;
  cursor: pointer;
}

.language-option:hover {
  border-color: #0de28f;
  color: #0de28f;
}

.vs-piece {
  height: 210px;
  background: linear-gradient(180deg, #18257a 0%, #0f1a67 100%);
  border: 2px solid #0b1260;
  border-radius: 3px;
  clip-path: polygon(
    0 0,
    55% 0,
    50% 18%,
    60% 18%,
    44% 50%,
    60% 82%,
    50% 82%,
    55% 100%,
    45% 100%,
    50% 82%,
    40% 82%,
    56% 50%,
    40% 18%,
    50% 18%,
    45% 0,
    0 0,
    100% 0,
    100% 100%,
    0 100%
  );
  position: relative;
}

.vs-piece::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 190px;
  height: 100%;
  background: #040818;
  clip-path: polygon(
    54% 0,
    76% 9%,
    45% 20%,
    70% 30%,
    36% 41%,
    68% 52%,
    32% 64%,
    64% 76%,
    28% 88%,
    46% 100%,
    39% 100%,
    18% 90%,
    52% 78%,
    22% 66%,
    56% 54%,
    26% 42%,
    60% 30%,
    30% 19%,
    66% 8%,
    46% 0
  );
  opacity: 0.97;
  z-index: 2;
}

.vs-piece::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 150px;
  height: 100%;
  background: linear-gradient(180deg, #1f3cff 0%, #2c49ff 100%);
  filter: none;
  clip-path: polygon(52% 0, 70% 9%, 44% 20%, 67% 31%, 38% 42%, 66% 53%, 34% 64%, 62% 75%, 31% 87%, 47% 100%, 43% 100%, 27% 88%, 57% 76%, 30% 65%, 60% 54%, 33% 43%, 63% 32%, 36% 21%, 67% 9%, 48% 0);
  z-index: 3;
}

.vs-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  font-weight: 900;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.vs-circle-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
  display: block;
}

.vs-circle-user {
  background: #f2f2f2;
  border: 2px solid #e4e4e4;
  left: 22%;
}

.vs-circle-opponent {
  background: #050505;
  color: #f8f8f8;
  border: 2px solid #0f0f0f;
  right: 22%;
}

.vs-circle-opponent.searching {
  animation: pulseSearch 0.45s ease-in-out infinite;
}

.vs-burst {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 102px;
  height: 102px;
  background: #ffe03a;
  color: #1d1d1d;
  font-weight: 900;
  font-size: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  clip-path: polygon(50% 0%, 62% 17%, 82% 8%, 78% 30%, 100% 34%, 86% 50%, 100% 66%, 78% 70%, 82% 92%, 62% 83%, 50% 100%, 38% 83%, 18% 92%, 22% 70%, 0% 66%, 14% 50%, 0% 34%, 22% 30%, 18% 8%, 38% 17%);
  border: 3px solid #ffd000;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.35);
  z-index: 6;
}

.vs-start-btn {
  width: fit-content;
  position: absolute;
  left: 50%;
  top: 76%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #ffe07a 0%, #ffbe2a 100%);
  color: #182045;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  z-index: 7;
}

.vs-start-btn:hover:not(:disabled) {
  transform: translateX(-50%) translateY(-1px);
}

.vs-start-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.challenge-status-live {
  margin: 8px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  min-height: 18px;
}

.challenge-headline,
.challenge-language-pill,
.challenge-template-wrap,
.challenge-template-image,
.challenge-overlay-avatar,
.challenge-overlay-avatar-user,
.challenge-overlay-avatar-opponent,
.challenge-overlay-photo,
.challenge-overlay-vs,
.challenge-overlay-label,
.challenge-overlay-label-user,
.challenge-overlay-label-opponent,
.challenge-overlay-start,
.arena-control,
.arena-control.compact,
.arena-select,
.challenge-status {
  display: none;
}

@media (max-width: 480px) {
  .result-scores {
    grid-template-columns: 1fr;
  }

  .language-picker {
    left: 0;
    top: 0;
    transform: translateY(-100%);
  }

  .language-picker-btn {
    font-size: 10px;
    padding: 5px 8px;
  }

  .language-picker-menu {
    min-width: 138px;
  }

  .vs-piece {
    height: 160px;
  }

  .vs-piece::before {
    width: 150px;
  }

  .vs-piece::after {
    width: 116px;
  }

  .vs-circle {
    width: 74px;
    height: 74px;
    font-size: 46px;
  }

  .vs-circle-user {
    left: 14%;
  }

  .vs-circle-opponent {
    right: 14%;
  }

  .vs-burst {
    width: 78px;
    height: 78px;
    font-size: 30px;
  }

  .vs-start-btn {
    width: fit-content;
    top: 77%;
    padding: 7px 12px;
    font-size: 12px;
  }

  .repo-categories-circles {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 8px;
  }
}

@keyframes pulseSearch {
  0% {
    box-shadow: 0 0 0 0 rgba(13, 226, 143, 0.25);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(13, 226, 143, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(13, 226, 143, 0);
  }
}

.challenges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.challenge-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  background: rgba(18, 28, 120, 0.7);
  border: 2px solid rgba(166, 184, 255, 0.45);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.challenge-card:hover {
  background: rgba(18, 28, 120, 0.95);
  border-color: #0de28f;
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(35, 61, 255, 0.4);
}

.challenge-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.challenge-card h3 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
}

.challenge-card p {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

.repo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.repo-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.community-block {
  background: rgba(11, 22, 92, 0.75);
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 14px;
  box-shadow: 0 10px 20px rgba(7, 16, 72, 0.35);
  padding: 12px;
}

.btn-upload {
  background: linear-gradient(135deg, #0de28f 0%, #00d887 100%);
  color: #08244d;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-upload:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(13, 226, 143, 0.4);
}

.repo-categories {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.repo-categories-circles {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.category-circle-item {
  background: transparent;
  border: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.category-circle-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: rgba(12, 25, 94, 0.85);
  border: 1px solid rgba(166, 184, 255, 0.45);
  transition: all 0.25s ease;
}

.category-circle-image {
  width: 70%;
  height: 70%;
  object-fit: contain;
  display: block;
}

.category-circle-name {
  font-size: 11px;
  font-weight: 700;
  color: #dce7ff;
}

.category-circle-item.active .category-circle-icon {
  border-color: #0de28f;
  box-shadow: 0 0 0 2px rgba(13, 226, 143, 0.2);
  background: rgba(13, 226, 143, 0.18);
}

.category-circle-item.active .category-circle-name {
  color: #0de28f;
}

.category-filter {
  background: rgba(12, 25, 94, 0.7);
  border: 1px solid rgba(166, 184, 255, 0.45);
  color: #dce7ff;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-filter.active {
  background: #0de28f;
  color: #08244d;
  border-color: #0de28f;
  font-weight: 700;
}

.repo-grid {
  display: grid;
  gap: 10px;
}

.repo-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: start;
  padding: 12px;
  background: rgba(18, 28, 120, 0.7);
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.repo-item:hover {
  background: rgba(18, 28, 120, 0.95);
  border-color: rgba(166, 184, 255, 0.7);
}

.repo-info {
  min-width: 0;
}

.repo-info h4 {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 700;
  color: #f3f8ff;
}

.repo-desc {
  margin: 0 0 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

.repo-meta {
  display: flex;
  gap: 8px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
}

.repo-actions {
  text-align: right;
}

.repo-link {
  color: #0de28f;
  text-decoration: none;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.repo-link:hover {
  color: #00d887;
}

.comunidad-feed {
  margin-bottom: 20px;
  padding: 12px;
  background: rgba(18, 28, 120, 0.7);
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 12px;
}

.community-scope-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.community-scope-tab {
  border: 1px solid rgba(166, 184, 255, 0.45);
  background: rgba(12, 25, 94, 0.55);
  color: #dce7ff;
  border-radius: 999px;
  padding: 6px 11px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.community-scope-tab.active {
  border-color: #0de28f;
  color: #08244d;
  background: #0de28f;
}

.notifications-trigger {
  margin-left: auto;
  border: 1px solid rgba(166, 184, 255, 0.45);
  background: rgba(12, 25, 94, 0.55);
  color: #dce7ff;
  border-radius: 999px;
  padding: 6px 11px;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.notifications-badge {
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ff5a66;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
}

.notifications-panel {
  margin: 0 0 12px;
  padding: 10px;
  background: rgba(10, 20, 84, 0.75);
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 12px;
}

.notifications-empty {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
}

.notifications-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(166, 184, 255, 0.3);
  border-radius: 10px;
  padding: 8px;
  background: rgba(12, 25, 94, 0.5);
  cursor: pointer;
}

.notification-item.unread {
  border-color: rgba(13, 226, 143, 0.6);
  background: rgba(13, 226, 143, 0.14);
}

.notification-icon {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.13);
  font-size: 14px;
}

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-text {
  margin: 0 0 2px;
  font-size: 12px;
  color: #f3f8ff;
  line-height: 1.35;
}

.notification-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 10px;
}

.notification-count {
  min-width: 22px;
  height: 22px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.14);
  color: #dce7ff;
  font-size: 10px;
  font-weight: 700;
}

.post-composer {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.composer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.composer-avatar-default {
  background: rgba(35, 61, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.composer-input {
  flex: 1;
  background: rgba(12, 25, 94, 0.6);
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 8px;
  padding: 10px 12px;
  color: #fff;
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
}

.composer-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.btn-publish {
  background: linear-gradient(135deg, #0de28f 0%, #00d887 100%);
  color: #08244d;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: fit-content;
  margin-left: auto;
  display: block;
}

.composer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.btn-project {
  background: rgba(12, 25, 94, 0.75);
  color: #dce7ff;
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 8px;
  padding: 10px 14px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-project:hover {
  border-color: #0de28f;
  color: #0de28f;
}

.repo-delete {
  border: 1px solid rgba(255, 120, 130, 0.6);
  background: rgba(255, 90, 102, 0.16);
  color: #ffd5d9;
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.repo-delete:hover {
  border-color: rgba(255, 120, 130, 0.95);
  color: #ffffff;
}

.btn-publish:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(13, 226, 143, 0.4);
}

.feed-container {
  max-height: none;
  overflow: visible;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.7);
}

.empty-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

.feed {
  display: grid;
  gap: 12px;
}

.community-post {
  padding: 14px;
  background: rgba(18, 28, 120, 0.7);
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.community-post:hover {
  background: rgba(18, 28, 120, 0.95);
  border-color: rgba(166, 184, 255, 0.7);
}

.post-header {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.post-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  cursor: pointer;
}

.post-avatar-default {
  background: rgba(35, 61, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.post-user-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.post-user-info h4 {
  margin: 0 0 2px;
  font-size: 13px;
  font-weight: 700;
  color: #f3f8ff;
}

.post-user-bio {
  margin: 0 0 2px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.74);
  line-height: 1.35;
}

.post-meta {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.post-content {
  margin-bottom: 10px;
}

.post-text {
  margin: 0 0 8px;
  font-size: 13px;
  color: #f3f8ff;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.post-expand-btn {
  border: 1px solid rgba(166, 184, 255, 0.45);
  background: rgba(12, 25, 94, 0.55);
  color: #cfe0ff;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 8px;
}

.post-expand-btn:hover {
  border-color: #0de28f;
  color: #0de28f;
}

.post-project-card {
  margin-top: 8px;
  padding: 10px;
  border: 1px solid rgba(13, 226, 143, 0.5);
  border-radius: 10px;
  background: rgba(12, 25, 94, 0.55);
}

.post-project-category {
  margin: 0 0 4px;
  font-size: 10px;
  color: #0de28f;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.post-project-title {
  margin: 0 0 6px;
  font-size: 13px;
  color: #f3f8ff;
  font-weight: 700;
}

.post-project-description {
  margin: 0 0 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
}

.post-project-link {
  color: #0de28f;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

.post-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(166, 184, 255, 0.2);
}

.action-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.action-icon {
  width: 15px;
  height: 15px;
  object-fit: contain;
}

.like-btn.active {
  color: #ff5a66;
  font-weight: 700;
}

.action-btn:hover {
  color: #0de28f;
}

.action-btn.active {
  color: #0de28f;
  font-weight: 700;
}

.action-btn-danger {
  color: #ff9ea5;
}

.action-btn-danger:hover {
  color: #ff5a66;
}

.action-btn-warning {
  color: #ffd37f;
}

.action-btn-warning:hover {
  color: #ffbe2a;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.admin-mode-banner {
  background: rgba(173, 62, 62, 0.35);
  border: 1px solid rgba(255, 170, 170, 0.5);
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.admin-mode-banner p {
  margin: 0;
  font-size: 12px;
  color: #ffecec;
}

.admin-logout-btn {
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.admin-logout-btn:hover {
  border-color: rgba(255, 255, 255, 0.75);
}

.admin-feedback {
  margin: 10px 0 0;
  font-size: 11px;
  color: #ffd8d8;
}

.friend-profile-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2200;
  padding: 20px;
}

.friend-profile-card {
  width: 100%;
  max-width: 400px;
  border-radius: 24px;
  background: linear-gradient(180deg, #382b79 0%, #2c2262 100%);
  border: 1px solid rgba(166, 184, 255, 0.45);
  box-shadow: 0 20px 40px rgba(2, 8, 53, 0.6);
  position: relative;
  padding: 22px 18px;
}

.modal-close-friend {
  position: absolute;
  top: 8px;
  right: 10px;
  border: none;
  background: transparent;
  color: rgba(230, 239, 255, 0.9);
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
}

.friend-profile-header {
  display: flex;
  justify-content: center;
  margin: 10px 0 8px;
}

.friend-profile-avatar,
.friend-profile-avatar-default {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.35);
}

.friend-profile-avatar-default {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  background: rgba(255, 255, 255, 0.12);
}

.friend-profile-content {
  text-align: center;
}

.friend-profile-name {
  margin: 0;
  font-size: 20px;
}

.friend-profile-username {
  margin: 4px 0 14px;
  font-size: 13px;
  color: rgba(226, 236, 255, 0.86);
}

.friend-profile-bio {
  margin: 0 0 14px;
  font-size: 12px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.85);
}

.friend-profile-league {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 0 10px;
}

.friend-profile-league-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.friend-profile-league-name {
  font-size: 13px;
  font-weight: 700;
  color: #9df3b6;
}

.friend-profile-type {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px;
}

.type-label {
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
}

.type-value {
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
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
  margin-bottom: 12px;
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

.send-friend-request-btn {
  width: auto;
  flex: 1;
  min-width: 0;
  border: none;
  border-radius: 999px;
  padding: 8px 10px;
  background: linear-gradient(135deg, #0de28f 0%, #00d887 100%);
  color: #08244d;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}

.friend-actions-row {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.send-friend-request-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-friend-request-btn.active {
  background: rgba(13, 226, 143, 0.16);
  border: 1px solid rgba(13, 226, 143, 0.8);
  color: #9df3b6;
}

.projects-btn {
  margin-top: 8px;
  width: 100%;
  background: linear-gradient(135deg, #6a86ff 0%, #4f6df2 100%);
  color: #eef3ff;
}

.friend-request-feedback {
  margin: 10px 0 0;
  font-size: 11px;
  color: #d6e9ff;
}

.projects-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2400;
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
}

.project-post-card {
  border: 1px solid rgba(13, 226, 143, 0.45);
  border-radius: 10px;
  padding: 9px;
  background: rgba(13, 226, 143, 0.08);
}

.project-post-category {
  margin: 0 0 4px;
  font-size: 11px;
  font-weight: 700;
  color: #9df3b6;
}

.project-post-title {
  margin: 0 0 4px;
  font-size: 16px;
  color: #f3f8ff;
}

.project-post-description {
  margin: 0 0 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.82);
}

.project-post-link {
  color: #0de28f;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
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

.comments-panel {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(166, 184, 255, 0.2);
}

.comments-empty {
  margin: 0 0 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
}

.comments-list {
  display: grid;
  gap: 8px;
  margin-bottom: 10px;
}

.comment-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.comment-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-avatar-default {
  background: rgba(35, 61, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.comment-content {
  min-width: 0;
}

.comment-author {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  color: #f3f8ff;
}

.comment-text {
  margin: 2px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.comment-composer {
  display: flex;
  gap: 8px;
}

.comment-input {
  flex: 1;
  background: rgba(12, 25, 94, 0.6);
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 8px;
  padding: 8px 10px;
  color: #fff;
  font-size: 12px;
}

.comment-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.comment-send {
  background: rgba(13, 226, 143, 0.18);
  border: 1px solid rgba(13, 226, 143, 0.8);
  color: #0de28f;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal-content {
  background: linear-gradient(180deg, #1f3cff 0%, #2c49ff 100%);
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 16px;
  padding: 20px;
  max-width: 500px;
  width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(12, 25, 94, 0.6);
  border: 1px solid rgba(166, 184, 255, 0.45);
  color: #fff;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(12, 25, 94, 0.9);
}

.modal-content h2 {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 700;
}

.upload-form {
  display: grid;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 12px;
  font-weight: 600;
  color: #f3f8ff;
}

.form-input,
.form-select,
.form-textarea {
  background: rgba(12, 25, 94, 0.6);
  border: 1px solid rgba(166, 184, 255, 0.45);
  border-radius: 8px;
  padding: 10px;
  color: #fff;
  font-size: 12px;
  font-family: inherit;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.btn-upload-submit {
  background: linear-gradient(135deg, #0de28f 0%, #00d887 100%);
  color: #08244d;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  grid-column: 1 / -1;
}

.btn-upload-submit:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(13, 226, 143, 0.4);
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

@media (max-width: 480px) {
  .content-area {
    padding: 12px;
  }

  .challenge-workspace {
    gap: 8px;
  }

  .workspace-grid {
    grid-template-columns: 1fr;
  }

  .workspace-editor {
    min-height: 380px;
  }

  .preview-frame {
    height: 150px;
  }

  .mysql-output {
    height: 150px;
  }

  .java-output {
    height: 150px;
  }

  .python-output {
    height: 150px;
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

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
