import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ChipsService } from './chips.service';
import { ResultChipDto } from './dto/result-chip.dto';
import { VoteChipDto } from './dto/vote-chip.dto';
import { ControllerResponseDto } from '../common/dto/controller-response.dto';
import { JsonApiResource } from '../common/dto/api-response.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { GetUser } from '../auth/user.decorator';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('chips')
@Controller('chips')
export class ChipsController {
  constructor(private readonly chipsService: ChipsService) {}

  @Post('vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vote a post (chip up/down)' })
  @ApiBody({ type: VoteChipDto })
  @ApiOkResponse({ description: 'Vote result', type: ResultChipDto })
  async voteChip(@Body() voteChipDto: VoteChipDto, @GetUser() user: any): Promise<ControllerResponseDto<ResultChipDto>> {
    const result = await this.chipsService.voteChip(user.userId, voteChipDto);

    const resource = new JsonApiResource({
      type: 'chip',
      id: voteChipDto.postId,
      attributes: result,
    });
    return new ControllerResponseDto(resource);
  }
}
