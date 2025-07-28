import React from 'react';

interface FandomLogoProps {
  className?: string;
  size?: number;
}

export const FandomLogo: React.FC<FandomLogoProps> = ({ className = "", size = 24 }) => {
  return (
    <svg 
      width={size} 
      height={size * 1.39} 
      viewBox="0 0 512 712" 
      className={className}
      fill="currentColor"
    >
      {/* Fandom heart/flame logo - recreated based on official design */}
      <path d="M256 712L256 632C256 632 80 496 80 320C80 213.33 165.33 128 272 128C298.67 128 325.33 138.67 352 160C378.67 138.67 405.33 128 432 128C538.67 128 624 213.33 624 320C624 496 448 632 448 632L448 712C448 712 352 656 256 712Z" transform="scale(0.8, 1)" transform-origin="256 420"/>
      
      {/* Inner flame */}
      <path d="M256 600L256 580C256 580 120 480 120 350C120 270 184 204 264 204C282 204 300 210 320 224C340 210 358 204 376 204C456 204 520 270 520 350C520 480 384 580 384 580L384 600C384 600 320 570 256 600Z" 
            transform="scale(0.8, 1)" transform-origin="256 400" 
            opacity="0.6"/>
      
      {/* Top flame detail */}
      <path d="M256 500C256 500 160 420 160 340C160 290 200 250 250 250C265 250 280 255 295 265C310 255 325 250 340 250C390 250 430 290 430 340C430 420 334 500 256 500Z" 
            transform="scale(0.8, 1)" transform-origin="256 375" 
            opacity="0.3"/>
    </svg>
  );
};