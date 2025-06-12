// src/cards/dto/create-card.dto.ts
import {
  IsArray,
  IsLowercase,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsLowercase()
  cardName: string;

  @IsString()
  @IsLowercase()
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

  @IsOptional()
  @IsString()
  summary: string;
}
