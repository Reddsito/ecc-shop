import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, LoginUserDto } from './dto/index';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JWtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository( User )
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ){}

  async create(createUserDto: CreateUserDto) {
    try {

      const { password, ...userData } = createUserDto

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync( password, 10 )
      });
      await this.userRepository.save( user );
      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      };
    } catch ( error ){
        this.handleExceptionsDB( error )
    } 
  }

  async login( loginUserDto : LoginUserDto ){
    
    let { email } = loginUserDto;
    const { password } = loginUserDto;
    email = email.toLowerCase();

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true } 
    });

    if ( !user )
      throw new UnauthorizedException(`Credentials are not valid (email)`)

    if ( !bcrypt.compareSync( password, user.password ) )
      throw new UnauthorizedException(`Credentials are not valid (password)`)

    delete user.password;

    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };


  }

  private getJwtToken( payload: JWtPayload ){

    const token = this.jwtService.sign( payload )
    return token;

  }

  checkAuthStatus( user: User ) {
    return {
        ...user,
        token: this.getJwtToken({ id: user.id })
    }
  }

  private handleExceptionsDB(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(`Unexpected error`);
  }

}
