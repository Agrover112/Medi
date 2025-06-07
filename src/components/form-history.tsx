
"use client";

import React, { useState } from 'react';
import { History, UserCircle, Search } from 'lucide-react';
import { format } from 'date-fns';
import type { ApiCustomerInfo } from '@/components/mediform';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar'; // Import useSidebar
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

interface ApiDataItem {
  data: {
    customer_info: ApiCustomerInfo;
  };
  timestamp: string;
}

interface FormHistoryProps {
  historyItems: ApiDataItem[];
  onSelectHistoryItem: (index: number) => void;
  currentIndex: number;
}

export default function FormHistory({ historyItems, onSelectHistoryItem, currentIndex }: FormHistoryProps) {
  const [filterTerm, setFilterTerm] = useState('');
  const { state: sidebarState } = useSidebar(); // Get sidebar state

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterTerm(event.target.value);
  };

  const filteredHistoryItems = historyItems.filter(item => {
    const searchTerm = filterTerm.toLowerCase();
    const nameMatch = item.data.customer_info.name?.toLowerCase().includes(searchTerm);
    const problemMatch = item.data.customer_info.problem?.toLowerCase().includes(searchTerm);
    return nameMatch || problemMatch;
  });

  // Find the original index of the selected item in the unfiltered list
  // This is important if filtering changes the displayed list but selection should persist on original data
  let actualCurrentIndex = -1;
  if (filteredHistoryItems.length > 0 && currentIndex < historyItems.length) {
     const currentSelectedItemOriginal = historyItems[currentIndex];
     actualCurrentIndex = filteredHistoryItems.findIndex(item => item.timestamp === currentSelectedItemOriginal.timestamp && item.data.customer_info.name === currentSelectedItemOriginal.data.customer_info.name);
  }


  return (
    <div className="flex h-full flex-col">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:justify-center">
          <History className="mr-2 h-5 w-5 text-primary group-data-[collapsible=icon]:mr-0" />
          <span className="group-data-[collapsible=icon]:hidden">Form History</span>
        </div>
        <div className={cn("relative mt-3", sidebarState === 'collapsed' && 'hidden')}>
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Filter by name/problem..."
            value={filterTerm}
            onChange={handleFilterChange}
            className="h-9 w-full rounded-md bg-sidebar-accent pl-8 pr-3 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto p-2">
        {(!filteredHistoryItems || filteredHistoryItems.length === 0) ? (
          <div className={cn("p-2 text-sm text-sidebar-foreground/70", sidebarState === 'collapsed' && 'hidden')}>
            {filterTerm ? 'No matching entries found.' : 'No past entries available.'}
          </div>
        ) : (
          <SidebarMenu>
            {filteredHistoryItems.map((item) => {
              // Find the original index of this item in the unfiltered historyItems array
              const originalIndex = historyItems.findIndex(
                originalItem => originalItem.timestamp === item.timestamp && originalItem.data.customer_info.name === item.data.customer_info.name
              );
              return (
                <SidebarMenuItem key={item.timestamp + '-' + originalIndex}>
                  <SidebarMenuButton
                    onClick={() => onSelectHistoryItem(originalIndex)}
                    isActive={originalIndex === currentIndex} // Compare with original currentIndex
                    className="w-full justify-start text-left h-auto py-2.5 px-3 group-data-[collapsible=icon]:justify-center"
                    tooltip={{
                      content: (
                        <>
                          <p>{item.data.customer_info.name || "Unnamed Customer"}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(item.timestamp), "MMM d, h:mm a")}
                          </p>
                        </>
                      ),
                      side: "right",
                      align: "center",
                    }}
                  >
                    <UserCircle className="h-5 w-5 flex-shrink-0 text-sidebar-foreground/80" />
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                      <span className="font-medium">
                        {item.data.customer_info.name || "Unnamed Customer"}
                      </span>
                      <span className="text-xs text-sidebar-foreground/70">
                        {format(new Date(item.timestamp), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                      {item.data.customer_info.problem && (
                        <span className="text-xs italic truncate w-full text-sidebar-foreground/60">
                          {item.data.customer_info.problem.substring(0, 30)}{item.data.customer_info.problem.length > 30 ? '...' : ''}
                        </span>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        )}
      </SidebarContent>
    </div>
  );
}

