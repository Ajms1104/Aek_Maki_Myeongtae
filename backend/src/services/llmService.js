'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');

const MOCK_MODE = !process.env.GEMINI_API_KEY;

// 위기 키워드 감지 | 추후 보강할 것
const CRISIS_KEYWORDS = ['자살', '죽고싶', '죽고 싶', '스스로 목숨', '극단적 선택'];

// 금칙어 | 추후 보강할 것
const BLOCKED_WORDS = ['씨발', '개새끼', '병신'];

const CRISIS_REPLY =
  '많이 힘드시겠어요. 지금 느끼는 감정은 혼자 감당하기 어려울 수 있어요. ' +
  '전문 상담 기관(정신건강 위기상담 전화: 1577-0199, 24시간)에 연락해보시는 건 어떨까요?';

// 금칙어 체크
function checkBlockedWords(content) {
  for (const word of BLOCKED_WORDS) {
    if (content.includes(word)) {
      const err = new Error('부적절한 단어가 포함되어 있습니다.');
      err.status = 400;
      err.code = 'PROFANITY';
      throw err;
    }
  }
}

// 위기 키워드 감지
function detectCrisis(content) {
  return CRISIS_KEYWORDS.some((kw) => content.includes(kw));
}

/**
 * Gemini로 명태 답변 생성
 * @param {{ content: string, category?: string }} params
 * @returns {Promise<string>}
 */
exports.generateReply = async ({ content, category }) => {
  // 금칙어 체크
  checkBlockedWords(content);

  // 위기 키워드 감지
  if (detectCrisis(content)) {
    return CRISIS_REPLY;
  }

  // 3. MOCK 모드
  if (MOCK_MODE) {
    console.warn('[MOCK] Gemini API 스킵 - 더미 답변 반환');
    return `명태가 말하길: 지금의 걱정은 곧 지나갈 거예요. 🐟`;
  }

  // 실제 Gemini 호출
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); //모델 변경시 같이 바꿔줄 것 필수!!

    const categoryStr = category ? `(카테고리: ${category})` : '';
    const prompt = //의미있는 답변을 위해 좀 더 수정할 필요가 있음
      `당신은 "액막이 명태" 미니앱의 지혜로운 명태 캐릭터예요. ` +
      `항상 사용자에게 존댓말은 해야 돼요 `+
      `답변 할 때 이모지나 이모티콘, 마크다운 문법은 사용하면 안돼요 `+
      `사용자의 고민을 따뜻하고 위트있게 들어주고, ` +
      `100~200자 내외의 짧은 위로와 조언을 한국어로 답해주세요. ` +
      `고민${categoryStr}: ${content}`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('[Gemini] API 호출 실패:', err.message);
    const error = new Error('LLM_ERROR');
    error.status = 503;
    throw error;
  }
};