import { Badge } from "~/components/ui/badge";
import type { AssignmentResult } from "./types";

type AssignmentResultProps = {
  result: AssignmentResult;
  userId: string;
};

export function AssignmentResultDisplay({
  result,
  userId,
}: AssignmentResultProps) {
  return (
    <div className="rounded-lg border p-6">
      <h3 className="mb-4 text-lg font-semibold">Assignment Result</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">User ID:</span>
          <code className="bg-muted rounded px-2 py-1">{userId}</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Assigned Variant:</span>
          <Badge className="text-lg">{result.variantKey}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Status:</span>
          <Badge variant={result.isNew ? "default" : "secondary"}>
            {result.isNew ? "New Assignment" : "Existing Assignment"}
          </Badge>
        </div>
      </div>
      <p className="text-muted-foreground mt-4 text-sm">
        {result.isNew
          ? "This user has been assigned to this variant for the first time."
          : "This user was previously assigned to this variant (sticky assignment)."}
      </p>
    </div>
  );
}
