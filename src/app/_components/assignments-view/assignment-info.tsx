export function AssignmentInfo() {
  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="mb-2 font-semibold">How It Works</h4>
      <ul className="text-muted-foreground space-y-1 text-sm">
        <li>
          • Enter a User ID and select an experiment to get their variant
          assignment
        </li>
        <li>
          • The system uses a hash-based algorithm to ensure sticky assignments
        </li>
        <li>
          • The same user will always get the same variant for an experiment
        </li>
        <li>
          • If this is the first time, a new assignment is created and stored
        </li>
      </ul>
    </div>
  );
}
