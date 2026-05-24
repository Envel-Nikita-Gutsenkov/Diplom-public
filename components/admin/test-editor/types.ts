export type QuestionType = "MULTIPLE_CHOICE" | "CHECKBOX" | "CODE" | "TEXT";

export interface TestCase {
  id: string;
  name: string;
  script: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  content: string;
  points: number;
  options?: string[];
  correctOptions?: number[];
  libraries?: string[];
  autoCheck?: boolean;
  testCases?: TestCase[];
  referenceSolution?: string;
}
