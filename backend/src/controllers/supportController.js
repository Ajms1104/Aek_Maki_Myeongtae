'use strict';

const supportService = require('../services/supportService');

// 1-1. 문의 등록
exports.createTicket = async (req, res) => {
  try {
    const userId = req.user?.userId || null;
    const { title, content, replyEmail } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: '제목과 내용을 모두 입력해주세요.' });
    }

    const result = await supportService.createTicket({ userId, title, content, replyEmail });
    return res.status(201).json({
      ticketId: result.ticketId,
      message: '성공적으로 접수되었습니다.'
    });
  } catch (err) {
    console.error('createTicket 에러:', err);
    return res.status(500).json({ error: '서버 내부 에러' });
  }
};

// 1-2. 내 문의 목록 조회
exports.getMyTickets = async (req, res) => {
  try {
    const userId = req.user?.userId || null;
    const cursor = req.query.cursor;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    const result = await supportService.getMyTickets({ userId, cursor, limit });
    return res.status(200).json(result);
  } catch (err) {
    console.error('getMyTickets 에러:', err);
    return res.status(500).json({ error: '서버 내부 에러' });
  }
};

// 관리자 - 전체 문의 목록 조회
exports.getAllTickets = async (req, res) => {
  try {
    const { status = 'ALL', cursor, limit = 50 } = req.query;
    const queryLimit = Math.min(parseInt(limit), 50);

    const result = await supportService.getAllTickets({ status, cursor, limit: queryLimit });
    return res.status(200).json(result);
  } catch (err) {
    console.error('getAllTickets 에러:', err);
    return res.status(500).json({ error: '서버 내부 에러' });
  }
};

// 관리자 - 문의 상태 변경/답변 등록
exports.updateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, replyContent } = req.body;

    const result = await supportService.updateTicket({ ticketId, status, replyContent });
    return res.status(200).json(result);
  } catch (err) {
    console.error('updateTicket 에러:', err);
    if (err.status === 404) return res.status(404).json({ error: err.message });
    return res.status(500).json({ error: '서버 내부 에러' });
  }
};