import { IsMongoId, IsNumber, IsArray, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCardOfferHistoryDto {
  @IsMongoId()
  cardId: string;

  @IsNumber()
  @Type(() => Number)
  annualFee: number;

  @IsNumber()
  @Type(() => Number)
  cashbackPercent: number;

  @IsArray()
  @IsString({ each: true })
  offers: string[];
}
