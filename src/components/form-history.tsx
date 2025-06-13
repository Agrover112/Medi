
"use client";

import React, { useState } from 'react';
import { History, UserCircle, Search, Download } from 'lucide-react';
import { format } from 'date-fns';
import type { ApiCustomerInfo } from '@/components/mediform';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import * as XLSX from 'xlsx';
import type { useToast } from "@/hooks/use-toast";


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
  toast: ReturnType<typeof useToast>['toast'];
}

export default function FormHistory({ historyItems, onSelectHistoryItem, currentIndex, toast }: FormHistoryProps) {
  const [filterTerm, setFilterTerm] = useState('');
  const { state: sidebarState } = useSidebar(); 

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterTerm(event.target.value);
  };

  const filteredHistoryItems = historyItems.filter(item => {
    const searchTerm = filterTerm.toLowerCase();
    const nameMatch = item.data.customer_info.name?.toLowerCase().includes(searchTerm);
    const problemMatch = item.data.customer_info.problem?.toLowerCase().includes(searchTerm);
    return nameMatch || problemMatch;
  });

  const handleDownloadCsv = () => {
    if (!historyItems || historyItems.length === 0) {
      toast({
        title: "No Data",
        description: "There is no patient data to export.",
        variant: "default",
      });
      return;
    }

    const csvData = historyItems.map(item => ({
      "Timestamp": item.timestamp,
      "Name": item.data.customer_info.name,
      "Address": item.data.customer_info.address || "",
      "Date of Birth": item.data.customer_info.date_of_birth || "",
      "Email": item.data.customer_info.email || "",
      "Phone": item.data.customer_info.phone || "",
      "Previous Customer": item.data.customer_info.previous_customer ? "Yes" : "No",
      "Problem": item.data.customer_info.problem || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PatientData");
    XLSX.writeFile(workbook, "mediform_patient_data.csv");
  };


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
              const originalIndex = historyItems.findIndex(
                originalItem => originalItem.timestamp === item.timestamp && originalItem.data.customer_info.name === item.data.customer_info.name
              );
              return (
                <SidebarMenuItem key={item.timestamp + '-' + originalIndex}>
                  <SidebarMenuButton
                    onClick={() => onSelectHistoryItem(originalIndex)}
                    isActive={originalIndex === currentIndex} 
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
      <SidebarFooter className={cn("p-3 border-t border-sidebar-border", sidebarState === 'collapsed' && 'hidden')}>
        <Button variant="outline" onClick={handleDownloadCsv} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </SidebarFooter>
    </div>
  );
}
