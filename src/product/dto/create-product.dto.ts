import { IsString, MinLength, IsNumber, Min, IsOptional, IsInt, IsArray, IsIn } from "class-validator";



export class CreateProductDto {
    
    @IsString()
    @MinLength(1)
    title: string

    @IsNumber()
    @Min(0)
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsInt()
    @Min(0)
    @IsOptional()
    stock?: number;

    @IsString({ each: true })
    @IsArray()
    sizes: string[];
    
    @IsIn(['men','women','kid','unisex'])
    gender: string;

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    tags?: string[];

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images?: string[];



}
