const adminService = require('../services/adminService');

exports.getProbabilities = async (req, res) => {
    try {
        const result = await adminService.getProbabilities();
        return res.status(200).json(result);
    } catch (error) {
        console.error('[AdminController] getProbabilities Error:', error);
        return res.status(500).json({ error: '서버 에러' });
    }
};

exports.updateAmuletProbability = async (req, res) => {
    try {
        const { id } = req.params;
        const { weight } = req.body;

        if (weight === undefined || isNaN(weight) || weight < 0) {
            return res.status(400).json({ error: '올바른 확률을 입력해주세요.' });
        }

        const result = await adminService.updateProbability(id, weight);

        return res.status(200).json(result);
    } catch (error) {
        if (error.message === 'NOT_FOUND') {
            return res.status(404).json({ error: '해당 부적을 찾을 수 없습니다.' });
        }
        console.error('[AdminController] updateAmuletProbability Error:', error);
        return res.status(500).json({ error: '서버 에러' });
    }
};

exports.publishProbabilities = async (req, res) => {
    try {
        const { effectiveAt } = req.body;
        const result = await adminService.publishProbabilities({ effectiveAt });
        return res.status(200).json(result);
    } catch (error) {
        console.error('[AdminController] publishProbabilities Error:', error);
        return res.status(500).json({ error: '서버 에러' });
    }
};

exports.createAmulet = async (req, res) => {
    try {
        const { name, description, grade } = req.body;
        const file = req.file;

        if (!name || !grade || !file) {
            return res.status(400).json({ error: '이름, 등급, 이미지 파일은 필수입니다.' });
        }

        const result = await adminService.createAmulet({ name, description, grade, file });
        return res.status(201).json(result);
    } catch (error) {
        console.error('[AdminController] createAmulet error:', error);
        return res.status(500).json({ error: '서버 에러' });
    }
};

exports.updateAmulet = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, grade } = req.body;
        const file = req.file;

        const result = await adminService.updateAmulet(id, { name, description, grade, file });
        return res.status(200).json(result);
    } catch (error) {
        if (error.message === 'NOT_FOUND') {
            return res.status(404).json({ error: '해당 부적을 찾을 수 없습니다.' });
        }
        console.error('[AdminController] updateAmulet error:', error);
        return res.status(500).json({ error: '서버 에러' });
    }
};

exports.deleteAmulet = async (req, res) => {
    try {
        const { id } = req.params;
        await adminService.deleteAmulet(id);
        return res.status(200).send('OK');
    } catch (error) {
        if (error.message === 'NOT_FOUND') {
            return res.status(404).json({ error: '해당 부적을 찾을 수 없습니다.' });
        }
        console.error('[AdminController] deleteAmulet error:', error);
        return res.status(500).json({ error: '서버 에러' });
    }
};

// 전체 유저 리스트 조회
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || '';
    const limit = 10;
    const offset = (page - 1) * limit;

    const result = await adminService.getUsers({ page, search, limit, offset });
    return res.status(200).json(result);
  } catch (err) {
    console.error('[AdminController] getUsers 에러:', err);
    return res.status(500).json({ error: '서버 에러' });
  }
};

// 유저 상세 조회
exports.getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await adminService.getUserDetail(userId);
    if (!result) return res.status(404).json({ error: '유저를 찾을 수 없습니다.' });
    return res.status(200).json(result);
  } catch (err) {
    console.error('[AdminController] getUserDetail 에러:', err);
    return res.status(500).json({ error: '서버 에러' });
  }
};

// 관리자 - 문의 리스트 조회
exports.getSupportTickets = async (req, res) => {
  try {
    const { status = 'ALL', cursor, limit = 50 } = req.query;
    const queryLimit = Math.min(parseInt(limit), 50);
    const result = await adminService.getSupportTickets({ status, cursor, limit: queryLimit });
    return res.status(200).json(result);
  } catch (err) {
    console.error('[AdminController] getSupportTickets 에러:', err);
    return res.status(500).json({ error: '서버 에러' });
  }
};

// 관리자 - 문의 상태 변경/답변 등록
exports.updateSupportTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, replyContent } = req.body;
    const result = await adminService.updateSupportTicket({ ticketId, status, replyContent });
    if (!result) return res.status(404).json({ error: '문의를 찾을 수 없습니다.' });
    return res.status(200).json(result);
  } catch (err) {
    console.error('[AdminController] updateSupportTicket 에러:', err);
    return res.status(500).json({ error: '서버 에러' });
  }
};

/**
 * 사용자 부적 관리
 */

// 유저 보유 부적 목록 조회
exports.getUserAmulets = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await adminService.getUserAmulets(userId);
    res.json(result);
  } catch (error) {
    console.error('[AdminController] getUserAmulets 에러:', error);
    res.status(500).json({ error: error.message });
  }
};

// 유저에게 부적 강제 지급
exports.addAmuletToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amuletId } = req.body;
    if (!amuletId) return res.status(400).json({ error: '지급할 부적 ID가 필요합니다.' });
    
    await adminService.giveAmuletToUser(userId, amuletId);
    res.status(201).json({ message: '부적이 성공적으로 지급되었습니다.' });
  } catch (error) {
    console.error('[AdminController] addAmuletToUser 에러:', error);
    res.status(500).json({ error: error.message });
  }
};

// 유저 보유 부적 회수
exports.deleteUserAmulet = async (req, res) => {
  try {
    const { userAmuletId } = req.params;
    await adminService.revokeUserAmulet(userAmuletId);
    res.json({ message: '부적이 성공적으로 회수되었습니다.' });
  } catch (error) {
    console.error('[AdminController] deleteUserAmulet 에러:', error);
    res.status(error.status || 500).json({ error: error.message });
  }
};
