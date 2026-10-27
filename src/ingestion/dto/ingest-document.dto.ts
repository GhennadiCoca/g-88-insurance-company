import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class IngestDocumentDto {
  @IsString()
  @IsNotEmpty()
  insuranceType: string;

  // { "departments": [ "insurance", "claims" ] }
  // { "departments": "insurance" }
  @Transform(({ value }: TransformFnParams): string[] =>
    Array.isArray(value) ? value : [value],
  )
  @IsArray()
  @IsNotEmpty()
  departments: string[];

  @IsString()
  @IsNotEmpty()
  language: string;

  @Transform(({ value }: TransformFnParams): boolean | string => {
    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    return value;
  })
  @IsBoolean()
  publicAccess: boolean;
}
