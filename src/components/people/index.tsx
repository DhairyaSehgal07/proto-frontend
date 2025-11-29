'use client';

import { useState, useMemo } from 'react';
import {
  useGetAllFarmers,
  StoreAdminFarmer,
} from '@/services/base/store-admin/functions/useGetAllFarmers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AddFarmerModal } from '@/components/forms/add-farmer-model';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Phone, MapPin, CheckCircle2, XCircle, Search, ChevronDown } from 'lucide-react';

const PeoplePage = () => {
  const { data, isLoading, error } = useGetAllFarmers();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'Name' | 'Account Number'>('Name');

  const farmers = useMemo(() => data?.data || [], [data?.data]);

  // Filter and sort farmers based on search query and sort option
  const filteredFarmers = useMemo(() => {
    let result = farmers;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (farmer) =>
          farmer.name.toLowerCase().includes(query) ||
          farmer.mobileNumber.includes(query) ||
          farmer.accountNumber.toString().includes(query) ||
          farmer.address.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const sorted = [...result].sort((a, b) => {
      if (sortBy === 'Name') {
        return a.name.localeCompare(b.name);
      } else {
        // Sort by Account Number
        return a.accountNumber - b.accountNumber;
      }
    });

    return sorted;
  }, [farmers, searchQuery, sortBy]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading farmers. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        {/* Total Farmers Count */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-10 items-center justify-center rounded-lg bg-muted">
                <div className="h-4 w-4 rounded-sm bg-primary"></div>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold text-foreground">
                  {farmers.length}
                </span>
                <span className="ml-2 text-sm sm:text-base text-foreground">farmers</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search, Sort and Add Button */}
        <Card>
          <CardContent>
            <div className="space-y-4 sm:space-y-6">
              {/* Search Bar */}
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, mobile, account number, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              {/* Sort and Add Button */}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                {/* Sort Dropdown */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-auto">
                        <span className="truncate">Sort by: {sortBy}</span>
                        <ChevronDown className="h-4 w-4 shrink-0 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full sm:w-auto">
                      <DropdownMenuItem onClick={() => setSortBy('Name')}>Name</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('Account Number')}>
                        Account Number
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Add Farmer Button */}
                <div className="flex justify-end">
                  <AddFarmerModal farmers={farmers} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Farmers List */}
      {filteredFarmers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'No farmers found matching your search.'
                  : 'No farmers registered yet.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFarmers.map((farmer) => (
            <FarmerCard key={farmer.id} farmer={farmer} />
          ))}
        </div>
      )}
    </div>
  );
};

interface FarmerCardProps {
  farmer: StoreAdminFarmer;
}

const FarmerCard = ({ farmer }: FarmerCardProps) => {
  return (
    <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{farmer.name}</CardTitle>
              <CardDescription className="mt-1">Account #{farmer.accountNumber}</CardDescription>
            </div>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              farmer.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}
          >
            {farmer.isActive ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Active
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                Inactive
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{farmer.mobileNumber}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="text-muted-foreground">{farmer.address}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PeoplePage;
