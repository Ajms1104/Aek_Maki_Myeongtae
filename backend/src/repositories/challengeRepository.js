'use strict';

const db = require('../db');

exports.findUserChallenge = async (userId, challengeKey) => {
  const { rows } = await db.query(
    `SELECT challenge_key, rewarded_at
     FROM user_challenges
     WHERE user_id = $1 AND challenge_key = $2`,
    [userId, challengeKey]
  );
  return rows[0] || null;
};

exports.getChallengeKeysForUser = async (userId) => {
  const { rows } = await db.query(
    `SELECT challenge_key
     FROM user_challenges
     WHERE user_id = $1`,
    [userId]
  );
  return rows.map((row) => row.challenge_key);
};

exports.awardChallenge = async (userId, challenge) => {
  try {
    return await db.transaction(async (client) => {
      const inserted = await client.query(
        `INSERT INTO user_challenges (user_id, challenge_key, reward_credits)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, challenge_key) DO NOTHING
         RETURNING challenge_key AS "challengeKey", reward_credits AS "rewardCredits", rewarded_at AS "rewardedAt"`,
        [userId, challenge.key, challenge.rewardCredits]
      );

      if (inserted.rows.length === 0) {
        throw new Error('CHALLENGE_ALREADY_AWARDED');
      }

      const updated = await client.query(
        `UPDATE users
         SET credits = credits + $1
         WHERE id = $2
         RETURNING credits`,
        [challenge.rewardCredits, userId]
      );

      return {
        ...inserted.rows[0],
        credits: updated.rows[0]?.credits,
      };
    });
  } catch (err) {
    if (err.message === 'CHALLENGE_ALREADY_AWARDED') {
      return null;
    }
    throw err;
  }
};
