
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import * as XLSX from "xlsx";
import { User, MapPin, ClipboardList, FileText, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  patientName: z.string().min(2, {
    message: "Patient name must be at least 2 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  appointmentReason: z.string().min(3, {
    message: "Reason for appointment must be at least 3 characters.",
  }),
  problemDescription: z.string().min(10, {
    message: "Problem description must be at least 10 characters.",
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function MediForm() {
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: "",
      address: "",
      appointmentReason: "",
      problemDescription: "",
    },
  });

  function onSubmit(values: FormData) {
    try {
      const dataForExcel = [
        {
          "Patient Name": values.patientName,
          "Address": values.address,
          "Reason for Appointment": values.appointmentReason,
          "Problem Description": values.problemDescription,
        },
      ];

      const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "PatientData");

      const date = new Date().toISOString().split('T')[0];
      const fileName = `PatientData_${values.patientName.replace(/\s+/g, '_')}_${date}.xlsx`;
      
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Success!",
        description: "Excel file generated and download started.",
      });
      form.reset(); 
    } catch (error) {
      console.error("Failed to generate Excel file:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem generating the Excel file.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="patientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground/90">Patient Name</FormLabel>
              <FormControl>
                <div className="relative flex items-center">
                  <User className="absolute left-3 h-5 w-5 text-muted-foreground" />
                  <Input data-ai-hint="person name" placeholder="Enter patient's full name" {...field} className="pl-10 text-base" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground/90">Address</FormLabel>
              <FormControl>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3 h-5 w-5 text-muted-foreground" />
                  <Input data-ai-hint="street address" placeholder="Enter patient's address" {...field} className="pl-10 text-base" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="appointmentReason"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground/90">Reason for Appointment</FormLabel>
              <FormControl>
                <div className="relative flex items-center">
                  <ClipboardList className="absolute left-3 h-5 w-5 text-muted-foreground" />
                  <Input data-ai-hint="medical appointment" placeholder="e.g., Checkup, Consultation" {...field} className="pl-10 text-base" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="problemDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center text-foreground/90">
                <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                Detailed Problem Description
              </FormLabel>
              <FormControl>
                <Textarea
                  data-ai-hint="medical symptoms"
                  placeholder="Describe the medical problem in detail..."
                  {...field}
                  rows={5}
                  className="text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          disabled={form.formState.isSubmitting}
        >
          <Download className="mr-2 h-5 w-5" />
          Generate and Download Excel
        </Button>
      </form>
    </Form>
  );
}

