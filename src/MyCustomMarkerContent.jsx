import React from 'react';

const MyCustomMarkerContent = ({ churchName, churchStatus, isSelected, districtColor }) => {
  const safeChurchName = churchName || '';
  const safeChurchStatus = churchStatus || 'general';
  
  // Default color from district is used, but "Main Church" status overrides it.
  const baseMarkerColor = safeChurchStatus === 'MAIN CHURCH' ? '#FF0000' : districtColor || '#4285F4'; // Red for Main, district color, or default blue

  const pinBackgroundColor = isSelected ? 'lime' : baseMarkerColor;
  const innerCircleColor = isSelected ? 'yellow' : 'white';

  return (
    <div className="google-marker" style={{ '--marker-color': pinBackgroundColor }}>
      <div className="google-marker-pin">
        <div className="google-marker-text">
          <span className="marker-church-name">{safeChurchName}</span>
          <div className="google-marker-inner-circle" style={{ backgroundColor: innerCircleColor }}></div>
        </div>
      </div>
      
    </div>
  );
};

export default MyCustomMarkerContent;