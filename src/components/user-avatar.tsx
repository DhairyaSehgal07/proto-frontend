'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function UserAvatar() {
  const userName = 'User';
  const userImageUrl = '';
  const firstLetter = userName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center">
      <Avatar>
        {userImageUrl ? <AvatarImage src={userImageUrl} alt={userName} /> : null}
        <AvatarFallback>{firstLetter}</AvatarFallback>
      </Avatar>
    </div>
  );
}
