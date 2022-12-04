import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min} from "class-validator";


export class PaginationDto {
    
    @IsOptional()
    @IsPositive()
    //Hacemos que los querys se transformen a un tipo de dato expecífico.
    @Type( () => Number) // enableImplicitCOnversions: true
    limit?: number;

    @IsOptional()
    @Min(0)
    @Type( () => Number)
    offset?: number;

}