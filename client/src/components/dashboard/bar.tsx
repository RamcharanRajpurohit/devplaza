import React, { useState } from "react";

type Segment = {
  label: string;
  value: number;
  color: string;
  platformBreakdown?: {
    platform: string;
    value: number;
  }[];
};

type PlatformBreakdown = {
  platform: string;
  value: number;
};

interface DonutChartProps {
  data: Segment[];
  total: number;
  platformBreakdown?: PlatformBreakdown[];
  showPlatformBreakdown?: boolean;
}

const DonutChart: React.FC<DonutChartProps> = ({ 
  data, 
  total, 
  platformBreakdown = [],
  showPlatformBreakdown = false 
}) => {
  const [hovered, setHovered] = useState<Segment | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const radius = 80;
  const strokeWidth = 20;
  const innerRadius = radius - strokeWidth / 2;
  const outerRadius = radius + strokeWidth / 2;
  const totalValue = data.reduce((acc, d) => acc + d.value, 0);

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const createDonutSegmentPath = (centerX: number, centerY: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) => {
    const outerStart = polarToCartesian(centerX, centerY, outerRadius, endAngle);
    const outerEnd = polarToCartesian(centerX, centerY, outerRadius, startAngle);
    const innerStart = polarToCartesian(centerX, centerY, innerRadius, endAngle);
    const innerEnd = polarToCartesian(centerX, centerY, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", outerStart.x, outerStart.y,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
      "L", innerEnd.x, innerEnd.y,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      "Z"
    ].join(" ");
  };

const handleMouseMove = (e: React.MouseEvent, segment: Segment, segmentAngle: number) => {
    const containerRect = e.currentTarget.closest('.chart-container')?.getBoundingClientRect();
    
    if (containerRect) {
      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;
      
      const normalizedAngle = (segmentAngle + 360) % 360;
      const angleRad = (normalizedAngle - 90) * Math.PI / 180;
      
      const distance = 140;
      const tooltipX = centerX + Math.cos(angleRad) * distance;
      const tooltipY = centerY + Math.sin(angleRad) * distance;
      
      setTooltipPos({ x: tooltipX, y: tooltipY});
    }
    setHovered(segment);
  };

  let cumulativeValue = 0;
  const segments = data.map((segment) => {
    const startAngle = (cumulativeValue / totalValue) * 360;
    const endAngle = ((cumulativeValue + segment.value) / totalValue) * 360;
    const middleAngle = (startAngle + endAngle) / 2;
    
    cumulativeValue += segment.value;
    
    return {
      ...segment,
      startAngle,
      endAngle,
      middleAngle,
      path: createDonutSegmentPath(100, 100, innerRadius, outerRadius, startAngle, endAngle)
    };
  });

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-800/30 rounded-xl p-6 lg:p-8 shadow-xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Chart Container */}
        <div className="relative flex items-center justify-center chart-container" style={{ minHeight: '280px', width: '100%' }}>
          <svg width="200" height="200" viewBox="0 0 200 200" className="w-full h-full max-w-[200px] max-h-[200px]">
            {segments.map((segment, index) => (
              <path
                key={`${segment.label}-${index}`}
                d={segment.path}
                fill={segment.color}
                className="cursor-pointer transition-all duration-300 hover:opacity-80 hover:filter hover:brightness-110"
                onMouseMove={(e) => handleMouseMove(e, segment, segment.middleAngle)}
                onMouseLeave={() => {
                  setHovered(null);
                  setTooltipPos(null);
                }}
              />
            ))}
          </svg>

          <div className="absolute flex flex-col items-center justify-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
              {total}
            </div>
            <div className="text-xs sm:text-sm text-gray-400 mt-1">Total</div>
          </div>

          {hovered && tooltipPos && (
            <div
              className="absolute z-20 pointer-events-none"
              style={{
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-800/50 text-white text-sm rounded-lg shadow-xl shadow-red-900/30 px-4 py-3 min-w-max">
                <div className="font-bold text-red-300 mb-2">{hovered.label}</div>
                {hovered.platformBreakdown && hovered.platformBreakdown.length > 0 ? (
                  <div className="space-y-1">
                    {hovered.platformBreakdown.map((platform, idx) => (
                      <div key={idx} className="text-gray-300 text-xs">
                        {platform.platform}: {platform.value}
                      </div>
                    ))}
                    <div className="text-gray-400 text-xs mt-2 pt-1 border-t border-gray-700">
                      Total: {hovered.value}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-300">
                    {hovered.value} ({((hovered.value / totalValue) * 100).toFixed(1)}%)
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-300 mb-4 lg:mb-6">
            {showPlatformBreakdown ? "Platform Breakdown" : "Difficulty Breakdown"}
          </h3>
          <div className="space-y-3 lg:space-y-4">
            {showPlatformBreakdown ? (
              // Platform breakdown view
              platformBreakdown.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-800/50 to-red-900/20 rounded-lg border border-red-800/30 hover:from-gray-800/70 hover:to-red-900/30 transition-all duration-300"
                >
                  <div className="flex items-center">
                    <span className="text-gray-300 font-medium text-sm sm:text-base">{item.platform}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-red-300 font-bold text-sm sm:text-base">{item.value}</span>
                    
                  </div>
                </div>
              ))
            ) : (
              // Difficulty breakdown view
              data.map((segment, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-800/50 to-red-900/20 rounded-lg border border-red-800/30 hover:from-gray-800/70 hover:to-red-900/30 transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3 flex-shrink-0 shadow-sm" 
                      style={{ backgroundColor: segment.color }}
                    ></div>
                    <span className="text-gray-300 font-medium text-sm sm:text-base">{segment.label}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-red-300 font-bold text-sm sm:text-base">{segment.value}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-red-800/30">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Total Problems:</span>
              <span className="text-red-300 font-semibold">{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonutChart;