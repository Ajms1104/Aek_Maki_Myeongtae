'use strict';

const CHALLENGES = [
  {
    key: 'ATTENDANCE_3_DAYS',
    title: '3-day streak',
    description: 'Visit three days in a row.',
    rewardCredits: 1,
    type: 'attendance',
    target: 3,
  },
  {
    key: 'ATTENDANCE_7_DAYS',
    title: '7-day streak',
    description: 'Visit seven days in a row.',
    rewardCredits: 2,
    type: 'attendance',
    target: 7,
  },
  {
    key: 'FIRST_AMULET',
    title: 'Create first amulet',
    description: 'Create your first amulet.',
    rewardCredits: 1,
    type: 'amulet',
    target: 1,
  },
  {
    key: 'FIRST_LEGEND',
    title: 'Get legendary amulet',
    description: 'Receive a legendary grade amulet.',
    rewardCredits: 3,
    type: 'amulet',
    target: 1,
  },
];

const CHALLENGE_BY_KEY = new Map(CHALLENGES.map((challenge) => [challenge.key, challenge]));
const getRepository = () => require('../repositories/challengeRepository');

const toKoreaDateKey = (value) => {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const daysBetweenKoreaDates = (fromDateKey, toDateKey) => {
  const from = new Date(`${fromDateKey}T00:00:00.000Z`);
  const to = new Date(`${toDateKey}T00:00:00.000Z`);
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
};

const awardEligible = async (userId, challenges, repository) => {
  const awards = [];

  for (const challenge of challenges) {
    const alreadyAwarded = await repository.findUserChallenge(userId, challenge.key);
    if (alreadyAwarded) continue;

    const award = await repository.awardChallenge(userId, challenge);
    if (award) {
      awards.push({
        ...award,
        title: challenge.title,
        description: challenge.description,
      });
    }
  }

  return { awards };
};

exports.CHALLENGES = CHALLENGES;

exports.calculateNextAttendanceStreak = (lastAttendanceAt, currentStreak = 0, now = new Date()) => {
  if (!lastAttendanceAt) return 1;

  const lastKey = toKoreaDateKey(lastAttendanceAt);
  const nowKey = toKoreaDateKey(now);
  const dayDiff = daysBetweenKoreaDates(lastKey, nowKey);

  if (dayDiff === 1) return currentStreak + 1;
  if (dayDiff === 0) return Math.max(currentStreak, 1);
  return 1;
};

exports.evaluateAttendance = async (userId, attendanceStreak, options = {}) => {
  const repository = options.repository || getRepository();
  const eligible = CHALLENGES.filter(
    (challenge) => challenge.type === 'attendance' && attendanceStreak >= challenge.target
  );

  return awardEligible(userId, eligible, repository);
};

exports.evaluateAmuletCreated = async (userId, amulet, options = {}) => {
  const repository = options.repository || getRepository();
  const eligible = [CHALLENGE_BY_KEY.get('FIRST_AMULET')];

  if (amulet?.grade === 'legend') {
    eligible.push(CHALLENGE_BY_KEY.get('FIRST_LEGEND'));
  }

  return awardEligible(userId, eligible.filter(Boolean), repository);
};

exports.getChallengeProgress = async (userId, user, options = {}) => {
  const repository = options.repository || getRepository();
  const awardedKeys = new Set(await repository.getChallengeKeysForUser(userId));
  const attendanceStreak = user?.current_attendance_streak || 0;

  return CHALLENGES.map((challenge) => {
    const progress = challenge.type === 'attendance'
      ? Math.min(attendanceStreak, challenge.target)
      : awardedKeys.has(challenge.key) ? challenge.target : 0;

    return {
      key: challenge.key,
      title: challenge.title,
      description: challenge.description,
      rewardCredits: challenge.rewardCredits,
      target: challenge.target,
      progress,
      completed: awardedKeys.has(challenge.key),
    };
  });
};
