
"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User, Phone, Mail, CalendarDays, MapPin, AlertTriangle, Ticket, Save, Check } from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";

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
  const [isProblemSubmitting, setIsProblemSubmitting] = React.useState(false); 
  const [isDetailsSubmitting, setIsDetailsSubmitting] = React.useState(false);

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
    setIsProblemSubmitting(false);
    setIsDetailsSubmitting(false);
  }, [customerData, customerDetailsForm, problemForm]);


  async function onSubmitProblem(values: ProblemFormData) {
    if (!initialData) return;
    setIsProblemSubmitting(true);

    const updatedApiInfo: ApiCustomerInfo = {
      ...initialData, 
      problem: values.currentProblem,
    };
    onUpdateCustomerInfo(updatedApiInfo, selectedIndex);
    
    toast({
      title: "Problem Updated!",
      description: `Problem description for ${initialData.name} has been updated in this session.`,
      variant: "default"
    });

     setTimeout(() => {
        setIsProblemSubmitting(false); 
     }, 3000); 
  }

  function onSaveCustomerDetails(values: CustomerDetailsFormData) {
    if (!initialData) return;
    setIsDetailsSubmitting(true);

    const updatedApiInfo: ApiCustomerInfo = {
        name: values.name,
        address: values.address || null,
        date_of_birth: values.dob || null,
        email: values.email || null,
        phone: values.phoneNumber || null,
        previous_customer: initialData.previous_customer, 
        problem: initialData.problem, 
    };

    onUpdateCustomerInfo(updatedApiInfo, selectedIndex);
    toast({
      title: "Patient Details Updated!",
      description: `Information for ${values.name} has been updated in this session.`,
      variant: "default"
    });
     setTimeout(() => {
        setIsDetailsSubmitting(false); 
     }, 3000); 
  }


  const isFormDisabled = customerData.name === "N/A" || !initialData;


  return (
    <Form {...customerDetailsForm}>
      <Card className="shadow-2xl rounded-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4 mb-2">
            <User className="h-10 w-10 text-primary" />
            <div className="flex-grow">
              <FormField
                control={customerDetailsForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Patient Name" {...field} className="text-2xl font-bold p-2 h-auto border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none" disabled={isFormDisabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <CardDescription className="ml-14"> {/* Aligns with name input start */}
            {initialData && (initialData.previous_customer ? "Returning Patient" : "New Patient")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={customerDetailsForm.handleSubmit(onSaveCustomerDetails)} className="space-y-3">
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
                      <Input placeholder="patient@example.com" {...field} disabled={isFormDisabled}/>
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
                      <Input placeholder="YYYY-MM-DD" {...field} disabled={isFormDisabled}/>
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
                      <Textarea placeholder="123 Main St, Anytown, USA 12345" {...field} rows={2} className="resize-none" disabled={isFormDisabled}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-4">
                <Button 
                  type="submit" 
                  variant="secondary"
                  className="w-full text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                  disabled={customerDetailsForm.formState.isSubmitting || isDetailsSubmitting || isFormDisabled}
                >
                  {isDetailsSubmitting ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Details Updated! 
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Update Patient Details
                    </>
                  )}
                </Button>
              </div>
          </form>

          <Separator />

          <div>
            <Form {...problemForm}>
              <form onSubmit={problemForm.handleSubmit(onSubmitProblem)} className="space-y-4">
                <FormField
                  control={problemForm.control}
                  name="currentProblem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-md font-semibold">
                        <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
                        Detailed Problem Description
                      </FormLabel>
                      <Alert variant="destructive" className="p-0 bg-destructive/5 border-destructive/50">
                        <FormControl className="p-0 m-0">
                          <Textarea
                            data-ai-hint="medical condition"
                            placeholder="Describe the current problem or reason for appointment..."
                            {...field}
                            rows={3}
                            className="text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent resize-none text-destructive dark:text-destructive-foreground placeholder:text-destructive/70 dark:placeholder:text-destructive-foreground/70"
                            disabled={isFormDisabled} 
                          />
                        </FormControl>
                      </Alert>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    variant="default"
                    className="w-full text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                    disabled={problemForm.formState.isSubmitting || isProblemSubmitting || isFormDisabled}
                  >
                    {isProblemSubmitting ? (
                      <>
                        <Check className="mr-2 h-5 w-5" />
                        Updated! 
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
          </div>
        </CardContent>
      </Card>
    </Form>
  );
}

