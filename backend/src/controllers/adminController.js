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
