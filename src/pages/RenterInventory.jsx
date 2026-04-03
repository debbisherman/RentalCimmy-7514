import React from 'react';
import { useApp } from '../store/AppContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiBox, FiCheck } = FiIcons;

const RenterInventory = () => {
  const { currentRenterId, renters, items } = useApp();
  
  const myInfo = renters.find(r => r.id === currentRenterId);
  
  // Filter items assigned to the renter's address
  const myItems = myInfo ? items.filter(item => item.location.includes(myInfo.address.split(',')[0])) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Property Items</h2>
        <p className="text-gray-600 text-sm">
          Items provided by the landlord at <strong>{myInfo?.address}</strong>. Please report any issues with these items.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {myItems.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <SafeIcon icon={FiBox} className="text-xl" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded inline-flex">
                <SafeIcon icon={FiCheck} /> Condition: {item.condition}
              </div>
            </div>
          </div>
        ))}
        {myItems.length === 0 && (
          <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
            No items are currently tracked for this property.
          </div>
        )}
      </div>
    </div>
  );
};

export default RenterInventory;