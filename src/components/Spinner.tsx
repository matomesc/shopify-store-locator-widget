import React from 'react';
import './Spinner.css';

export const Spinner: React.FC = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="lds-ring">
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  );
};
