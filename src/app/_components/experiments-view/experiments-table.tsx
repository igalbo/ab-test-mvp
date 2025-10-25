import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { ExperimentStatusBadge } from "./experiment-status-badge";
import type { Experiment } from "./types";

type ExperimentsTableProps = {
  experiments: Experiment[] | undefined;
  isLoading: boolean;
  onEdit: (experiment: Experiment) => void;
  onDelete: (id: string) => void;
};

export function ExperimentsTable({
  experiments,
  isLoading,
  onEdit,
  onDelete,
}: ExperimentsTableProps) {
  // Helper function to format date for display in table
  const formatDateForDisplay = (date: Date | null | undefined): string => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (isLoading) {
    return <div className="py-8 text-center">Loading...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Strategy</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Variants</TableHead>
            <TableHead>Assignments</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {experiments?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center">
                No experiments found. Create one to get started.
              </TableCell>
            </TableRow>
          ) : (
            experiments?.map((exp) => (
              <TableRow key={exp.id}>
                <TableCell className="font-medium">{exp.name}</TableCell>
                <TableCell>
                  <ExperimentStatusBadge
                    status={exp.status}
                    startAt={exp.startAt}
                    endAt={exp.endAt}
                  />
                </TableCell>
                <TableCell>{exp.strategy}</TableCell>
                <TableCell className="text-sm">
                  {formatDateForDisplay(exp.startAt)}
                </TableCell>
                <TableCell className="text-sm">
                  {formatDateForDisplay(exp.endAt)}
                </TableCell>
                <TableCell>{exp._count.variants}</TableCell>
                <TableCell>{exp._count.assignments}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(exp)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(exp.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
