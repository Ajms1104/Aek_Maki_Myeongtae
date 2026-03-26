const worryRepository = require('../repositories/worryRepository');
const amuletRepository = require('../repositories/amuletRepository');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

exports.processWorry = async ({ userId, content, category }) => {

  // 1. LLM - 실제 연동 전 더미 응답
  const advice = `명태가 말하길: 지금의 걱정은 곧 지나갈 거예요. 🐟`;

  // 2. 고민 저장
  const encryptedContent = crypto.createHash('sha256').update(content).digest('hex');
  const worryEntry = await worryRepository.save({
    userId, //원래 코드 : userId: userToken,
    content: encryptedContent,
    category,
    expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  // 3. 부적 뽑기
  const amulets = await amuletRepository.getAll();
  if (!amulets || amulets.length === 0) {
    throw new Error('등록된 부적이 없습니다.');
  }
  const selected = amulets[Math.floor(Math.random() * amulets.length)];

  // 4. 보유 여부 확인 및 지급
  const isNew = !(await amuletRepository.checkUserHas(userId, selected.id)); //원래코드 : userToken, selected.id
  await amuletRepository.giveToUser(userId, selected.id); //원래코드 : userToken, selected.id

  return {
    historyId: worryEntry.id,
    llmResponse: advice,
    amulet: { ...selected, isNew }
  };
};

// 부적 다운로드 정보
exports.getAmuletDownloadInfo = async (userId, userAmuletId) => {
  const amulet = await amuletRepository.findUserAmuletWithOwner(userId, userAmuletId);

  if (!amulet) {
    throw { status: 404, message: '부적을 찾을 수 없거나 소유 권한이 없습니다.' };
  }
  const filePath = path.join(__dirname, '../../', amulet.image_url);

  if (!fs.existsSync(filePath)) {
    throw { status: 404, message: '서버 파일이 존재하지 않습니다.' };
  }
  return { filePath, fileName: `${amulet.name}.png` };
};