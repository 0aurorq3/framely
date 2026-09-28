import React from 'react';

interface ChromeMockupProps {
  chromeStyle: 'mac' | 'windows' | 'none';
  chromeTheme: 'dark' | 'light';
  scale?: number;
}

export default function ChromeMockup({ chromeStyle, chromeTheme, scale = 1 }: ChromeMockupProps) {
  if (chromeStyle === 'none') return null;

  const style = { '--chrome-scale': scale } as React.CSSProperties;

  if (chromeStyle === 'mac') {
    return (
      <div className={`preview-chrome-mac ${chromeTheme}`} style={style}>
        <div className="dot dot-red" />
        <div className="dot dot-yellow" />
        <div className="dot dot-green" />
      </div>
    );
  }

  if (chromeStyle === 'windows') {
    return (
      <div className={`preview-chrome-win ${chromeTheme}`} style={style}>
        <div className="win-min" />
        <div className="win-icon" />
        <div className="win-close" />
      </div>
    );
  }

  return null;
}

