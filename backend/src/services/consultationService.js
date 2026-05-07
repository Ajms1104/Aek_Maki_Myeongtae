'use strict';

const consultationRepository = require('../repositories/consultationRepository');
const amuletRepository = require('../repositories/amuletRepository');
const userRepository = require('../repositories/userRepository');
const llmService = require('./llmService');

// 고민 등록 + 부적 발급
exports.createConsultation = async ({ userId, content, category }) => {
  // 1. 크레딧 차감 시도
  const remainingCredits = await userRepository.deductCredit(userId, 1);
  if (remainingCredits === null) {
    const err = new Error('크레딧이 부족합니다.');
    err.status = 403;
    throw err;
  }

  // 2. preview 생성
  const preview = content.slice(0, 50) + (content.length > 50 ? '...' : '');

  // DB 저장
  const consultation = await consultationRepository.create({
    userId,
    category,
    content,
    preview,
  });

  // Gemini 답변 생성
  const reply = await llmService.generateReply({ content, category });

  // 4. 부적 뽑기 (중복 방지 로직 적용)
  // 유저가 아직 얻지 못한 부적 목록을 조회합니다.
  const uncollected = await amuletRepository.findUncollectedByUser(userId);
  
  let selected;
  let isNew = true;

  if (uncollected && uncollected.length > 0) {
    // 아직 못 얻은 게 있다면 그 중에서 랜덤 선택
    selected = uncollected[Math.floor(Math.random() * uncollected.length)];
  } else {
    // 다 모았다면 전체 중에서 랜덤 선택 (중복 발생)
    const amulets = await amuletRepository.getAll();
    if (!amulets || amulets.length === 0) throw new Error('등록된 부적이 없습니다.');
    selected = amulets[Math.floor(Math.random() * amulets.length)];
    isNew = false;
  }

  // 5. 지급
  await amuletRepository.giveToUser(userId, selected.id);

  // 6. 상담-부적 연결
  await consultationRepository.linkAmulet(consultation.id, selected.id);

  // 7. 상태 업데이트
  await consultationRepository.updateStatus(consultation.id, {
    status: 'DONE',
    reply,
  });

  return {
    consultationId: consultation.id,
    status: 'DONE',
    reply,
    amulet: { ...selected, isNew },
    remainingCredits, // 복수형으로 통일
    deleteAt: consultation.delete_at,
  };
};

// 단건 조회
exports.getConsultation = async (userId, consultationId) => {
  const result = await consultationRepository.findOneByUser(userId, consultationId);
  if (!result) {
    const err = new Error('존재하지 않거나 본인 글이 아닙니다.');
    err.status = 404;
    throw err;
  }
  return result;
};

// 목록 조회
exports.getConsultations = async (userId, { cursor, limit }) => {
  return await consultationRepository.findByUser(userId, { cursor, limit });
};

// 삭제
exports.deleteConsultation = async (userId, consultationId) => {
  const deleted = await consultationRepository.deleteOne(userId, consultationId);
  if (!deleted) {
    const err = new Error('존재하지 않거나 본인 글이 아닙니다.');
    err.status = 404;
    throw err;
  }
};

// 반응 업데이트
exports.updateReaction = async (userId, consultationId, reaction) => {
  const updated = await consultationRepository.updateReaction(
    userId,
    consultationId,
    reaction
  );
  if (!updated) {
    const err = new Error('존재하지 않거나 본인 글이 아닙니다.');
    err.status = 404;
    throw err;
  }
};
