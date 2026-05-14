const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Streak = require('../models/Streak');
const Friendship = require('../models/Friendship');
const UserLanguageProgress = require('../models/UserLanguageProgress');
const CommunityPost = require('../models/CommunityPost');
const Notification = require('../models/Notification');
const Follow = require('../models/Follow');
const BattleRequest = require('../models/BattleRequest');
const BattleMatch = require('../models/BattleMatch');

let io = null;

const initSocketIO = (server) => {
  io = require('socket.io')(server);
  return io;
};

const router = express.Router();

const LEVELS_PER_LANGUAGE = 30;
const MS_IN_DAY = 24 * 60 * 60 * 1000;
const MS_IN_WEEK = 7 * MS_IN_DAY;
const POINTS_PER_LEVEL = 2;
const LANGUAGE_POOL = ['HTML', 'CSS', 'JavaScript', 'Node.js', 'SQL', 'Python', 'Java', 'PHP'];
const PUBLIC_USER_FILTER = {
  role: { $ne: 'admin' },
  isBanned: { $ne: true },
};
const BATTLE_LANGUAGES = ['Python', 'Java', 'SQL', 'HTML/CSS'];
const BATTLE_REQUEST_TTL_MS = 10 * 60 * 1000;

const getLeagueForPoints = (points) => {
  if (points >= 1000) return { key: 'legendary-lead', name: 'Legendary Lead', image: '/images/6.png' };
  if (points >= 800) return { key: 'tech-architect', name: 'Tech Architect', image: '/images/5.png' };
  if (points >= 600) return { key: 'software-engineer', name: 'Software Engineer', image: '/images/4.png' };
  if (points >= 400) return { key: 'stack-crafter', name: 'Stack Crafter', image: '/images/3.png' };
  if (points >= 200) return { key: 'code-builder', name: 'Code Builder', image: '/images/2.png' };
  return { key: 'junior-explorer', name: 'Junior Explorer', image: '/images/1.png' };
};

const normalizeDate = (inputDate = new Date()) => {
  const date = new Date(inputDate);
  date.setHours(0, 0, 0, 0);
  return date;
};

const toDateKey = (inputDate = new Date()) => {
  const date = normalizeDate(inputDate);
  return date.toISOString().slice(0, 10);
};

const daysBetween = (laterDate, earlierDate) => {
  const later = normalizeDate(laterDate).getTime();
  const earlier = normalizeDate(earlierDate).getTime();
  return Math.floor((later - earlier) / MS_IN_DAY);
};

const canUseWeeklyRestore = (lastRestoreAt) => {
  if (!lastRestoreAt) return true;
  return Date.now() - new Date(lastRestoreAt).getTime() >= MS_IN_WEEK;
};

const getOrCreateStreak = async (userId) => {
  const streak = await Streak.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        consecutiveActiveDays: 0,
        maxStreak: 0,
        activityDates: [],
      },
    },
    {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
    }
  );

  return streak;
};

const updateStreakWithActivity = (streak, nowDate = new Date()) => {
  const today = normalizeDate(nowDate);
  const todayKey = toDateKey(today);

  if (!streak.lastActivityDate) {
    streak.consecutiveActiveDays = 1;
    streak.maxStreak = Math.max(streak.maxStreak || 0, 1);
    streak.lastActivityDate = today;
    streak.activityDates = [...new Set([...(streak.activityDates || []), todayKey])];
    return { alreadyRegistered: false, broken: false };
  }

  const gap = daysBetween(today, streak.lastActivityDate);

  if (gap <= 0) {
    streak.activityDates = [...new Set([...(streak.activityDates || []), todayKey])];
    return { alreadyRegistered: true, broken: false };
  }

  if (gap === 1) {
    streak.consecutiveActiveDays = (streak.consecutiveActiveDays || 0) + 1;
    streak.maxStreak = Math.max(streak.maxStreak || 0, streak.consecutiveActiveDays);
    streak.lastActivityDate = today;
    streak.activityDates = [...new Set([...(streak.activityDates || []), todayKey])];
    streak.recoverableStreak = 0;
    return { alreadyRegistered: false, broken: false };
  }

  streak.recoverableStreak = streak.consecutiveActiveDays || 0;
  streak.consecutiveActiveDays = 1;
  streak.lastActivityDate = today;
  streak.activityDates = [...new Set([...(streak.activityDates || []), todayKey])];
  return { alreadyRegistered: false, broken: true };
};

const buildYearCalendar = (activityDates = [], year = new Date().getFullYear()) => {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const active = new Set((activityDates || []).filter((key) => key.startsWith(String(year))));
  const days = [];

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateKey = toDateKey(date);
    days.push({
      date: dateKey,
      month: date.getMonth() + 1,
      day: date.getDate(),
      active: active.has(dateKey),
    });
  }

  return days;
};

const sanitizeText = (value) => String(value || '').trim();
const sanitizeUrl = (value) => String(value || '').trim();

const toObjectIdList = (values = []) => {
  const unique = [...new Set((values || []).map((value) => String(value || '')).filter(Boolean))];
  return unique
    .filter((value) => mongoose.Types.ObjectId.isValid(value))
    .map((value) => new mongoose.Types.ObjectId(value));
};

const parsePositiveInt = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
};

const parsePagination = (query = {}, defaults = {}) => {
  const page = parsePositiveInt(query.page, defaults.page || 1);
  const requestedLimit = parsePositiveInt(query.limit, defaults.limit || 20);
  const maxLimit = defaults.maxLimit || 100;
  const limit = Math.min(requestedLimit, maxLimit);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const isCompactMode = (query = {}) => {
  const value = String(query?.compact || '').trim().toLowerCase();
  return value === '1' || value === 'true' || value === 'yes';
};

const buildUserPointsMap = async (userIds = []) => {
  const ids = toObjectIdList(userIds);
  if (ids.length === 0) {
    return new Map();
  }

  const aggregated = await UserLanguageProgress.aggregate([
    { $match: { userId: { $in: ids } } },
    { $group: { _id: '$userId', totalPoints: { $sum: { $ifNull: ['$totalPoints', 0] } } } },
  ]);

  return new Map(aggregated.map((item) => [String(item._id), Number(item.totalPoints || 0)]));
};

const isAdminUser = (user) => String(user?.role || 'user') === 'admin';

const getUserByIdOrNull = async (userId, projection = {}) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;
  return User.findById(userId, projection).lean();
};

const buildBannedMessage = (user) => {
  const reason = sanitizeText(user?.bannedReason || '');
  return reason
    ? `Tu cuenta está baneada y no puede usar la comunidad. Motivo: ${reason}`
    : 'Tu cuenta está baneada y no puede usar la comunidad.';
};

const normalizeBattleLanguage = (value) => {
  const clean = sanitizeText(value);
  const found = BATTLE_LANGUAGES.find((language) => language.toLowerCase() === clean.toLowerCase());
  return found || '';
};

const areUsersFriends = async (userAId, userBId) => {
  const friendship = await Friendship.findOne({
    status: 'accepted',
    $or: [
      { userId: userAId, friendId: userBId },
      { userId: userBId, friendId: userAId },
    ],
  }).lean();

  return Boolean(friendship);
};

const getEntityUserId = (entity) => String(entity?._id || entity || '');

const buildBattleResultPayload = (match, userId) => {
  const targetScore = Number(match.targetScore || 90);
  const challengerScore = Number(match.challengerSubmission?.score || 0);
  const challengedScore = Number(match.challengedSubmission?.score || 0);
  const userIsChallenger = getEntityUserId(match.challengerUserId) === String(userId);
  const userScore = userIsChallenger ? challengerScore : challengedScore;
  const rivalScore = userIsChallenger ? challengedScore : challengerScore;
  const winnerUserId = String(match.winnerUserId || '');
  const winnerIsUser = winnerUserId.length > 0 && winnerUserId === String(userId);

  return {
    targetScore,
    userScore,
    rivalScore,
    winnerUserId,
    winnerIsUser,
    finishedAt: match.finishedAt,
  };
};

const resolveBattleWinner = (match) => {
  const targetScore = Number(match.targetScore || 90);
  const challengerScore = Number(match.challengerSubmission?.score || 0);
  const challengedScore = Number(match.challengedSubmission?.score || 0);
  const challengerDistance = Math.abs(targetScore - challengerScore);
  const challengedDistance = Math.abs(targetScore - challengedScore);

  if (challengedDistance < challengerDistance) {
    return getEntityUserId(match.challengedUserId);
  }

  return getEntityUserId(match.challengerUserId);
};

const ensureActiveActor = async (userId, res, options = {}) => {
  const { allowAdmin = true } = options;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ message: 'Usuario invalido.' });
    return null;
  }

  const actor = await User.findById(userId, { role: 1, isBanned: 1, bannedReason: 1 }).lean();
  if (!actor) {
    res.status(404).json({ message: 'Usuario no encontrado.' });
    return null;
  }

  if (actor.isBanned) {
    res.status(403).json({ message: buildBannedMessage(actor) });
    return null;
  }

  if (!allowAdmin && isAdminUser(actor)) {
    res.status(403).json({ message: 'Acción no permitida para administradores.' });
    return null;
  }

  return actor;
};

const buildNotificationText = (type, actorName = 'Alguien') => {
  if (type === 'like') return `${actorName} le dio like a tu publicación.`;
  if (type === 'comment') return `${actorName} comentó tu publicación.`;
  if (type === 'share') return `${actorName} compartió tu publicación.`;
  return `${actorName} interactuó con tu publicación.`;
};

const pushPostNotification = async ({ recipientUserId, actorUserId, postId, type }) => {
  if (!recipientUserId || !actorUserId || !postId) return;
  if (String(recipientUserId) === String(actorUserId)) return;

  const actor = await User.findById(actorUserId, { fullName: 1, username: 1 }).lean();
  const actorName = actor?.fullName || actor?.username || 'Alguien';

  if (type === 'like') {
    const existing = await Notification.findOne({ userId: recipientUserId, postId, type: 'like' });
    if (existing) {
      existing.actorId = actorUserId;
      existing.count = Number(existing.count || 0) + 1;
      existing.text = buildNotificationText('like', actorName);
      existing.isRead = false;
      existing.lastTriggeredAt = new Date();
      await existing.save();
      return;
    }
  }

  await Notification.create({
    userId: recipientUserId,
    actorId: actorUserId,
    postId,
    type,
    count: 1,
    text: buildNotificationText(type, actorName),
    isRead: false,
    lastTriggeredAt: new Date(),
  });
};

const buildCompactInteractionPayload = (post, userId, extras = {}) => {
  const likes = Array.isArray(post?.likes) ? post.likes : [];
  const comments = Array.isArray(post?.comments) ? post.comments : [];
  const savedBy = Array.isArray(post?.savedBy) ? post.savedBy : [];

  return {
    id: String(post?._id || ''),
    likedByMe: likes.some((id) => String(id) === String(userId || '')),
    likes: likes.length,
    commentsCount: comments.length,
    savedByMe: savedBy.some((id) => String(id) === String(userId || '')),
    savedCount: savedBy.length,
    shareCount: Number(post?.shareCount || 0),
    ...extras,
  };
};

const formatCommunityPost = (postDoc, viewerUserId = '', viewerIsAdmin = false) => {
  const post = postDoc?.toObject ? postDoc.toObject() : postDoc;

  const postUser = post?.userId || {};
  const hiddenAuthor = !viewerIsAdmin && (postUser?.isBanned || postUser?.role === 'admin');
  if (hiddenAuthor) return null;

  const likedByMe = Array.isArray(post?.likes)
    ? post.likes.some((id) => String(id) === String(viewerUserId || ''))
    : false;
  const savedByMe = Array.isArray(post?.savedBy)
    ? post.savedBy.some((id) => String(id) === String(viewerUserId || ''))
    : false;

  const formattedComments = Array.isArray(post?.comments)
    ? post.comments
      .filter((comment) => {
        const commentUser = comment?.userId || {};
        if (viewerIsAdmin) return true;
        return !commentUser?.isBanned && commentUser?.role !== 'admin';
      })
      .map((comment) => {
      const commentUser = comment?.userId || {};

      return {
        id: String(comment?._id || ''),
        userId: String(commentUser?._id || comment?.userId || ''),
        username: commentUser?.username || 'usuario',
        fullName: commentUser?.fullName || commentUser?.username || 'usuario',
        avatar: commentUser?.avatarUrl || '',
        text: comment?.text || '',
        createdAt: comment?.createdAt || null,
      };
      })
    : [];

  return {
    id: String(post?._id || ''),
    userId: String(postUser?._id || post?.userId || ''),
    username: postUser?.username || 'usuario',
    fullName: postUser?.fullName || postUser?.username || 'usuario',
    bio: postUser?.bio || '',
    userRole: postUser?.role || 'user',
    isAuthorAdmin: postUser?.role === 'admin',
    avatar: postUser?.avatarUrl || '',
    type: post?.type || 'Compartio',
    createdAt: post?.createdAt || null,
    text: post?.text || '',
    achievement: post?.achievement || '',
    likes: Array.isArray(post?.likes) ? post.likes.length : 0,
    likedByMe,
    savedCount: Array.isArray(post?.savedBy) ? post.savedBy.length : 0,
    savedByMe,
    comments: formattedComments,
    commentsCount: formattedComments.length,
    shareCount: Number(post?.shareCount || 0),
    project: {
      title: sanitizeText(post?.project?.title),
      description: sanitizeText(post?.project?.description),
      url: sanitizeUrl(post?.project?.url),
      category: sanitizeText(post?.project?.category) || 'Proyectos',
    },
  };
};

const ensureAdminUserSeeded = async () => {
  const adminUsername = sanitizeText(process.env.ADMIN_USERNAME) || 'admin404';
  const adminEmail = sanitizeText(process.env.ADMIN_EMAIL) || 'admin@coding404.dev';
  const adminFullName = sanitizeText(process.env.ADMIN_FULL_NAME) || 'Administrador Coding 404';
  const adminProgrammerType = sanitizeText(process.env.ADMIN_PROGRAMMER_TYPE) || 'Administración';
  const adminPassword = String(process.env.ADMIN_PASSWORD || 'Admin404A').trim();

  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD vacío. Define una contraseña para el usuario administrador.');
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await User.findOneAndUpdate(
    { username: adminUsername.toLowerCase() },
    {
      fullName: adminFullName,
      email: adminEmail.toLowerCase(),
      username: adminUsername.toLowerCase(),
      passwordHash,
      programmerType: adminProgrammerType,
      role: 'admin',
      isBanned: false,
      bannedReason: '',
      bannedAt: null,
      bannedBy: null,
      learningPath: {
        preferredTrack: 'Administración',
        recommendedCourse: 'frontend',
        activeCourse: 'frontend',
        startedCourses: [],
        startedLessons: [],
        completedLessons: [],
      },
      github: { hasAccount: false, username: '' },
      avatarUrl: '',
    },
    {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
    }
  );
};

const ensureDemoUsersSeeded = async () => {
  await ensureAdminUserSeeded();

  const usersSeed = [
    { fullName: 'Kike Demo', email: 'kike@coding404.dev', username: 'kike', programmerType: 'Full-Stack', xpTarget: 900 },
    { fullName: 'Laura Front', email: 'laura@coding404.dev', username: 'laura', programmerType: 'Front-end', xpTarget: 700 },
    { fullName: 'Mario Back', email: 'mario@coding404.dev', username: 'mario', programmerType: 'Back-end', xpTarget: 500 },
    { fullName: 'Nora Data', email: 'nora@coding404.dev', username: 'nora', programmerType: 'Data', xpTarget: 300 },
    { fullName: 'Santi Dev', email: 'santi@coding404.dev', username: 'santi', programmerType: 'Full-Stack', xpTarget: 100 },
  ];

  const passwordHash = await bcrypt.hash('Demo1234', 10);

  // Avatar data URLs (simple colored gradients)
  const avatars = [
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAKPGWVYXV0b21hdGljPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigzNSw2MSwyNTUpO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDAsMTEwLDI1NSk7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIzMjAiIGZpbGw9InVybCgjZ3JhZDEpIiAvPgogIDx0ZXh0IHg9IjE2MCIgeT0iMTYwIiBmb250LXNpemU9IjEyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1mYW1pbHk9IkFyaWFsIj5LOjwvdGV4dD4KPC9zdmc+',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAKPGWEVLJ+UnZlcnRHeHA/PC9kZWZzPgogIDxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMzIwIiBmaWxsPSJ1cmwoI2dyYWQyKSIgLz4KICAKICAKICAKICAKICAKICAKPJMDAGATAGVT0JCA8L3N2Zz4='
  ];

  // Create avatars for demo users
  const createSimpleAvatar = (initial, color1, color2) => {
    const svg = `<svg width="320" height="320" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="320" height="320" fill="url(#grad)" />
      <text x="160" y="160" font-size="140" fill="white" text-anchor="middle" dy=".3em" font-weight="bold" font-family="Arial">${initial}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  };

  const avatarMap = {
    kike: createSimpleAvatar('K', '#233dff', '#006eff'),
    laura: createSimpleAvatar('L', '#ff6b9d', '#ff1178'),
    mario: createSimpleAvatar('M', '#00d887', '#00b857'),
    nora: createSimpleAvatar('N', '#ffa500', '#ff7700'),
    santi: createSimpleAvatar('S', '#9d4edd', '#7209b7'),
  };

  for (const item of usersSeed) {
    const user = await User.findOneAndUpdate(
      { username: item.username },
      {
        ...item,
        passwordHash,
        role: 'user',
        isBanned: false,
        github: { hasAccount: false, username: '' },
        avatarUrl: avatarMap[item.username] || '',
      },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
      }
    );

    await getOrCreateStreak(user._id);
  }

  const demoUsers = await User.find({ username: { $in: usersSeed.map((item) => item.username) } }).lean();
  const mapByUsername = new Map(demoUsers.map((item) => [item.username, item]));

  const targetXpByUser = {
    kike: 900,
    laura: 700,
    mario: 500,
    nora: 300,
    santi: 100,
  };

  for (const username of Object.keys(targetXpByUser)) {
    const targetXp = targetXpByUser[username] || 0;
    const targetLevels = Math.floor(targetXp / POINTS_PER_LEVEL);
    const user = mapByUsername.get(username);
    if (!user) continue;

    const existingProgress = await UserLanguageProgress.findOne({ userId: user._id });
    if (existingProgress) continue;

    let remainingLevels = targetLevels;
    let languageIndex = 0;

    while (remainingLevels > 0) {
      const chunkLevels = Math.min(LEVELS_PER_LANGUAGE, remainingLevels);
      const languageName = languageIndex < LANGUAGE_POOL.length
        ? LANGUAGE_POOL[languageIndex]
        : `DEMO-${username.toUpperCase()}-${languageIndex - LANGUAGE_POOL.length + 1}`;

      await UserLanguageProgress.findOneAndUpdate(
        { userId: user._id, language: languageName },
        {
          userId: user._id,
          language: languageName,
          completedLevels: Array.from({ length: chunkLevels }, (_, index) => index + 1),
          completionPercentage: Math.min(100, Math.round((chunkLevels / LEVELS_PER_LANGUAGE) * 100)),
          totalPoints: chunkLevels * POINTS_PER_LEVEL,
          startedAt: new Date('2026-01-01T00:00:00.000Z'),
          completedAt: chunkLevels >= LEVELS_PER_LANGUAGE ? new Date('2026-02-01T00:00:00.000Z') : null,
          lastActivityAt: new Date(),
        },
        {
          upsert: true,
          returnDocument: 'after',
          setDefaultsOnInsert: true,
        }
      );

      remainingLevels -= chunkLevels;
      languageIndex += 1;
    }
  }

  const acceptedPairs = [
    ['kike', 'laura'],
    ['kike', 'mario'],
    ['laura', 'santi'],
  ];

  for (const [sender, receiver] of acceptedPairs) {
    const userA = mapByUsername.get(sender);
    const userB = mapByUsername.get(receiver);
    if (!userA || !userB) continue;

    await Friendship.findOneAndUpdate(
      {
        $or: [
          { userId: userA._id, friendId: userB._id },
          { userId: userB._id, friendId: userA._id },
        ],
      },
      {
        userId: userA._id,
        friendId: userB._id,
        status: 'accepted',
        requestedAt: new Date('2026-01-15T00:00:00.000Z'),
        establishedAt: new Date('2026-01-16T00:00:00.000Z'),
      },
      {
        upsert: true,
        returnDocument: 'after',
      }
    );
  }

  const pendingFromNora = mapByUsername.get('nora');
  const pendingToKike = mapByUsername.get('kike');
  if (pendingFromNora && pendingToKike) {
    await Friendship.findOneAndUpdate(
      {
        $or: [
          { userId: pendingFromNora._id, friendId: pendingToKike._id },
          { userId: pendingToKike._id, friendId: pendingFromNora._id },
        ],
      },
      {
        userId: pendingFromNora._id,
        friendId: pendingToKike._id,
        status: 'pending',
        requestedAt: new Date(),
        establishedAt: null,
      },
      {
        upsert: true,
        returnDocument: 'after',
      }
    );
  }

  const demoCommunityPosts = [
    {
      username: 'kike',
      type: 'Completado',
      text: 'Acabo de terminar un reto de Node.js con rutas y middlewares. Hoy por fin lo entendi bien.',
      achievement: 'Completo modulo de APIs REST',
      likedBy: ['laura', 'mario'],
      comments: [
        { username: 'laura', text: 'Muy bueno, te quedo super claro.' },
      ],
      shareCount: 2,
    },
    {
      username: 'laura',
      type: 'Compartio',
      text: 'Subi un mini proyecto de landing responsive con animaciones suaves y buen rendimiento.',
      achievement: 'Publico proyecto Front-end',
      likedBy: ['kike', 'santi'],
      comments: [
        { username: 'kike', text: 'Se ve genial en movil.' },
      ],
      shareCount: 1,
    },
    {
      username: 'mario',
      type: 'Completado',
      text: 'Hoy practique consultas SQL con joins y subconsultas. Ya me siento mucho mas comodo.',
      achievement: 'Completo nivel SQL intermedio',
      likedBy: ['kike', 'nora'],
      comments: [
        { username: 'nora', text: 'Gran avance, ahora a por optimizacion.' },
      ],
      shareCount: 0,
    },
    {
      username: 'nora',
      type: 'Compartio',
      text: 'Comparti una guia corta de estructuras de datos para quienes empiezan con arboles y grafos.',
      achievement: 'Publico guia de estructuras',
      likedBy: ['laura'],
      comments: [
        { username: 'mario', text: 'Me sirvio para repasar conceptos base.' },
      ],
      shareCount: 3,
    },
    {
      username: 'santi',
      type: 'Completado',
      text: 'Primera semana seguida estudiando. Termine ejercicios de JavaScript sobre arrays y funciones.',
      achievement: 'Racha de 7 dias',
      likedBy: ['kike', 'laura', 'mario'],
      comments: [
        { username: 'kike', text: 'Vamos con todo, sigue asi.' },
      ],
      shareCount: 1,
    },
    {
      username: 'kike',
      type: 'Proyecto',
      text: 'Comparto mi API de tareas con autenticacion y roles para practicar backend.',
      achievement: 'Publico proyecto Backend',
      project: {
        category: 'Proyectos',
        title: 'TaskFlow API',
        description: 'API REST con JWT, permisos por rol y tests basicos.',
        url: 'https://github.com/example/taskflow-api',
      },
      likedBy: ['laura', 'mario', 'nora'],
      comments: [
        { username: 'laura', text: 'Muy limpia la estructura de carpetas.' },
      ],
      shareCount: 4,
    },
    {
      username: 'laura',
      type: 'Proyecto',
      text: 'Subi un dashboard para seguimiento de habitos con graficas y filtros.',
      achievement: 'Publico proyecto UI',
      project: {
        category: 'Proyectos',
        title: 'Habit Dashboard',
        description: 'Dashboard responsive con Vue y componentes reutilizables.',
        url: 'https://github.com/example/habit-dashboard',
      },
      likedBy: ['kike', 'santi'],
      comments: [
        { username: 'santi', text: 'Los colores y el layout quedaron top.' },
      ],
      shareCount: 2,
    },
    {
      username: 'mario',
      type: 'Compartio',
      text: 'Dejo una explicacion corta de Dijkstra con ejemplo paso a paso para caminos minimos.',
      achievement: 'Guia de Algoritmos',
      likedBy: ['nora', 'kike'],
      comments: [
        { username: 'kike', text: 'Excelente para repasar grafos.' },
      ],
      shareCount: 3,
    },
    {
      username: 'nora',
      type: 'Completado',
      text: 'Implemente Trie y tabla hash para comparar rendimiento de busqueda.',
      achievement: 'Laboratorio de Estructuras',
      likedBy: ['mario', 'laura'],
      comments: [
        { username: 'mario', text: 'Buen enfoque para medir complejidad.' },
      ],
      shareCount: 1,
    },
    {
      username: 'santi',
      type: 'Compartio',
      text: 'Comparto chuleta de Git para rebase interactivo, squash y resolucion de conflictos.',
      achievement: 'Guia Git Team',
      likedBy: ['kike', 'laura', 'nora'],
      comments: [
        { username: 'laura', text: 'Justo lo que necesitaba para el equipo.' },
      ],
      shareCount: 5,
    },
    {
      username: 'kike',
      type: 'Completado',
      text: 'Termine el desafio de SQL modelando usuarios, swipes, matches y mensajes.',
      achievement: 'Desafio SQL completado',
      likedBy: ['mario', 'nora', 'santi'],
      comments: [
        { username: 'nora', text: 'Muy buen modelado de relaciones.' },
      ],
      shareCount: 2,
    },
    {
      username: 'laura',
      type: 'Compartio',
      text: 'Comparto snippets de animaciones CSS con transiciones suaves para cards.',
      achievement: 'Tips Front-end',
      likedBy: ['kike', 'santi'],
      comments: [
        { username: 'kike', text: 'Me viene perfecto para la comunidad.' },
      ],
      shareCount: 1,
    },
    {
      username: 'mario',
      type: 'Proyecto',
      text: 'Mini app para analizar logs y detectar errores frecuentes con patrones.',
      achievement: 'Publico herramienta DevOps',
      project: {
        category: 'Algoritmos',
        title: 'Log Pattern Analyzer',
        description: 'Procesa logs grandes y resume patrones por severidad.',
        url: 'https://github.com/example/log-pattern-analyzer',
      },
      likedBy: ['kike', 'santi'],
      comments: [
        { username: 'santi', text: 'Muy util para monitoreo rapido.' },
      ],
      shareCount: 2,
    },
    {
      username: 'nora',
      type: 'Proyecto',
      text: 'Subi implementacion de AVL y Heap con comparativa de insercion.',
      achievement: 'Proyecto Estructuras',
      project: {
        category: 'Estructuras',
        title: 'AVL vs Heap Playground',
        description: 'Comparador visual de inserciones y balanceo.',
        url: 'https://github.com/example/avl-heap-playground',
      },
      likedBy: ['mario', 'kike', 'laura'],
      comments: [
        { username: 'mario', text: 'Genial para explicar arboles balanceados.' },
      ],
      shareCount: 3,
    },
    {
      username: 'santi',
      type: 'Proyecto',
      text: 'Publico un flujo GitFlow simplificado para equipos pequenos.',
      achievement: 'Proyecto Git',
      project: {
        category: 'Git',
        title: 'GitFlow Lite',
        description: 'Propuesta simple de ramas, releases y hotfixes.',
        url: 'https://github.com/example/gitflow-lite',
      },
      likedBy: ['laura', 'kike'],
      comments: [
        { username: 'kike', text: 'Esto va directo a onboarding del equipo.' },
      ],
      shareCount: 2,
    },
  ];

  for (const postSeed of demoCommunityPosts) {
    const author = mapByUsername.get(postSeed.username);
    if (!author) continue;

    const exists = await CommunityPost.exists({
      userId: author._id,
      text: postSeed.text,
    });

    if (exists) continue;

    const likes = (postSeed.likedBy || [])
      .map((username) => mapByUsername.get(username)?._id)
      .filter(Boolean);

    const comments = (postSeed.comments || [])
      .map((comment) => {
        const commentUser = mapByUsername.get(comment.username);
        if (!commentUser) return null;

        return {
          userId: commentUser._id,
          text: comment.text,
          createdAt: new Date(),
        };
      })
      .filter(Boolean);

    await CommunityPost.create({
      userId: author._id,
      type: postSeed.type,
      text: postSeed.text,
      achievement: postSeed.achievement,
      likes,
      comments,
      shareCount: Number(postSeed.shareCount || 0),
      savedBy: [],
      project: postSeed.project
        ? {
            category: sanitizeText(postSeed.project.category) || 'Proyectos',
            title: sanitizeText(postSeed.project.title),
            description: sanitizeText(postSeed.project.description),
            url: sanitizeUrl(postSeed.project.url),
          }
        : {},
    });
  }

};

router.post('/activity/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Usuario inválido.' });
    }

    const streak = await getOrCreateStreak(userId);
    const status = updateStreakWithActivity(streak, new Date());
    await streak.save();

    return res.json({
      message: status.alreadyRegistered ? 'Actividad ya registrada hoy.' : 'Actividad registrada.',
      streak: {
        consecutiveActiveDays: streak.consecutiveActiveDays,
        maxStreak: streak.maxStreak,
        recoverableStreak: streak.recoverableStreak,
        canRestore: canUseWeeklyRestore(streak.lastRestoreAt) && streak.recoverableStreak > 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo registrar actividad.' });
  }
});

router.post('/streak/restore/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Usuario inválido.' });
    }

    const streak = await getOrCreateStreak(userId);

    if (!streak.recoverableStreak || streak.recoverableStreak <= 0) {
      return res.status(400).json({ message: 'No hay racha disponible para restaurar.' });
    }

    if (!canUseWeeklyRestore(streak.lastRestoreAt)) {
      return res.status(400).json({ message: 'Solo puedes restaurar una vez por semana.' });
    }

    const today = normalizeDate(new Date());
    streak.consecutiveActiveDays = streak.recoverableStreak + 1;
    streak.maxStreak = Math.max(streak.maxStreak || 0, streak.consecutiveActiveDays);
    streak.lastActivityDate = today;
    streak.lastRestoreAt = new Date();
    streak.recoverableStreak = 0;
    streak.activityDates = [...new Set([...(streak.activityDates || []), toDateKey(today)])];

    await streak.save();

    return res.json({
      message: 'Racha restaurada correctamente.',
      streak: {
        consecutiveActiveDays: streak.consecutiveActiveDays,
        maxStreak: streak.maxStreak,
        canRestore: false,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo restaurar la racha.' });
  }
});

router.get('/streak/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const year = Number(req.query.year || new Date().getFullYear());

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Usuario inválido.' });
    }

    const streak = await getOrCreateStreak(userId);
    const calendar = buildYearCalendar(streak.activityDates, year);

    return res.json({
      streak: {
        consecutiveActiveDays: streak.consecutiveActiveDays || 0,
        maxStreak: streak.maxStreak || 0,
        canRestore: canUseWeeklyRestore(streak.lastRestoreAt) && (streak.recoverableStreak || 0) > 0,
        recoverableStreak: streak.recoverableStreak || 0,
      },
      calendar,
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo obtener la racha.' });
  }
});

router.get('/friends/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Usuario inválido.' });
    }

    const friendships = await Friendship.find({
      status: 'accepted',
      $or: [{ userId }, { friendId: userId }],
    }).lean();

    const friendIds = friendships.map((item) => {
      const left = String(item.userId);
      const right = String(item.friendId);
      return left === String(userId) ? right : left;
    });

    const friends = await User.find(
      { _id: { $in: friendIds }, ...PUBLIC_USER_FILTER },
      { username: 1, fullName: 1, avatarUrl: 1, bio: 1 }
    ).lean();

    const pointsByUserId = await buildUserPointsMap(friends.map((friend) => friend._id));

    const friendsWithLeague = friends.map((friend) => {
      const totalPoints = Number(pointsByUserId.get(String(friend._id)) || 0);
      return {
        userId: String(friend._id),
        username: friend.username,
        fullName: friend.fullName,
        avatarUrl: friend.avatarUrl || '',
        bio: friend.bio || '',
        league: getLeagueForPoints(totalPoints),
        totalPoints,
      };
    });

    return res.json({
      friends: friendsWithLeague,
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo obtener la lista de amigos.' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, { page: 1, limit: 200, maxLimit: 500 });

    const users = await User.find({ isBanned: { $ne: true } }, { username: 1, fullName: 1, avatarUrl: 1, bio: 1 })
      .sort({ registeredAt: 1, username: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.json({
      page,
      limit,
      users: users.map((user) => ({
        userId: String(user._id),
        username: user.username,
        fullName: user.fullName || user.username,
        avatarUrl: user.avatarUrl || '',
        bio: user.bio || '',
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo obtener la lista de usuarios.' });
  }
});

router.get('/community/posts', async (req, res) => {
  try {
    const { userId } = req.query;
    const { page, limit, skip } = parsePagination(req.query, { page: 1, limit: 100, maxLimit: 150 });
    const viewerUserId = mongoose.Types.ObjectId.isValid(userId) ? userId : '';
    const viewer = viewerUserId
      ? await User.findById(viewerUserId, { role: 1, isBanned: 1 }).lean()
      : null;
    const viewerIsAdmin = isAdminUser(viewer) && !viewer?.isBanned;

    const posts = await CommunityPost.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username fullName avatarUrl bio role isBanned')
      .populate('comments.userId', 'username fullName avatarUrl role isBanned')
      .lean();

    const formattedPosts = posts
      .map((post) => formatCommunityPost(post, viewerUserId, viewerIsAdmin))
      .filter(Boolean);

    return res.json({
      page,
      limit,
      posts: formattedPosts,
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudieron obtener las publicaciones.' });
  }
});

router.get('/community/posts/user/:targetUserId', async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { userId } = req.query;
    const { page, limit, skip } = parsePagination(req.query, { page: 1, limit: 200, maxLimit: 250 });

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'Usuario objetivo invalido.' });
    }

    const viewerUserId = mongoose.Types.ObjectId.isValid(userId) ? userId : '';
    const viewer = viewerUserId
      ? await User.findById(viewerUserId, { role: 1, isBanned: 1 }).lean()
      : null;
    const viewerIsAdmin = isAdminUser(viewer) && !viewer?.isBanned;

    const posts = await CommunityPost.find({ userId: targetUserId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username fullName avatarUrl bio role isBanned')
      .populate('comments.userId', 'username fullName avatarUrl role isBanned')
      .lean();

    const formattedPosts = posts
      .map((post) => formatCommunityPost(post, viewerUserId, viewerIsAdmin))
      .filter(Boolean);

    return res.json({ page, limit, posts: formattedPosts });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudieron obtener las publicaciones del usuario.' });
  }
});

router.get('/community/posts/foryou', async (req, res) => {
  try {
    const { userId } = req.query;
    const { page, limit, skip } = parsePagination(req.query, { page: 1, limit: 100, maxLimit: 150 });
    const actor = await ensureActiveActor(userId, res, { allowAdmin: false });
    if (!actor) return;

    const follows = await Follow.find({ followerId: userId }).lean();
    const followingIds = follows.map((item) => String(item.followingId || '')).filter(Boolean);
    if (followingIds.length === 0) {
      return res.json({ page, limit, posts: [] });
    }

    const friendships = await Friendship.find({
      status: 'accepted',
      $or: [{ userId }, { friendId: userId }],
    }).lean();

    const friendIds = new Set(
      friendships.map((item) => {
        if (String(item.userId) === String(userId)) return String(item.friendId || '');
        return String(item.userId || '');
      })
    );

    const onlyFollowing = followingIds.filter((followedId) => !friendIds.has(String(followedId)));
    if (onlyFollowing.length === 0) {
      return res.json({ page, limit, posts: [] });
    }

    const posts = await CommunityPost.find({ userId: { $in: onlyFollowing } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username fullName avatarUrl bio role isBanned')
      .populate('comments.userId', 'username fullName avatarUrl role isBanned')
      .lean();

    const formattedPosts = posts
      .map((post) => formatCommunityPost(post, userId, false))
      .filter(Boolean);

    return res.json({ page, limit, posts: formattedPosts });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo obtener el feed para ti.' });
  }
});

router.post('/community/posts', async (req, res) => {
  try {
    const { userId, text, type, achievement, project } = req.body || {};
    const actor = await ensureActiveActor(userId, res, { allowAdmin: false });
    if (!actor) return;

    const cleanText = sanitizeText(text);

    const projectData = {
      title: sanitizeText(project?.title),
      description: sanitizeText(project?.description),
      url: sanitizeUrl(project?.url),
      category: sanitizeText(project?.category) || 'Proyectos',
    };

    const hasProject = Boolean(projectData.title || projectData.url || projectData.description);

    if (hasProject && (!projectData.title || !projectData.url)) {
      return res.status(400).json({ message: 'Para subir un proyecto, incluye titulo y enlace.' });
    }

    const finalText = cleanText || (hasProject ? `Compartio un proyecto: ${projectData.title}` : '');
    if (!finalText) {
      return res.status(400).json({ message: 'El texto de la publicacion es obligatorio.' });
    }

    const created = await CommunityPost.create({
      userId,
      text: finalText,
      type: sanitizeText(type) || (hasProject ? 'Proyecto' : 'Compartio'),
      achievement: sanitizeText(achievement),
      likes: [],
      comments: [],
      shareCount: 0,
      project: hasProject ? projectData : {},
    });

    const post = await CommunityPost.findById(created._id)
      .populate('userId', 'username fullName avatarUrl')
      .populate('comments.userId', 'username fullName avatarUrl');

    // Emitir evento de nueva publicación
    if (io) {
      io.emit('newPost', formatCommunityPost(post, userId));
    }

    return res.status(201).json({
      message: 'Publicacion creada.',
      post: formatCommunityPost(post, userId),
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo crear la publicacion.' });
  }
});

router.post('/community/posts/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body || {};
    const compact = isCompactMode(req.query);

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const actor = await ensureActiveActor(userId, res);
    if (!actor) return;

    const actorObjectId = new mongoose.Types.ObjectId(userId);
    const updated = await CommunityPost.findOneAndUpdate(
      { _id: postId },
      [
        {
          $set: {
            likes: {
              $cond: [
                { $in: [actorObjectId, { $ifNull: ['$likes', []] }] },
                {
                  $filter: {
                    input: { $ifNull: ['$likes', []] },
                    as: 'likeUserId',
                    cond: { $ne: ['$$likeUserId', actorObjectId] },
                  },
                },
                { $setUnion: [{ $ifNull: ['$likes', []] }, [actorObjectId]] },
              ],
            },
          },
        },
      ],
      { returnDocument: 'after' }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Publicacion no encontrada.' });
    }

    const likedByMe = Array.isArray(updated.likes)
      ? updated.likes.some((id) => String(id) === String(userId))
      : false;

    if (likedByMe) {
      await pushPostNotification({
        recipientUserId: updated.userId,
        actorUserId: userId,
        postId,
        type: 'like',
      });
    }

    if (compact) {
      return res.json({
        likedByMe,
        interaction: buildCompactInteractionPayload(updated, userId),
      });
    }

    await updated.populate('userId', 'username fullName avatarUrl');
    await updated.populate('comments.userId', 'username fullName avatarUrl');

    return res.json({
      likedByMe,
      post: formatCommunityPost(updated, userId),
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo actualizar el like.' });
  }
});

router.post('/community/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, text } = req.body || {};
    const compact = isCompactMode(req.query);

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const actor = await ensureActiveActor(userId, res);
    if (!actor) return;

    const cleanText = sanitizeText(text);
    if (!cleanText) {
      return res.status(400).json({ message: 'El comentario no puede estar vacio.' });
    }

    const actorObjectId = new mongoose.Types.ObjectId(userId);
    const updated = await CommunityPost.findOneAndUpdate(
      { _id: postId },
      {
        $push: {
          comments: {
            userId: actorObjectId,
            text: cleanText,
            createdAt: new Date(),
          },
        },
      },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Publicacion no encontrada.' });
    }

    await pushPostNotification({
      recipientUserId: updated.userId,
      actorUserId: userId,
      postId,
      type: 'comment',
    });

    if (compact) {
      const lastComment = Array.isArray(updated.comments) ? updated.comments[updated.comments.length - 1] : null;
      return res.status(201).json({
        message: 'Comentario agregado.',
        interaction: buildCompactInteractionPayload(updated, userId, {
          lastComment: lastComment
            ? {
              id: String(lastComment._id || ''),
              userId: String(lastComment.userId || userId),
              text: lastComment.text || cleanText,
              createdAt: lastComment.createdAt || new Date(),
            }
            : null,
        }),
      });
    }

    await updated.populate('userId', 'username fullName avatarUrl');
    await updated.populate('comments.userId', 'username fullName avatarUrl');

    return res.status(201).json({
      message: 'Comentario agregado.',
      post: formatCommunityPost(updated, userId),
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo comentar la publicacion.' });
  }
});

router.post('/community/posts/:postId/share', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body || {};
    const compact = isCompactMode(req.query);

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Publicacion invalida.' });
    }

    if (userId) {
      const actor = await ensureActiveActor(userId, res);
      if (!actor) return;
    }

    const post = await CommunityPost.findByIdAndUpdate(
      postId,
      { $inc: { shareCount: 1 } },
      { returnDocument: 'after' }
    );

    if (!post) {
      return res.status(404).json({ message: 'Publicacion no encontrada.' });
    }

    if (userId) {
      await pushPostNotification({
        recipientUserId: post.userId,
        actorUserId: userId,
        postId,
        type: 'share',
      });
    }

    if (compact) {
      return res.json({
        message: 'Publicacion compartida.',
        interaction: buildCompactInteractionPayload(post, userId),
        shareUrl: `/comunidad/post/${String(post._id)}`,
      });
    }

    await post.populate('userId', 'username fullName avatarUrl');
    await post.populate('comments.userId', 'username fullName avatarUrl');

    return res.json({
      message: 'Publicacion compartida.',
      post: formatCommunityPost(post, userId),
      shareUrl: `/comunidad/post/${String(post._id)}`,
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo compartir la publicacion.' });
  }
});

router.post('/follow', async (req, res) => {
  try {
    const { userId, targetUserId } = req.body || {};
    const actor = await ensureActiveActor(userId, res, { allowAdmin: false });
    if (!actor) return;

    if (!mongoose.Types.ObjectId.isValid(targetUserId) || String(userId) === String(targetUserId)) {
      return res.status(400).json({ message: 'Usuario objetivo inválido.' });
    }

    const target = await User.findOne({ _id: targetUserId, ...PUBLIC_USER_FILTER }, { _id: 1 }).lean();
    if (!target) {
      return res.status(404).json({ message: 'Usuario objetivo no encontrado.' });
    }

    await Follow.findOneAndUpdate(
      { followerId: userId, followingId: targetUserId },
      { followerId: userId, followingId: targetUserId },
      { upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({ following: true });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo seguir al usuario.' });
  }
});

router.delete('/follow', async (req, res) => {
  try {
    const { userId, targetUserId } = req.body || {};
    const actor = await ensureActiveActor(userId, res, { allowAdmin: false });
    if (!actor) return;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'Usuario objetivo inválido.' });
    }

    await Follow.deleteOne({ followerId: userId, followingId: targetUserId });
    return res.json({ following: false });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo dejar de seguir al usuario.' });
  }
});

router.get('/following/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const actor = await ensureActiveActor(userId, res, { allowAdmin: false });
    if (!actor) return;

    const follows = await Follow.find({ followerId: userId })
      .populate('followingId', 'username fullName avatarUrl bio role isBanned')
      .lean();

    const users = follows
      .map((item) => item.followingId)
      .filter((item) => item && item.role !== 'admin' && !item.isBanned)
      .map((item) => ({
        userId: String(item._id),
        username: item.username,
        fullName: item.fullName || item.username,
        avatarUrl: item.avatarUrl || '',
        bio: item.bio || '',
      }));

    return res.json({ following: users });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo obtener la lista de seguidos.' });
  }
});

router.get('/followers/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const actor = await ensureActiveActor(userId, res, { allowAdmin: false });
    if (!actor) return;

    const follows = await Follow.find({ followingId: userId })
      .populate('followerId', 'username fullName avatarUrl bio role isBanned')
      .lean();

    const users = follows
      .map((item) => item.followerId)
      .filter((item) => item && item.role !== 'admin' && !item.isBanned)
      .map((item) => ({
        userId: String(item._id),
        username: item.username,
        fullName: item.fullName || item.username,
        avatarUrl: item.avatarUrl || '',
        bio: item.bio || '',
      }));

    return res.json({ followers: users, count: users.length });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo obtener la lista de seguidores.' });
  }
});

router.get('/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const actor = await ensureActiveActor(userId, res, { allowAdmin: false });
    if (!actor) return;

    const notifications = await Notification.find({ userId })
      .sort({ lastTriggeredAt: -1 })
      .limit(80)
      .populate('actorId', 'username fullName avatarUrl')
      .populate('postId', '_id')
      .lean();

    const formatted = notifications.map((item) => ({
      id: String(item._id),
      type: item.type,
      count: Number(item.count || 1),
      text: item.text || '',
      isRead: Boolean(item.isRead),
      createdAt: item.lastTriggeredAt || item.updatedAt || item.createdAt,
      postId: item.postId?._id ? String(item.postId._id) : '',
      actor: {
        userId: item.actorId?._id ? String(item.actorId._id) : '',
        username: item.actorId?.username || '',
        fullName: item.actorId?.fullName || item.actorId?.username || '',
        avatarUrl: item.actorId?.avatarUrl || '',
      },
    }));

    const unreadCount = formatted.filter((item) => !item.isRead).length;
    return res.json({ notifications: formatted, unreadCount });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudieron obtener las notificaciones.' });
  }
});

router.post('/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body || {};
    const actor = await ensureActiveActor(userId, res, { allowAdmin: false });
    if (!actor) return;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ message: 'Notificación inválida.' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { returnDocument: 'after' }
    ).lean();

    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada.' });
    }

    return res.json({ message: 'Notificación marcada como leída.' });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo actualizar la notificación.' });
  }
});

router.post('/community/posts/:postId/save', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body || {};
    const compact = isCompactMode(req.query);

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const actor = await ensureActiveActor(userId, res);
    if (!actor) return;

    const actorObjectId = new mongoose.Types.ObjectId(userId);
    const updated = await CommunityPost.findOneAndUpdate(
      { _id: postId },
      [
        {
          $set: {
            savedBy: {
              $cond: [
                { $in: [actorObjectId, { $ifNull: ['$savedBy', []] }] },
                {
                  $filter: {
                    input: { $ifNull: ['$savedBy', []] },
                    as: 'savedUserId',
                    cond: { $ne: ['$$savedUserId', actorObjectId] },
                  },
                },
                { $setUnion: [{ $ifNull: ['$savedBy', []] }, [actorObjectId]] },
              ],
            },
          },
        },
      ],
      { returnDocument: 'after' }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Publicacion no encontrada.' });
    }

    const savedByMe = Array.isArray(updated.savedBy)
      ? updated.savedBy.some((id) => String(id) === String(userId))
      : false;

    if (compact) {
      return res.json({
        savedByMe,
        interaction: buildCompactInteractionPayload(updated, userId),
      });
    }

    await updated.populate('userId', 'username fullName avatarUrl');
    await updated.populate('comments.userId', 'username fullName avatarUrl');

    return res.json({
      savedByMe,
      post: formatCommunityPost(updated, userId),
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo guardar la publicacion.' });
  }
});

router.get('/community/saved/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit, skip } = parsePagination(req.query, { page: 1, limit: 200, maxLimit: 250 });
    const actor = await ensureActiveActor(userId, res);
    if (!actor) return;

    const posts = await CommunityPost.find({ savedBy: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username fullName avatarUrl role isBanned')
      .populate('comments.userId', 'username fullName avatarUrl role isBanned')
      .lean();

    const saved = posts
      .map((post) => formatCommunityPost(post, userId, isAdminUser(actor)))
      .filter(Boolean);

    return res.json({
      page,
      limit,
      posts: saved,
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudieron obtener los guardados.' });
  }
});

router.delete('/community/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.body?.userId || req.query?.userId;
    const adminUserId = req.body?.adminUserId || req.query?.adminUserId;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Datos invalidos.' });
    }

    if (mongoose.Types.ObjectId.isValid(adminUserId)) {
      const adminUser = await User.findById(adminUserId, { role: 1, isBanned: 1, bannedReason: 1 }).lean();
      if (!adminUser || !isAdminUser(adminUser)) {
        return res.status(403).json({ message: 'Solo un administrador puede eliminar publicaciones.' });
      }
      if (adminUser.isBanned) {
        return res.status(403).json({ message: buildBannedMessage(adminUser) });
      }

      const deleted = await CommunityPost.findByIdAndDelete(postId);
      if (!deleted) {
        return res.status(404).json({ message: 'Publicacion no encontrada.' });
      }

      return res.json({ message: 'Publicacion eliminada por moderación.' });
    }

    const actor = await ensureActiveActor(userId, res, { allowAdmin: false });
    if (!actor) return;

    const post = await CommunityPost.findById(postId, { userId: 1 }).lean();
    if (!post) {
      return res.status(404).json({ message: 'Publicacion no encontrada.' });
    }

    if (String(post.userId) !== String(userId)) {
      return res.status(403).json({ message: 'Solo puedes eliminar tus propias publicaciones.' });
    }

    await CommunityPost.findByIdAndDelete(postId);
    return res.json({ message: 'Publicacion eliminada.' });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo eliminar la publicacion.' });
  }
});

router.patch('/moderation/users/:targetUserId/ban', async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { adminUserId, reason, removePosts = true } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(targetUserId) || !mongoose.Types.ObjectId.isValid(adminUserId)) {
      return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const adminUser = await User.findById(adminUserId, { role: 1, isBanned: 1, bannedReason: 1 }).lean();
    if (!adminUser || !isAdminUser(adminUser)) {
      return res.status(403).json({ message: 'Solo un administrador puede banear usuarios.' });
    }
    if (adminUser.isBanned) {
      return res.status(403).json({ message: buildBannedMessage(adminUser) });
    }

    const targetUser = await User.findById(targetUserId, { role: 1, username: 1 }).lean();
    if (!targetUser) {
      return res.status(404).json({ message: 'Usuario objetivo no encontrado.' });
    }
    if (isAdminUser(targetUser)) {
      return res.status(400).json({ message: 'No se puede banear a otro administrador.' });
    }

    await User.findByIdAndUpdate(targetUserId, {
      isBanned: true,
      bannedReason: sanitizeText(reason),
      bannedAt: new Date(),
      bannedBy: adminUserId,
    });

    if (removePosts) {
      await CommunityPost.deleteMany({ userId: targetUserId });
    }

    await Friendship.deleteMany({
      $or: [{ userId: targetUserId }, { friendId: targetUserId }],
    });

    return res.json({
      message: `Usuario @${targetUser.username} baneado correctamente.`,
      removedPosts: Boolean(removePosts),
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo banear al usuario.' });
  }
});

router.patch('/moderation/users/:targetUserId/unban', async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { adminUserId } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(targetUserId) || !mongoose.Types.ObjectId.isValid(adminUserId)) {
      return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const adminUser = await User.findById(adminUserId, { role: 1, isBanned: 1, bannedReason: 1 }).lean();
    if (!adminUser || !isAdminUser(adminUser)) {
      return res.status(403).json({ message: 'Solo un administrador puede desbanear usuarios.' });
    }
    if (adminUser.isBanned) {
      return res.status(403).json({ message: buildBannedMessage(adminUser) });
    }

    const targetUser = await User.findById(targetUserId, { role: 1, username: 1 }).lean();
    if (!targetUser) {
      return res.status(404).json({ message: 'Usuario objetivo no encontrado.' });
    }
    if (isAdminUser(targetUser)) {
      return res.status(400).json({ message: 'No se puede desbanear administradores desde este endpoint.' });
    }

    await User.findByIdAndUpdate(targetUserId, {
      isBanned: false,
      bannedReason: '',
      bannedAt: null,
      bannedBy: null,
    });

    return res.json({ message: `Usuario @${targetUser.username} desbaneado correctamente.` });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo desbanear al usuario.' });
  }
});

router.get('/friend-requests/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Usuario inválido.' });
    }

    const requests = await Friendship.find({ friendId: userId, status: 'pending' })
      .populate('userId', 'username fullName avatarUrl bio role isBanned')
      .lean();

    const visibleRequests = requests.filter((item) => {
      const user = item.userId;
      return user && !user.isBanned && user.role !== 'admin';
    });

    const pointsByUserId = await buildUserPointsMap(visibleRequests.map((item) => item.userId?._id));

    const requestsWithLeague = visibleRequests.map((item) => {
      const fromUserId = String(item.userId?._id || '');
      const totalPoints = Number(pointsByUserId.get(fromUserId) || 0);

      return {
        requestId: String(item._id),
        fromUserId,
        username: item.userId?.username || 'usuario',
        fullName: item.userId?.fullName || '',
        avatarUrl: item.userId?.avatarUrl || '',
        bio: item.userId?.bio || '',
        league: getLeagueForPoints(totalPoints),
        requestedAt: item.requestedAt,
      };
    });

    return res.json({
      requests: requestsWithLeague,
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudieron obtener las solicitudes.' });
  }
});

router.post('/friend-requests', async (req, res) => {
  try {
    const { userId, targetUsername } = req.body || {};

    if (!targetUsername) {
      return res.status(400).json({ message: 'Datos inválidos para solicitud.' });
    }

    const actor = await ensureActiveActor(userId, res, { allowAdmin: false });
    if (!actor) return;

    const targetUser = await User.findOne({
      username: String(targetUsername).trim(),
      ...PUBLIC_USER_FILTER,
    });
    if (!targetUser) {
      return res.status(404).json({ message: 'No existe un usuario con ese nombre.' });
    }

    if (String(targetUser._id) === String(userId)) {
      return res.status(400).json({ message: 'No puedes enviarte solicitud a ti mismo.' });
    }

    const existing = await Friendship.findOne({
      $or: [
        { userId, friendId: targetUser._id },
        { userId: targetUser._id, friendId: userId },
      ],
    });

    if (existing && existing.status === 'accepted') {
      return res.status(409).json({ message: 'Ya sois amigos.' });
    }

    if (existing && existing.status === 'pending') {
      return res.status(409).json({ message: 'Ya existe una solicitud pendiente.' });
    }

    await Friendship.create({
      userId,
      friendId: targetUser._id,
      status: 'pending',
      requestedAt: new Date(),
      establishedAt: null,
    });

    return res.status(201).json({ message: 'Solicitud enviada.' });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo enviar la solicitud.' });
  }
});

router.post('/friend-requests/:requestId/respond', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId, accept } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Datos inválidos.' });
    }

    const actor = await ensureActiveActor(userId, res, { allowAdmin: false });
    if (!actor) return;

    const request = await Friendship.findById(requestId);
    if (!request || String(request.friendId) !== String(userId)) {
      return res.status(404).json({ message: 'Solicitud no encontrada.' });
    }

    request.status = accept ? 'accepted' : 'rejected';
    request.establishedAt = accept ? new Date() : null;
    await request.save();

    return res.json({ message: accept ? 'Solicitud aceptada.' : 'Solicitud rechazada.' });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo responder la solicitud.' });
  }
});

router.post('/battles/challenge', async (req, res) => {
  try {
    const { fromUserId, toUserId, language } = req.body || {};

    const challenger = await ensureActiveActor(fromUserId, res, { allowAdmin: false });
    if (!challenger) return;

    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({ message: 'Destinatario invalido.' });
    }

    if (String(fromUserId) === String(toUserId)) {
      return res.status(400).json({ message: 'No puedes retarte a ti mismo.' });
    }

    const battleLanguage = normalizeBattleLanguage(language);
    if (!battleLanguage) {
      return res.status(400).json({ message: 'Lenguaje de batalla inválido.' });
    }

    const targetUser = await User.findOne({ _id: toUserId, ...PUBLIC_USER_FILTER }, { username: 1, fullName: 1, avatarUrl: 1 }).lean();
    if (!targetUser) {
      return res.status(404).json({ message: 'No se encontró al amigo para retar.' });
    }

    const areFriends = await areUsersFriends(fromUserId, toUserId);
    if (!areFriends) {
      return res.status(403).json({ message: 'Solo puedes retar a usuarios que sean tus amigos.' });
    }

    await BattleRequest.updateMany(
      {
        status: 'pending',
        expiresAt: { $lte: new Date() },
      },
      {
        $set: {
          status: 'expired',
          respondedAt: new Date(),
        },
      }
    );

    const existingPending = await BattleRequest.findOne({
      challengerUserId: fromUserId,
      challengedUserId: toUserId,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    }).lean();

    if (existingPending) {
      return res.status(409).json({ message: 'Ya tienes un reto pendiente con este amigo.' });
    }

    const created = await BattleRequest.create({
      challengerUserId: fromUserId,
      challengedUserId: toUserId,
      language: battleLanguage,
      status: 'pending',
      expiresAt: new Date(Date.now() + BATTLE_REQUEST_TTL_MS),
    });

    return res.status(201).json({
      message: `Reto enviado a @${targetUser.username}.`,
      battleRequestId: String(created._id),
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo enviar el reto amistoso.' });
  }
});

router.get('/battles/incoming/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const actor = await ensureActiveActor(userId, res, { allowAdmin: false });
    if (!actor) return;

    await BattleRequest.updateMany(
      {
        status: 'pending',
        expiresAt: { $lte: new Date() },
      },
      {
        $set: {
          status: 'expired',
          respondedAt: new Date(),
        },
      }
    );

    const invite = await BattleRequest.findOne({
      challengedUserId: userId,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .populate('challengerUserId', 'username fullName avatarUrl')
      .lean();

    if (!invite || !invite.challengerUserId) {
      return res.json({ invite: null });
    }

    return res.json({
      invite: {
        battleRequestId: String(invite._id),
        language: invite.language,
        createdAt: invite.createdAt,
        expiresAt: invite.expiresAt,
        challenger: {
          userId: String(invite.challengerUserId._id),
          username: invite.challengerUserId.username,
          fullName: invite.challengerUserId.fullName || invite.challengerUserId.username,
          avatarUrl: invite.challengerUserId.avatarUrl || '',
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo consultar retos pendientes.' });
  }
});

router.post('/battles/:battleRequestId/respond', async (req, res) => {
  try {
    const { battleRequestId } = req.params;
    const { userId, accept } = req.body || {};

    const actor = await ensureActiveActor(userId, res, { allowAdmin: false });
    if (!actor) return;

    if (!mongoose.Types.ObjectId.isValid(battleRequestId)) {
      return res.status(400).json({ message: 'Reto inválido.' });
    }

    const invite = await BattleRequest.findById(battleRequestId).populate('challengerUserId', 'username fullName avatarUrl').lean();
    if (!invite || String(invite.challengedUserId) !== String(userId)) {
      return res.status(404).json({ message: 'Reto no encontrado.' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ message: 'Este reto ya fue respondido.' });
    }

    if (new Date(invite.expiresAt).getTime() <= Date.now()) {
      await BattleRequest.findByIdAndUpdate(invite._id, {
        status: 'expired',
        respondedAt: new Date(),
      });
      return res.status(400).json({ message: 'El reto ha expirado.' });
    }

    const nextStatus = accept ? 'accepted' : 'rejected';
    await BattleRequest.findByIdAndUpdate(invite._id, {
      status: nextStatus,
      respondedAt: new Date(),
    });

    let battleMatch = null;
    if (accept) {
      battleMatch = await BattleMatch.findOneAndUpdate(
        { battleRequestId: invite._id },
        {
          battleRequestId: invite._id,
          challengerUserId: invite.challengerUserId?._id || invite.challengerUserId,
          challengedUserId: invite.challengedUserId,
          language: invite.language,
          status: 'active',
          targetScore: 90,
        },
        {
          upsert: true,
          returnDocument: 'after',
          setDefaultsOnInsert: true,
        }
      ).lean();
    }

    return res.json({
      message: accept ? 'Reto aceptado.' : 'Reto rechazado.',
      accepted: Boolean(accept),
      battle: accept
        ? {
          matchId: String(battleMatch?._id || ''),
          language: invite.language,
          challenger: {
            userId: String(invite.challengerUserId?._id || ''),
            username: invite.challengerUserId?.username || 'usuario',
            fullName: invite.challengerUserId?.fullName || invite.challengerUserId?.username || 'usuario',
            avatarUrl: invite.challengerUserId?.avatarUrl || '',
          },
        }
        : null,
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo responder el reto.' });
  }
});

router.get('/battles/active/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const actor = await ensureActiveActor(userId, res, { allowAdmin: false });
    if (!actor) return;

    const match = await BattleMatch.findOne({
      status: 'active',
      $or: [{ challengerUserId: userId }, { challengedUserId: userId }],
    })
      .sort({ createdAt: -1 })
      .populate('challengerUserId', 'username fullName avatarUrl')
      .populate('challengedUserId', 'username fullName avatarUrl')
      .lean();

    if (!match) {
      return res.json({ battle: null });
    }

    const challengerId = String(match.challengerUserId?._id || match.challengerUserId);
    const challengedId = String(match.challengedUserId?._id || match.challengedUserId);
    const isChallenger = challengerId === String(userId);
    const opponent = isChallenger ? match.challengedUserId : match.challengerUserId;

    return res.json({
      battle: {
        matchId: String(match._id),
        language: match.language,
        status: match.status,
        mySubmitted: isChallenger ? Boolean(match.challengerSubmission) : Boolean(match.challengedSubmission),
        opponentSubmitted: isChallenger ? Boolean(match.challengedSubmission) : Boolean(match.challengerSubmission),
        opponent: {
          userId: String(opponent?._id || ''),
          username: opponent?.username || 'usuario',
          fullName: opponent?.fullName || opponent?.username || 'usuario',
          avatarUrl: opponent?.avatarUrl || '',
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo consultar la batalla activa.' });
  }
});

router.post('/battles/:matchId/submit', async (req, res) => {
  try {
    const { matchId } = req.params;
    const { userId, score } = req.body || {};

    const actor = await ensureActiveActor(userId, res, { allowAdmin: false });
    if (!actor) return;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({ message: 'Partida invalida.' });
    }

    const normalizedScore = Number(score);
    if (!Number.isFinite(normalizedScore) || normalizedScore < 0 || normalizedScore > 100) {
      return res.status(400).json({ message: 'Score invalido.' });
    }

    const match = await BattleMatch.findById(matchId).lean();

    if (!match || match.status !== 'active') {
      return res.status(404).json({ message: 'Partida no encontrada o finalizada.' });
    }

    const isChallenger = getEntityUserId(match.challengerUserId) === String(userId);
    const isChallenged = getEntityUserId(match.challengedUserId) === String(userId);
    if (!isChallenger && !isChallenged) {
      return res.status(403).json({ message: 'No perteneces a esta batalla.' });
    }

    const submissionField = isChallenger ? 'challengerSubmission' : 'challengedSubmission';
    await BattleMatch.updateOne(
      { _id: matchId, status: 'active' },
      {
        $set: {
          [submissionField]: {
            score: Math.round(normalizedScore),
            submittedAt: new Date(),
          },
        },
      }
    );

    let updatedMatch = await BattleMatch.findById(matchId)
      .populate('challengerUserId', 'username fullName avatarUrl')
      .populate('challengedUserId', 'username fullName avatarUrl');

    if (!updatedMatch) {
      return res.status(404).json({ message: 'Partida no encontrada o finalizada.' });
    }

    const bothSubmitted = Boolean(updatedMatch.challengerSubmission && updatedMatch.challengedSubmission);
    if (bothSubmitted && updatedMatch.status === 'active') {
      const winnerUserId = resolveBattleWinner(updatedMatch);
      await BattleMatch.updateOne(
        { _id: matchId, status: 'active' },
        {
          $set: {
            winnerUserId,
            status: 'finished',
            finishedAt: new Date(),
          },
        }
      );

      updatedMatch = await BattleMatch.findById(matchId)
        .populate('challengerUserId', 'username fullName avatarUrl')
        .populate('challengedUserId', 'username fullName avatarUrl');
    }

    if (!updatedMatch || updatedMatch.status !== 'finished') {
      return res.json({
        waiting: true,
        message: 'Esperando a que tu amigo termine su desafío...',
      });
    }

    const opponent = isChallenger ? updatedMatch.challengedUserId : updatedMatch.challengerUserId;
    const result = buildBattleResultPayload(updatedMatch, userId);
    return res.json({
      waiting: false,
      result: {
        ...result,
        opponentName: opponent?.fullName || opponent?.username || 'Rival',
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo registrar el resultado.' });
  }
});

router.get('/battles/:matchId/status/:userId', async (req, res) => {
  try {
    const { matchId, userId } = req.params;
    const actor = await ensureActiveActor(userId, res, { allowAdmin: false });
    if (!actor) return;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({ message: 'Partida invalida.' });
    }

    const match = await BattleMatch.findById(matchId)
      .populate('challengerUserId', 'username fullName avatarUrl')
      .populate('challengedUserId', 'username fullName avatarUrl')
      .lean();

    if (!match) {
      return res.status(404).json({ message: 'Partida no encontrada.' });
    }

    const isChallenger = String(match.challengerUserId?._id || match.challengerUserId) === String(userId);
    const isChallenged = String(match.challengedUserId?._id || match.challengedUserId) === String(userId);
    if (!isChallenger && !isChallenged) {
      return res.status(403).json({ message: 'No perteneces a esta batalla.' });
    }

    if (match.status !== 'finished') {
      return res.json({
        waiting: true,
        mySubmitted: isChallenger ? Boolean(match.challengerSubmission) : Boolean(match.challengedSubmission),
        opponentSubmitted: isChallenger ? Boolean(match.challengedSubmission) : Boolean(match.challengerSubmission),
      });
    }

    const opponent = isChallenger ? match.challengedUserId : match.challengerUserId;
    const result = buildBattleResultPayload(match, userId);
    return res.json({
      waiting: false,
      result: {
        ...result,
        opponentName: opponent?.fullName || opponent?.username || 'Rival',
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo consultar el estado de la batalla.' });
  }
});

router.get('/certificates/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Usuario inválido.' });
    }

    const progressByLanguage = await UserLanguageProgress.find({ userId }).lean();
    const byLanguage = new Map(progressByLanguage.map((item) => [item.language, item]));

    const getLanguagePct = (language) => Number(byLanguage.get(language)?.completionPercentage || 0);

    const certificates = [
      {
        title: 'DESARROLLADOR FULL-STACK',
        percentage: Math.round((
          getLanguagePct('HTML') +
          getLanguagePct('CSS') +
          getLanguagePct('JavaScript') +
          getLanguagePct('Node.js')
        ) / 4),
      },
      {
        title: 'DESARROLLADOR DE PYTHON',
        percentage: getLanguagePct('Python'),
      },
      {
        title: 'DESARROLLADOR FRONT-END',
        percentage: Math.round((
          getLanguagePct('HTML') +
          getLanguagePct('CSS') +
          getLanguagePct('JavaScript')
        ) / 3),
      },
    ];

    return res.json({ certificates });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudieron obtener los certificados.' });
  }
});

router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { viewerUserId } = req.query;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Usuario inválido.' });
    }

    const user = await User.findById(userId, { username: 1, fullName: 1, avatarUrl: 1, bio: 1, programmerType: 1, role: 1, isBanned: 1 });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (user.role === 'admin' || user.isBanned) {
      const canViewSelf = mongoose.Types.ObjectId.isValid(viewerUserId) && String(viewerUserId) === String(user._id);
      if (!canViewSelf) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }
    }

    return res.json({
      profile: {
        userId: String(user._id),
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl || '',
        bio: user.bio || '',
        programmerType: user.programmerType || '',
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo obtener el perfil.' });
  }
});

router.put('/profile/:userId/avatar', async (req, res) => {
  try {
    const { userId } = req.params;
    const { avatarUrl } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Usuario inválido.' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { avatarUrl: typeof avatarUrl === 'string' ? avatarUrl : '' },
      { returnDocument: 'after' }
    );

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    return res.json({
      message: 'Avatar actualizado.',
      profile: {
        userId: String(user._id),
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl || '',
        bio: user.bio || '',
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo actualizar el avatar.' });
  }
});

module.exports = {
  socialRouter: router,
  ensureDemoUsersSeeded,
  initSocketIO,
};
