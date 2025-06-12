import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Card } from './card.entity';

export type CardOfferHistoryDocument = HydratedDocument<Card>;

console.log(Card.name);
@Schema({ timestamps: true })
export class CardOfferHistory {
  @Prop({ type: Types.ObjectId, ref: Card.name, required: true })
  cardId: Types.ObjectId;

  @Prop({ required: true })
  annualFee: number;

  @Prop({ required: true })
  cashbackPercent: number;

  @Prop({ type: [String], default: [] })
  offers: string[];

  @Prop({ default: Date.now })
  recordedAt: Date;
}

export const CardOfferHisotrySchema =
  SchemaFactory.createForClass(CardOfferHistory);
