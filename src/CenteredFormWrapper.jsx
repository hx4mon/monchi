import React from 'react';
import './CenteredFormWrapper.css';

const CenteredFormWrapper = ({ children }) => {
  return (
    <div className="centered-form-wrapper">
      {children}
    </div>
  );
};

export default CenteredFormWrapper;
