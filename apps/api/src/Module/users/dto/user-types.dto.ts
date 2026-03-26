import { Expose, Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  user: string;
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
export class UserProfileDto {
  @Expose()
  @Transform(({ obj }) => obj.id?.toString())
  id: string;
  @Expose()
  user: string;
  @Expose()
  @IsBoolean()
  isOwner: boolean;
  @IsArray()
  roles: [];
}
