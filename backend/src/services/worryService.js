const worryRepository = require('../repositories/worryRepository');
const amuletRepository = require('../repositories/amuletRepository');
const crypto = require('crypto');

exports.processWorry = async ({userId, content, category }) => {

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