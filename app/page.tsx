import { Header } from "@/components/header";
import { EmailInput } from "@/components/email-input";
import { Itinerary } from "@/components/itinerary";

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 flex flex-col gap-8">
        <EmailInput />
        <Itinerary />
      </main>
    </div>
  );
}
