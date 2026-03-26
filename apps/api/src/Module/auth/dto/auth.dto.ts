import { IsNotEmpty, IsString } from 'class-validator';

export class loginDto {
  @IsString()
  @IsNotEmpty()
  user: string;
  @IsString()
  @IsNotEmpty()
  password: string;
}
