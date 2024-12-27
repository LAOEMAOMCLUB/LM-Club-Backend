// user-referral.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserDetail } from './user.entity'; 

@Entity()
export class UserReferral {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserDetail)
  @JoinColumn({ name: 'user_id' })
  user: UserDetail;

  @Column({ type: 'varchar', length: 30, nullable: true })
  referral_code: string;

  @Column({ type: 'timestamptz', nullable: false })
  valid_from: Date;

  @Column({ type: 'timestamptz', nullable: false })
  valid_upto: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'integer', nullable: true })
  created_by: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_on: Date;

  @Column({ type: 'integer', nullable: true })
  modified_by: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  modified_on: Date;
}
