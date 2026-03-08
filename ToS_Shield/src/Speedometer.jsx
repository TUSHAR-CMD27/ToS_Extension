import React from 'react';

const Speedometer = ({ risk }) => {
  // The needle starts at -90deg (far left = Low/green),
  // 0deg = center (Medium/yellow), +90deg = far right (High/red)
  let rotation = 0;
  let riskClass = 'risk-medium';
  let displayRisk = 'Medium Risk';

  const riskNorm = (risk || '').toLowerCase().trim();

  if (riskNorm === 'low') {
    rotation = -90;
    riskClass = 'risk-low';
    displayRisk = 'Low Risk';
  } else if (riskNorm === 'high') {
    rotation = 90;
    riskClass = 'risk-high';
    displayRisk = 'High Risk';
  } else {
    rotation = 0;
    riskClass = 'risk-medium';
    displayRisk = 'Medium Risk';
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="speedometer-wrapper">
        <div className="speedometer-arc" />
        <div
          className="speedometer-needle"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        />
      </div>
      <div className={`risk-label ${riskClass}`}>{displayRisk}</div>
    </div>
  );
};

export default Speedometer;
