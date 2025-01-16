// beehive-post.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserDetail } from './user.entity';
import { StatusMaster } from './status.entity';
import { BeehiveCategoryMaster } from './beehiveCategoryMaster.entity';

@Entity()
export class BeehivePost {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserDetail)
  @JoinColumn({ name: 'user_id' })
  user: UserDetail;

  @ManyToOne(() => StatusMaster)
  @JoinColumn({ name: 'status_id' })
  status: StatusMaster;

  @ManyToOne(() => BeehiveCategoryMaster)
  @JoinColumn({ name: 'beehive_category_id' })
  beehiveCategory: BeehiveCategoryMaster;

  @Column({ type: 'varchar', length: 100, nullable: true })
  company_name: string;

  @Column({ type: 'varchar', length: 1000 })
  title: string;

  @Column({ type: 'varchar', length: 1000 })
  description: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  coupon_code: string;

  @Column({ type: 'timestamptz', nullable: true })
  valid_from: Date;

  @Column({ type: 'timestamptz', nullable: true })
  valid_upto: Date;

  @Column({ type: 'timestamptz' })
  posted_time: Date;

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  @Column({ type: 'boolean', default: false })
  is_draft: boolean;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

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

  @Column({ type: 'boolean', default: false })
  is_edited: boolean;

  @Column({ type: 'time', nullable: true })
  event_start_time: string;

  @Column({ type: 'time', nullable: true })
  event_end_time: string;
}
