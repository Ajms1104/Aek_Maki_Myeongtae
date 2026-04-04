'use strict';

const announcementRepository = require('../repositories/announcementRepository');

exports.getActiveAnnouncements = async () => {
  const rows = await announcementRepository.findActive();
  return rows.map(row => ({
    announcementId: String(row.announcement_id),
    title: row.title,
    content: row.content,
    isUrgent: row.is_urgent,
    startAt: row.start_at,
    endAt: row.end_at,
    createdAt: row.created_at,
  }));
};