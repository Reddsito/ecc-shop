import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from '../entities/user.entity';
import { JWtPayload } from "../interfaces/jwt-payload.interface";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ){

    constructor(
       @InjectRepository( User ) 
       private readonly userRepository: Repository<User>,
       private readonly configService :ConfigService
    ){
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        });
    }


    async validate( payload: JWtPayload ): Promise<User> {

        const { id } = payload;

        const user = await this.userRepository.findOneBy({ id })
        
        if ( !user )
            throw new UnauthorizedException('Token no valid')

        if ( !user.isActive )
            throw new UnauthorizedException('User is inactive, talk with an admin')
        
        return user;
    }

}