const amuletRepository = require('../repositories/amuletRepository');

exports.updateProbability = async (id, weight) => {
    // 1. 부적 확률 변경
    const updatedAmulet = await amuletRepository.updateWeight(id, weight);
    if (!updatedAmulet) {
        throw new Error('NOT_FOUND');
    }

    // 2. 전체 부적 확률 리스트 
    const allAmulets = await amuletRepository.getAllWeights();

    // 3. 전체 합 계산
    const totalWeight = allAmulets.reduce((sum, amulet) => sum + Number(amulet.weight), 0);

    return {
        message: '부적 확률 변동이 성공적으로 반영되었습니다.',
        updatedAmulet,
        totalWeight,
        allAmulets
    };
};
