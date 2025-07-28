import React from 'react';

interface FandomLogoProps {
  className?: string;
  size?: number;
}

export const FandomLogo: React.FC<FandomLogoProps> = ({ className = "", size = 24 }) => {
  return (
    <svg 
      width={size * 4} 
      height={size} 
      viewBox="0 0 512 128" 
      className={className}
      fill="currentColor"
    >
      {/* Official Fandom logo recreation based on public domain design */}
      <g>
        {/* F */}
        <rect x="16" y="24" width="6" height="80"/>
        <rect x="22" y="24" width="28" height="6"/>
        <rect x="22" y="58" width="20" height="6"/>
        
        {/* A */}
        <path d="M64 24 L76 24 L88 104 L82 104 L80 88 L60 88 L58 104 L52 104 L64 24 Z M62 82 L78 82 L70 44 L62 82 Z"/>
        
        {/* N */}
        <rect x="104" y="24" width="6" height="80"/>
        <rect x="128" y="24" width="6" height="80"/>
        <path d="M110 24 L116 32 L122 88 L122 24 L128 24 L128 104 L122 104 L116 96 L110 40 L110 104 L104 104 L104 24 L110 24 Z"/>
        
        {/* D */}
        <rect x="150" y="24" width="6" height="80"/>
        <path d="M156 24 L176 24 Q186 24 186 34 L186 94 Q186 104 176 104 L156 104 L156 24 Z M162 30 L162 98 L174 98 Q180 98 180 94 L180 34 Q180 30 174 30 L162 30 Z"/>
        
        {/* O */}
        <path d="M202 22 Q218 22 218 38 L218 90 Q218 106 202 106 Q186 106 186 90 L186 38 Q186 22 202 22 Z M192 38 Q192 28 202 28 Q212 28 212 38 L212 90 Q212 100 202 100 Q192 100 192 90 L192 38 Z"/>
        
        {/* M */}
        <rect x="234" y="24" width="6" height="80"/>
        <rect x="270" y="24" width="6" height="80"/>
        <path d="M240 24 L246 32 L252 64 L258 32 L264 24 L270 24 L270 104 L264 104 L264 44 L258 76 L246 76 L240 44 L240 104 L234 104 L234 24 L240 24 Z"/>
      </g>
    </svg>
  );
};