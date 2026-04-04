'use strict';

const consultationRepository = require('../repositories/consultationRepository');
const amuletRepository = require('../repositories/amuletRepository');
const crypto = require('crypto');

// 고민 등록 + 부적 발급 (worryService 대체)
exports.createConsultation = async ({ userId, content, category }) => {
  // preview 생성 (앞 50자)
  const preview = content.slice(0, 50) + (content.length > 50 ? '...' : '');

  // DB 저장
  const consultation = await consultationRepository.create({
    userId,
    category,
    content,
    preview,
  });

  // LLM 더미 응답 (추후 교체)
  const reply = `명태가 말하길: 지금의 걱정은 곧 지나갈 거예요. 🐟`;

  // 부적 뽑기
  const amulets = await amuletRepository.getAll();
  if (!amulets || amulets.length === 0) throw new Error('등록된 부적이 없습니다.');
  const selected = amulets[Math.floor(Math.random() * amulets.length)];

  // 보유 여부 확인 및 지급
  const isNew = !(await amuletRepository.checkUserHas(userId, selected.id));
  await amuletRepository.giveToUser(userId, selected.id);

  // 상담-부적 연결
  await consultationRepository.linkAmulet(consultation.id, selected.id);

  // 상태 업데이트
  await consultationRepository.updateStatus(consultation.id, {
    status: 'DONE',
    reply,
  });

  return {
    consultationId: consultation.id,
    status: 'DONE',
    reply,
    amulet: { ...selected, isNew },
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