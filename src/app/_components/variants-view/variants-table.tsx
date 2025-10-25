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
import { Slider } from "~/components/ui/slider";
import { Plus, Trash2, Save } from "lucide-react";
import type { Variant } from "./types";

type VariantsTableProps = {
  variants: Variant[];
  isLoading: boolean;
  onUpdate: (
    index: number,
    field: "key" | "weight",
    value: string | number,
  ) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  onSave: () => void;
  isSaving: boolean;
};

export function VariantsTable({
  variants,
  isLoading,
  onUpdate,
  onRemove,
  onAdd,
  onSave,
  isSaving,
}: VariantsTableProps) {
  if (isLoading) {
    return <div className="py-8 text-center">Loading variants...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Variants</h3>
        <div className="flex gap-2">
          <Button onClick={onAdd} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Variant
          </Button>
          <Button onClick={onSave} disabled={isSaving} size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save All
          </Button>
        </div>
      </div>

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
                      onChange={(e) => onUpdate(index, "key", e.target.value)}
                      placeholder="A"
                      className="w-32 md:w-48 lg:w-64"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[variant.weight]}
                        onValueChange={(value) =>
                          onUpdate(index, "weight", value[0]!)
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
                          onUpdate(index, "weight", e.target.value)
                        }
                        className="w-full text-center md:w-16"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(index)}
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

      <div className="text-muted-foreground text-sm">
        <p>
          • Variant keys should be unique (e.g., &quot;A&quot;, &quot;B&quot;,
          &quot;control&quot;, &quot;treatment&quot;)
        </p>
        <p>• Weights range from 0-100 (they don&apos;t need to sum to 100)</p>
        <p>• At least 2 variants are required per experiment</p>
      </div>
    </div>
  );
}
