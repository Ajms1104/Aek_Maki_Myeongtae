// 나중에 여기서 DB 모델 추가
exports.save = async (data) => {
  console.log('>> [DB] 고민 내용 암호화 저장 완료');
  return { id: "worry_" + Date.now() };
};