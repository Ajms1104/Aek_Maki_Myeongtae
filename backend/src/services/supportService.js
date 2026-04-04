'use strict';

const supportRepository = require('../repositories/supportRepository');

exports.createTicket = async ({ userId, title, content, replyEmail }) => {
  return await supportRepository.create({ userId, title, content, replyEmail });
};

exports.getMyTickets = async ({ userId, cursor, limit }) => {
  const rows = await supportRepository.findByUser({ userId, cursor, limit });
  const nextCursor = rows.length === limit
    ? String(rows[rows.length - 1].ticketId)
    : null;
  return { items: rows.map(r => ({ ...r, ticketId: String(r.ticketId) })), nextCursor };
};

exports.getAllTickets = async ({ status, cursor, limit }) => {
  const rows = await supportRepository.findAll({ status, cursor, limit });
  return {
    items: rows,
    nextCursor: rows.length > 0 ? rows[rows.length - 1].ticketId : null
  };
};

exports.updateTicket = async ({ ticketId, status, replyContent }) => {
  const result = await supportRepository.update({ ticketId, status, replyContent });
  if (!result) {
    const err = new Error('문의를 찾을 수 없습니다.');
    err.status = 404;
    throw err;
  }
  return result;
};