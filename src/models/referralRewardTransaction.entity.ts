// referral-reward-transaction.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserDetail } from './user.entity'; 
import { UserReferral } from './userReferral.entity'; 

@Entity()
export class ReferralRewardTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserDetail)
  @JoinColumn({ name: 'user_id' })
  user: UserDetail;

  @Column({ type: 'timestamptz', nullable: false })
  transaction_date: Date;

  @Column({ type: 'char', length: 1, nullable: false })
  transaction_type: string;

  @ManyToOne(() => UserReferral)
  @JoinColumn({ name: 'user_referral_id' })
  userReferral: UserReferral;

  @Column({ type: 'varchar', length: 1000 })
  source: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: false })
  points: number;

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
