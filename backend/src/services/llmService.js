'use strict';

const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 테스트를 위해 LLM을 비활성화하고 고정 답변만 사용하려면 true로 설정하세요.
const FORCE_FALLBACK = true; 

const FALLBACK_REPLIES = [
  '세상의 모든 액운을 동해의 깊은 바닷속으로 흘려보내오니, 그대의 마음속에 맺힌 응어리가 파도에 씻겨 내려갈 것이라. 두려워 마소서, 곧 밝은 해가 떠오르리라.',
  '모진 바람이 불어와도 명태의 영험한 기운이 그대의 앞길을 지키고 있음을 잊지 마오. 어둠이 깊을수록 새벽은 머지않았으니, 오직 평안만이 그대와 함께할 것이오.',
  '고민의 사슬을 끊어내고 신령한 기운을 불어넣었으니, 이제 그대의 앞날에 만복이 깃들 것이라. 거친 바다를 헤엄쳐 온 지혜가 그대의 삶을 밝게 비추어 주리이다.'
];

const CRISIS_KEYWORDS = ['자살', '죽고싶', '죽고 싶', '스스로 목숨', '극단적 선택'];
const BLOCKED_WORDS = ['씨발', '개새끼', '병신'];
const CRISIS_REPLY = '그대의 아픔이 깊어 내 마음이 미어지는구료. 부디 전문 상담 기관(1577-0199)의 지혜를 빌려 이 모진 시간을 견뎌내어 소중한 생명을 보전하소서.';

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

function detectCrisis(content) {
  return CRISIS_KEYWORDS.some((kw) => content.includes(kw));
}

exports.generateReply = async ({ content, category }) => {
  // 1. 비속어 및 위기 감지는 API 호출 전에 수행
  checkBlockedWords(content);
  if (detectCrisis(content)) return CRISIS_REPLY;

  // 강제 폴백 모드 활성화 시 바로 반환
  if (FORCE_FALLBACK) {
    console.log('[Gemini] 강제 폴백 모드 작동 중');
    return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return `명태가 말하길: 걱정 마세요. 당신의 앞날에 행운이 가득할 거예요. 🐟`;

  try {
    // 2. 사용 가능한 모델 목록 동적 조회
    let selectedModelName = 'gemini-2.0-flash';
    
    try {
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const listRes = await axios.get(listUrl, { timeout: 3000 });
      const availableModels = listRes.data.models
        .filter(m => m.supportedGenerationMethods.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));
      
      selectedModelName = availableModels.find(name => name.includes('gemini-2.0-flash')) ||
                          availableModels.find(name => name.includes('gemini-1.5-flash')) ||
                          availableModels.find(name => name.includes('gemini-pro')) ||
                          availableModels[0] || 'gemini-2.0-flash';
    } catch (listErr) {
      console.warn('[Gemini] 모델 목록 조회 실패:', listErr.message);
    }

    // 3. SDK를 이용한 답변 생성
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: selectedModelName });

    const categoryStr = category ? `(고민 카테고리: ${category})` : '';
    const systemPrompt = `당신은 영험하고 따뜻한 기운을 가진 '액막이 명태'입니다. 
      사용자의 고민을 듣고, 마치 전통 부적에 새겨진 비문이나 신령한 계시처럼 답하세요.
      
      [답변 가이드라인]
      1. 문체: '~하오니', '~소서', '~할 것이라', '~할 것이오' 등 고전적이면서도 품격 있는 문어체를 사용하세요.
      2. 내용: 단순히 위로하는 것을 넘어, 자연물(바다, 파도, 달빛, 명태 등)을 비유로 들어 신비로운 통찰을 전달하세요.
      3. 구성: 첫 문장은 액운을 씻어내는 선언으로 시작하고, 중간은 지혜로운 조언, 끝은 평안을 기원하는 축원으로 마무리하세요.
      4. 제약: 120~150자 내외로 작성하며, 이모지는 절대 사용하지 마세요. 현대적인 은어나 가벼운 말투는 엄금합니다.`;
    
    const prompt = `${systemPrompt}\n\n사용자의 고민: ${content} ${categoryStr}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (text) {
      return text.trim();
    } else {
      throw new Error('EMPTY_RESPONSE');
    }
  } catch (err) {
    console.error('[Gemini] 답변 생성 중 최종 오류 발생:', err.message);
    return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
  }
};
