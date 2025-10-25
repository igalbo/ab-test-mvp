import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Search } from "lucide-react";
import type { Experiment } from "./types";

type AssignmentFormProps = {
  userId: string;
  onUserIdChange: (userId: string) => void;
  selectedExperimentId: string;
  onExperimentChange: (experimentId: string) => void;
  experiments: Experiment[] | undefined;
  onSubmit: () => void;
  isLoading: boolean;
};

export function AssignmentForm({
  userId,
  onUserIdChange,
  selectedExperimentId,
  onExperimentChange,
  experiments,
  onSubmit,
  isLoading,
}: AssignmentFormProps) {
  return (
    <div className="rounded-lg border p-6">
      <h3 className="mb-4 text-lg font-semibold">Get User Assignment</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="userId">User ID *</Label>
          <Input
            id="userId"
            value={userId}
            onChange={(e) => onUserIdChange(e.target.value)}
            placeholder="user_123"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="experiment">Experiment *</Label>
          <select
            id="experiment"
            value={selectedExperimentId}
            onChange={(e) => onExperimentChange(e.target.value)}
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

        <div className="grid gap-2">
          <Label className="invisible">Action</Label>
          <Button onClick={onSubmit} disabled={isLoading} className="w-full">
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? "Getting Assignment..." : "Get Assignment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
