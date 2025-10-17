import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DiscuitsService } from './discuits.service';
import { CreateDiscutDto } from './dto/create-discuit.dto';
import { GetUser } from '../auth/user.decorator';
import { ControllerResponseDto } from '../common/dto/controller-response.dto';
import { GetDiscuitDto } from './dto/get-discuit.dto';
import { JsonApiResource } from '../common/dto/api-response.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('discuits')
@Controller('discuits')
export class DiscuitsController {
  constructor(private readonly discuitsService: DiscuitsService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a discuit (community)' })
  @ApiBody({ type: CreateDiscutDto })
  @ApiOkResponse({ type: GetDiscuitDto })
  async create(@Body() createDiscuitDto: CreateDiscutDto, @GetUser() user: any): Promise<ControllerResponseDto<GetDiscuitDto>> {
    const discuit = await this.discuitsService.create(createDiscuitDto, user);
    const resource = new JsonApiResource<GetDiscuitDto>({
      type: 'discuit',
      id: discuit.id.toString(),
      attributes: discuit,
    });
    return new ControllerResponseDto(resource);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recommended')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recommended discuits for current user' })
  @ApiOkResponse({ type: GetDiscuitDto, isArray: true })
  async getRecommended(@GetUser() user: any): Promise<ControllerResponseDto<GetDiscuitDto>> {
    const discuits = await this.discuitsService.getRecommended(user?.userId);
    const resources = discuits.map(discuit => new JsonApiResource<GetDiscuitDto>({
      type: 'discuit',
      id: (discuit.id ?? '').toString(),
      attributes: discuit as unknown as GetDiscuitDto,
    }));
    return new ControllerResponseDto(resources);
  }

  @Get(':name')
  @ApiOperation({ summary: 'Get discuit by name' })
  @ApiParam({ name: 'name', type: String })
  @ApiOkResponse({ type: GetDiscuitDto })
  async getByName(
    @Param('name') name: string
  ): Promise<ControllerResponseDto<GetDiscuitDto>> {
    const discuit = await this.discuitsService.getByName(name);
    const resource = new JsonApiResource<GetDiscuitDto>({
      type: 'discuit',
      id: discuit.id.toString(),
      attributes: discuit,
    });
    return new ControllerResponseDto(resource);
  }
}
