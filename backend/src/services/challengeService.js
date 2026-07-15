'use strict';

const CHALLENGES = [
  {
    key: 'ATTENDANCE_3_DAYS',
    title: '3일 연속 출석',
    description: '3일 연속으로 명태를 찾아오세요.',
    rewardCredits: 1,
    type: 'attendance',
    target: 3,
  },
  {
    key: 'ATTENDANCE_15_DAYS',
    title: '15일 연속 출석',
    description: '15일 연속으로 명태를 찾아오세요.',
    rewardCredits: 2,
    type: 'attendance',
    target: 15,
  },
  {
    key: 'ATTENDANCE_30_DAYS',
    title: '30일 연속 출석',
    description: '30일 연속으로 명태를 찾아오는 진정한 신도!',
    rewardCredits: 5,
    type: 'attendance',
    target: 30,
  },
  {
    key: 'AMULET_10_CREATIONS',
    title: '부적 10개 생성',
    description: '명태와 함께 액운을 10번 물리치세요.',
    rewardCredits: 2,
    type: 'amulet_count',
    target: 10,
  },
  {
    key: 'AMULET_50_CREATIONS',
    title: '부적 50개 생성',
    description: '명태와 함께 액운을 50번 물리친 액막이 마스터!',
    rewardCredits: 5,
    type: 'amulet_count',
    target: 50,
  },
  {
    key: 'LEGEND_3_COLLECT',
    title: '전설 부적 3종 수집',
    description: '서로 다른 전설 등급 부적을 3종 수집하세요.',
    rewardCredits: 3,
    type: 'legend_collect',
    target: 3,
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
exports.toKoreaDateKey = toKoreaDateKey;

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
  const eligible = [];

  // A. 누적 부적 생성 수 가져오기
  const createdCount = await repository.countUserCreatedAmulets(userId);
  const countChallenges = CHALLENGES.filter(
    (c) => c.type === 'amulet_count' && createdCount >= c.target
  );
  eligible.push(...countChallenges);

  // B. 유니크 전설 부적 획득 수 가져오기
  const uniqueLegendCount = await repository.countUserUniqueLegendAmulets(userId);
  const legendChallenges = CHALLENGES.filter(
    (c) => c.type === 'legend_collect' && uniqueLegendCount >= c.target
  );
  eligible.push(...legendChallenges);

  return awardEligible(userId, eligible, repository);
};

exports.getChallengeProgress = async (userId, user, options = {}) => {
  const repository = options.repository || getRepository();
  const awardedKeys = new Set(await repository.getChallengeKeysForUser(userId));
  const attendanceStreak = user?.current_attendance_streak || 0;

  // 진척도 계산을 위해 미리 누적 DB 카운트를 획득합니다.
  const createdCount = await repository.countUserCreatedAmulets(userId);
  const uniqueLegendCount = await repository.countUserUniqueLegendAmulets(userId);

  return CHALLENGES.map((challenge) => {
    let progress = 0;
    if (challenge.type === 'attendance') {
      progress = Math.min(attendanceStreak, challenge.target);
    } else if (challenge.type === 'amulet_count') {
      progress = Math.min(createdCount, challenge.target);
    } else if (challenge.type === 'legend_collect') {
      progress = Math.min(uniqueLegendCount, challenge.target);
    }

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
