import React from 'react';

const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="max-w-4xl mx-auto mt-8 bg-white rounded shadow p-6">
    {children}
  </div>
);

export default Container; 