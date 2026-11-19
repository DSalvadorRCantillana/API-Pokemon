import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTipoDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  nombre: string;
}