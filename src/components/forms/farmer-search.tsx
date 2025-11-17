'use client';

import React, { useMemo } from 'react';
import { SearchSelector } from '../search-selector';
import { useGetAllFarmers } from '@/services/base/store-admin/functions/useGetAllFarmers';

interface FarmerSearchProps {
  onSelect?: (farmerStorageLinkId: string | '') => void;
}

export const FarmerSearch = ({ onSelect }: FarmerSearchProps) => {
  const farmersQuery = useGetAllFarmers();

  const farmerOptions = useMemo(() => {
    // Actual farmer data from API
    const farmers = farmersQuery.data?.data ?? [];
    return farmers.map((farmer) => ({
      label: farmer.name,
      value: farmer.id, // This is the farmerStorageLinkId
      // Include name, mobile, and address in searchable text
      searchableText: `${farmer.name} ${farmer.mobileNumber} ${farmer.address}`,
      // Custom rendering to show detailed info
      renderLabel: (
        <div className="flex flex-col">
          <span className="font-medium">{farmer.name}</span>
          <span className="text-xs text-muted-foreground">📞 {farmer.mobileNumber}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
            📍 {farmer.address}
          </span>
        </div>
      ),
    }));
  }, [farmersQuery.data?.data]);

  return (
    <SearchSelector
      id="farmer-search"
      options={farmerOptions}
      placeholder="Select farmer..."
      searchPlaceholder="Search by name, mobile, or address..."
      className="w-[280px] p-0"
      buttonClassName="w-full sm:w-[320px] justify-between h-10 flex-shrink-0"
      loading={farmersQuery.isLoading}
      loadingMessage="Loading farmers..."
      emptyMessage="No farmers found."
      onSelect={onSelect}
    />
  );
};
