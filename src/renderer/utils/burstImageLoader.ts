import { preloadBgImage, RenderConfig } from '../canvasRenderer';

export function loadBurstImages(
  screenshotSrc: string | null,
  noImageMode: boolean,
  getConfig: () => RenderConfig,
  callback: (screenshotImg: HTMLImageElement | null) => void
): void {
  const config = getConfig();
  let pending = 0;
  let screenshotImg: HTMLImageElement | null = null;
  let called = false;

  const checkDone = () => {
    if (pending === 0 && !called) {
      called = true;
      callback(screenshotImg);
    }
  };

  if (!noImageMode && screenshotSrc) {
    pending += 1;
    screenshotImg = new Image();
    screenshotImg.src = screenshotSrc;
    screenshotImg.onload = () => {
      pending -= 1;
      checkDone();
    };
    screenshotImg.onerror = () => {
      pending -= 1;
      checkDone();
    };
  }

  if (config.backgroundType === 'gradient') {
    const urlPattern = /url\(['"]?([^'"()]+)['"]?\)/g;
    let urlMatch;
    while ((urlMatch = urlPattern.exec(config.backgroundValue)) !== null) {
      pending += 1;
      preloadBgImage(urlMatch[1], () => {
        pending -= 1;
        checkDone();
      });
    }
  }

  checkDone();
}