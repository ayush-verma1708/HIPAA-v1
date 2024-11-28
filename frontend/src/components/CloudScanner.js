import React, { useState } from 'react';
import AzureLogin from './AzureLogin';
import AWSLogin from './AWSLogin';
import GCPLogin from './GCPLogin';

const CloudScanner = () => {
  const [activeTab, setActiveTab] = useState('azure');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className='tabs'>
        <button onClick={() => handleTabChange('azure')}>Azure</button>
        <button onClick={() => handleTabChange('aws')}>AWS</button>
        <button onClick={() => handleTabChange('gcp')}>GCP</button>
      </div>
      <div className='tab-content'>
        {activeTab === 'azure' && <AzureLogin />}
        {activeTab === 'aws' && <AWSLogin />}
        {activeTab === 'gcp' && <GCPLogin />}
      </div>
    </>
  );
};

export default CloudScanner;
