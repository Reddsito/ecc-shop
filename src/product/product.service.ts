import { NotFoundException } from '@nestjs/common';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities/index';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductService {
  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,

        //Al estar creando las imagenes dentro del create del product, no es necesario que, en el create de la imagen declararemos a que producto pertenece, automaticamente colocará el producto al estar dentro de un create de un producto.
        images: images.map((image) =>
          this.productImageRepository.create({ url: image })
        ),
        user
      });

      await this.productRepository.save(product);

      return { ...product, images };
    } catch (error) {
      this.handleExceptionsDB(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,

      //AL hacer esto, podemos traer las imagenes que pertenezcan a cada producto, decidimos que relaciones queremos que traiga.
      relations: {
        images: true,
      },
    });

    return products.map((product) => ({
      ...product,
      images: product.images.map((img) => img.url),
    }));
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    }

    if (!product) {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');

      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product)
      throw new NotFoundException(`Not found product with term: ${term}`);

    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ 
      id,...toUpdate });

    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found`);

      //Query Runner
      const queryRunner= this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

    try {

      if( images ) {
        //Eliminamos todas las imagenes que tenga de id el id del producto.
        await queryRunner.manager.delete( ProductImage, { product: { id } } )

        product.images = 
        images.map( image => this.productImageRepository.create( 
          { url: image } ) )

      } 
      product.user = user;
      await queryRunner.manager.save( product )
      // await this.productRepository.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain( id );

    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleExceptionsDB(error);
    }

  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);

    return product;
  }

  private handleExceptionsDB(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(`Unexpected error`);
  }

  //Solo para desarrollo, eliminar todos los datos generados por la seed.
  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product')

    try{
      return await query
      .delete()
      .where({})
      .execute()

    } catch ( error ){
      this.handleExceptionsDB( error )
    }
  }
}
