import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { IsId } from 'src/common/Global/security/validator/isId.validator';

export class crateRoleDto {
  @IsNotEmpty()
  @MaxLength(10)
  name: string;
  @IsOptional()
  @MaxLength(20)
  description: string;
}
export class DeleteRoleDto {
  @IsId()
  @IsNotEmpty()
  roleId: string;
}
