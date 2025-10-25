import { Badge } from "~/components/ui/badge";

type ExperimentStatusBadgeProps = {
  status: string;
  startAt?: Date | null;
  endAt?: Date | null;
};

export function ExperimentStatusBadge({
  status,
  startAt,
  endAt,
}: ExperimentStatusBadgeProps) {
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
}
