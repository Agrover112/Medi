
import CustomerInformationForm from '@/components/mediform';

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

interface ApiDataItem {
  data: {
    customer_info: ApiCustomerInfo;
  };
  timestamp: string;
}

export default async function HomePage() {
  let customerApiData: ApiCustomerInfo | null = null;

  try {
    const response = await fetch('https://backend.hackaton.runcarsnowpen.work/get_all', { cache: 'no-store' });
    if (!response.ok) {
      console.error("Failed to fetch customer data:", response.statusText, await response.text());
    } else {
      const data: ApiDataItem[] = await response.json();
      if (data && data.length > 0 && data[0].data && data[0].data.customer_info) {
        customerApiData = data[0].data.customer_info; // Take the first customer's info
      } else {
        console.warn("Fetched data is empty or not in the expected format:", data);
      }
    }
  } catch (error) {
    console.error("Error fetching customer data:", error);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-8 bg-background">
      <div className="w-full text-center mb-10 mt-4">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">
          Customer Information
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Receptionist Dashboard
        </p>
      </div>
      <div className="w-full max-w-3xl">
        <CustomerInformationForm initialData={customerApiData} />
      </div>
    </main>
  );
}
