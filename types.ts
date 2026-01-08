
export interface Calculation {
  id: string;
  expression: string;
  result: string;
  type: 'manual' | 'ai';
  timestamp: number;
}

export interface SmartResponse {
  answer: string;
  steps: string[];
  explanation: string;
}
