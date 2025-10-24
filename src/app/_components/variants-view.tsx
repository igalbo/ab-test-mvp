"use client";

import { useState, useEffect } from "react";
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
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";
import { Plus, Trash2, Save } from "lucide-react";

type Variant = {
  id?: string;
  key: string;
  weight: number;
};

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

  const addVariant = () => {
    const nextLetter = String.fromCharCode(65 + variants.length); // A, B, C, etc.
    setVariants([...variants, { key: nextLetter, weight: 50 }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 2) {
      toast.error("Must have at least 2 variants");
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (
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

    if (variants.length < 2) {
      toast.error("Must have at least 2 variants");
      return;
    }

    // Validate variant keys are unique
    const keys = variants.map((v) => v.key);
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      toast.error("Variant keys must be unique");
      return;
    }

    // Validate weights
    for (const v of variants) {
      if (v.weight < 0 || v.weight > 100) {
        toast.error("Weights must be between 0 and 100");
        return;
      }
    }

    upsertMutation.mutate({
      experimentId: selectedExperimentId,
      variants: variants.map((v) => ({ key: v.key, weight: v.weight })),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="max-w-sm flex-1">
          <Label htmlFor="experiment">Select Experiment</Label>
          <select
            id="experiment"
            value={selectedExperimentId}
            onChange={(e) => handleExperimentChange(e.target.value)}
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
      </div>

      {selectedExperimentId && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Variants</h3>
            <div className="flex gap-2">
              <Button onClick={addVariant} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Variant
              </Button>
              <Button
                onClick={handleSave}
                disabled={upsertMutation.isPending}
                size="sm"
              >
                <Save className="mr-2 h-4 w-4" />
                Save All
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-8 text-center">Loading variants...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variant Key</TableHead>
                    <TableHead>Weight (0-100)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-8 text-center">
                        No variants yet. Add at least 2 to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    variants.map((variant, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={variant.key}
                            onChange={(e) =>
                              updateVariant(index, "key", e.target.value)
                            }
                            placeholder="A"
                            className="w-32 md:w-48 lg:w-64"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Slider
                              value={[variant.weight]}
                              onValueChange={(value) =>
                                updateVariant(index, "weight", value[0]!)
                              }
                              min={0}
                              max={100}
                              step={1}
                              className="hidden md:flex md:flex-1"
                            />
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={variant.weight}
                              onChange={(e) =>
                                updateVariant(index, "weight", e.target.value)
                              }
                              className="w-full text-center md:w-16"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariant(index)}
                            disabled={variants.length <= 2}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="text-muted-foreground text-sm">
            <p>
              • Variant keys should be unique (e.g., &quot;A&quot;,
              &quot;B&quot;, &quot;control&quot;, &quot;treatment&quot;)
            </p>
            <p>
              • Weights range from 0-100 (they don&apos;t need to sum to 100)
            </p>
            <p>• At least 2 variants are required per experiment</p>
          </div>
        </>
      )}
    </div>
  );
}
