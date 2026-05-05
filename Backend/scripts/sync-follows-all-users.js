const dotenv = require('dotenv');
const mongoose = require('mongoose');

const User = require('../models/User');
const Follow = require('../models/Follow');

dotenv.config({ path: '.env.local' });

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandom = (values) => values[Math.floor(Math.random() * values.length)];

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const users = await User.find(
      { role: { $ne: 'admin' }, isBanned: { $ne: true } },
      { _id: 1, username: 1 }
    ).lean();

    if (users.length < 2) {
      console.log('No hay usuarios suficientes para generar seguidores.');
      process.exit(0);
    }

    const userIds = users.map((u) => String(u._id));
    const userSet = new Set(userIds);

    const minFollowing = Math.min(10, users.length - 1);
    const maxFollowing = Math.min(16, users.length - 1);
    const minFollowers = Math.min(8, users.length - 1);

    const existingFollows = await Follow.find(
      {
        $or: [
          { followerId: { $in: userIds } },
          { followingId: { $in: userIds } },
        ],
      },
      { followerId: 1, followingId: 1 }
    ).lean();

    const outMap = new Map(userIds.map((id) => [id, new Set()]));
    const inMap = new Map(userIds.map((id) => [id, new Set()]));

    for (const row of existingFollows) {
      const followerId = String(row.followerId || '');
      const followingId = String(row.followingId || '');
      if (!userSet.has(followerId) || !userSet.has(followingId) || followerId === followingId) continue;
      outMap.get(followerId).add(followingId);
      inMap.get(followingId).add(followerId);
    }

    const targetFollowing = new Map(
      userIds.map((id) => {
        const current = outMap.get(id).size;
        const target = Math.max(current, randomInt(minFollowing, maxFollowing));
        return [id, target];
      })
    );

    const inserts = [];

    const tryInsertFollow = (followerId, followingId) => {
      if (!userSet.has(followerId) || !userSet.has(followingId)) return false;
      if (followerId === followingId) return false;
      if (outMap.get(followerId).has(followingId)) return false;

      outMap.get(followerId).add(followingId);
      inMap.get(followingId).add(followerId);
      inserts.push({ followerId, followingId });
      return true;
    };

    for (const followerId of userIds) {
      let safeGuard = 0;
      while (outMap.get(followerId).size < targetFollowing.get(followerId) && safeGuard < 1200) {
        safeGuard += 1;
        const candidate = pickRandom(userIds);
        tryInsertFollow(followerId, candidate);
      }
    }

    for (const targetUserId of userIds) {
      let safeGuard = 0;
      while (inMap.get(targetUserId).size < minFollowers && safeGuard < 1800) {
        safeGuard += 1;
        const followerCandidate = pickRandom(userIds);
        if (followerCandidate === targetUserId) continue;

        const canGrowFollowing = outMap.get(followerCandidate).size < Math.min(users.length - 1, maxFollowing + 4);
        if (!canGrowFollowing) continue;

        tryInsertFollow(followerCandidate, targetUserId);
      }
    }

    if (inserts.length > 0) {
      await Follow.insertMany(inserts, { ordered: false }).catch(() => undefined);
    }

    const finalFollows = await Follow.find(
      {
        $or: [
          { followerId: { $in: userIds } },
          { followingId: { $in: userIds } },
        ],
      },
      { followerId: 1, followingId: 1 }
    ).lean();

    const outCount = new Map(userIds.map((id) => [id, 0]));
    const inCount = new Map(userIds.map((id) => [id, 0]));

    for (const row of finalFollows) {
      const followerId = String(row.followerId || '');
      const followingId = String(row.followingId || '');
      if (outCount.has(followerId)) outCount.set(followerId, outCount.get(followerId) + 1);
      if (inCount.has(followingId)) inCount.set(followingId, inCount.get(followingId) + 1);
    }

    const outValues = [...outCount.values()];
    const inValues = [...inCount.values()];

    console.log(`Usuarios activos actualizados: ${users.length}`);
    console.log(`Nuevos follows creados: ${inserts.length}`);
    console.log(`Following min/max: ${Math.min(...outValues)} / ${Math.max(...outValues)}`);
    console.log(`Followers min/max: ${Math.min(...inValues)} / ${Math.max(...inValues)}`);

    process.exit(0);
  } catch (error) {
    console.error('Error en sync-follows-all-users:', error.message);
    process.exit(1);
  }
}

run();
