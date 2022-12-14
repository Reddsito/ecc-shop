import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { User } from '../../auth/entities/user.entity';


@Entity({ name: 'products' })
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    title: string

    @Column('float', {
        default: 0
    })
    price: number

    @Column('text', {
        nullable: true
    })
    description: string

    @Column('text', {
        unique: true
    })
    slug: string

    @Column('int', {
        default: 0
    })
    stock: number;

    @Column('text', {
        array: true
    })
    sizes: string[]

    @Column('text')
    gender: string

    @Column('text', {
        array: true,
        default: []
    })
    tags: string[]

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
