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
    key: 'ATTENDANCE_10_DAYS_TOTAL',
    title: '누적 10일 출석',
    description: '연속이 아니어도 괜찮아요. 누적 10일 방문 달성!',
    rewardCredits: 2,
    type: 'attendance_total',
    target: 10,
  },
  {
    key: 'AMULET_3_CREATIONS',
    title: '부적 3개 생성',
    description: '명태와 함께 액운을 3번 물리치세요.',
    rewardCredits: 1,
    type: 'amulet_count',
    target: 3,
  },
  {
    key: 'FIRST_LEGEND',
    title: '전설 등급 부적 획득',
    description: '5%의 기적! 전설 등급 부적 최초 획득',
    rewardCredits: 3,
    type: 'legend_first',
    target: 1,
  },
  {
    key: 'PAYMENT_CREDIT',
    title: '10 크레딧 충전 완료',
    description: '크레딧 10개 상품을 구매하여 준비성 인증!',
    rewardCredits: 2,
    type: 'payment_credit',
    target: 1,
  },
  {
    key: 'PAYMENT_HIDDEN',
    title: '히든 패키지 해금 완료',
    description: '감사 편지와 함께 히든 등급 5종 영구 해금!',
    rewardCredits: 3,
    type: 'payment_hidden',
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
  const eligible = [];

  // A. 3일 연속 출석 체크
  if (attendanceStreak >= 3) {
    eligible.push(CHALLENGE_BY_KEY.get('ATTENDANCE_3_DAYS'));
  }

  // B. 비연속 누적 10일 출석 체크
  const totalAttendanceDays = await repository.countUserTotalAttendanceDays(userId);
  if (totalAttendanceDays >= 10) {
    eligible.push(CHALLENGE_BY_KEY.get('ATTENDANCE_10_DAYS_TOTAL'));
  }

  return awardEligible(userId, eligible.filter(Boolean), repository);
};

exports.evaluateAmuletCreated = async (userId, amulet, options = {}) => {
  const repository = options.repository || getRepository();
  const eligible = [];

  // A. 누적 부적 생성 수 체크 (3개 이상 시 달성)
  const createdCount = await repository.countUserCreatedAmulets(userId);
  if (createdCount >= 3) {
    eligible.push(CHALLENGE_BY_KEY.get('AMULET_3_CREATIONS'));
  }

  // B. 전설 등급 1개 최초 획득 체크
  if (amulet?.grade === 'legend') {
    eligible.push(CHALLENGE_BY_KEY.get('FIRST_LEGEND'));
  }

  return awardEligible(userId, eligible.filter(Boolean), repository);
};

// 🔒 [유료 결제 도전과제 실시간 평가]
exports.evaluatePayment = async (userId, productType, options = {}) => {
  const repository = options.repository || getRepository();
  const eligible = [];

  if (productType === 'credit') {
    eligible.push(CHALLENGE_BY_KEY.get('PAYMENT_CREDIT'));
  } else if (productType === 'hidden') {
    eligible.push(CHALLENGE_BY_KEY.get('PAYMENT_HIDDEN'));
  }

  return awardEligible(userId, eligible.filter(Boolean), repository);
};

exports.getChallengeProgress = async (userId, user, options = {}) => {
  const repository = options.repository || getRepository();
  const awardedKeys = new Set(await repository.getChallengeKeysForUser(userId));
  const attendanceStreak = user?.current_attendance_streak || 0;

  // 진척도 게이지용 누적 데이터 쿼리
  const createdCount = await repository.countUserCreatedAmulets(userId);
  const totalAttendanceDays = await repository.countUserTotalAttendanceDays(userId);

  return CHALLENGES.map((challenge) => {
    let progress = 0;
    if (challenge.key === 'ATTENDANCE_3_DAYS') {
      progress = Math.min(attendanceStreak, challenge.target);
    } else if (challenge.key === 'ATTENDANCE_10_DAYS_TOTAL') {
      progress = Math.min(totalAttendanceDays, challenge.target);
    } else if (challenge.key === 'AMULET_3_CREATIONS') {
      progress = Math.min(createdCount, challenge.target);
    } else if (
      challenge.key === 'FIRST_LEGEND' ||
      challenge.key === 'PAYMENT_CREDIT' ||
      challenge.key === 'PAYMENT_HIDDEN'
    ) {
      // 일회성 및 결제 챌린지는 달성 여부에 따라 진척도 부여
      progress = awardedKeys.has(challenge.key) ? challenge.target : 0;
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
