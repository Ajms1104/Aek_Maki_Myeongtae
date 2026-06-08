import type { Talisman, Grade } from '../types';
import { getAmuletImage } from '../utils/amuletAssets';

export const GRADE_COLORS: Record<Grade, { bg: string; text: string; sub: string }> = {
  legend: { bg: '#f4edff', text: '#a25df5', sub: '#e8d9ff' }, // 보라색
  rare:   { bg: '#e8f3ff', text: '#3182f6', sub: '#d0e6ff' }, // 파란색
  common: { bg: '#ffffff', text: '#191f28', sub: '#f2f4f6' }, // 흰색
  hidden: { bg: '#fff0f6', text: '#f783ac', sub: '#ffdeeb' }, // 히든 전용
};

export const INITIAL_TALISMAN_DATA: Talisman[] = [
  // common (id 1~31)
  { id: 1,  unlocked: false, name: '윙크 명태',       grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_01.png', 'ui'), count: 0, description: '명태가 보내는 기분 좋은 깜빡임이 당신의 긴장을 녹여줄 거예요. 오늘 하루, 예상치 못한 작은 행운이 당신을 향해 윙크할지도 몰라요!' },
  { id: 2,  unlocked: false, name: '깜짝 명태',       grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_02.png', 'ui'), count: 0, description: '눈이 동그래진 명태가 당신의 불운을 보고 먼저 놀라 쫓아버렸어요! 나쁜 일은 놀란 가슴과 함께 날려버리고, 즐거운 소식만 맞이하세요.' },
  { id: 3,  unlocked: false, name: '겁먹은 명태',     grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_03.png', 'ui'), count: 0, description: '당신의 걱정이 너무 커서 명태도 잠시 겁을 먹었나 봐요. 하지만 걱정 마세요, 명태가 대신 겁먹어준 덕분에 당신에겐 용기만 남을 테니까요.' },
  { id: 4,  unlocked: false, name: '화난 명태',       grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_04.png', 'ui'), count: 0, description: '부정적인 기운을 향해 명태가 대신 화를 내주고 있어요! 당신을 괴롭히던 나쁜 생각들은 명태의 불호령에 멀리 달아날 것입니다.' },
  { id: 5,  unlocked: false, name: '반짝이는 명태',   grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_05.png', 'ui'), count: 0, description: '초롱초롱한 눈망울의 명태가 당신의 숨겨진 재능을 발견했습니다. 오늘 당신은 그 누구보다 눈부시게 빛날 자격이 충분합니다.' },
  { id: 6,  unlocked: false, name: '슬픈 명태',       grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_06.png', 'ui'), count: 0, description: '명태가 당신의 슬픔을 대신 지고 울고 있어요. 명태의 눈물과 함께 마음속 응어리도 씻어내고, 내일은 꼭 맑은 웃음을 되찾으시길.' },
  { id: 7,  unlocked: false, name: '메롱 명태',       grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_07.png', 'ui'), count: 0, description: '인생의 심각한 고민들도 명태의 익살스러운 장난에 웃어넘겨 보세요. 가벼운 마음이 때로는 가장 강력한 액막이가 되기도 한답니다.' },
  { id: 8,  unlocked: false, name: '기본 명태',       grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_08.png', 'ui'), count: 0, description: '가장 평범해 보이지만 가장 튼튼한 명태입니다. 당신의 일상이 흔들리지 않도록 묵묵히 곁을 지키며 안정을 선물할 거예요.' },
  { id: 9,  unlocked: false, name: '잠자는 명태',     grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_09.png', 'ui'), count: 0, description: '명태가 당신의 불면과 근심을 안고 깊은 잠에 들었습니다. 오늘 밤만큼은 아무 생각 없이 명태처럼 편안하고 달콤한 휴식을 취해보세요.' },
  { id: 10, unlocked: false, name: '사악한 명태',     grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_10.png', 'ui'), count: 0, description: '나쁜 기운을 물리치기 위해 명태가 더 무섭게 변신했습니다! 당신을 방해하는 검은 그림자들은 이 명태의 기세에 눌려 접근조차 못 할 거예요.' },
  { id: 11, unlocked: false, name: '짝사랑 명태',     grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_11.png', 'ui'), count: 0, description: '사랑 때문에 가슴 앓이 중인가요? 수줍은 명태가 당신의 진심을 상대방에게 몰래 전달해 줄 거예요. 설레는 인연이 시작되길 기원합니다.' },
  { id: 12, unlocked: false, name: '뽀뽀 명태',       grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_12.png', 'ui'), count: 0, description: '사랑과 애정이 가득한 기운을 전합니다. 서먹했던 관계가 회복되고, 소중한 사람들과의 사이가 명태의 뽀뽀처럼 더욱 돈독해질 거예요.' },
  { id: 13, unlocked: false, name: '승리자 명태',     grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_13.png', 'ui'), count: 0, description: '자신만만한 미소를 띤 명태가 승리의 소식을 가져옵니다. 경쟁에서 이기고 목표를 달성하는 성취의 기쁨이 당신을 기다리고 있습니다.' },
  { id: 14, unlocked: false, name: '초롱초롱 명태',   grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_14.png', 'ui'), count: 0, description: '호기심 가득한 눈으로 세상을 보는 명태입니다. 지루했던 일상 속에서 새로운 영감과 가슴 뛰는 발견을 할 수 있게 도와줄 거예요.' },
  { id: 15, unlocked: false, name: '익살 명태',       grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_15.png', 'ui'), count: 0, description: '명태의 유쾌한 에너지가 우울함을 한방에 날려줍니다! 억지로라도 한번 웃어보세요. 이 명태가 진짜 웃음꽃이 피게 만들어 드릴게요.' },
  { id: 16, unlocked: false, name: '노곤 명태',       grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_16.png', 'ui'), count: 0, description: '열심히 달려온 당신, 잠시 쉬어가도 괜찮습니다. 노곤하게 풀린 명태와 함께 긴장을 풀고 삶의 여유를 만끽해 보세요.' },
  { id: 17, unlocked: false, name: '배부른 명태',     grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_17.png', 'ui'), count: 0, description: '부족함 없이 풍족한 마음을 상징합니다. 식복과 재물복이 가득 차올라, 당신의 삶이 명태의 배처럼 든든하고 여유로워질 거예요.' },
  { id: 18, unlocked: false, name: '감탄 명태',       grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_18.png', 'ui'), count: 0, description: '놀라운 행운에 감탄할 준비가 되셨나요? 명태가 입을 쩍 벌릴 만큼 기막히게 좋은 소식이 곧 당신의 귓가에 들려올 것입니다.' },
  { id: 19, unlocked: false, name: '반장대소 명태',   grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_19.png', 'ui'), count: 0, description: '크게 웃으면 복이 온다는 말, 진짜랍니다. 명태와 함께 배꼽 빠지게 웃다 보면 꼬였던 문제들도 마법처럼 풀려나갈 거예요.' },
  { id: 20, unlocked: false, name: '식은땀 명태',     grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_20.png', 'ui'), count: 0, description: '긴장되는 순간, 명태가 당신의 식은땀을 대신 흘려줍니다. 당신은 차분하고 대담하게 실력을 발휘하기만 하세요. 결과는 좋을 거예요!' },
  { id: 21, unlocked: false, name: '명상 명태',       grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_21.png', 'ui'), count: 0, description: '복잡한 머릿속을 명태와 함께 비워보세요. 고요한 마음속에서 당신이 찾던 정답과 평화가 자연스럽게 떠오를 것입니다.' },
  { id: 22, unlocked: false, name: '부끄 명태',       grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_22.png', 'ui'), count: 0, description: '수줍어하는 명태의 귀여운 기운이 당신의 매력을 높여줍니다. 사람들 앞에서 자신감을 찾고, 사랑스러운 이미지를 심어주는 데 도움을 줄 거예요.' },
  { id: 23, unlocked: false, name: '열정 명태',       grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_23.png', 'ui'), count: 0, description: '이글거리는 눈빛의 명태가 당신의 의지에 불을 지핍니다! 정체되었던 일들이 명태의 뜨거운 기운을 받아 활기차게 풀리기 시작할 거예요.' },
  { id: 24, unlocked: false, name: '비웃는 명태',     grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_24.png', 'ui'), count: 0, description: '당신을 얕보는 부정적인 시선들을 명태가 비웃어 넘깁니다. 타인의 시선에 휘둘리지 말고 당신만의 길을 당당하게 걸어가세요.' },
  { id: 25, unlocked: false, name: '의욕제로 명태',   grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_25.png', 'ui'), count: 0, description: '아무것도 하기 싫은 날, 이 명태가 당신의 무력감을 대신 짊어집니다. 억지로 힘내지 않아도 괜찮아요. 에너지가 차오를 때까지 명태가 기다려줄게요.' },
  { id: 26, unlocked: false, name: '흥얼 명태',       grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_26.png', 'ui'), count: 0, description: '콧노래가 절로 나오는 즐거운 기운입니다. 하는 일마다 리듬을 타듯 경쾌하게 진행되고, 하루 종일 좋은 기분이 유지될 거예요.' },
  { id: 27, unlocked: false, name: '도파민 명태',     grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_27.png', 'ui'), count: 0, description: '짜릿한 즐거움과 신선한 자극이 필요한 당신에게 최고의 부적입니다. 지루함을 깨뜨릴 흥미진진한 사건들이 당신을 찾아옵니다.' },
  { id: 28, unlocked: false, name: '의심 명태',       grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_28.png', 'ui'), count: 0, description: '속임수나 실수를 미리 방지하는 날카로운 직관력을 빌려줍니다. 미심쩍은 상황에서 명태의 예민한 감각이 당신을 손해로부터 지켜줄 거예요.' },
  { id: 29, unlocked: false, name: '발랄 명태',       grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_29.png', 'ui'), count: 0, description: '통통 튀는 명태의 생동감이 당신의 일상을 활기로 채웁니다. 주변 사람들까지 행복하게 만드는 밝은 에너지가 당신에게 깃들 거예요.' },
  { id: 30, unlocked: false, name: '밤샌 명태',       grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_30.png', 'ui'), count: 0, description: '피치 못할 사정으로 밤을 지새운 당신을 응원합니다. 흐릿한 정신을 맑게 해주고, 오늘 하루를 무사히 마칠 수 있는 끈기를 선물할게요.' },
  { id: 31, unlocked: false, name: '피곤 명태',       grade: 'common', img: getAmuletImage('/uploads/common/common_amulet_31.png', 'ui'), count: 0, description: '천근만근 무거운 몸을 명태가 받쳐줍니다. 지친 기력을 회복하고 다시 일어설 수 있도록 명태의 은은한 치유 에너지가 당신을 감싸 안을 거예요.' },

  // rare (id 32~68)
  { id: 32, unlocked: false, name: '천문학자 명태',       grade: 'rare', img: getAmuletImage('/uploads/rare/rare_amulet_01.png', 'ui'), count: 0, description: '밤하늘의 길을 찾는 명태의 망원경이 당신의 어두운 앞길을 밝게 비춰줍니다. 혼란스러운 선택의 기로에서 올바른 방향을 짚어줄 거예요.' },
  { id: 33, unlocked: false, name: '패션디자이너 명태',   grade: 'rare', img: getAmuletImage('/uploads/rare/rare_amulet_02.png', 'ui'), count: 0, description: '세련된 감각을 지닌 명태가 당신의 매력을 극대화합니다. 어디를 가든 돋보이는 존재감을 발휘하고, 사람들의 시선을 사로잡는 마법 같은 기운을 드려요.' },
  { id: 34, unlocked: false, name: '건축가 명태',         grade: 'rare', img: getAmuletImage('/uploads/rare/rare_amulet_03.png', 'ui'), count: 0, description: '무너지지 않는 단단한 기초를 세워줍니다. 당신이 계획하는 사업이나 공부, 목표들이 흔들림 없이 차곡차곡 쌓여 거대한 결실을 맺게 될 거예요.' },
  { id: 35, unlocked: false, name: '보석감정사 명태',     grade: 'rare', img: getAmuletImage('/uploads/rare/rare_amulet_04.png', 'ui'), count: 0, description: '진짜 가치를 알아보는 혜안을 빌려줍니다. 겉모습에 속지 않고 소중한 인연과 기회를 놓치지 않도록 명태의 예리한 관찰력이 당신과 함께합니다.' },
  { id: 36, unlocked: false, name: '엔지니어 명태',       grade: 'rare', img: getAmuletImage('/uploads/rare/rare_amulet_05.png', 'ui'), count: 0, description: '복잡하고 꼬인 문제들을 명쾌하게 수리해 드립니다. 막혔던 업무나 기계 결함, 인간관계의 갈등까지 명태의 정교한 기운이 하나씩 풀어낼 것입니다.' },
  { id: 40, unlocked: false, name: '플로리스트 명태',     grade: 'rare', img: getAmuletImage('/uploads/rare/rare_amulet_09.png', 'ui'), count: 0, description: '삭막했던 당신의 마음에 아름다운 꽃을 피워줍니다. 정서적인 안정과 풍요로움을 선사하며, 당신의 공간을 생기와 향기로 가득 채워줄 거예요.' },
  { id: 41, unlocked: false, name: '스쿠버다이버 명태',   grade: 'rare', img: getAmuletImage('/uploads/rare/rare_amulet_10.png', 'ui'), count: 0, description: '깊은 무의식의 바다에서 당신도 몰랐던 행운의 보물을 건져 올립니다. 침체되어 있던 운기가 깊은 곳에서부터 다시 솟구쳐 오를 것입니다.' },
  { id: 42, unlocked: false, name: '연주가 명태',         grade: 'rare', img: getAmuletImage('/uploads/rare/rare_amulet_11.png', 'ui'), count: 0, description: '인생의 불협화음을 조화로운 선율로 바꿔줍니다. 당신의 말과 행동이 타인에게 아름답게 전달되어 대인관계에서 큰 인기를 얻게 될 거예요.' },
  { id: 45, unlocked: false, name: '파티시에 명태',       grade: 'rare', img: getAmuletImage('/uploads/rare/rare_amulet_14.png', 'ui'), count: 0, description: '씁쓸했던 일상을 달콤한 성공으로 요리해 드립니다. 노력한 결과가 최상의 맛과 모양으로 나타나, 주변의 칭송과 보상을 동시에 받게 될 것입니다.' },
  { id: 47, unlocked: false, name: '우주비행사 명태',     grade: 'rare', img: getAmuletImage('/uploads/rare/rare_amulet_16.png', 'ui'), count: 0, description: '지상의 제약에서 벗어나 더 넓은 세계로 도약하게 도와줍니다. 한계를 극복하고 원대한 꿈을 실현할 수 있는 무한한 우주의 기운을 전해 드립니다.' },
  { id: 48, unlocked: false, name: '교사 명태',           grade: 'rare', img: getAmuletImage('/uploads/rare/rare_amulet_17.png', 'ui'), count: 0, description: '지혜를 가르치고 깨달음을 주는 기운입니다. 공부 운과 합격 운을 높여주며, 당신의 지식이 널리 인정받아 존경받는 위치에 오르게 될 것입니다.' },
  { id: 50, unlocked: false, name: '영화감독 명태',       grade: 'rare', img: getAmuletImage('/uploads/rare/rare_amulet_19.png', 'ui'), count: 0, description: '인생이라는 영화의 주인공인 당신이 멋진 시나리오를 써 내려가게 돕습니다. 극적인 반전과 해피엔딩을 선사하며, 당신의 삶을 예술로 만들어줄 거예요.' },
  { id: 51, unlocked: false, name: '수의사 명태',         grade: 'rare', img: getAmuletImage('/uploads/rare/rare_amulet_20.png', 'ui'), count: 0, description: '상처받은 영혼을 치유하고 돌보는 따뜻한 기운입니다. 반려동물과의 교감을 돕고, 주변 사람들에게 포근한 안식처가 되어주는 치유의 힘을 빌려드려요.' },
  { id: 55, unlocked: false, name: '해커 명태',           grade: 'rare', img: getAmuletImage('/uploads/rare/rare_amulet_24.png', 'ui'), count: 0, description: '어떤 난관도 뚫고 지나가는 명쾌한 해결책을 찾아냅니다. 보안과 방어의 기운도 함께 있어, 당신의 소중한 정보와 재산을 위협으로부터 완벽히 보호해 줄 거예요.' },
  { id: 56, unlocked: false, name: '의사 명태',           grade: 'rare', img: getAmuletImage('/uploads/rare/rare_amulet_25.png', 'ui'), count: 0, description: '심신의 고통을 덜어주고 건강을 수호합니다. 나쁜 질병의 기운이 틈타지 못하도록 강한 면역의 벽을 세워주며, 매일매일 활기찬 컨디션을 유지하게 돕습니다.' },
  { id: 57, unlocked: false, name: '소방관 명태',         grade: 'rare', img: getAmuletImage('/uploads/rare/rare_amulet_26.png', 'ui'), count: 0, description: '갑작스러운 사고와 재난의 불길을 명태가 대신 꺼드립니다. 위급한 순간마다 당신을 구출해 주는 수호천사 같은 기운이 위기를 기회로 바꿔놓을 거예요.' },
  { id: 58, unlocked: false, name: '경찰관 명태',         grade: 'rare', img: getAmuletImage('/uploads/rare/rare_amulet_27.png', 'ui'), count: 0, description: '정의와 질서의 기운으로 당신을 지킵니다. 불공평한 대우나 억울한 상황에서 벗어나게 해주고, 주변의 시비와 다툼을 깔끔하게 정리해 주는 강력한 수호 부적입니다.' },
  { id: 59, unlocked: false, name: '판사 명태',           grade: 'rare', img: getAmuletImage('/uploads/rare/rare_amulet_28.png', 'ui'), count: 0, description: '공명정대한 판결로 당신의 억울함을 풀어줍니다. 복잡한 소송이나 시시비비가 가려져야 하는 일에서 당신에게 유리한 정의의 결과를 가져다줄 것입니다.' },
  { id: 67, unlocked: false, name: '개발자 명태',         grade: 'rare', img: getAmuletImage('/uploads/rare/rare_amulet_36.png', 'ui'), count: 0, description: '세상의 규칙을 다시 쓰는 창조적인 에너지를 드립니다. 막혔던 로직이 풀리듯 복잡한 일들이 논리적으로 해결되고, 당신의 아이디어가 현실이 되는 기적을 경험하세요.' },

  // legend (id 69~84)
  { id: 69, unlocked: false, name: '태양 명태',   grade: 'legend', img: getAmuletImage('/uploads/legend/legend_amulet_01.png', 'ui'), count: 0, description: '태양의 강렬한 화마가 모든 어둠과 부정적인 기운을 단숨에 태워버립니다. 당신의 삶에 찬란한 광명과 무한한 생명력이 영원토록 깃들지어다.' },
  { id: 70, unlocked: false, name: '무지개 명태', grade: 'legend', img: getAmuletImage('/uploads/legend/legend_amulet_02.png', 'ui'), count: 0, description: '비 온 뒤에 뜨는 무지개처럼, 고난 끝에 찾아오는 최고의 축복을 상징합니다. 7가지 행운의 빛깔이 당신의 앞날을 화려하고 풍요롭게 수놓을 것입니다.' },
  { id: 71, unlocked: false, name: '황금 명태',   grade: 'legend', img: getAmuletImage('/uploads/legend/legend_amulet_03.png', 'ui'), count: 0, description: '천지만물의 재운이 이 황금 명태에게 집중됩니다. 만지는 것마다 금으로 변하는 미다스의 손처럼, 당신의 모든 경제적 활동에 막대한 부가 따를 것입니다.' },
  { id: 72, unlocked: false, name: '구름 명태',   grade: 'legend', img: getAmuletImage('/uploads/legend/legend_amulet_04.png', 'ui'), count: 0, description: '하늘 위를 유영하는 구름처럼 자유롭고 신비로운 운기입니다. 구설수와 속박에서 벗어나 고고한 위치에 오르게 하며, 세상을 굽어보는 명망을 얻게 될 거예요.' },
  { id: 73, unlocked: false, name: '번개 명태',   grade: 'legend', img: getAmuletImage('/uploads/legend/legend_amulet_05.png', 'ui'), count: 0, description: '벽력(霹靂)과 같은 기세로 사악한 악귀들을 단숨에 멸합니다. 당신을 가로막는 어떤 장애물도 이 강렬한 번개 한 번에 가루가 되어 사라질 만큼 강력한 보호를 선사합니다.' },
  { id: 74, unlocked: false, name: '수호신 명태', grade: 'legend', img: getAmuletImage('/uploads/legend/legend_amulet_06.png', 'ui'), count: 0, description: '태초부터 당신을 지키기 위해 존재했던 절대적인 수호의 기운입니다. 어떤 우연한 사고나 악의적인 기운도 당신의 털끝 하나 건드리지 못하도록 철통같이 방어합니다.' },
  { id: 75, unlocked: false, name: '얼음 명태',   grade: 'legend', img: getAmuletImage('/uploads/legend/legend_amulet_07.png', 'ui'), count: 0, description: '활활 타오르는 화(火)의 기운과 분노를 차갑게 식혀줍니다. 냉철한 판단력과 이성을 유지하게 하여, 일촉즉발의 상황에서도 완벽한 승리를 거둘 수 있게 얼음처럼 견고한 기운을 드려요.' },
  { id: 76, unlocked: false, name: '불꽃 명태',   grade: 'legend', img: getAmuletImage('/uploads/legend/legend_amulet_08.png', 'ui'), count: 0, description: '꺼지지 않는 불멸의 열정과 생명력을 부여합니다. 패배와 절망을 용광로 속에 집어넣고 다시 태어나는 피닉스처럼, 당신의 삶을 뜨겁고 강렬한 환희로 가득 채울 것입니다.' },
  { id: 77, unlocked: false, name: '밤 명태',     grade: 'legend', img: getAmuletImage('/uploads/legend/legend_amulet_09.png', 'ui'), count: 0, description: '깊고 고요한 밤의 기운이 당신을 은밀하게 보호합니다. 경쟁자들 모르게 힘을 기르고, 보이지 않는 곳에서 행운이 쌓여 어느 날 거대한 결실로 나타나는 신비로운 운기입니다.' },
  { id: 78, unlocked: false, name: '보석 명태',   grade: 'legend', img: getAmuletImage('/uploads/legend/legend_amulet_10.png', 'ui'), count: 0, description: '당신이라는 보석이 최고의 가치로 빛나게 세공해 드립니다. 명예와 지위가 드높아지며, 세상 모든 사람의 우러름을 받는 고귀한 존재가 되도록 별의 기운을 담았습니다.' },
  { id: 79, unlocked: false, name: '사탕 명태',   grade: 'legend', img: getAmuletImage('/uploads/legend/legend_amulet_11.png', 'ui'), count: 0, description: '세상의 모든 달콤함과 기쁨이 당신에게 집중됩니다. 괴로운 일은 흔적도 없이 사라지고, 매일매일이 축제 같은 즐거움과 사랑으로 가득 찬 파라다이스를 경험하게 될 거예요.' },
  { id: 80, unlocked: false, name: '모래 명태',   grade: 'legend', img: getAmuletImage('/uploads/legend/legend_amulet_12.png', 'ui'), count: 0, description: '유구한 시간과 인내의 기운을 담았습니다. 사막의 오아시스처럼 메마른 삶에 기적 같은 풍요를 선사하며, 당신이 쌓아온 노력이 영원히 무너지지 않는 성(城)이 되게 합니다.' },
  { id: 81, unlocked: false, name: '바람 명태',   grade: 'legend', img: getAmuletImage('/uploads/legend/legend_amulet_13.png', 'ui'), count: 0, description: '막힌 기운을 소통시키고 새로운 변화의 바람을 몰고 옵니다. 침체된 운명을 일깨워 순풍에 돛 단 듯 당신이 원하는 목적지까지 가장 빠르고 쾌적하게 안내할 것입니다.' },
  { id: 82, unlocked: false, name: '어둠 명태',   grade: 'legend', img: getAmuletImage('/uploads/legend/legend_amulet_14.png', 'ui'), count: 0, description: '그림자 속에 숨은 적들을 제압하고 비밀스러운 힘을 다스립니다. 혼란한 세상을 뒤집는 대담한 배짱과 통찰력을 주어, 보이지 않는 영역까지 당신의 영향력 아래 두게 합니다.' },
  { id: 83, unlocked: false, name: '화산 명태',   grade: 'legend', img: getAmuletImage('/uploads/legend/legend_amulet_15.png', 'ui'), count: 0, description: '대지의 억눌린 에너지가 폭발하듯 거대한 성공의 기회를 터뜨려줍니다. 주저하던 과거를 날려버리고, 압도적인 힘으로 세상을 장악하는 통치자의 운기를 부여합니다.' },
  { id: 84, unlocked: false, name: '숲 명태',     grade: 'legend', img: getAmuletImage('/uploads/legend/legend_amulet_16.png', 'ui'), count: 0, description: '대자연의 무한한 치유력과 생명력이 당신을 뿌리 깊은 나무처럼 지탱합니다. 몸과 마음의 평온은 물론, 가문과 자손 대대로 이어지는 번창의 기운을 약속합니다.' },
];

export const HIDDEN_TALISMAN_DATA: Talisman[] = [
  { 
    id: 85, unlocked: false, name: 'Sourcandy 명태', grade: 'hidden', count: 0,
    img: getAmuletImage('/uploads/hidden/hidden_amulet_01.png', 'ui'), 
    description: 'Sourcandy 명태는 달콤하면서도 톡 쏘는 에너지로 당신의 지루한 일상을 깨워줄 거예요.',
    letter: '안녕하세요 사용자 여러분, 개발자 장시영입니다.\n먼저, 저희 앱을 이용해 주셔서 너무나도 감사합니다.\n여러분들은 이 금괴 명태가 어떻게 보이시나요? 몇몇 주변사람들은 이게뭐냐 인절미냐\n의도는 알겠는데 그냥 치즈덩어리다 라고들 하는데요.\n금괴가 행운,재물을 상징해서 이 부적을 받은 분들은 큰 걱정은 줄고 큰 행운은 늘어나라는\n마음으로 그렸습니다.\n제가 의도한 바로 한눈에 알아봐주신 분들도 있기를 간절히X3 바랍니다.\n아무리 해도 금괴로 안보이신다면 금괴로 상상하며 봐주세요..\n모두들 건강하시고 무사무탈 하시길 !!',
    fontFamily: '"East Sea Dokdo", cursive'
  },
  { 
    id: 86, unlocked: false, name: 'Moshu 명태', grade: 'hidden', count: 0,
    img: getAmuletImage('/uploads/hidden/hidden_amulet_02.png', 'ui'), 
    description: 'Moshu 명태는 따뜻하고 부드러운 기운으로 당신의 지친 마음을 포근하게 안아줍니다.',
    letter: '안녕하세요 액막이 AI를 이용해주셔서 감사합니다\n해당 부적(그림)에 제가 좋아하는 것들과 명태, 돈과 네잎클로버를\n적절하게 배치해, 액막이+행운 기능을 극대화 해봤습니다\n항상 행복하시고 건강하시길 바라겠습니다\n다시 한 번 이용 및 구매해주셔서 감사합니다',
    fontFamily: '"Nanum Pen Script", cursive'
  },
  { 
    id: 87, unlocked: false, name: 'LeeJin 명태', grade: 'hidden', count: 0,
    img: getAmuletImage('/uploads/hidden/hidden_amulet_03.png', 'ui'), 
    description: 'LeeJin 명태는 명석한 지혜와 결단력을 주어 당신이 나아갈 길을 밝게 비춰줍니다.',
    letter: '안녕하세요 개발자 이승진입니다.\n이 프로젝트가 생초보 개발자 5명이서 한번 해보자 해서 만든 지\n4개월이 걸린 프로젝트네요\n이 감사 편지를 보고 계신다는 건 저희가 만든 앱이 출시되어\n여러분들이 결제까지 가능할 정도로 완성시켰다는 의미겠네요\n제 명태는 딱 봐도 덩치가 있죠? 저희 팀에서 가장 잘 먹는 개발자다 보니\n스스로 붕어빵이 되어보았습니다. 거기에 제 올블랙 스타일까지 넣어봤습니다.\n다시 한번 저희 앱에 결제해 주셔서 감사합니다.\n여러분들의 행운을 위해 보관함에서 액막이 역할을 잘 수행하겠습니다.',
    fontFamily: '"Hi Melody", cursive'
  },
  { 
    id: 88, unlocked: false, name: 'Baldy 명태', grade: 'hidden', count: 0,
    img: getAmuletImage('/uploads/hidden/hidden_amulet_04.png', 'ui'), 
    description: 'Baldy 명태는 어떤 시련에도 굴하지 않는 단단한 용기와 자신감을 심어줍니다.',
    letter: '말하기 힘든 고민을 이곳에 털어놓고, 또 소중한 정성까지 보태어 주셔서 진심으로 고맙습니다.\n보내주신 마음은 이 공간이 지친 이들에게 더 든든한 안식처가 될 수 있도록 다듬어 나가는 데 사용하겠습니다.\n새로운 부적이 사용자님의 무거운 마음을 조금이나마 덜어내고, 일상에 작은 평온을 가져다주기를 바랍니다.',
    fontFamily: '"Gamja Flower", cursive'
  },
  { 
    id: 89, unlocked: false, name: '억만이 명태', grade: 'hidden', count: 0,
    img: getAmuletImage('/uploads/hidden/hidden_amulet_05.png', 'ui'), 
    description: '억만이 명태는 이름처럼 억만금의 복과 풍요를 당신의 삶으로 끌어당겨 줍니다.',
    letter: '안녕하세요, 액막이 명태 개발자 입니다. 저희 서비스를 아껴주시고 관심을 가져주셔서 진심으로 감사합니다.\n부족함이 많았던 프로젝트이지만 여러분의 일상에 작은 위로와 안정감을 드리고 싶다는 마음으로 시작해서\n여기까지 오게되었습니다. 이 서비스가 여러분의 걱정에 많은 도움이 되고 앞날에 행운만이 있길 바랍니다.',
    fontFamily: '"Gowun Dodum", sans-serif'
  },
];

export const STORAGE_KEYS = {
  TALISMAN_DATA: 'talisman_data',
  CREDITS: 'talisman_credits',
  WISH: 'talisman_wish',
};
