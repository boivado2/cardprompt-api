import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Card, CardSchema } from './entities/card.entity';
import { OpenAIService } from './openai.service';
import {
  CardOfferHisotrySchema,
  CardOfferHistory,
} from './entities/cardOfferHistory.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Card.name, schema: CardSchema },
      { name: CardOfferHistory.name, schema: CardOfferHisotrySchema },
    ]),
  ],
  controllers: [CardsController],
  providers: [CardsService, OpenAIService],
})
export class CardsModule {}
