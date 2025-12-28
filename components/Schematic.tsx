import React from 'react';
import { ProfileType } from '../types';

interface SchematicProps {
  type: ProfileType;
  width: number;
  height: number;
  className?: string;
  showDimensions?: boolean;
}

const Schematic: React.FC<SchematicProps> = ({ type, width, height, className = "", showDimensions = true }) => {
  // Normalize visual dimensions to a square-ish viewBox while preserving aspect ratio logic roughly
  // We don't want the SVG to be too thin or too wide visually, but we want to show relative shape.
  // We'll use a fixed viewBox size and scale the drawing inside.
  
  const viewBoxSize = 200;
  const padding = 30;
  const drawArea = viewBoxSize - (padding * 2);

  const aspectRatio = width / height;
  
  let drawW, drawH;
  if (aspectRatio > 1) {
    drawW = drawArea;
    drawH = drawArea / aspectRatio;
  } else {
    drawH = drawArea;
    drawW = drawArea * aspectRatio;
  }

  const startX = (viewBoxSize - drawW) / 2;
  const startY = (viewBoxSize - drawH) / 2;
  
  // Helper for glass effect
  const GlassLines = ({ x, y, w, h }: {x: number, y: number, w: number, h: number}) => (
    <g stroke="#94a3b8" strokeWidth="0.5" opacity="0.5">
       <line x1={x + w*0.7} y1={y + h*0.1} x2={x + w*0.9} y2={y + h*0.3} />
       <line x1={x + w*0.75} y1={y + h*0.1} x2={x + w*0.9} y2={y + h*0.25} />
    </g>
  );

  const renderContent = () => {
    switch (type) {
      case ProfileType.FIXED:
        return (
          <g>
            <rect x={startX} y={startY} width={drawW} height={drawH} fill="#e0f2fe" stroke="#334155" strokeWidth="2" />
            <GlassLines x={startX} y={startY} w={drawW} h={drawH} />
          </g>
        );
      case ProfileType.CASEMENT_WINDOW:
        return (
          <g>
            <rect x={startX} y={startY} width={drawW} height={drawH} fill="#e0f2fe" stroke="#334155" strokeWidth="2" />
            <rect x={startX + 4} y={startY + 4} width={drawW - 8} height={drawH - 8} fill="none" stroke="#475569" strokeWidth="1" />
            {/* Hinge triangle */}
            <path d={`M${startX} ${startY} L${startX + drawW} ${startY + drawH / 2} L${startX} ${startY + drawH}`} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 2" />
             <GlassLines x={startX} y={startY} w={drawW} h={drawH} />
          </g>
        );
      case ProfileType.SLIDING_2_TRACK:
        return (
          <g>
            <rect x={startX} y={startY} width={drawW} height={drawH} fill="#f1f5f9" stroke="#334155" strokeWidth="2" />
            {/* Left sash */}
            <rect x={startX} y={startY + 2} width={drawW / 2 + 2} height={drawH - 4} fill="#e0f2fe" stroke="#475569" strokeWidth="1" />
            {/* Right sash */}
            <rect x={startX + drawW / 2 - 2} y={startY + 2} width={drawW / 2 + 2} height={drawH - 4} fill="#e0f2fe" stroke="#475569" strokeWidth="1" />
            {/* Arrows */}
            <path d={`M${startX + drawW * 0.2} ${startY + drawH * 0.5} L${startX + drawW * 0.3} ${startY + drawH * 0.5} M${startX + drawW * 0.3} ${startY + drawH * 0.5} l-3 -3 M${startX + drawW * 0.3} ${startY + drawH * 0.5} l-3 3`} stroke="#64748b" strokeWidth="1.5"/>
            <path d={`M${startX + drawW * 0.8} ${startY + drawH * 0.5} L${startX + drawW * 0.7} ${startY + drawH * 0.5} M${startX + drawW * 0.7} ${startY + drawH * 0.5} l3 -3 M${startX + drawW * 0.7} ${startY + drawH * 0.5} l3 3`} stroke="#64748b" strokeWidth="1.5"/>
          </g>
        );
      case ProfileType.SLIDING_3_TRACK:
        const sashW = drawW / 3;
        return (
          <g>
            <rect x={startX} y={startY} width={drawW} height={drawH} fill="#f1f5f9" stroke="#334155" strokeWidth="2" />
            <rect x={startX} y={startY + 2} width={sashW + 2} height={drawH - 4} fill="#e0f2fe" stroke="#475569" strokeWidth="1" />
            <rect x={startX + sashW} y={startY + 2} width={sashW + 2} height={drawH - 4} fill="#e0f2fe" stroke="#475569" strokeWidth="1" />
            <rect x={startX + sashW * 2} y={startY + 2} width={sashW} height={drawH - 4} fill="#e0f2fe" stroke="#475569" strokeWidth="1" />
             {/* Arrows */}
             <path d={`M${startX + drawW * 0.15} ${startY + drawH * 0.5} L${startX + drawW * 0.25} ${startY + drawH * 0.5}`} stroke="#64748b" strokeWidth="1.5"/>
             <path d={`M${startX + drawW * 0.5} ${startY + drawH * 0.5} L${startX + drawW * 0.6} ${startY + drawH * 0.5}`} stroke="#64748b" strokeWidth="1.5"/>
          </g>
        );
      case ProfileType.CASEMENT_DOOR:
        return (
           <g>
            <rect x={startX} y={startY} width={drawW} height={drawH} fill="#f8fafc" stroke="#334155" strokeWidth="2" />
            {/* Frame inside */}
            <rect x={startX + 3} y={startY + 3} width={drawW - 6} height={drawH - 3} fill="#e0f2fe" stroke="#475569" strokeWidth="1" />
            {/* Hinge */}
            <circle cx={startX + 5} cy={startY + drawH / 2} r="2" fill="#334155" />
            {/* Handle */}
            <rect x={startX + drawW - 12} y={startY + drawH / 2 - 5} width={6} height={10} rx="1" fill="#334155" />
          </g>
        );
      case ProfileType.SLIDING_DOOR:
        return (
          <g>
            <rect x={startX} y={startY} width={drawW} height={drawH} fill="#f1f5f9" stroke="#334155" strokeWidth="2" />
            <rect x={startX + 2} y={startY + 2} width={drawW / 2} height={drawH - 4} fill="#e0f2fe" stroke="#475569" strokeWidth="1" />
            <rect x={startX + drawW / 2} y={startY + 2} width={drawW / 2 - 2} height={drawH - 4} fill="#e0f2fe" stroke="#475569" strokeWidth="1" />
            <line x1={startX + drawW / 2} y1={startY} x2={startX + drawW / 2} y2={startY + drawH} stroke="#334155" strokeWidth="2" />
          </g>
        );
      case ProfileType.VENTILATOR:
        return (
          <g>
            <rect x={startX} y={startY} width={drawW} height={drawH} fill="#e0f2fe" stroke="#334155" strokeWidth="2" />
            <line x1={startX} y1={startY + drawH / 2} x2={startX + drawW} y2={startY + drawH / 2} stroke="#94a3b8" strokeDasharray="3 2" />
            {/* Louvre lines */}
            {[0.2, 0.4, 0.6, 0.8].map((f, i) => (
                <line key={i} x1={startX + 5} y1={startY + drawH * f} x2={startX + drawW - 5} y2={startY + drawH * f} stroke="#334155" strokeWidth="1" />
            ))}
          </g>
        );
      case ProfileType.ARCH:
        return (
          <g>
            {/* Arch Top */}
            <path d={`M${startX} ${startY + drawH*0.3} Q${startX + drawW/2} ${startY - drawH*0.1} ${startX + drawW} ${startY + drawH*0.3} L${startX + drawW} ${startY + drawH} L${startX} ${startY + drawH} Z`} fill="#e0f2fe" stroke="#334155" strokeWidth="2" />
            <GlassLines x={startX} y={startY + drawH*0.3} w={drawW} h={drawH*0.7} />
          </g>
        );
      default:
        return <rect x={startX} y={startY} width={drawW} height={drawH} fill="#eee" stroke="#333" />;
    }
  };

  return (
    <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className={className}>
      {renderContent()}
      
      {showDimensions && (
        <>
          {/* Width Dimension */}
          <line x1={startX} y1={startY - 10} x2={startX + drawW} y2={startY - 10} stroke="#64748b" strokeWidth="1" markerEnd="url(#arrowhead)" markerStart="url(#arrowhead)" />
          <text x={startX + drawW / 2} y={startY - 14} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="bold">
            {width} mm
          </text>
          
          {/* Height Dimension */}
          <line x1={startX - 10} y1={startY} x2={startX - 10} y2={startY + drawH} stroke="#64748b" strokeWidth="1" />
          <text x={startX - 14} y={startY + drawH / 2} textAnchor="middle" transform={`rotate(-90, ${startX - 14}, ${startY + drawH / 2})`} fontSize="10" fill="#64748b" fontWeight="bold">
            {height} mm
          </text>
        </>
      )}

      {/* Frame Dimensions (Visual Guide only) */}
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="0" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="#64748b" />
        </marker>
      </defs>
    </svg>
  );
};

export default Schematic;
