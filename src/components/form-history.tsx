
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { History, UserCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { ApiCustomerInfo } from '@/components/mediform'; // Assuming ApiCustomerInfo is exported

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
  if (!historyItems || historyItems.length === 0) {
    return (
      <Card className="shadow-lg rounded-xl h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold flex items-center">
            <History className="mr-2 h-5 w-5 text-primary" />
            Form History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No past entries available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg rounded-xl h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold flex items-center">
          <History className="mr-2 h-5 w-5 text-primary" />
          Form History
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-grow">
        <ScrollArea className="h-[calc(100vh-250px)] pr-3"> {/* Adjust height as needed */}
          <div className="space-y-3">
            {historyItems.map((item, index) => (
              <Button
                key={item.timestamp + '-' + index} // More robust key
                variant={index === currentIndex ? "default" : "outline"}
                className="w-full justify-start h-auto py-3 px-4 text-left flex flex-col items-start space-y-1 shadow-sm hover:shadow-md transition-shadow"
                onClick={() => onSelectHistoryItem(index)}
              >
                <div className="flex items-center w-full">
                   <UserCircle className="mr-2 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <span className={`font-medium ${index === currentIndex ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {item.data.customer_info.name || "Unnamed Customer"}
                  </span>
                </div>
                <p className={`text-xs ${index === currentIndex ? 'text-primary-foreground/80' : 'text-muted-foreground'} pl-7`}>
                  {format(new Date(item.timestamp), "MMM d, yyyy 'at' h:mm a")}
                </p>
                 {item.data.customer_info.problem && (
                   <p className={`text-xs italic truncate w-full ${index === currentIndex ? 'text-primary-foreground/70' : 'text-muted-foreground/80'} pl-7`}>
                    Problem: {item.data.customer_info.problem.substring(0, 50)}{item.data.customer_info.problem.length > 50 ? '...' : ''}
                  </p>
                 )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
