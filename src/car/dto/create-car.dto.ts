import {ApiProperty} from "@nestjs/swagger";
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCarDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly brand: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly model: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly state_number: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly vin: string;
}
