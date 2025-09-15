export interface MCQOption {
  images: string[];
  option_id: string;
  value: string;
}

export interface MCQData {
  id: string;
  title?: string;
  topic?: string;
  subtopic?: string;
  question_text?: string;
  options?: MCQOption[];
  correct_options?: string[];
  difficulty_level?: string;
  marks?: number;
  negative_marks?: number;
  time_limit?: number;
  explanation?: string;
  tags?: string[];
  missing?: boolean;
  note?: string;
}

export interface RearrangeItem {
  images: string[];
  item_id: string;
  value: string;
}

export interface RearrangeData {
  id: string;
  title: string;
  topic: string;
  subtopic: string;
  prompt: string;
  items: RearrangeItem[];
  correct_order: string[];
  difficulty_level: string;
  marks: number;
  negative_marks: number;
  time_limit: number;
  explanation: string;
  tags: string[];
  is_drag_and_drop: boolean;
}

export interface SampleIO {
  input_text: string;
  output: string;
  explanation: string;
}

export interface CodingData {
  title: string;
  topic: string;
  subtopic: string;
  tags: string[];
  short_description: string;
  long_description_markdown: string;
  difficulty: string;
  points: number;
  time_limit_ms: number;
  memory_limit_kb: number;
  sample_io: SampleIO[];
  allowed_languages: string[];
  predefined_boilerplates: Record<string, string>;
    solution_code?: Record<string, string>; // <-- full solution snippets per language




}

export interface Question {
  type: 'mcq' | 'rearrange' | 'coding';
  data: MCQData | RearrangeData | string;
}