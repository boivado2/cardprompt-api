// src/cards/schemas/card.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CardDocument = HydratedDocument<Card>;

@Schema()
export class Card {
  @Prop({ required: true, lowercase: true })
  cardName: string;

  @Prop({ required: true, lowercase: true })
  bank: string;

  @Prop({ required: true })
  annualFee: number;

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop({ type: [String], default: [] })
  categories: string[];

  @Prop({ required: true })
  eligibility: string;

  @Prop({ type: [String], default: [] })
  bestFor: string[];

  @Prop({ required: true })
  rewardsRate: string;

  @Prop({ required: true })
  cardType: string;

  @Prop({ required: true })
  foreignTransactionFee: string;

  @Prop({
    type: {
      joining: { type: Number, required: true },
      renewal: { type: Number, required: true },
    },
    required: true,
  })
  fees: {
    joining: number;
    renewal: number;
  };

  @Prop({ default: '' })
  summary: string;
}

export const CardSchema = SchemaFactory.createForClass(Card);
