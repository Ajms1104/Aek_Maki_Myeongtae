'use strict';

const announcementService = require('../services/announcementService');

exports.getAnnouncements = async (req, res) => {
  try {
    const items = await announcementService.getActiveAnnouncements();
    return res.status(200).json({ items });
  } catch (err) {
    console.error('getAnnouncements 에러:', err);
    return res.status(500).json({ error: '서버 내부 에러' });
  }
};