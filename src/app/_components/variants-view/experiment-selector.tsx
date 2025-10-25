import { Label } from "~/components/ui/label";
import type { Experiment } from "./types";

type ExperimentSelectorProps = {
  experiments: Experiment[] | undefined;
  selectedId: string;
  onChange: (experimentId: string) => void;
};

export function ExperimentSelector({
  experiments,
  selectedId,
  onChange,
}: ExperimentSelectorProps) {
  return (
    <div className="max-w-sm flex-1">
      <Label htmlFor="experiment">Select Experiment</Label>
      <select
        id="experiment"
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        className="border-input bg-background mt-2 flex h-10 w-full rounded-md border px-3 py-2"
      >
        <option value="">-- Select an experiment --</option>
        {experiments?.map((exp) => (
          <option key={exp.id} value={exp.id}>
            {exp.name} ({exp._count.variants} variants)
          </option>
        ))}
      </select>
    </div>
  );
}
