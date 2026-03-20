import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

export type ParagraphElement = {
  type: 'paragraph';
  children: CustomText[];
};

export type HeadingElement = {
  type: 'heading-one' | 'heading-two';
  children: CustomText[];
};

export type TableElement = {
  type: 'table';
  children: TableRowElement[];
};

export type TableRowElement = {
  type: 'table-row';
  children: TableCellElement[];
};

export type TableCellElement = {
  type: 'table-cell';
  children: CustomText[]; // Simplifying cell content to text for this demo
  header?: boolean;
};

export type CustomElement =
  | ParagraphElement
  | HeadingElement
  | TableElement
  | TableRowElement
  | TableCellElement;

export type CustomText = { text: string; bold?: boolean; italic?: boolean; comment?: string };

// Module augmentation removed to avoid "Invalid module name" error in certain environments.
// Types are applied via casting in consumption files.

// Data Types
export interface UserStory {
  userstory_id: string;
  Story: string;
  AcceptanceCriteria: string[];
  RequirementType: string;
  section: string;
  source?: string;
}

export interface RequirementData {
  req_id: string;
  RequirementDescription: string;
  UserStories: UserStory[];
}

export interface AgentResponse {
  [key: string]: RequirementData;
}

export interface ValidationScores {
  [key: string]: number;
}

export interface AppData {
  message: string;
  data: {
    UserStory_Agent: {
      response: string; // JSON string
    };
    UserStoryFormatValidator_Agent: {
      response: string; // JSON string
    };
    UserStoryValidityScorer_Agent: {
      response: string; // JSON string
    };
  };
}