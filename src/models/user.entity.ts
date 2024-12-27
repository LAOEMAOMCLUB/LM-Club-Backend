// user-detail.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role.entity';
import { State } from './state.entity';
import { City } from './city.entity';

@Entity()
export class UserDetail {
  @PrimaryGeneratedColumn()
  id: number;

//   @ManyToOne(() => Role)
//   role: Role;

  @Column({ length: 50, nullable: false })
  user_name: string;

  @Column({ length: 50, nullable: false })
  email_id: string;

  @Column({ length: 15, nullable: false })
  mobile_number: string;

  @Column({ nullable: false })
  password: string;

  @Column({ length: 4000, nullable: true })
  image_path: string;

  @Column({ default: false })
  is_verified_user: boolean;

  @Column({ length: 30, nullable: true })
  referral_code_applied: string;

  @Column({ length: 100, nullable: true })
  street: string;

//   @ManyToOne(() => City)
//   @Column({ nullable: true })
//   city: number;

//   @ManyToOne(() => State)
//   @Column({ nullable: true })
//   state: number;

  @Column({ length: 10, nullable: true })
  zipcode: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  created_by: number;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_on: Date;

  @Column({ nullable: true })
  modified_by: number;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  modified_on: Date;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;
  
  @ManyToOne(() => City)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @ManyToOne(() => State)
  @JoinColumn({ name: 'state_id' })
  state: State;
}
