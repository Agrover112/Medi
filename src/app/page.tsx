
"use client";

import React, { useState, useEffect } from "react";
import CustomerInformationForm, { type ApiCustomerInfo } from '@/components/mediform';
import FormHistory from '@/components/form-history';
import { Loader2, AlertTriangle } from "lucide-react"; // Keep for potential future use

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
  }
];

export default function HomePage() {
  const [allCustomerApiData, setAllCustomerApiData] = useState<ApiDataItem[]>(mockCustomerApiData);
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState<number>(0);
  // isLoading and fetchError states are removed as we are using mock data

  useEffect(() => {
    // If mock data is empty, set a default or handle appropriately
    if (mockCustomerApiData.length === 0) {
      // Potentially set some default state or error for no mock data
      console.warn("Mock data is empty.");
      setAllCustomerApiData([]); // Ensure it's an empty array
    } else {
      setAllCustomerApiData(mockCustomerApiData);
      setSelectedCustomerIndex(0);
    }
  }, []); // Runs once on mount to initialize with mock data

  const handleSelectHistoryItem = (index: number) => {
    setSelectedCustomerIndex(index);
  };

  const selectedCustomerInfo = 
    allCustomerApiData && allCustomerApiData.length > selectedCustomerIndex 
    ? allCustomerApiData[selectedCustomerIndex].data.customer_info 
    : null;

  // Removed loading state display as data is now static
  // Removed fetchError display as fetching is removed

  return (
    <main className="flex min-h-screen flex-col items-start justify-start p-4 md:p-8 bg-background">
      <div className="w-full text-center mb-10 mt-4">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">
          MediForm Excel Generator
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Patient Data Entry & Excel Export
        </p>
      </div>

      {allCustomerApiData.length === 0 && !selectedCustomerInfo ? (
         <div className="w-full max-w-4xl mx-auto p-6 bg-destructive/10 border border-destructive text-destructive rounded-lg flex flex-col items-center">
          <AlertTriangle className="h-10 w-10 mb-3" />
          <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
          <p className="text-center mb-4">There is no mock patient data to display.</p>
        </div>
      ) : (
        <div className="w-full flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 w-full">
            <CustomerInformationForm initialData={selectedCustomerInfo} key={selectedCustomerIndex} />
          </div>
          <div className="lg:w-1/3 w-full">
            <FormHistory 
              historyItems={allCustomerApiData}
              onSelectHistoryItem={handleSelectHistoryItem}
              currentIndex={selectedCustomerIndex}
            />
          </div>
        </div>
      )}
    </main>
  );
}
