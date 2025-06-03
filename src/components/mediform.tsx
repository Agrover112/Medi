
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User, Phone, Mail, CalendarDays, MapPin, AlertTriangle, Edit, Eye, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Static data for display (can be props later)
const customerInfo = {
  name: "Jane Doe",
  profileType: "Customer Profile",
  phoneNumber: "123-456-7890",
  email: "jane.doe@example.com",
  dob: "1990-05-15",
  address: "123 Main St, Anytown, USA 12345",
  status: "Returning",
};

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
  <div className={`flex items-center space-x-3 py-2 ${className}`}>
    <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 w-full">
      <span className="text-sm font-medium text-muted-foreground min-w-[120px]">{label}:</span>
      <span className="text-sm text-foreground break-words">{value}</span>
    </div>
  </div>
);

export default function CustomerInformationForm() {
  const { toast } = useToast();
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

  return (
    <Card className="shadow-2xl rounded-xl">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-4">
          <User className="h-10 w-10 text-primary" />
          <div>
            <CardTitle className="text-2xl font-bold">{customerInfo.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">{customerInfo.profileType}</CardDescription>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">Returning Customer</Badge>
          <Button variant="default" size="sm">
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-1">
          <InfoLine icon={Phone} label="Phone Number" value={customerInfo.phoneNumber} />
          <InfoLine icon={Mail} label="Email Address" value={customerInfo.email} />
          <InfoLine icon={CalendarDays} label="Date of Birth" value={customerInfo.dob} />
          <InfoLine icon={MapPin} label="Address" value={customerInfo.address} />
        </div>

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
              
              <div className="pt-4"> {/* Added spacing for the button */}
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
          <p className="text-sm text-muted-foreground">Customer Status: <span className="font-semibold text-foreground">{customerInfo.status}</span></p>
          <div className="flex space-x-2">
            <Button variant="default" size="sm">
              <Eye className="mr-2 h-4 w-4" /> View History
            </Button>
            {/* The purple submit button from image is omitted as "Create Ticket" handles submission */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
