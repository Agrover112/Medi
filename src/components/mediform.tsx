
"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User, Phone, Mail, CalendarDays, MapPin, AlertTriangle, Edit, Ticket, Save, XCircle } from "lucide-react";

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
import { Alert } from "@/components/ui/alert"; // Removed AlertDescription as it's not used

// Define the expected structure for a single customer's info from the API
interface ApiCustomerInfo {
  name: string;
  address: string;
  date_of_birth: string;
  email: string;
  phone: string;
  previous_customer: boolean;
  problem: string;
}

interface CustomerInformationFormProps {
  initialData: ApiCustomerInfo | null;
}

// Structure for display state
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
  dob: "N/A",
  address: "",
  previous_customer: false,
  problem: "",
};

const customerDetailsSchema = z.object({
  name: z.string().min(1, { message: "Name must be at least 1 character." }),
  phoneNumber: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal("")),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date of birth must be in YYYY-MM-DD format." }),
  address: z.string().optional(),
});

type CustomerDetailsFormData = z.infer<typeof customerDetailsSchema>;

const problemFormSchema = z.object({
  currentProblem: z.string().min(10, {
    message: "Problem description must be at least 10 characters.",
  }),
});

type ProblemFormData = z.infer<typeof problemFormSchema>;

interface InfoLineProps {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
}

const InfoLine: React.FC<InfoLineProps> = ({ icon: Icon, label, value, className }) => (
  <div className={`flex items-start space-x-3 py-2 ${className}`}>
    <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
    <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-2 w-full">
      <span className="text-sm font-medium text-muted-foreground min-w-[120px]">{label}:</span>
      <span className="text-sm text-foreground break-words">{value || "N/A"}</span>
    </div>
  </div>
);

export default function CustomerInformationForm({ initialData }: CustomerInformationFormProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = React.useState(false);

  const mapApiToDisplayData = React.useCallback((apiData: ApiCustomerInfo | null): DisplayCustomerData => {
    if (!apiData) return defaultDisplayData;
    return {
      name: apiData.name || defaultDisplayData.name,
      phoneNumber: apiData.phone || defaultDisplayData.phoneNumber,
      email: apiData.email || defaultDisplayData.email,
      dob: apiData.date_of_birth || defaultDisplayData.dob,
      address: apiData.address || defaultDisplayData.address,
      previous_customer: apiData.previous_customer,
      problem: apiData.problem || defaultDisplayData.problem,
    };
  }, []);

  const [customerData, setCustomerData] = React.useState<DisplayCustomerData>(() => mapApiToDisplayData(initialData));

  const customerDetailsForm = useForm<CustomerDetailsFormData>({
    resolver: zodResolver(customerDetailsSchema),
    defaultValues: {
      name: customerData.name === "N/A" ? "" : customerData.name,
      phoneNumber: customerData.phoneNumber,
      email: customerData.email,
      dob: customerData.dob === "N/A" ? "" : customerData.dob,
      address: customerData.address,
    },
  });

  const problemForm = useForm<ProblemFormData>({
    resolver: zodResolver(problemFormSchema),
    defaultValues: {
      currentProblem: customerData.problem,
    },
  });

  React.useEffect(() => {
    const newDisplayData = mapApiToDisplayData(initialData);
    setCustomerData(newDisplayData);
    customerDetailsForm.reset({
      name: newDisplayData.name === "N/A" ? "" : newDisplayData.name,
      phoneNumber: newDisplayData.phoneNumber,
      email: newDisplayData.email,
      dob: newDisplayData.dob === "N/A" ? "" : newDisplayData.dob,
      address: newDisplayData.address,
    });
    problemForm.reset({
      currentProblem: newDisplayData.problem,
    });
  }, [initialData, customerDetailsForm, problemForm, mapApiToDisplayData]);

  function onSubmitProblem(values: ProblemFormData) {
    console.log("Problem submitted:", values);
    toast({
      title: "Ticket Created!",
      description: `Problem reported: ${values.currentProblem.substring(0,50)}...`,
    });
    // problemForm.reset(); // Resetting might clear user input if they want to edit it after submission, depends on UX
  }

  function onSaveCustomerDetails(values: CustomerDetailsFormData) {
    setCustomerData(prev => ({
        ...prev, // Keep previous_customer and problem from original data source
        name: values.name,
        phoneNumber: values.phoneNumber || "",
        email: values.email || "",
        dob: values.dob,
        address: values.address || "",
    }));
    setIsEditing(false);
    toast({
      title: "Customer Details Updated!",
      description: "The customer information has been saved locally.",
    });
  }

  function handleCancelEdit() {
    customerDetailsForm.reset({
        name: customerData.name === "N/A" ? "" : customerData.name,
        phoneNumber: customerData.phoneNumber,
        email: customerData.email,
        dob: customerData.dob === "N/A" ? "" : customerData.dob,
        address: customerData.address,
    });
    setIsEditing(false);
  }

  return (
    <Form {...customerDetailsForm}>
      <Card className="shadow-2xl rounded-xl">
        <CardHeader className="flex flex-col sm:flex-row items-start justify-between space-y-2 sm:space-y-0 pb-4">
          <div className="flex items-center space-x-4">
            <User className="h-10 w-10 text-primary" />
            {isEditing ? (
              <div className="space-y-2">
                <FormField
                  control={customerDetailsForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Customer Name" {...field} className="text-2xl font-bold p-2 h-auto" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {/* Previous customer status is not editable here, shown as description */}
              </div>
            ) : (
              <div>
                <CardTitle className="text-2xl font-bold">{customerData.name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {customerData.previous_customer ? "Returning Customer" : "New Customer"}
                </CardDescription>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Button variant="default" size="sm" onClick={customerDetailsForm.handleSubmit(onSaveCustomerDetails)}>
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  <XCircle className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)} disabled={customerData.name === "N/A"}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isEditing ? (
            <div className="space-y-3">
                <FormField
                  control={customerDetailsForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <FormLabel className="text-sm font-medium text-muted-foreground min-w-[120px] pt-2">Phone Number:</FormLabel>
                      <FormControl>
                        <Input placeholder="123-456-7890" {...field} />
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
                        <Input placeholder="jane.doe@example.com" {...field} />
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
                        <Input placeholder="YYYY-MM-DD" {...field} />
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
                        <Textarea placeholder="123 Main St, Anytown, USA 12345" {...field} rows={2} className="resize-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
          ) : (
            <div className="space-y-1">
              <InfoLine icon={Phone} label="Phone Number" value={customerData.phoneNumber} />
              <InfoLine icon={Mail} label="Email Address" value={customerData.email} />
              <InfoLine icon={CalendarDays} label="Date of Birth" value={customerData.dob} />
              <InfoLine icon={MapPin} label="Address" value={customerData.address} />
            </div>
          )}

          <Separator />

          <div>
            <Form {...problemForm}>
              <form onSubmit={problemForm.handleSubmit(onSubmitProblem)} className="space-y-4">
                <FormField
                  control={problemForm.control}
                  name="currentProblem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-md font-semibold text-foreground">
                        <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
                        Current Problem
                      </FormLabel>
                      <Alert variant="destructive" className="p-0">
                        <FormControl className="p-0 m-0">
                          <Textarea
                            data-ai-hint="device issue"
                            placeholder="Describe the current problem..."
                            {...field}
                            rows={3}
                            className="text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent resize-none"
                            disabled={customerData.name === "N/A"}
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
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                    disabled={problemForm.formState.isSubmitting || customerData.name === "N/A"}
                  >
                    <Ticket className="mr-2 h-5 w-5" />
                    Create Ticket
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
