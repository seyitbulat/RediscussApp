import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/auth.guard';
import { GetUser } from './auth/user.decorator';
import { JsonApiResource } from './common/dto/api-response.dto';
import { ControllerResponseDto } from './common/dto/controller-response.dto';

@Controller("app")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(JwtAuthGuard)
  @Get("hehe")
  getHello(@GetUser() user: any): ControllerResponseDto<string> {
    const response =  this.appService.getHello();
    const resource = new JsonApiResource<string>({
      type: 'greeting',
      attributes: `${response} from user ${user.userId}`,
      id: '1',
    });
    return new ControllerResponseDto(resource);
  }
}
