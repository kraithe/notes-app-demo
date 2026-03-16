import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type UserId = number & { readonly __brand: 'UserId' };

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: UserId;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;
}
