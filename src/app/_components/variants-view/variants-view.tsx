"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { ExperimentSelector } from "./experiment-selector";
import { VariantsTable } from "./variants-table";
import { validateVariants } from "./validation";
import type { Variant } from "./types";

export default function VariantsView() {
  const [selectedExperimentId, setSelectedExperimentId] = useState<string>("");
  const [variants, setVariants] = useState<Variant[]>([]);

  const { data: experiments } = api.experiments.list.useQuery();
  const { data: existingVariants, isLoading } = api.variants.list.useQuery(
    { experimentId: selectedExperimentId },
    { enabled: !!selectedExperimentId },
  );

  const utils = api.useUtils();
  const upsertMutation = api.variants.upsertMany.useMutation({
    onSuccess: () => {
      void utils.variants.list.invalidate();
      toast.success("Variants saved successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to save variants: ${error.message}`);
    },
  });

  // Load variants when experiment is selected or data changes
  useEffect(() => {
    if (existingVariants && existingVariants.length > 0) {
      setVariants(
        existingVariants.map((v) => ({
          id: v.id,
          key: v.key,
          weight: v.weight,
        })),
      );
    } else if (selectedExperimentId && !isLoading) {
      // Initialize with 2 empty variants if none exist
      setVariants([
        { key: "A", weight: 50 },
        { key: "B", weight: 50 },
      ]);
    }
  }, [existingVariants, selectedExperimentId, isLoading]);

  const handleExperimentChange = (experimentId: string) => {
    setSelectedExperimentId(experimentId);
  };

  const handleAddVariant = () => {
    const nextLetter = String.fromCharCode(65 + variants.length); // A, B, C, etc.
    setVariants([...variants, { key: nextLetter, weight: 50 }]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 2) {
      toast.error("Must have at least 2 variants");
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleUpdateVariant = (
    index: number,
    field: "key" | "weight",
    value: string | number,
  ) => {
    const updated = [...variants];
    if (field === "key") {
      updated[index]!.key = value as string;
    } else {
      updated[index]!.weight = Number(value);
    }
    setVariants(updated);
  };

  const handleSave = () => {
    if (!selectedExperimentId) {
      toast.error("Please select an experiment");
      return;
    }

    const validationError = validateVariants(variants);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    upsertMutation.mutate({
      experimentId: selectedExperimentId,
      variants: variants.map((v) => ({ key: v.key, weight: v.weight })),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <ExperimentSelector
          experiments={experiments}
          selectedId={selectedExperimentId}
          onChange={handleExperimentChange}
        />
      </div>

      {selectedExperimentId && (
        <VariantsTable
          variants={variants}
          isLoading={isLoading}
          onUpdate={handleUpdateVariant}
          onRemove={handleRemoveVariant}
          onAdd={handleAddVariant}
          onSave={handleSave}
          isSaving={upsertMutation.isPending}
        />
      )}
    </div>
  );
}
