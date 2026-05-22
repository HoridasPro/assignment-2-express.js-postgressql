export interface IIssue {
  reporter_id?: number;
  title: string;
  description: string;
  type: "bug" | "feature" | "task";
}