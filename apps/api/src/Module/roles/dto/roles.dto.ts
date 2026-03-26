import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class crateRoleDto {
  @IsNotEmpty()
  @MaxLength(10)
  name: string;
  @IsOptional()
  @MaxLength(20)
  description: string;
}
