
"use client";

import React, { useState, useEffect } from "react";
import CustomerInformationForm, { type ApiCustomerInfo } from '@/components/mediform';
import FormHistory from '@/components/form-history';
import { Loader2, AlertTriangle } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarInset, SidebarHeader as PageHeader, SidebarContent as PageContent } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";


interface ApiDataItem {
  data: {
    customer_info: ApiCustomerInfo;
  };
  timestamp: string;
}

const mockCustomerApiData: ApiDataItem[] = [
  {
    data: {
      customer_info: {
        name: "Andy Alex",
        address: "123 Med Ctr, Stockholm",
        date_of_birth: "1985-01-16",
        email: "andy.alex@example.com",
        phone: "555-0101",
        previous_customer: false,
        problem: "Persistent knee pain after a fall. Difficulty walking stairs."
      }
    },
    timestamp: "2024-07-15T10:30:00.000Z"
  },
  {
    data: {
      customer_info: {
        name: "Betty Charles",
        address: "456 Health Ave, Gothenburg",
        date_of_birth: "1972-05-22",
        email: "betty.c@example.net",
        phone: "555-0202",
        previous_customer: true,
        problem: "Recurring headaches, especially in the afternoon. Some dizziness."
      }
    },
    timestamp: "2024-07-16T14:45:00.000Z"
  },
  {
    data: {
      customer_info: {
        name: "Carl Davidsson",
        address: "789 Wellness Rd, Malmö",
        date_of_birth: null,
        email: "carl.d@example.org",
        phone: "555-0303",
        previous_customer: false,
        problem: "Sore throat and mild fever for two days. General fatigue."
      }
    },
    timestamp: "2024-07-17T09:15:00.000Z"
  },
  {
    data: {
      customer_info: {
        name: "Diana Ericcson",
        address: "101 Recovery Lane, Uppsala",
        date_of_birth: "1990-11-30",
        email: "diana.e@example.com",
        phone: "555-0404",
        previous_customer: true,
        problem: "Annual check-up and flu shot."
      }
    },
    timestamp: "2024-07-18T11:00:00.000Z"
  },
  {
    data: {
      customer_info: {
        name: "Erik Gustavsson",
        address: null,
        date_of_birth: "2001-03-10",
        email: "erik.g@example.com",
        phone: null,
        previous_customer: false,
        problem: "Follow-up for seasonal allergies."
      }
    },
    timestamp: "2024-07-19T16:20:00.000Z"
  }
];

export default function HomePage() {
  const [allCustomerApiData, setAllCustomerApiData] = useState<ApiDataItem[]>([]);
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    setFetchError(null);
    setTimeout(() => {
      if (mockCustomerApiData.length === 0) {
        setAllCustomerApiData([]);
        setFetchError("No mock patient data is available to display.");
      } else {
        setAllCustomerApiData(mockCustomerApiData);
        setSelectedCustomerIndex(0);
      }
      setIsLoading(false);
    }, 500);
  }, []);

  const handleSelectHistoryItem = (index: number) => {
    setSelectedCustomerIndex(index);
  };

  const handleUpdateCustomerInfo = (updatedInfo: ApiCustomerInfo, index: number) => {
    setAllCustomerApiData(prevData => {
      const newData = [...prevData];
      if (newData[index]) {
        newData[index] = {
          ...newData[index],
          data: {
            ...newData[index].data,
            customer_info: updatedInfo
          },
        };
      }
      return newData;
    });
  };


  const selectedCustomerInfo =
    allCustomerApiData && allCustomerApiData.length > selectedCustomerIndex
      ? allCustomerApiData[selectedCustomerIndex].data.customer_info
      : null;

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading patient data...</p>
      </main>
    );
  }
  
  if (fetchError && allCustomerApiData.length === 0) {
     return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
        <div className="w-full max-w-md p-6 bg-destructive/10 border border-destructive text-destructive rounded-lg flex flex-col items-center shadow-xl">
          <AlertTriangle className="h-10 w-10 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
          <p className="text-center mb-4">{fetchError}</p>
        </div>
      </main>
    );
  }

  if (allCustomerApiData.length === 0 && !selectedCustomerInfo && !isLoading) {
     return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
        <div className="w-full max-w-4xl mx-auto p-6 bg-card border border-border rounded-lg flex flex-col items-center shadow-xl">
          <AlertTriangle className="h-10 w-10 mb-3 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2 text-foreground">No Data Available</h2>
          <p className="text-center text-muted-foreground mb-4">There is no mock patient data to display.</p>
        </div>
      </main>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" className="bg-sidebar text-sidebar-foreground">
        <FormHistory
          historyItems={allCustomerApiData}
          onSelectHistoryItem={handleSelectHistoryItem}
          currentIndex={selectedCustomerIndex}
          toast={toast}
        />
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-auto items-center justify-between gap-x-2 border-b bg-background px-4 py-3 sm:static sm:border-0 sm:bg-transparent sm:px-6 md:gap-x-4">
          <div className="flex-shrink-0" style={{ minWidth: '2.5rem' }}> 
            <div className="md:hidden">
              {/* SidebarTrigger removed from here */}
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center text-center">
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground">
              MediForm
            </h1>
            <p className="text-sm text-muted-foreground">
              Patient Data Entry
            </p>
          </div>

          <div className="flex-shrink-0" style={{ minWidth: '2.5rem' }}>
            {/* Placeholder for balance */}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
            <CustomerInformationForm
              initialData={selectedCustomerInfo}
              key={selectedCustomerIndex}
              onUpdateCustomerInfo={handleUpdateCustomerInfo}
              selectedIndex={selectedCustomerIndex}
            />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
