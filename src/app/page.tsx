
import CustomerInformationForm from '@/components/mediform'; // Will be the CustomerInformationForm logic

export default function HomePage() {
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
        <CustomerInformationForm />
      </div>
    </main>
  );
}
