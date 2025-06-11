// src/cards/dto/create-card.dto.ts
import { IsArray, IsNumber, IsObject, IsString } from 'class-validator';

export class CreateCardDto {
  @IsString()
  cardName: string;

  @IsString()
  bank: string;

  @IsNumber()
  annualFee: number;

  @IsArray()
  @IsString({ each: true })
  features: string[];

  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @IsString()
  eligibility: string;

  @IsArray()
  @IsString({ each: true })
  bestFor: string[];

  @IsString()
  rewardsRate: string;

  @IsString()
  cardType: string;

  @IsString()
  foreignTransactionFee: string;

  @IsObject()
  fees: {
    joining: number;
    renewal: number;
  };
}
