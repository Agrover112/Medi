
"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User, Phone, Mail, CalendarDays, MapPin, AlertTriangle, Ticket } from "lucide-react";

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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";


export interface ApiCustomerInfo {
  name: string;
  address: string | null;
  date_of_birth: string | null;
  email: string | null;
  phone: string | null;
  previous_customer: boolean;
  problem: string;
}

interface CustomerInformationFormProps {
  initialData: ApiCustomerInfo | null;
  onUpdateCustomerInfo: (updatedInfo: ApiCustomerInfo, index: number) => void;
  selectedIndex: number;
}

interface DisplayCustomerData {
  name: string;
  phoneNumber: string;
  email: string;
  dob: string;
  address: string;
  previous_customer: boolean;
  problem: string;
}

const defaultDisplayData: DisplayCustomerData = {
  name: "N/A",
  phoneNumber: "",
  email: "",
  dob: "",
  address: "",
  previous_customer: false,
  problem: "",
};

const customerDetailsSchema = z.object({
  name: z.string().min(1, { message: "Name must be at least 1 character." }),
  phoneNumber: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal("")),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date of birth must be in YYYY-MM-DD format." }).optional().or(z.literal("")),
  address: z.string().optional(),
});

type CustomerDetailsFormData = z.infer<typeof customerDetailsSchema>;

const problemFormSchema = z.object({
  currentProblem: z.string().min(1, {
    message: "Problem description must be at least 1 character.",
  }),
});

type ProblemFormData = z.infer<typeof problemFormSchema>;


export default function CustomerInformationForm({ initialData, onUpdateCustomerInfo, selectedIndex }: CustomerInformationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const customerData = React.useMemo((): DisplayCustomerData => {
    if (!initialData) return defaultDisplayData;
    return {
      name: initialData.name || defaultDisplayData.name,
      phoneNumber: initialData.phone || defaultDisplayData.phoneNumber,
      email: initialData.email || defaultDisplayData.email,
      dob: initialData.date_of_birth || defaultDisplayData.dob,
      address: initialData.address || defaultDisplayData.address,
      previous_customer: initialData.previous_customer,
      problem: initialData.problem || defaultDisplayData.problem,
    };
  }, [initialData]);

  const customerDetailsForm = useForm<CustomerDetailsFormData>({
    resolver: zodResolver(customerDetailsSchema),
    defaultValues: {
      name: (customerData.name && customerData.name !== "N/A") ? customerData.name : "",
      phoneNumber: customerData.phoneNumber || "",
      email: customerData.email || "",
      dob: (customerData.dob && customerData.dob !== "N/A") ? customerData.dob : "",
      address: customerData.address || "",
    },
  });

  const problemForm = useForm<ProblemFormData>({
    resolver: zodResolver(problemFormSchema),
    defaultValues: {
      currentProblem: customerData.problem || "",
    },
  });

  React.useEffect(() => {
    customerDetailsForm.reset({
      name: (customerData.name && customerData.name !== "N/A") ? customerData.name : "",
      phoneNumber: customerData.phoneNumber || "",
      email: customerData.email || "",
      dob: (customerData.dob && customerData.dob !== "N/A") ? customerData.dob : "",
      address: customerData.address || "",
    });
    problemForm.reset({
      currentProblem: customerData.problem || "",
    });
    setIsSubmitting(false);
  }, [customerData, customerDetailsForm, problemForm]);


  async function onSubmitAllData(problemValues: ProblemFormData) {
    if (!initialData) return;
    
    const customerDetailsAreValid = await customerDetailsForm.trigger();
    if (!customerDetailsAreValid) {
      toast({
        title: "Validation Error",
        description: "Please check the patient details for errors.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);

    const detailValues = customerDetailsForm.getValues();

    const updatedApiInfo: ApiCustomerInfo = {
      name: detailValues.name,
      address: detailValues.address || null,
      date_of_birth: detailValues.dob || null,
      email: detailValues.email || null,
      phone: detailValues.phoneNumber || null,
      previous_customer: initialData.previous_customer,
      problem: problemValues.currentProblem,
    };
    onUpdateCustomerInfo(updatedApiInfo, selectedIndex);

    toast({
      title: "Patient Information Updated!",
      description: `All information for ${detailValues.name} has been updated in this session.`,
      variant: "default"
    });

    setTimeout(() => {
      setIsSubmitting(false);
    }, 1500);
  }

  const isFormDisabled = customerData.name === "N/A" || !initialData;


  return (
    <Card className="shadow-2xl rounded-xl">
      <Form {...customerDetailsForm}>
        <CardHeader className="pb-2 pt-6">
          {/* Intentionally empty or for a future static title if needed */}
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center space-x-4">
              <User className="h-10 w-10 text-primary flex-shrink-0" />
              <div className="flex flex-col">
                <FormField
                  control={customerDetailsForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Patient Name"
                          {...field}
                          className="text-2xl font-bold p-2 h-auto border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none bg-transparent text-foreground placeholder:text-muted-foreground"
                          disabled={isFormDisabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-sm text-muted-foreground">
                  {initialData && (initialData.previous_customer ? "Returning Patient" : "New Patient")}
                </p>
              </div>
            </div>
          </div>
          <Separator className="mb-6" />

          <form className="space-y-3"> {/* This form tag is not strictly necessary for RHF submission if Form provider is at top level */}
            <FormField
              control={customerDetailsForm.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <FormLabel className="text-sm font-medium text-muted-foreground min-w-[120px] pt-2">Phone Number:</FormLabel>
                  <FormControl>
                    <Input placeholder="123-456-7890" {...field} disabled={isFormDisabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={customerDetailsForm.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <FormLabel className="text-sm font-medium text-muted-foreground min-w-[120px] pt-2">Email Address:</FormLabel>
                  <FormControl>
                    <Input placeholder="patient@example.com" {...field} disabled={isFormDisabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={customerDetailsForm.control}
              name="dob"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-3">
                  <CalendarDays className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <FormLabel className="text-sm font-medium text-muted-foreground min-w-[120px] pt-2">Date of Birth:</FormLabel>
                  <FormControl>
                    <Input placeholder="YYYY-MM-DD" {...field} disabled={isFormDisabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={customerDetailsForm.control}
              name="address"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                  <FormLabel className="text-sm font-medium text-muted-foreground min-w-[120px] pt-2">Address:</FormLabel>
                  <FormControl>
                    <Textarea placeholder="123 Main St, Anytown, USA 12345" {...field} rows={2} className="resize-none" disabled={isFormDisabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
          <Separator />

          <Form {...problemForm}>
            <form onSubmit={problemForm.handleSubmit(onSubmitAllData)} className="space-y-4">
              <FormField
                control={problemForm.control}
                name="currentProblem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-md font-semibold">
                      <AlertTriangle className="h-5 w-5 mr-2 text-muted-foreground" /> {/* Icon color changed */}
                      Detailed Problem Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        data-ai-hint="medical condition"
                        placeholder="Describe the current problem or reason for appointment..."
                        {...field}
                        rows={4} // Increased rows slightly for better visibility
                        className="resize-none" // Removed specific destructive styling, relies on default Textarea style
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="default"
                  className="w-full text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                  disabled={problemForm.formState.isSubmitting || isSubmitting || isFormDisabled}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Ticket className="mr-2 h-5 w-5" />
                      Update Problem Description
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Form>
    </Card>
  );
}
