"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Plus } from "lucide-react";
import type { Experiment, ExperimentFormData, ExperimentStatus } from "./types";

type ExperimentFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experiment?: Experiment | null;
  onSubmit: (data: ExperimentFormData) => void;
  isPending: boolean;
};

export function ExperimentFormDialog({
  open,
  onOpenChange,
  experiment,
  onSubmit,
  isPending,
}: ExperimentFormDialogProps) {
  const [validationError, setValidationError] = useState<string>("");
  const [dateValidationError, setDateValidationError] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    status: "draft" as ExperimentStatus,
    strategy: "uniform",
    startAt: "",
    endAt: "",
  });

  // Helper function to convert UTC date to local datetime-local format (for inputs)
  const toLocalDatetimeString = (date: Date | null | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    // Adjust for timezone offset to get local time
    const offset = d.getTimezoneOffset() * 60000;
    const localDate = new Date(d.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
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
  };

  // Load experiment data when editing
  useEffect(() => {
    if (experiment) {
      setFormData({
        name: experiment.name,
        status: experiment.status as ExperimentStatus,
        strategy: experiment.strategy,
        startAt: toLocalDatetimeString(experiment.startAt),
        endAt: toLocalDatetimeString(experiment.endAt),
      });
    } else {
      resetForm();
    }
  }, [experiment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      return;
    }

    const data: ExperimentFormData = {
      name: formData.name,
      status: formData.status,
      strategy: formData.strategy,
      startAt: formData.startAt ? new Date(formData.startAt) : undefined,
      endAt: formData.endAt ? new Date(formData.endAt) : undefined,
    };

    onSubmit(data);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              {experiment ? "Edit" : "Create"} Experiment
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
                style={{
                  colorScheme: "dark",
                }}
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
                style={{
                  colorScheme: "dark",
                }}
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
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !!validationError || !!dateValidationError || isPending
                }
              >
                {experiment ? "Update" : "Create"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
