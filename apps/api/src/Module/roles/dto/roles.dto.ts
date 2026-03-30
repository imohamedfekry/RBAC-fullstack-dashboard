import { ArrayNotEmpty, ArrayUnique, IsArray, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { IsId } from 'src/common/Global/security/validator/isId.validator';
import { Permission } from 'src/common/utils/permission';

export class crateRoleDto {
  @IsNotEmpty()
  @MaxLength(10)
  name: string;
  @IsOptional()
  @MaxLength(20)
  description: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hierarchy?: number;
}
export class roleIdParamsDto {
  @IsId()
  @IsNotEmpty()
  roleId: string;
}
export class updateRoleDto {
  @IsArray()
  // @ArrayNotEmpty()
  @IsOptional()
  @ArrayUnique({ message: 'Permissions must not be duplicated' })
  @IsEnum(Permission, { each: true, message: 'Invalid permission value' })
  permissions: Permission[];

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hierarchy?: number;

}