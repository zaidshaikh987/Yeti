import React from 'react';
import { useParams } from 'react-router-dom';

const AssetDetail = () => {
  const { id } = useParams();
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">Asset Detail</h1>
      <p>Details for asset ID: {id}</p>
    </div>
  );
};

export default AssetDetail;
