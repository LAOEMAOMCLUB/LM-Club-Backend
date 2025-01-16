// beehive-reward-transaction.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserDetail } from './user.entity';
import { BeehivePostTracking } from './beehivePostTracking.entity';

@Entity('beehive_reward_transaction')
export class BeehiveRewardTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserDetail)
  @JoinColumn({ name: 'user_id' })
  user: UserDetail;

  @Column({ type: 'timestamp with time zone' })
  transaction_date: Date;

  @Column({ type: 'char' })
  transaction_type: string;

  @ManyToOne(() => BeehivePostTracking)
  @JoinColumn({ name: 'beehive_post_tracking_id' })
  beehivePostTracking: BeehivePostTracking;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  source: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  points: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', nullable: true })
  created_by: number;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_on: Date;

  @Column({ type: 'int', nullable: true })
  modified_by: number;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  modified_on: Date;
}
