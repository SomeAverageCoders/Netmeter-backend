import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({unique:true})
  email: string;

  @Column()
  mobile: string;

  @Column({default: false})
  isVerified: boolean;

  @Column()
  userRole: string;

  @Column()
  @Exclude()
  password: string;
}
