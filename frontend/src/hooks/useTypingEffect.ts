import { useState, useEffect } from 'react';

export const useTypingEffect = (text: string, speed: number = 50) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      setIsFinished(false);
      return;
    }

    let i = 0;
    setDisplayedText('');
    setIsFinished(false);
    
    const timer = setInterval(() => {
      if (i <= text.length) {
        setDisplayedText(text.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
        setIsFinished(true);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isFinished };
};
