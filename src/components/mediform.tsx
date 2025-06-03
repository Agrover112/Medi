
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User, Phone, Mail, CalendarDays, MapPin, AlertTriangle, Edit, Eye, Ticket, Save, XCircle } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Static data for initial display
const initialCustomerInfo = {
  name: "Jane Doe",
  profileType: "Customer Profile",
  phoneNumber: "123-456-7890",
  email: "jane.doe@example.com",
  dob: "1990-05-15",
  address: "123 Main St, Anytown, USA 12345",
  status: "Returning", // "Returning Customer" badge implies a status
};

const customerDetailsSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  profileType: z.string().min(2, { message: "Profile type must be at least 2 characters." }),
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date of birth must be in YYYY-MM-DD format." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  status: z.string().min(2, { message: "Status must be at least 2 characters." }),
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
      <span className="text-sm text-foreground break-words">{value}</span>
    </div>
  </div>
);

export default function CustomerInformationForm() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = React.useState(false);
  const [customerData, setCustomerData] = React.useState(initialCustomerInfo);

  const customerDetailsForm = useForm<CustomerDetailsFormData>({
    resolver: zodResolver(customerDetailsSchema),
    defaultValues: customerData, // Initialize with current customer data
  });

  React.useEffect(() => {
    customerDetailsForm.reset(customerData); // Reset form when customerData changes or edit mode toggles
  }, [customerData, isEditing, customerDetailsForm]);

  const problemForm = useForm<ProblemFormData>({
    resolver: zodResolver(problemFormSchema),
    defaultValues: {
      currentProblem: "",
    },
  });

  function onSubmitProblem(values: ProblemFormData) {
    console.log("Problem submitted:", values);
    toast({
      title: "Ticket Created!",
      description: `Problem reported: ${values.currentProblem.substring(0,50)}...`,
    });
    problemForm.reset();
  }

  function onSaveCustomerDetails(values: CustomerDetailsFormData) {
    setCustomerData(values);
    setIsEditing(false);
    toast({
      title: "Customer Details Updated!",
      description: "The customer information has been saved.",
    });
  }

  function handleCancelEdit() {
    customerDetailsForm.reset(customerData); // Reset to last saved data
    setIsEditing(false);
  }

  return (
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
              <FormField
                control={customerDetailsForm.control}
                name="profileType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Profile Type" {...field} className="text-sm p-1 h-auto" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <div>
              <CardTitle className="text-2xl font-bold">{customerData.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">{customerData.profileType}</CardDescription>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <FormField
              control={customerDetailsForm.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Status (e.g., Returning)" {...field} className="text-xs p-1 h-auto w-32" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <Badge variant="outline">{customerData.status}</Badge>
          )}
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
            <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isEditing ? (
          <Form {...customerDetailsForm}>
            <form onSubmit={customerDetailsForm.handleSubmit(onSaveCustomerDetails)} className="space-y-3">
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
                  <FormItem className="flex items-start space-x-3"> {/* items-start for address */}
                    <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    <FormLabel className="text-sm font-medium text-muted-foreground min-w-[120px] pt-2">Address:</FormLabel>
                    <FormControl>
                      <Textarea placeholder="123 Main St, Anytown, USA 12345" {...field} rows={2} className="resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
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
                    <Alert variant="destructive" className="bg-red-50 border-red-200 p-0">
                      <FormControl className="p-0 m-0">
                        <Textarea
                          data-ai-hint="device issue"
                          placeholder="The device won't turn on after the latest update."
                          {...field}
                          rows={3}
                          className="text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent resize-none"
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
                  disabled={problemForm.formState.isSubmitting}
                >
                  <Ticket className="mr-2 h-5 w-5" />
                  Create Ticket
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <Separator />

        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <p className="text-sm text-muted-foreground">Customer Status: <span className="font-semibold text-foreground">{customerData.status}</span></p>
          <div className="flex space-x-2">
            <Button variant="default" size="sm">
              <Eye className="mr-2 h-4 w-4" /> View History
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

    