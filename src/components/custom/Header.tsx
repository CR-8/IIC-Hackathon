'use client';

import { Search, Upload, Bell, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HeaderProps {
  onUploadClick?: () => void;
}

export function Header({ onUploadClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search task..." 
              className="pl-10 bg-surface border-none shadow-sm w-full max-w-md rounded-xl focus-visible:ring-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={onUploadClick}
            className="rounded-full px-6 font-medium shadow-sm hover:shadow-md transition-all"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>
    </header>
  );
}
