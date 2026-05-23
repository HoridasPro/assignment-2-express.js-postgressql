export interface IIssue {
  reporter_id?: number;
  title: string;
  description: string;
  type: "bug" | "feature_request";
}
export interface IIssues {
  id: number;
  title: string;
  description: string;
  type: "bug" | "feature_request";
  status: number;
   
}
 
