import { IsIn, IsOptional, IsString } from 'class-validator';

export class StartConversationDto {
  @IsString()
  callerName!: string;

  @IsString()
  phoneNumber!: string;

  @IsOptional()
  @IsIn(['auto', 'ar', 'en', 'ru'])
  languageHint?: 'auto' | 'ar' | 'en' | 'ru';

  @IsOptional()
  @IsString()
  context?: string;
}
