import React from 'react';

const MyCustomMarkerContent = ({ churchName, churchStatus, isSelected }) => {
  const safeChurchName = churchName || '';
  const safeChurchStatus = churchStatus || 'general';
  const markerColor = safeChurchStatus === 'MAIN CHURCH' ? '#FF0000' : '#4285F4'; // Red for Main Church, Google Blue otherwise
  const pinBackgroundColor = isSelected ? 'lime' : markerColor;
  const innerCircleColor = isSelected ? 'yellow' : 'white';

  return (
    <div className="google-marker" style={{ '--marker-color': pinBackgroundColor }}>
      <div className="google-marker-pin">
        <div className="google-marker-text">
          <span className="marker-church-name">{safeChurchName}</span>
          <div className="google-marker-inner-circle" style={{ backgroundColor: innerCircleColor }}></div>
        </div>
      </div>
      <div className="google-marker-shadow"></div>
    </div>
  );
};

export default MyCustomMarkerContent;