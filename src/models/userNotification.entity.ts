// src/entities/UserNotification.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserDetail } from './user.entity'; 
import { WidgetMaster } from './widget.entity'; 

@Entity()
export class UserNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserDetail)
  @JoinColumn({ name: 'user_id' })
  user: UserDetail;

  @ManyToOne(() => UserDetail)
  @JoinColumn({ name: 'action_by' })
  actionBy: UserDetail;

  @Column({ length: 1000 })
  action_type: string

  @Column({ length: 1000 })
  message: string;

  @ManyToOne(() => WidgetMaster)
  @JoinColumn({ name: 'widget_id' })
  widget: WidgetMaster;

  @Column({ nullable: true })
  post_id: number;

  @Column({ nullable: false, default: false })
  is_viewed: boolean;

  @Column({ nullable: false, default: false })
  is_read: boolean;

  @Column({ nullable: false, default: true })
  is_active: boolean;

  @Column({ nullable: true })
  created_by: number;

  @CreateDateColumn({type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_on: Date;

  @Column({ nullable: true })
  modified_by: number;

  @UpdateDateColumn({type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  modified_on: Date;
}
