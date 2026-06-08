import { useCallback, useEffect, useState } from 'react';
import { TossAds, type TossAdsAttachBannerOptions } from '@apps-in-toss/web-framework';

export function useTossBanner() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) return;

    if (!TossAds.initialize.isSupported()) {
      console.warn('배너 광고 기능을 사용할 수 없습니다.');
      return;
    }

    TossAds.initialize({
      callbacks: {
        onInitialized: () => setIsInitialized(true),
        onInitializationFailed: (error) => {
          console.error('Toss Ads SDK initialization failed:', error);
        },
      },
    });
  }, [isInitialized]);

  const attachBanner = useCallback(
    (adGroupId: string, element: HTMLElement, options?: TossAdsAttachBannerOptions) => {
      if (!isInitialized) return;
      return TossAds.attachBanner(adGroupId, element, options);
    },
    [isInitialized],
  );

  return { isInitialized, attachBanner };
}
