export type Variant = {
  id?: string;
  key: string;
  weight: number;
};

export type VariantInput = {
  key: string;
  weight: number;
};

export type Experiment = {
  id: string;
  name: string;
  _count: {
    variants: number;
  };
};
