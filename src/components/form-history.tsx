
"use client";

import React from 'react';
import { History, UserCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { ApiCustomerInfo } from '@/components/mediform';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
} from '@/components/ui/sidebar'; // Assuming these are exported correctly

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
  return (
    <div className="flex h-full flex-col">
      <SidebarHeader className="p-4">
        <div className="flex items-center text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:justify-center">
          <History className="mr-2 h-5 w-5 text-primary group-data-[collapsible=icon]:mr-0" />
          <span className="group-data-[collapsible=icon]:hidden">Form History</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto p-2">
        {(!historyItems || historyItems.length === 0) ? (
          <div className="p-2 text-sm text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
            No past entries available.
          </div>
        ) : (
          <SidebarMenu>
            {historyItems.map((item, index) => (
              <SidebarMenuItem key={item.timestamp + '-' + index}>
                <SidebarMenuButton
                  onClick={() => onSelectHistoryItem(index)}
                  isActive={index === currentIndex}
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
            ))}
          </SidebarMenu>
        )}
      </SidebarContent>
    </div>
  );
}
