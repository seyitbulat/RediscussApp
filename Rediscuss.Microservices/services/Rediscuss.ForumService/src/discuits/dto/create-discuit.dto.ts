import {IsNotEmpty} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDiscutDto {
    
    @ApiProperty()
    @IsNotEmpty()
    name: string;
    
    @ApiProperty({ required: false })
    description: string;
}