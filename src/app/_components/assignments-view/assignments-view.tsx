"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { AssignmentForm } from "./assignment-form";
import { AssignmentResultDisplay } from "./assignment-result";
import { AssignmentInfo } from "./assignment-info";
import type { AssignmentResult } from "./types";

export default function AssignmentsView() {
  const [userId, setUserId] = useState("");
  const [selectedExperimentId, setSelectedExperimentId] = useState("");
  const [assignmentResult, setAssignmentResult] =
    useState<AssignmentResult | null>(null);

  const { data: experiments } = api.experiments.list.useQuery();
  const { data: users } = api.users.list.useQuery();

  const assignMutation = api.assignments.get.useQuery(
    {
      userId: userId,
      experimentId: selectedExperimentId,
    },
    {
      enabled: false, // Don't auto-run
      gcTime: 0, // Don't cache results
      staleTime: 0, // Always refetch
      retry: false, // Don't retry failed queries
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

    // Clear previous result
    setAssignmentResult(null);

    // Trigger the query
    void assignMutation.refetch().then((result) => {
      if (result.data) {
        setAssignmentResult(result.data);
        toast.success("Assignment retrieved successfully!");
      } else if (result.error) {
        toast.error(result.error.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <AssignmentForm
        userId={userId}
        onUserIdChange={setUserId}
        selectedExperimentId={selectedExperimentId}
        onExperimentChange={setSelectedExperimentId}
        experiments={experiments}
        users={users}
        onSubmit={handleGetAssignment}
        isLoading={assignMutation.isFetching}
      />

      {assignmentResult && (
        <AssignmentResultDisplay result={assignmentResult} userId={userId} />
      )}

      {assignMutation.isError && (
        <div className="rounded-lg border border-red-500 bg-red-50 p-4 text-red-900 dark:bg-red-950 dark:text-red-200">
          <h4 className="font-semibold">Error</h4>
          <p className="text-sm">{assignMutation.error.message}</p>
        </div>
      )}

      <AssignmentInfo />
    </div>
  );
}
