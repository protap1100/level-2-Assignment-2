export type IssueType = "bug" | "feature_request";
export type IssueStatus = "open" | "in_progress" | "resolved";

export interface IIssue {
  title: string;
  description: string;
  type: IssueType;
}