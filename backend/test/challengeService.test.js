const assert = require('node:assert/strict');
const test = require('node:test');

const challengeService = require('../src/services/challengeService');

const createRepository = () => {
  const state = {
    user: {
      id: 1,
      credits: 0,
      current_attendance_streak: 0,
      last_attendance_at: null,
    },
    awarded: new Set(),
    creditsAdded: 0,
  };

  return {
    state,
    async findUserChallenge(userId, challengeKey) {
      assert.equal(userId, 1);
      return state.awarded.has(challengeKey) ? { challenge_key: challengeKey } : null;
    },
    async awardChallenge(userId, challenge) {
      assert.equal(userId, 1);
      if (state.awarded.has(challenge.key)) return null;
      state.awarded.add(challenge.key);
      state.creditsAdded += challenge.rewardCredits;
      state.user.credits += challenge.rewardCredits;
      return {
        challengeKey: challenge.key,
        rewardCredits: challenge.rewardCredits,
        credits: state.user.credits,
      };
    },
    async getChallengeKeysForUser() {
      return Array.from(state.awarded);
    },
  };
};

test('awards first amulet challenge once when an amulet is created', async () => {
  const repository = createRepository();

  const firstResult = await challengeService.evaluateAmuletCreated(1, {
    id: 10,
    grade: 'common',
  }, { repository });
  const secondResult = await challengeService.evaluateAmuletCreated(1, {
    id: 11,
    grade: 'rare',
  }, { repository });

  assert.deepEqual(firstResult.awards.map((award) => award.challengeKey), ['FIRST_AMULET']);
  assert.equal(repository.state.creditsAdded, 1);
  assert.deepEqual(secondResult.awards, []);
});

test('awards legendary challenge when the created amulet grade is legend', async () => {
  const repository = createRepository();

  const result = await challengeService.evaluateAmuletCreated(1, {
    id: 70,
    grade: 'legend',
  }, { repository });

  assert.deepEqual(
    result.awards.map((award) => award.challengeKey),
    ['FIRST_AMULET', 'FIRST_LEGEND']
  );
  assert.equal(repository.state.creditsAdded, 4);
});

test('awards 3-day and 7-day streak challenges from attendance streak count', async () => {
  const repository = createRepository();

  const threeDay = await challengeService.evaluateAttendance(1, 3, { repository });
  const sevenDay = await challengeService.evaluateAttendance(1, 7, { repository });

  assert.deepEqual(threeDay.awards.map((award) => award.challengeKey), ['ATTENDANCE_3_DAYS']);
  assert.deepEqual(sevenDay.awards.map((award) => award.challengeKey), ['ATTENDANCE_7_DAYS']);
  assert.equal(repository.state.creditsAdded, 3);
});

