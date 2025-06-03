
import MediForm from '@/components/mediform';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
      <div className="w-full max-w-2xl bg-card p-6 sm:p-8 rounded-xl shadow-2xl">
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-center mb-8 text-primary">
          MediForm Excel Generator
        </h1>
        <MediForm />
      </div>
    </main>
  );
}
