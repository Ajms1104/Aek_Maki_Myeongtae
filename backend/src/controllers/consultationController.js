'use strict';

const consultationService = require('../services/consultationService');

// 고민 등록 + 부적 발급
exports.createConsultation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { content, category } = req.body;

    if (!content || content.length < 10 || content.length > 300) {
      return res.status(400).json({ error: '고민은 10자 이상 300자 이내로 적어주세요.' });
    }

    const result = await consultationService.createConsultation({
      userId,
      content,
      category,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('createConsultation 에러:', err);
    if (err.code === 'PROFANITY') return res.status(400).json({ error: err.message });
    if (err.message === 'LLM_ERROR') return res.status(503).json({ error: '명태가 답변 준비 중 에러가 났어요.' });
    return res.status(500).json({ error: '서버 내부 에러' });
  }
};

// 단건 조회
exports.getConsultation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { consultationId } = req.params;

    const result = await consultationService.getConsultation(userId, consultationId);
    return res.status(200).json(result);
  } catch (err) {
    console.error('getConsultation 에러:', err);
    if (err.status === 404) return res.status(404).json({ error: err.message });
    return res.status(500).json({ error: '서버 내부 에러' });
  }
};

// 목록 조회
exports.getConsultations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cursor = req.query.cursor;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    const result = await consultationService.getConsultations(userId, {
      cursor,
      limit,
    });
    return res.status(200).json(result);
  } catch (err) {
    console.error('getConsultations 에러:', err);
    return res.status(500).json({ error: '서버 내부 에러' });
  }
};

// 삭제
exports.deleteConsultation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { consultationId } = req.params;

    await consultationService.deleteConsultation(userId, consultationId);
    return res.status(200).json({ message: '삭제되었습니다.' });
  } catch (err) {
    console.error('deleteConsultation 에러:', err);
    if (err.status === 404) return res.status(404).json({ error: err.message });
    return res.status(500).json({ error: '서버 내부 에러' });
  }
};

// LLM 답변 평가
exports.updateReaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { consultationId } = req.params;
    const { reaction } = req.body;

    if (!['LIKE', 'DISLIKE', 'NONE'].includes(reaction)) {
      return res.status(400).json({ error: 'reaction은 LIKE, DISLIKE, NONE 중 하나여야 합니다.' });
    }

    await consultationService.updateReaction(userId, consultationId, reaction);
    return res.status(200).json({ message: '평가가 저장되었습니다.' });
  } catch (err) {
    console.error('updateReaction 에러:', err);
    if (err.status === 404) return res.status(404).json({ error: err.message });
    return res.status(500).json({ error: '서버 내부 에러' });
  }
};