import { Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Card } from './entities/card.entity';
import { Model } from 'mongoose';
import { OpenAIService } from './openai.service';

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

    await newCard.save();
    return newCard;
  }

  async findAll() {
    console.log(process.env.OPENAI_KEY);
    return await this.cardModel.find({});
  }

  async findOne(id: number) {
    return await this.cardModel.findById(id);
  }

  async update(id: number, updateCardDto: UpdateCardDto) {
    return `This action updates a #${id} card`;
  }

  async remove(id: number) {
    return await this.cardModel.findByIdAndDelete(id);
  }

  async searchCards({
    features,
    maxAnnualFee,
    bank,
  }: {
    features: string[];
    maxAnnualFee: string;
    bank: string;
  }) {
    const query: {
      features: any;
      maxAnnualFee?: any;
      bank?: any;
    } = {
      features: { $all: features.map(feature => new RegExp(feature, 'i')) },
    };

    if (maxAnnualFee) {
      query.maxAnnualFee = { $lte: maxAnnualFee };
    }

    if (bank) {
      query.bank = new RegExp(bank, 'i');
    }

    return await this.cardModel.find(query);
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
        }
      }
    }

    return 'no matching function';
  }
}
