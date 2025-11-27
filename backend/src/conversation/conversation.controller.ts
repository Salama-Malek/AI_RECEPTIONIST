import { Body, Controller, Post } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { StartConversationDto } from './dto/start-conversation.dto';
import { MessageDto } from './dto/message.dto';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post('start')
  start(@Body() dto: StartConversationDto) {
    return this.conversationService.startConversation(dto);
  }

  @Post('message')
  message(@Body() dto: MessageDto) {
    return this.conversationService.handleMessage(dto);
  }
}
