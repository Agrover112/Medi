
"use client";

import React, { useState, useEffect, useCallback } from "react";
import CustomerInformationForm, { type ApiCustomerInfo } from '@/components/mediform';
import FormHistory from '@/components/form-history';
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, History as HistoryIcon } from "lucide-react";
import { format } from 'date-fns';

interface ApiDataItem {
  data: {
    customer_info: ApiCustomerInfo;
  };
  timestamp: string;
}

export default function HomePage() {
  const [allCustomerApiData, setAllCustomerApiData] = useState<ApiDataItem[] | null>(null);
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await fetch('https://backend.hackaton.runcarsnowpen.work/get_all', { cache: 'no-store' });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch customer data (server response not OK):", response.statusText, errorText);
        const specificMessage = `Server error: ${response.statusText}. ${errorText || 'No additional error message from server.'}`;
        console.log("Setting user-facing fetch error:", specificMessage);
        setFetchError(specificMessage);
        setAllCustomerApiData([]); 
      } else {
        const data: ApiDataItem[] = await response.json();
        if (data && data.length > 0) {
          setAllCustomerApiData(data);
          setSelectedCustomerIndex(0); 
        } else {
          console.warn("Fetched data is empty or not in the expected format:", data);
          setAllCustomerApiData([]); 
          setFetchError("No customer data found or data is not in the expected format.");
        }
      }
    } catch (error: any) {
      console.error("Error fetching customer data (raw error):", error);
      if (error.message.includes("Failed to fetch")) {
        const specificMessage = "Failed to fetch data. Please check your network connection or if the backend server is reachable (e.g., server down, CORS policy). See browser console for more details.";
        console.log("Setting user-facing fetch error:", specificMessage);
        setFetchError(specificMessage);
      } else {
        const specificMessage = `An unexpected error occurred while fetching data: ${error.message}`;
        console.log("Setting user-facing fetch error:", specificMessage);
        setFetchError(specificMessage);
      }
      setAllCustomerApiData([]); 
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectHistoryItem = (index: number) => {
    setSelectedCustomerIndex(index);
  };

  const selectedCustomerInfo = 
    allCustomerApiData && allCustomerApiData.length > selectedCustomerIndex 
    ? allCustomerApiData[selectedCustomerIndex].data.customer_info 
    : null;

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading customer data...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-start justify-start p-4 md:p-8 bg-background">
      <div className="w-full text-center mb-10 mt-4">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">
          Customer Information
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Receptionist Dashboard
        </p>
      </div>

      {fetchError ? (
         <div className="w-full max-w-4xl mx-auto p-6 bg-destructive/10 border border-destructive text-destructive rounded-lg flex flex-col items-center">
          <AlertTriangle className="h-10 w-10 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Error Fetching Data</h2>
          <p className="text-center mb-4">{fetchError}</p>
          <Button onClick={fetchData} variant="destructive">
            <HistoryIcon className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </div>
      ) : (
        <div className="w-full flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 w-full">
            <CustomerInformationForm initialData={selectedCustomerInfo} key={selectedCustomerIndex} />
          </div>
          <div className="lg:w-1/3 w-full">
            <FormHistory 
              historyItems={allCustomerApiData || []}
              onSelectHistoryItem={handleSelectHistoryItem}
              currentIndex={selectedCustomerIndex}
            />
          </div>
        </div>
      )}
    </main>
  );
}
