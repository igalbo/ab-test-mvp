"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Search } from "lucide-react";

export default function AssignmentsView() {
  const [userId, setUserId] = useState("");
  const [selectedExperimentId, setSelectedExperimentId] = useState("");
  const [assignmentResult, setAssignmentResult] = useState<{
    variantKey: string;
    isNew: boolean;
  } | null>(null);

  const { data: experiments } = api.experiments.list.useQuery();

  const assignMutation = api.assignments.get.useQuery(
    {
      userId: userId,
      experimentId: selectedExperimentId,
    },
    {
      enabled: false, // Don't auto-run
    },
  );

  const handleGetAssignment = () => {
    if (!userId.trim()) {
      toast.error("Please enter a User ID");
      return;
    }
    if (!selectedExperimentId) {
      toast.error("Please select an experiment");
      return;
    }

    // Trigger the query
    assignMutation.refetch().then((result) => {
      if (result.data) {
        setAssignmentResult(result.data);
        toast.success("Assignment retrieved successfully!");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-6">
        <h3 className="mb-4 text-lg font-semibold">Get User Assignment</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="userId">User ID *</Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="user_123"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="experiment">Experiment *</Label>
            <select
              id="experiment"
              value={selectedExperimentId}
              onChange={(e) => setSelectedExperimentId(e.target.value)}
              className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2"
            >
              <option value="">-- Select an experiment --</option>
              {experiments?.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleGetAssignment}
            disabled={assignMutation.isFetching}
            className="w-full"
          >
            <Search className="mr-2 h-4 w-4" />
            {assignMutation.isFetching
              ? "Getting Assignment..."
              : "Get Assignment"}
          </Button>
        </div>
      </div>

      {assignmentResult && (
        <div className="rounded-lg border p-6">
          <h3 className="mb-4 text-lg font-semibold">Assignment Result</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">User ID:</span>
              <code className="bg-muted rounded px-2 py-1">{userId}</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Assigned Variant:</span>
              <Badge className="text-lg">{assignmentResult.variantKey}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={assignmentResult.isNew ? "default" : "secondary"}>
                {assignmentResult.isNew
                  ? "New Assignment"
                  : "Existing Assignment"}
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground mt-4 text-sm">
            {assignmentResult.isNew
              ? "This user has been assigned to this variant for the first time."
              : "This user was previously assigned to this variant (sticky assignment)."}
          </p>
        </div>
      )}

      {assignMutation.isError && (
        <div className="rounded-lg border border-red-500 bg-red-50 p-4 text-red-900 dark:bg-red-950 dark:text-red-200">
          <h4 className="font-semibold">Error</h4>
          <p className="text-sm">{assignMutation.error.message}</p>
        </div>
      )}

      <div className="bg-muted rounded-lg p-4">
        <h4 className="mb-2 font-semibold">How It Works</h4>
        <ul className="text-muted-foreground space-y-1 text-sm">
          <li>
            • Enter a User ID and select an experiment to get their variant
            assignment
          </li>
          <li>
            • The system uses a hash-based algorithm to ensure sticky
            assignments
          </li>
          <li>
            • The same user will always get the same variant for an experiment
          </li>
          <li>
            • If this is the first time, a new assignment is created and stored
          </li>
        </ul>
      </div>
    </div>
  );
}
