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
              'Search for credit cards using filters like features, annual fee, and issuing bank',
            parameters: {
              type: 'object',
              properties: {
                features: {
                  type: 'array',
                  items: { type: 'string' },
                  description:
                    'Card features like lounge access, fuel cashback',
                },
                maxAnnualFee: {
                  type: 'number',
                  description: 'Maximum acceptable annual fee',
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
      ],
      tool_choice: 'auto',
    });

    console.log('response from openai', response);

    return response.choices[0].message;
  }
}
