import { AgentResponse, AppData, CustomElement, ValidationScores } from '../types';

export const transformJsonToSlateNodes = (data: AppData): CustomElement[] => {
  const nodes: CustomElement[] = [];

  // 1. Title
  nodes.push({
    type: 'heading-one',
    children: [{ text: 'User Stories Import' }],
  });

  nodes.push({
    type: 'paragraph',
    children: [{ text: 'The following data has been parsed from the attached JSON source.' }],
  });

  // 2. Transform User Stories
  try {
    const rawResponse = data.data.UserStory_Agent.response;
    if (rawResponse) {
      const parsedStories: AgentResponse = JSON.parse(rawResponse);
      
      nodes.push({
        type: 'heading-two',
        children: [{ text: 'Detailed User Stories' }],
      });

      // Create Table Header
      const tableHeaderRow: CustomElement = {
        type: 'table-row',
        children: [
          { type: 'table-cell', header: true, children: [{ text: 'Category' }] },
          { type: 'table-cell', header: true, children: [{ text: 'Req ID' }] },
          { type: 'table-cell', header: true, children: [{ text: 'Story ID' }] },
          { type: 'table-cell', header: true, children: [{ text: 'User Story' }] },
          { type: 'table-cell', header: true, children: [{ text: 'Type' }] },
          { type: 'table-cell', header: true, children: [{ text: 'Source' }] },
        ],
      };

      const tableRows: CustomElement[] = [tableHeaderRow];

      // Flatten data for table
      Object.entries(parsedStories).forEach(([category, reqData]) => {
        if (reqData.UserStories && Array.isArray(reqData.UserStories)) {
          reqData.UserStories.forEach((story) => {
            tableRows.push({
              type: 'table-row',
              children: [
                { type: 'table-cell', children: [{ text: category }] },
                { type: 'table-cell', children: [{ text: reqData.req_id || '-' }] },
                { type: 'table-cell', children: [{ text: story.userstory_id || '-' }] },
                { type: 'table-cell', children: [{ text: story.Story || '-' }] },
                { type: 'table-cell', children: [{ text: story.RequirementType || '-' }] },
                { type: 'table-cell', children: [{ text: story.source || '-' }] },
              ],
            });
          });
        }
      });

      nodes.push({
        type: 'table',
        children: tableRows as any, 
      });
    }
  } catch (e) {
    console.error("Failed to parse User Stories", e);
    nodes.push({
      type: 'paragraph',
      children: [{ text: 'Error parsing User Story data.' }],
    });
  }

  // 3. Transform Validity Scores
  try {
    const rawScores = data.data.UserStoryValidityScorer_Agent.response;
    if (rawScores) {
      const parsedScores: ValidationScores = JSON.parse(rawScores);

      nodes.push({
        type: 'heading-two',
        children: [{ text: 'Validity Scores' }],
      });

       const scoreHeaderRow: CustomElement = {
        type: 'table-row',
        children: [
          { type: 'table-cell', header: true, children: [{ text: 'Metric' }] },
          { type: 'table-cell', header: true, children: [{ text: 'Score' }] },
        ],
      };

      const scoreRows: CustomElement[] = [scoreHeaderRow];

      Object.entries(parsedScores).forEach(([metric, score]) => {
        if (metric !== 'Justification') { // Skip complex objects/nulls for simple table
             scoreRows.push({
              type: 'table-row',
              children: [
                { type: 'table-cell', children: [{ text: metric }] },
                { type: 'table-cell', children: [{ text: String(score) }] },
              ],
            });
        }
      });

      nodes.push({
        type: 'table',
        children: scoreRows as any,
      });
    }

  } catch (e) {
    console.error("Failed to parse Scores", e);
    nodes.push({
        type: 'paragraph',
        children: [{ text: 'Error parsing Validity Scores.' }],
      });
  }

  // Add trailing paragraph so user can type after table
  nodes.push({
    type: 'paragraph',
    children: [{ text: '' }],
  });

  return nodes;
};