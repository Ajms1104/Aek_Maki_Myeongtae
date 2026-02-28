const adminService = require('../services/adminService');

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
        console.error('[AdminController] Error:', error);
        return res.status(500).json({ error: '서버 내부 에러' });
    }
};
