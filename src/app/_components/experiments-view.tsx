"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";

type ExperimentStatus = "draft" | "active" | "paused" | "completed";

export default function ExperimentsView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string>("");
  const [dateValidationError, setDateValidationError] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    status: "draft" as ExperimentStatus,
    strategy: "uniform",
    startAt: "",
    endAt: "",
  });

  const utils = api.useUtils();
  const { data: experiments, isLoading } = api.experiments.list.useQuery();

  const createMutation = api.experiments.create.useMutation({
    onSuccess: () => {
      utils.experiments.list.invalidate();
      setIsCreateOpen(false);
      resetForm();
      toast.success("Experiment created successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to create experiment: ${error.message}`);
    },
  });

  const updateMutation = api.experiments.update.useMutation({
    onSuccess: () => {
      utils.experiments.list.invalidate();
      setIsCreateOpen(false);
      setEditingId(null);
      resetForm();
      toast.success("Experiment updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update experiment: ${error.message}`);
    },
  });

  const deleteMutation = api.experiments.delete.useMutation({
    onSuccess: () => {
      utils.experiments.list.invalidate();
      toast.success("Experiment deleted successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to delete experiment: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      status: "draft",
      strategy: "uniform",
      startAt: "",
      endAt: "",
    });
    setValidationError("");
    setDateValidationError("");
    setEditingId(null);
  };

  // Helper function to convert UTC date to local datetime-local format (for inputs)
  const toLocalDatetimeString = (date: Date | null | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    // Adjust for timezone offset to get local time
    const offset = d.getTimezoneOffset() * 60000;
    const localDate = new Date(d.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

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

  // Validate experiment name (snake_case)
  const validateName = (name: string): string => {
    if (!name) {
      return "Name is required";
    }
    if (name.length > 100) {
      return "Name must be less than 100 characters";
    }
    if (!/^[a-z][a-z0-9_]*$/.test(name)) {
      return "Name must be snake_case (lowercase letters, numbers, and underscores only)";
    }
    return "";
  };

  // Validate date range
  const validateDates = (): string => {
    if (formData.startAt && formData.endAt) {
      const start = new Date(formData.startAt);
      const end = new Date(formData.endAt);
      if (start >= end) {
        return "Start date must be before end date";
      }
    }
    return "";
  };

  const isFormValid = (): boolean => {
    const nameError = validateName(formData.name);
    const dateError = validateDates();
    setValidationError(nameError);
    setDateValidationError(dateError);
    return !nameError && !dateError;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      return;
    }

    const data = {
      name: formData.name,
      status: formData.status,
      strategy: formData.strategy,
      startAt: formData.startAt ? new Date(formData.startAt) : undefined,
      endAt: formData.endAt ? new Date(formData.endAt) : undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (experiment: any) => {
    setEditingId(experiment.id);
    setFormData({
      name: experiment.name,
      status: experiment.status,
      strategy: experiment.strategy,
      startAt: toLocalDatetimeString(experiment.startAt),
      endAt: toLocalDatetimeString(experiment.endAt),
    });
    setIsCreateOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this experiment?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getStatusBadge = (
    status: string,
    startAt?: Date | null,
    endAt?: Date | null,
  ) => {
    const now = new Date();

    // First check explicit paused/completed status
    if (status === "paused") {
      return <Badge className="bg-red-600">Paused</Badge>;
    }
    if (status === "completed") {
      return <Badge className="bg-red-600">Completed</Badge>;
    }

    // For "active" status, check dates to determine actual state
    if (status === "active") {
      // If end date has passed, show as completed
      if (endAt && new Date(endAt) < now) {
        return <Badge className="bg-red-600">Completed</Badge>;
      }

      // If start date is in the future, show as scheduled
      if (startAt && new Date(startAt) > now) {
        return <Badge className="bg-yellow-600">Scheduled</Badge>;
      }

      // Otherwise, truly active (either no dates, or within the active period)
      return <Badge className="bg-green-600">Active</Badge>;
    }

    // Default to draft
    return <Badge variant="secondary">Draft</Badge>;
  };

  const filteredExperiments = experiments?.filter((exp) =>
    exp.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search experiments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              // Clear state when dialog closes
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Create
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit" : "Create"} Experiment
                </DialogTitle>
                <DialogDescription>
                  Enter experiment details. Name must be snake_case.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setValidationError(validateName(e.target.value));
                    }}
                    placeholder="my_experiment_name"
                    required
                    className={validationError ? "border-red-500" : ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status *</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as ExperimentStatus,
                      })
                    }
                    className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="strategy">Strategy</Label>
                  <Input
                    id="strategy"
                    value={formData.strategy}
                    onChange={(e) =>
                      setFormData({ ...formData, strategy: e.target.value })
                    }
                    placeholder="uniform"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="startAt">Start Date</Label>
                  <Input
                    id="startAt"
                    type="datetime-local"
                    value={formData.startAt}
                    onChange={(e) => {
                      setFormData({ ...formData, startAt: e.target.value });
                      setDateValidationError("");
                    }}
                    className={dateValidationError ? "border-red-500" : ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endAt">End Date</Label>
                  <Input
                    id="endAt"
                    type="datetime-local"
                    value={formData.endAt}
                    onChange={(e) => {
                      setFormData({ ...formData, endAt: e.target.value });
                      setDateValidationError("");
                    }}
                    className={dateValidationError ? "border-red-500" : ""}
                  />
                </div>
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                {(validationError || dateValidationError) && (
                  <div className="flex-1 rounded bg-red-50 p-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                    {validationError || dateValidationError}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setEditingId(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      !!validationError ||
                      !!dateValidationError ||
                      createMutation.isPending ||
                      updateMutation.isPending
                    }
                  >
                    {editingId ? "Update" : "Create"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="py-8 text-center">Loading...</div>
      ) : (
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
              {filteredExperiments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center">
                    No experiments found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredExperiments?.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="font-medium">{exp.name}</TableCell>
                    <TableCell>
                      {getStatusBadge(exp.status, exp.startAt, exp.endAt)}
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
                          onClick={() => handleEdit(exp)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(exp.id)}
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
      )}
    </div>
  );
}
