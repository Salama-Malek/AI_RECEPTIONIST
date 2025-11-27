import { IsIn, IsString } from 'class-validator';

export class MessageDto {
  @IsString()
  conversationId!: string;

  @IsIn(['caller', 'assistant'])
  from!: 'caller' | 'assistant';

  @IsString()
  text!: string;
}
