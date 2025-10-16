import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { JsonApiResource, StandardApiResponse } from '../dto/api-response.dto';
import { ControllerResponseDto } from '../dto/controller-response.dto';


@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<JsonApiResource<T>, StandardApiResponse<JsonApiResource<T> | JsonApiResource<T>[]>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardApiResponse<JsonApiResource<T> | JsonApiResource<T>[]>> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((controllerResponse: ControllerResponseDto<T>) => {
        if(!(controllerResponse instanceof ControllerResponseDto)){
          throw new InternalServerErrorException('Controller response must be an instance of ControllerResponseDto');
        }

        const apiResponse = StandardApiResponse.success(
          controllerResponse.data,
          controllerResponse.links,
          controllerResponse.meta,
        );

        apiResponse.statusCode = response.statusCode;
        return apiResponse;
      })
    );
  }
}
