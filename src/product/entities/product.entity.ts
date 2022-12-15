import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { User } from '../../auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';


@Entity({ name: 'products' })
export class Product {

    @ApiProperty({
        example: '64ad2b99-ba52-4eb1-8d4c-f4bdeea0877f',
        description: 'Product ID',
        uniqueItems: true

    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-shirt Ecc',
        description: 'Product Title',
        uniqueItems: true

    })
    @Column('text', {
        unique: true
    })
    title: string

    @ApiProperty({
        example: 0,
        description: 'Product price',

    })
    @Column('float', {
        default: 0
    })
    price: number

    @ApiProperty({
        example: 'Anim reprehenderit nulla in anim mollit minim irure commodo.',
        description: 'Product description',
        default: null

    })
    @Column('text', {
        nullable: true
    })
    description: string

    @ApiProperty({
        example: 't-shirt_ecc',
        description: 'Product SLUG - for SEO',
        uniqueItems: true

    })
    @Column('text', {
        unique: true
    })
    slug: string

    @ApiProperty({
        example: 0,
        description: 'Product stock',

    })
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: ['M', 'XL', 'XXL'],
        description: 'Product sizeS',
    })

    @Column('text', {
        array: true
    })
    sizes: string[]

    @ApiProperty({
        example: 'women',
        description: `Product gender`,
    
    })
    @Column('text')
    gender: string
    
    @ApiProperty({
        example: ['shirt', 'men', 'casual'],
        description: `Product tags`,
    
    })
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[]

    @ApiProperty({
        example: ['1741416-10-A_0_2000.jpg'],
        description: `Product image`,
    
    })
    @OneToMany(
        () => ProductImage,
        productImage => productImage.product,
        //eager sirve para que al obtener un producto, automaticamente venga con sus relaciones.
        { cascade: true, eager: true }
    )
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        ( user ) => user.product,
        { eager: true }
    )
    user: User;

    @BeforeInsert()
    checkSlugInster(){
        if ( !this.slug ) {
            this.slug = this.title
        }

        this.slug = this.slug
            .toLowerCase()
            //Cambiar tsconfig.json ES2017 A ES2021
            .replaceAll(' ', '_')
            .replaceAll("'", '')

    }

    @BeforeUpdate()
    checkSlugUpdate(){
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }
    
 



}
