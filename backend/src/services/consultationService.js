'use strict';

const consultationRepository = require('../repositories/consultationRepository');
const amuletRepository = require('../repositories/amuletRepository');
const userRepository = require('../repositories/userRepository');
const llmService = require('./llmService');
const challengeService = require('./challengeService');

// 怨좊? ?깅줉 + 遺??諛쒓툒
exports.createConsultation = async ({ userId, content, category }) => {
  const remainingCredits = await userRepository.deductCredit(userId, 1);
  if (remainingCredits === null) {
    const err = new Error('?щ젅?㏃씠 遺議깊빀?덈떎.');
    err.status = 403;
    throw err;
  }

   // const remainingCredits = 999; // AI ?뚯뒪?몄떆 ?ъ슜??寃? ?꾩쓽 肄붾뱶??二쇱꽍泥섎━?섍퀬


  // 2. preview ?앹꽦
  const preview = content.slice(0, 50) + (content.length > 50 ? '...' : '');

  // DB ???
  const consultation = await consultationRepository.create({
    userId,
    category,
    content,
    preview,
  });

  // GPT ?듬? ?앹꽦
  const reply = await llmService.generateReply({ content, category });

  // 4. 부적 뽑기 (가중치 기반 무작위 추첨 적용)
  const uncollected = await amuletRepository.findUncollectedByUser(userId);
  
  let selected;
  let isNew = true;

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

  if (uncollected && uncollected.length > 0) {
    // 아직 못 얻은 게 있다면 가중치 기반으로 랜덤 선택
    selected = selectWeightedRandom(uncollected);
  } else {
    // 다 모았다면 전체 중에서 가중치 기반으로 랜덤 선택 (중복 발생)
    const amulets = await amuletRepository.getAll();
    if (!amulets || amulets.length === 0) throw new Error('등록된 부적이 없습니다.');
    selected = selectWeightedRandom(amulets);
    isNew = false;
  }

  // 5. 吏€湲?
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



