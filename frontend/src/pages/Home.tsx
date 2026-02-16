import { Button } from '@toss/tds-mobile';

function App() {
  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>액막이 명태 테스트 🐟</h1>
      
      <Button size="large" onClick={() => alert('명태가 응답했습니다!')}>
        고민 털어놓기
      </Button>
    </div>
  );
}

export default App;