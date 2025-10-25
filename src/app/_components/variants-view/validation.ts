import type { Variant } from "./types";

export function validateVariants(variants: Variant[]): string | null {
  // Check minimum number of variants
  if (variants.length < 2) {
    return "Must have at least 2 variants";
  }

  // Validate unique keys
  const uniqueKeyError = validateUniqueKeys(variants);
  if (uniqueKeyError) {
    return uniqueKeyError;
  }

  // Validate weights
  const weightsError = validateWeights(variants);
  if (weightsError) {
    return weightsError;
  }

  return null;
}

export function validateUniqueKeys(variants: Variant[]): string | null {
  const keys = variants.map((v) => v.key);
  const uniqueKeys = new Set(keys);

  if (keys.length !== uniqueKeys.size) {
    return "Variant keys must be unique";
  }

  return null;
}

export function validateWeights(variants: Variant[]): string | null {
  for (const v of variants) {
    if (v.weight < 0 || v.weight > 100) {
      return "Weights must be between 0 and 100";
    }
  }

  return null;
}
