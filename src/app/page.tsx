import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="bg-background flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            A/B Testing <span className="text-primary">Platform</span>
          </h1>
          <p className="text-muted-foreground text-xl">
            Manage experiments, variants, and user assignments
          </p>
        </div>
      </main>
    </HydrateClient>
  );
}
