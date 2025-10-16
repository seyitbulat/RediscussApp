import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

export const User = (...args: string[]) => SetMetadata('user', args);

export const GetUser = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if(data){
        return request.user?.[data];
    }

    return request.user;
})