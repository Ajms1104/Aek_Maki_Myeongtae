const worryService = require('../services/worryService');

exports.createWorry = async (req, res) => {
  try {
    const userToken = req.headers.authorization;
    const { content, category } = req.body;

    // 기본적인 밸리데이션
    if (!content || content.length < 10 || content.length > 300) {
      return res.status(400).json({ error: '고민은 10자 이상 300자 이내로 적어주세요.' });
    }

    // 서비스 레이어로 전달
    const result = await worryService.processWorry({ userToken, content, category });
    
    return res.status(200).json(result);
  } catch (error) {
    if (error.message === 'PROFANITY') return res.status(400).json({ error: '부적절한 단어 포함' });
    if (error.message === 'LLM_ERROR') return res.status(503).json({ error: '명태가 답변 준비 중 에러가 났어요.' });
    
    return res.status(500).json({ error: '서버 내부 에러' });
  }
};