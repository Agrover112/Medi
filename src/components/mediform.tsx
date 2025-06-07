
"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User, Phone, Mail, CalendarDays, MapPin, AlertTriangle, Edit, Ticket, Save, XCircle, Check } from "lucide-react";

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

interface InfoLineProps {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
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

export default function CustomerInformationForm({ initialData, onUpdateCustomerInfo, selectedIndex }: CustomerInformationFormProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isProblemSubmitting, setIsProblemSubmitting] = React.useState(false); // For problem form

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
    setIsEditing(false); 
    // Reset problem submission state if initial data changes, ensuring button is fresh
    setIsProblemSubmitting(false);
  }, [customerData, customerDetailsForm, problemForm]);


  async function onSubmitProblem(values: ProblemFormData) {
    if (!initialData) return;
    setIsProblemSubmitting(true);

    const updatedApiInfo: ApiCustomerInfo = {
      ...initialData, // Preserve other details
      problem: values.currentProblem,
    };
    onUpdateCustomerInfo(updatedApiInfo, selectedIndex);
    
    toast({
      title: "Problem Updated!",
      description: `Problem description for ${initialData.name} has been updated.`,
      variant: "default"
    });

    // No need to manually reset problemForm.isSubmitting, React Hook Form handles it.
    // The button state can be controlled by `isProblemSubmitting` for UI feedback.
    // The useEffect above will re-sync the form if initialData changes, 
    // but here we specifically want to give submission feedback then potentially allow re-submission.
    // If you want to prevent multiple submissions until data re-syncs, this state is useful.
     setTimeout(() => {
        setIsProblemSubmitting(false); // Allow re-submission or further edits after a delay
     }, 3000); // Re-enable after 3 seconds
  }

  function onSaveCustomerDetails(values: CustomerDetailsFormData) {
    if (!initialData) return;

    const updatedApiInfo: ApiCustomerInfo = {
        name: values.name,
        address: values.address || null,
        date_of_birth: values.dob || null,
        email: values.email || null,
        phone: values.phoneNumber || null,
        // Preserve these from the original data as they are not part of this form
        previous_customer: initialData.previous_customer, 
        problem: initialData.problem, 
    };

    onUpdateCustomerInfo(updatedApiInfo, selectedIndex);
    setIsEditing(false);
    toast({
      title: "Patient Details Updated!",
      description: `Information for ${values.name} has been updated.`,
      variant: "default"
    });
  }

  function handleCancelEdit() {
    customerDetailsForm.reset({
        name: (customerData.name && customerData.name !== "N/A") ? customerData.name : "",
        phoneNumber: customerData.phoneNumber,
        email: customerData.email,
        dob: (customerData.dob && customerData.dob !== "N/A") ? customerData.dob : "",
        address: customerData.address,
    });
    setIsEditing(false);
  }

  const isFormDisabled = customerData.name === "N/A" || !initialData;


  return (
    <Form {...customerDetailsForm}>
      <Card className="shadow-2xl rounded-xl bg-card">
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
                        <Input placeholder="Patient Name" {...field} className="text-2xl font-bold p-2 h-auto bg-input text-foreground border-border focus:ring-primary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <div>
                <CardTitle className="text-2xl font-bold text-foreground">{customerData.name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {customerData.previous_customer ? "Returning Patient" : "New Patient"}
                </CardDescription>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Button variant="default" size="sm" onClick={customerDetailsForm.handleSubmit(onSaveCustomerDetails)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancelEdit} className="border-border hover:bg-muted">
                  <XCircle className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)} disabled={isFormDisabled} className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
                        <Input placeholder="123-456-7890" {...field} className="bg-input text-foreground border-border focus:ring-primary"/>
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
                        <Input placeholder="patient@example.com" {...field} className="bg-input text-foreground border-border focus:ring-primary"/>
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
                        <Input placeholder="YYYY-MM-DD" {...field} className="bg-input text-foreground border-border focus:ring-primary"/>
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
                        <Textarea placeholder="123 Main St, Anytown, USA 12345" {...field} rows={2} className="resize-none bg-input text-foreground border-border focus:ring-primary" />
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

          <Separator className="bg-border"/>

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
                            disabled={isFormDisabled || isEditing} // Disable if main form is N/A or if details are being edited
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
                    disabled={problemForm.formState.isSubmitting || isProblemSubmitting || isFormDisabled || isEditing}
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

