import { HydrateClient } from "~/trpc/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import ExperimentsView from "~/app/_components/experiments-view";
import VariantsView from "~/app/_components/variants-view";
import AssignmentsView from "~/app/_components/assignments-view";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="bg-background min-h-screen p-8">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">A/B Testing Platform</h1>
            <p className="text-muted-foreground mt-2">
              Manage experiments, variants, and user assignments
            </p>
          </div>

          <Tabs defaultValue="experiments" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="experiments">Experiments</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
            </TabsList>

            <TabsContent value="experiments" className="mt-6">
              <ExperimentsView />
            </TabsContent>

            <TabsContent value="variants" className="mt-6">
              <VariantsView />
            </TabsContent>

            <TabsContent value="assignments" className="mt-6">
              <AssignmentsView />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </HydrateClient>
  );
}
