import { NotFoundException } from '@nestjs/common';
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid'

@Injectable()
export class ProductService {

  private readonly logger = new Logger('ProductService')

  constructor(
    
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>

  ){}

  async create(createProductDto: CreateProductDto) {
    
    try{

      const product = this.productRepository.create(createProductDto)

      await this.productRepository.save( product )

      return product;
      

    } catch ( error ){
      this.handleExceptionsDB( error )
    }

  }

  async findAll(paginationDto: PaginationDto) {

    const {limit = 10, offset = 0 } = paginationDto;
    
    const products = await this.productRepository.find({
      take: limit,
      skip: offset
    }) 
    // TODO: Relaciones
    return products;
  }

  async findOne(term: string) {

    let product: Product;

    if( isUUID(term) ) {
      product = await this.productRepository.findOneBy({ id: term }) 
    }

    if ( !product ) {
      const queryBuilder = this.productRepository.createQueryBuilder();

      product = await queryBuilder
      .where('UPPER(title) =:title or slug =:slug', {
        title: term.toUpperCase(),
        slug: term.toLowerCase()
      }).getOne();
    }


    if( !product )
      throw new NotFoundException(`Not found product with term: ${term}`)

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    })

    if( !product )
      throw new NotFoundException(`Product with id: ${ id } not found`)
    
    try{
      await this.productRepository.save( product );
      return product;

    } catch ( error ){
      this.handleExceptionsDB( error )
    }

 

  }

  async remove(id: string) {
    const product = await this.findOne( id )
    await this.productRepository.remove( product )

    return product;
  }

  private handleExceptionsDB ( error: any ){

    if( error.code === '23505' )
      throw new BadRequestException( error.detail )
    

    this.logger.error( error )
    throw new InternalServerErrorException(`Unexpected error`)
  }
}
