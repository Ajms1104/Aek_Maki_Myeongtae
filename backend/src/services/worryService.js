const worryRepository = require('../repositories/worryRepository');
//const amuletRepository = require('../repositories/amuletRepository');
//const llmClient = require('../external/llmClient');
//const crypto = require('crypto');

exports.processWorry = async ({ userToken, content, category }) => {
  // 1. LLM 답변 생성
  const advice = await llmClient.getAdvice(content, category);

  // 2. 고민 저장 (암호화 + 30일 TTL 설정)
  const encryptedContent = crypto.createHash('sha256').update(content).digest('hex');
  const worryEntry = await worryRepository.save({
    userId: userToken,
    content: encryptedContent,
    category,
    expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  // 3. 확률 기반 부적 뽑기
  const amulets = await amuletRepository.getAll();
  const selected = amulets[Math.floor(Math.random() * amulets.length)]; // 임시 랜덤

  // 4. 보유 여부 확인 및 저장
  const isNew = !(await amuletRepository.checkUserHas(userToken, selected.id));
  await amuletRepository.giveToUser(userToken, selected.id);

  return {
    historyId: worryEntry.id,
    llmResponse: advice,
    amulet: { ...selected, isNew }
  };
};