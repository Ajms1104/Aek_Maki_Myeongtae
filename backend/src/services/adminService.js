const amuletRepository = require('../repositories/amuletRepository');

// 확률 조회
exports.getProbabilities = async () => {
    const config = await amuletRepository.getProbabilityConfig();
    const items = await amuletRepository.getDraftWeights();

    return {
        version: config.version,
        updatedAt: config.updatedAt,
        items
    };
};

// 드래프트 확률 업데이트
exports.updateProbability = async (id, weight) => {
    const updatedAmulet = await amuletRepository.updateWeight(id, weight);
    if (!updatedAmulet) {
        throw new Error('NOT_FOUND');
    }

    return {
        message: '부적 드래프트 확률이 수정되었습니다. 최종 적용을 위해 발행을 진행해주세요.',
        updatedAmulet
    };
};

// 확률 실제 적용
exports.publishProbabilities = async ({ effectiveAt }) => {
    const config = await amuletRepository.getProbabilityConfig();
    const nextVersion = config.version + 1;
    const weights = await amuletRepository.getDraftWeightsRows();

    // 예약인 경우
    if (effectiveAt && new Date(effectiveAt) > new Date()) {
        const schedule = await amuletRepository.createSchedule(nextVersion, weights, effectiveAt);
        return {
            message: '확률 발행이 예약되었습니다.',
            publishedVersion: schedule.version,
            effectiveAt: schedule.effectiveAt,
            status: 'SCHEDULED'
        };
    }

    // 즉시 적용
    const result = await amuletRepository.applyWeights(nextVersion, weights);
    return {
        message: '확률이 즉시 적용되었습니다.',
        publishedVersion: result.version,
        effectiveAt: result.effectiveAt,
        status: 'PUBLISHED'
    };
};

// 부적 생성
exports.createAmulet = async ({ name, description, grade, file }) => {
    const imageUrl = `/uploads/${file.filename}`;
    const newAmulet = await amuletRepository.create({ name, description, grade, imageUrl });
    return newAmulet;
};

// 부적 수정
exports.updateAmulet = async (id, { name, description, grade, file }) => {
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (grade) updateData.grade = grade;
    if (file) updateData.image_url = `/uploads/${file.filename}`;

    const updatedAmulet = await amuletRepository.update(id, updateData);
    if (!updatedAmulet) {
        throw new Error('NOT_FOUND');
    }
    return updatedAmulet;
};

// 부적 삭제
exports.deleteAmulet = async (id) => {
    const deleted = await amuletRepository.deleteById(id);
    if (!deleted) {
        throw new Error('NOT_FOUND');
    }
    return true;
};
