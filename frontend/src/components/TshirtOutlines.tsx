// Clean SVG T-shirt outline components - minimal and accurate

interface TshirtOutlineProps {
  color?: string;
  className?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export const RegularTshirtFront = ({ color = "#ffffff", className = "", strokeColor = "#333", strokeWidth = 2 }: TshirtOutlineProps) => (
  <svg 
    viewBox="0 0 500 650" 
    className={className}
    style={{ maxWidth: '100%', height: 'auto' }}
  >
    {/* T-shirt body - clean outline */}
    <path
      d="M 100 120
         C 90 125, 70 135, 50 160
         L 40 200
         L 35 250
         L 40 280
         L 55 300
         L 75 315
         L 75 610
         C 75 625, 85 635, 100 640
         L 400 640
         C 415 635, 425 625, 425 610
         L 425 315
         L 445 300
         L 460 280
         L 465 250
         L 460 200
         L 450 160
         C 430 135, 410 125, 400 120
         L 380 110
         L 350 100
         L 320 95
         L 290 92
         L 270 90
         L 250 88
         L 230 90
         L 210 92
         L 180 95
         L 150 100
         L 120 110
         Z"
      fill={color}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    
    {/* Neck cutout */}
    <ellipse
      cx="250"
      cy="95"
      rx="45"
      ry="18"
      fill="#000"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
  </svg>
);

export const RegularTshirtBack = ({ color = "#ffffff", className = "", strokeColor = "#333", strokeWidth = 2 }: TshirtOutlineProps) => (
  <svg 
    viewBox="0 0 500 650" 
    className={className}
    style={{ maxWidth: '100%', height: 'auto' }}
  >
    {/* T-shirt body - clean outline */}
    <path
      d="M 100 120
         C 90 125, 70 135, 50 160
         L 40 200
         L 35 250
         L 40 280
         L 55 300
         L 75 315
         L 75 610
         C 75 625, 85 635, 100 640
         L 400 640
         C 415 635, 425 625, 425 610
         L 425 315
         L 445 300
         L 460 280
         L 465 250
         L 460 200
         L 450 160
         C 430 135, 410 125, 400 120
         L 380 110
         L 350 100
         L 320 95
         L 290 92
         L 270 90
         L 250 88
         L 230 90
         L 210 92
         L 180 95
         L 150 100
         L 120 110
         Z"
      fill={color}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    
    {/* Back neck - smaller cutout */}
    <ellipse
      cx="250"
      cy="95"
      rx="35"
      ry="12"
      fill="#000"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
  </svg>
);

export const OversizedTshirtFront = ({ color = "#ffffff", className = "", strokeColor = "#333", strokeWidth = 2 }: TshirtOutlineProps) => (
  <svg 
    viewBox="0 0 450 550" 
    className={className}
    style={{ maxWidth: '100%', height: 'auto' }}
  >
    {/* Oversized T-shirt body - wider and longer */}
    <path
      d="M 60 90
         C 45 95, 30 105, 20 125
         L 15 150
         L 12 180
         L 15 210
         L 25 235
         L 40 250
         L 55 260
         L 65 265
         L 65 510
         C 65 525, 75 535, 90 540
         L 360 540
         C 375 535, 385 525, 385 510
         L 385 265
         L 395 260
         L 410 250
         L 425 235
         L 435 210
         L 438 180
         L 435 150
         L 430 125
         C 420 105, 405 95, 390 90
         L 365 80
         L 335 72
         L 305 68
         L 275 65
         L 245 63
         L 225 62
         L 205 63
         L 175 65
         L 145 68
         L 115 72
         L 85 80
         Z"
      fill={color}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    
    {/* Neck cutout - round */}
    <ellipse
      cx="225"
      cy="68"
      rx="50"
      ry="15"
      fill="#000"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
  </svg>
);

export const OversizedTshirtBack = ({ color = "#ffffff", className = "", strokeColor = "#333", strokeWidth = 2 }: TshirtOutlineProps) => (
  <svg 
    viewBox="0 0 450 550" 
    className={className}
    style={{ maxWidth: '100%', height: 'auto' }}
  >
    {/* Oversized T-shirt body - wider and longer */}
    <path
      d="M 60 90
         C 45 95, 30 105, 20 125
         L 15 150
         L 12 180
         L 15 210
         L 25 235
         L 40 250
         L 55 260
         L 65 265
         L 65 510
         C 65 525, 75 535, 90 540
         L 360 540
         C 375 535, 385 525, 385 510
         L 385 265
         L 395 260
         L 410 250
         L 425 235
         L 435 210
         L 438 180
         L 435 150
         L 430 125
         C 420 105, 405 95, 390 90
         L 365 80
         L 335 72
         L 305 68
         L 275 65
         L 245 63
         L 225 62
         L 205 63
         L 175 65
         L 145 68
         L 115 72
         L 85 80
         Z"
      fill={color}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    
    {/* Back neck - smaller cutout */}
    <ellipse
      cx="225"
      cy="68"
      rx="40"
      ry="10"
      fill="#000"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
  </svg>
);
