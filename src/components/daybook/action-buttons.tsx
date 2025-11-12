'use client';

import { ArrowUp, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ActionButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
      <Button asChild variant="default">
        <Link href="/store-admin/incoming">
          <ArrowUp className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">Add Incoming</span>
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/store-admin/outgoing">
          <ArrowLeft className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">Add Outgoing</span>
        </Link>
      </Button>
    </div>
  );
}
