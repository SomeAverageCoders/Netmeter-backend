import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Group } from 'src/groups/group.entity';

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

   @ManyToMany(() => Group, group => group.members)
  groups: Group[];
}
