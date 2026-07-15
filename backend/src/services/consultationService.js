'use strict';

const consultationRepository = require('../repositories/consultationRepository');
const amuletRepository = require('../repositories/amuletRepository');
const userRepository = require('../repositories/userRepository');
const llmService = require('./llmService');
const challengeService = require('./challengeService');

// 怨좊? ?깅줉 + 遺€?? 諛쒓툒
exports.createConsultation = async ({ userId, content, category }) => {
  // 1. 크레딧 선검증 (차감은 하지 않고 보유량만 선조회)
  const user = await userRepository.findById(userId);
  if (!user || user.credits < 1) {
    const err = new Error('크레딧이 부족합니다.');
    err.status = 403;
    throw err;
  }

  // 2. preview ?앹꽦
  const preview = content.slice(0, 50) + (content.length > 50 ? '...' : '');

  // DB ?€??
  const consultation = await consultationRepository.create({
    userId,
    category,
    content,
    preview,
  });

  // GPT ?듬? ?앹꽦
  const reply = await llmService.generateReply({ content, category });

  // 4. 부적 뽑기 (중복 획득 가능 + 천장/확률 보정 룰)
  const amulets = await amuletRepository.getAll();
  if (!amulets || amulets.length === 0) throw new Error('등록된 부적이 없습니다.');

  // 가중치(weight) 기반 무작위 선택 헬퍼 함수
  const selectWeightedRandom = (items) => {
    if (!items || items.length === 0) return null;
    const totalWeight = items.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
    if (totalWeight <= 0) {
      return items[Math.floor(Math.random() * items.length)];
    }
    let randomValue = Math.random() * totalWeight;
    for (const item of items) {
      randomValue -= (Number(item.weight) || 0);
      if (randomValue <= 0) {
        return item;
      }
    }
    return items[items.length - 1];
  };

  // 1차적으로 전체 부적 중에서 가중치 기반 랜덤 선택
  let selected = selectWeightedRandom(amulets);
  let isNew = true;

  // 유저의 인벤토리와 미해금 목록 확인
  const ownedAmulets = await amuletRepository.findUserInventory(userId);
  const uncollected = await amuletRepository.findUncollectedByUser(userId);

  const isAlreadyOwned = ownedAmulets.some(owned => owned.id === selected.id);

  if (isAlreadyOwned && uncollected && uncollected.length > 0) {
    // 중복 부적이 뽑혔고, 아직 획득하지 못한 부적이 남아있다면
    const userPity = user.amulet_pity_count || 0;
    const pityChance = userPity * 0.20; // 1회 중복당 20% 확률 보정

    if (Math.random() < pityChance) {
      // 보정 확률 통과: 미해금 부적 중에서 다시 가중치 기반으로 뽑기
      selected = selectWeightedRandom(uncollected);
      isNew = true;
      await userRepository.resetAmuletPity(userId);
    } else {
      // 보정 확률 실패: 원래 뽑혔던 중복 부적 지급하고 스택 증가
      isNew = false;
      await userRepository.incrementAmuletPity(userId);
    }
  } else if (!isAlreadyOwned) {
    // 처음 획득한 부적이면 천장 스택 리셋
    isNew = true;
    await userRepository.resetAmuletPity(userId);
  } else {
    // 이미 모든 부적을 다 해금한 상태
    isNew = false;
  }

  // 5. 실질적 크레딧 차감 (모든 위험 요소 통과 후 최종 확정)
  const remainingCredits = await userRepository.deductCredit(userId, 1);
  if (remainingCredits === null) {
    const err = new Error('크레딧이 부족합니다.');
    err.status = 403;
    throw err;
  }

  // 6. 吏€湲?
  await amuletRepository.giveToUser(userId, selected.id);

  const challengeResult = await challengeService.evaluateAmuletCreated(userId, selected);
  const finalCredits = challengeResult.awards.length > 0
    ? challengeResult.awards[challengeResult.awards.length - 1].credits
    : remainingCredits;

  // 6. ?곷떞-遺???곌껐
  await consultationRepository.linkAmulet(consultation.id, selected.id);

  // 7. ?곹깭 ?낅뜲?댄듃
  await consultationRepository.updateStatus(consultation.id, {
    status: 'DONE',
    reply,
  });

  return {
    consultationId: consultation.id,
    status: 'DONE',
    reply,
    amulet: { ...selected, isNew },
    remainingCredits: finalCredits, // includes challenge rewards when granted
    challengeAwards: challengeResult.awards,
    deleteAt: consultation.delete_at,
  };
};

// ?④굔 議고쉶
exports.getConsultation = async (userId, consultationId) => {
  const result = await consultationRepository.findOneByUser(userId, consultationId);
  if (!result) {
    const err = new Error('議댁옱?섏? ?딄굅??蹂몄씤 湲???꾨떃?덈떎.');
    err.status = 404;
    throw err;
  }
  return result;
};

// 紐⑸줉 議고쉶
exports.getConsultations = async (userId, { cursor, limit }) => {
  return await consultationRepository.findByUser(userId, { cursor, limit });
};

// ??젣
exports.deleteConsultation = async (userId, consultationId) => {
  const deleted = await consultationRepository.deleteOne(userId, consultationId);
  if (!deleted) {
    const err = new Error('議댁옱?섏? ?딄굅??蹂몄씤 湲???꾨떃?덈떎.');
    err.status = 404;
    throw err;
  }
};

// 諛섏쓳 ?낅뜲?댄듃
exports.updateReaction = async (userId, consultationId, reaction) => {
  const updated = await consultationRepository.updateReaction(
    userId,
    consultationId,
    reaction
  );
  if (!updated) {
    const err = new Error('議댁옱?섏? ?딄굅??蹂몄씤 湲???꾨떃?덈떎.');
    err.status = 404;
    throw err;
  }
};



