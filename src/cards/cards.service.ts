import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Card } from './entities/card.entity';
import { Model, Types } from 'mongoose';
import { OpenAIService } from './openai.service';
import { isEqual } from 'lodash';

interface ISUMMARYPARAMS {
  features: string[];
  maxAnnualFee: number;
  categories?: string[];
  bestFor: string[];
  rewardsRate?: string;
  cardId: string;
}

@Injectable()
export class CardsService {
  constructor(
    @InjectModel(Card.name) private cardModel: Model<Card>,
    private openAIService: OpenAIService,
  ) {}
  async create(createCardDto: CreateCardDto) {
    const newCard = new this.cardModel({
      ...createCardDto,
    });

    const prompt = `
    Summarize the key benefits of the ${newCard.cardName} credit card by ${newCard.bank}:
    - Annual fee: ₹${newCard.annualFee}
    - Benefits: ${newCard.bestFor.join(', ')}
    - Features: ${newCard.features.join(', ')}
    - Categories: ${newCard.categories.join(', ')}
    
    Create a short 1-2 sentence summary that is friendly and highlights its main appeal.
    `;
    const response = await this.openAIService.generateCardSummary(prompt); // can use cron job to handle this
    console.log(response.content);
    newCard.summary = response.content;
    await newCard.save();
    return newCard;
  }

  async findAll() {
    console.log(process.env.OPENAI_KEY);
    return await this.cardModel.find({});
  }

  async findOne(id: string) {
    return await this.cardModel.findById(id);
  }

  async update(id: string, updateCardDto: UpdateCardDto) {
    console.log(id);
    const existingCard = await this.cardModel.findById(new Types.ObjectId(id));
    if (!existingCard)
      throw new NotFoundException(`Card with ${id} not found.`);

    const updatedFields: any = {};
    const keysToLook = [
      'features',
      'annualFee',
      'categories',
      'rewardsRate',
      'cardName',
      'bank',
      'bestFor',
    ];

    const updateCardDtoKeys = Object.keys(updateCardDto);

    if (updateCardDtoKeys.length === 0) {
      return existingCard;
    }

    updateCardDtoKeys.forEach(key => {
      if (!isEqual(updateCardDto[key], existingCard[key])) {
        updatedFields[key] = updateCardDto[key];
      }
    });

    const keyAvalaible = keysToLook.some(key =>
      updateCardDtoKeys.includes(key),
    );

    if (keyAvalaible) {
      const prompt = `
      Summarize the key benefits of the ${updateCardDto.cardName ?? existingCard.cardName} credit card by ${updateCardDto.bank ?? existingCard.bank}:
      - Annual fee: ₹${updateCardDto.annualFee ?? existingCard.annualFee}
      - Benefits: ${(updateCardDto.bestFor ?? existingCard.bestFor)?.join(', ')}
      - Features: ${(updateCardDto.features ?? existingCard.features)?.join(', ')}
      - Categories: ${(updateCardDto.categories ?? existingCard.categories)?.join(', ')}

      Create a short 1-2 sentence summary that is friendly and highlights its main appeal.
    `.trim();

      const response = await this.openAIService.generateCardSummary(prompt); // can use cron job to handle this
      updatedFields.summary = response.content;
    }
    const updatedCard = await this.cardModel.findByIdAndUpdate(
      id,
      {
        $set: updatedFields,
      },
      { new: true },
    );

    return updatedCard;
  }

  async remove(id: number) {
    return await this.cardModel.findByIdAndDelete(id);
  }

  // async createSummmary({
  //   cardId,
  //   maxAnnualFee,
  //   categories,
  //   bestFor,
  //   rewardsRate,
  //   features,
  // }: ISUMMARYPARAMS) {
  //   const query;
  // }

  async searchCards({
    features,
    annualFee,
    bank,
  }: {
    features: string[];
    annualFee: string;
    bank: string;
  }) {
    const query: {
      features?: any;
      annualFee?: any;
      bank?: any;
    } = {};
    if (features) {
      query.features = {
        $all: features.map(feature => new RegExp(feature, 'i')),
      };
    }

    if (annualFee !== undefined && annualFee !== null) {
      console.log('working here');
      query.annualFee = { $lte: annualFee };
    }

    if (bank) {
      query.bank = new RegExp(bank, 'i');
    }

    return await this.cardModel.find(query);
  }

  async compareCards(cards: string[]) {
    console.log(cards);
    const regexCards = cards.map(name => new RegExp(name));
    console.log(regexCards);
    const validCards = await this.cardModel.find({
      $or: regexCards.map(r => ({ cardName: { $regex: r } })),
    });

    const cardDescription = validCards.map((card, i) =>
      `
      ${i + 1}. ${card.cardName} credit card by ${card.bank}:
        - Annual fee: ${card.annualFee}
        - Benefits: ${card.bestFor?.join(', ')}
        - Rewards Rate: ${card.rewardsRate}
        - Features: ${card.features?.join(', ')}
        - Categories: ${card.categories?.join(', ')}
    `.trim(),
    );

    const prompt = `
      Compare the following credit cards. Highlight key differences, and which type of user each is best suited for:
      ${cardDescription}
      Return a short and readable comparison summary.
    `.trim();
    const response = await this.openAIService.generateComparisonSummary(prompt);
    return response.content;
  }
  async query(userInput: string) {
    const response = await this.openAIService.processQuery(userInput);
    if (response.tool_calls) {
      for (const props of response.tool_calls) {
        if (props.function.name === process.env.GET_CARDS) {
          console.log(JSON.parse(props.function.arguments));
          const response = await this.searchCards(
            JSON.parse(props.function.arguments),
          );

          // const responseCall = await this.findAll();
          // return responseCall;
          return JSON.stringify(response);
        } else if (props.function.name === process.env.COMPARE_CARDS) {
          console.log(typeof props.function.arguments);
          return await this.compareCards(
            JSON.parse(props.function.arguments).cardNames,
          );
        }
      }
    }

    return 'no matching function';
  }
}
