import { Injectable } from '@nestjs/common';
import { ProductService } from '../product/product.service';
import { initialData } from './data/seed-data';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductService,
    @InjectRepository( User )
    private readonly userRepository: Repository<User>
    ) {}

  async runSeed() {
    await this.deleteTables()
    const adminUser = await this.insertUsers()

    await this.insertNewProducts( adminUser );

    return adminUser;
  }

  private async deleteTables(){

    await this.productService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute()

  }

  private async insertUsers() {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach( user => {
      users.push( this.userRepository.create(
        {
          ...user,
          password: bcrypt.hashSync( user.password, 10 )
        }
       ))

    } )

    const dbUsers = await this.userRepository.save( users )

    return dbUsers[0]

  }

  private async insertNewProducts( user: User ) {
    const products = initialData.products;

    const insertPromises = [];

    products.forEach((product) => {
      insertPromises.push(this.productService.create(product, user));
    });

    await Promise.all( insertPromises )

    return true;
    
  }
}
