import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
  }

  async processQuery(userInput: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You're a credit card advisor. Help users find or compare cards based on benefits or fees. Use tools where required.`,
        },
        { role: 'user', content: userInput },
      ],

      tools: [
        {
          type: 'function',
          function: {
            name: process.env.GET_CARDS,
            description:
              'Search for credit cards using filters like features, annual fee, bestfor, categories, and issuing bank',
            parameters: {
              type: 'object',
              properties: {
                matchOperator: {
                  type: 'string',
                  enum: ['and', 'or'],
                  description:
                    "Determines how to combine multiple filters e.g (feature, categories). Use 'and' to match all, 'or' to match any. Ignored if only one filter is provided.",
                },

                features: {
                  type: 'object',
                  properties: {
                    values: {
                      type: 'array',
                      items: { type: 'string' },
                      description:
                        'Card features like lounge access, fuel cashback',
                    },
                    matchType: {
                      type: 'string',
                      enum: ['all', 'in'],
                      description:
                        "Use 'all' to return items that include all specified values, and 'in' to return items that include at least one of the values.",
                    },
                  },
                },
                bestFor: {
                  type: 'object',
                  properties: {
                    values: {
                      type: 'array',
                      items: { type: 'string' },
                      description:
                        'Card benefits like e.g (frequent traveler, education)',
                    },
                    matchType: {
                      type: 'string',
                      enum: ['all', 'in'],
                      description:
                        "Use 'all' to return items that include all specified values, and 'in' to return items that include at least one of the values.",
                    },
                  },
                },
                categories: {
                  type: 'object',
                  properties: {
                    values: {
                      type: 'array',
                      items: { type: 'string' },
                      description:
                        'Card benefits like e.g (luxury, travellers, premium)',
                    },
                    matchType: {
                      type: 'string',
                      enum: ['all', 'in'],
                      description:
                        "Use 'all' to return items that include all specified values, and 'in' to return items that include at least one of the values.",
                    },
                  },
                },

                annualFee: {
                  type: 'object',
                  properties: {
                    value: {
                      type: 'number',
                      description: 'Maximum acceptable annual fee',
                    },
                    comparator: {
                      type: 'string',
                      enum: ['lte', 'gte', 'eq'],
                      description: `Comparison operator for the value, e.g., 'lte' for ≤, 'eq' for = and 'gte' for ≥`,
                    },
                  },
                },
                bank: {
                  type: 'string',
                  description: 'Bank issuing the card',
                },
              },
              required: ['features'],
            },
          },
        },
        {
          type: 'function',
          function: {
            name: process.env.COMPARE_CARDS,
            description:
              'Compare two credit cards by name and summarize their benefits side-by-side',
            parameters: {
              type: 'object',
              properties: {
                cardNames: {
                  type: 'array',
                  items: { type: 'string' },
                  description:
                    'List of credit card names to comapare (e.g., ["Axis Magnus", "HDFC Regalia"])',
                },
              },
              required: ['cardNames'],
            },
          },
        },
        {
          type: 'function',
          function: {
            name: process.env.GENERATE_SUMMARY,
            description:
              'generate summary using filters like features, best for, rewards rate, annualFee, categories',
            parameters: {
              type: 'object',
              properties: {
                features: {
                  type: 'array',
                  items: { type: 'string' },
                  description:
                    'Benefits like lounge access, fuel cashback, etc.',
                },
                bestFor: {
                  type: 'array',
                  items: { type: 'string' },
                  description:
                    'besfor like Lounge access, Partner offers on dining',
                },
                categories: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'categories like essentials, luxury and travel',
                },
                rewardsRate: {
                  type: 'string',
                  description: 'rewards rate like 5x on travel',
                },

                maxAnnualFee: {
                  type: 'number',
                  description:
                    'Maximum annual fee (e.g., 1000 means ₹1000 max)',
                },
                bank: {
                  type: 'string',
                  description: 'Bank name if user specifies a particular bank',
                },
              },
              required: ['features, bestFor, annualFee'],
            },
          },
        },
      ],
      tool_choice: 'auto',
    });

    console.log('response from openai', response);

    return response.choices[0].message;
  }

  async generateComparisonSummary(prompt: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return response.choices[0].message;
  }
  async generateCardSummary(prompt: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return response.choices[0].message;
  }
}
