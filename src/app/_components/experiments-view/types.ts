export type ExperimentStatus = "draft" | "active" | "paused" | "completed";

export type Experiment = {
  id: string;
  name: string;
  status: string;
  strategy: string;
  startAt: Date | null;
  endAt: Date | null;
  _count: {
    variants: number;
    assignments: number;
  };
};

export type ExperimentFormData = {
  name: string;
  status: ExperimentStatus;
  strategy: string;
  startAt?: Date;
  endAt?: Date;
};
