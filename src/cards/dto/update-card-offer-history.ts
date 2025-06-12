import { PartialType } from '@nestjs/mapped-types';
import { CreateCardOfferHistoryDto } from './create-card-offer-history';

export class UpdateCardOfferDto extends PartialType(
  CreateCardOfferHistoryDto,
) {}
