import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { ApiError, StandardApiResponse } from '../dto/api-response.dto';

@Catch()
export class HttpExceptionFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    
    let status: number;
    let message: string | object;
    let errorDetails: any;

    if(exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;

      const errorResponse = exception.getResponse();
      errorDetails = errorResponse;
    }else{
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      errorDetails = exception;
    }

    const apiError : ApiError = {
      status: status.toString(),
      title: message.toString(),
      detail: errorDetails,
    }

    const apiResponse: StandardApiResponse<ApiError> = {
      statusCode: status,
      errors: [apiError]
    }

    response.status(status).json(apiResponse);
  }
}
