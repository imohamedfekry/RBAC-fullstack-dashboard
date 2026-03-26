import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

/**
 * Credentials collected during `prisma/seed` for the application owner.
 */
export class OwnerSeedCredentialsDto {
  @IsString({ message: 'Username must be a string.' })
  @IsNotEmpty({ message: 'Username is required.' })
  username!: string;

  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(12, { message: 'Password must be at least 12 characters.' })
  @Matches(/[a-z]/, { message: 'Include at least one lowercase letter.' })
  @Matches(/[A-Z]/, { message: 'Include at least one uppercase letter.' })
  @Matches(/\d/, { message: 'Include at least one number.' })
  @Matches(/[^a-zA-Z0-9\s]/, {
    message: 'Include at least one symbol (non-letter, non-digit).',
  })
  password!: string;
}
