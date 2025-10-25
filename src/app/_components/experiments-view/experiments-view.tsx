"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { Input } from "~/components/ui/input";
import { ExperimentFormDialog } from "./experiment-form-dialog";
import { ExperimentsTable } from "./experiments-table";
import type { Experiment, ExperimentFormData } from "./types";

export default function ExperimentsView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingExperiment, setEditingExperiment] = useState<Experiment | null>(
    null,
  );

  const utils = api.useUtils();
  const { data: experiments, isLoading } = api.experiments.list.useQuery();

  const createMutation = api.experiments.create.useMutation({
    onSuccess: () => {
      void utils.experiments.list.invalidate();
      setIsCreateOpen(false);
      setEditingExperiment(null);
      toast.success("Experiment created successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to create experiment: ${error.message}`);
    },
  });

  const updateMutation = api.experiments.update.useMutation({
    onSuccess: () => {
      void utils.experiments.list.invalidate();
      setIsCreateOpen(false);
      setEditingExperiment(null);
      toast.success("Experiment updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update experiment: ${error.message}`);
    },
  });

  const deleteMutation = api.experiments.delete.useMutation({
    onSuccess: () => {
      void utils.experiments.list.invalidate();
      toast.success("Experiment deleted successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to delete experiment: ${error.message}`);
    },
  });

  const handleFormSubmit = (data: ExperimentFormData) => {
    if (editingExperiment) {
      updateMutation.mutate({ id: editingExperiment.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (experiment: Experiment) => {
    setEditingExperiment(experiment);
    setIsCreateOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this experiment?")) {
      deleteMutation.mutate({ id });
    }
  };

  const filteredExperiments = experiments?.filter((exp) =>
    exp.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="Search experiments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <ExperimentFormDialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setEditingExperiment(null);
            }
          }}
          experiment={editingExperiment}
          onSubmit={handleFormSubmit}
          isPending={createMutation.isPending || updateMutation.isPending}
        />
      </div>

      <ExperimentsTable
        experiments={filteredExperiments}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
