// beehive-post-tracking.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BeehivePost } from './beehivePost.entity';
import { UserDetail } from './user.entity';

@Entity('beehive_post_tracking')
export class BeehivePostTracking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BeehivePost)
  @JoinColumn({ name: 'beehive_post_id' })
  beehivePost: BeehivePost;

  @ManyToOne(() => UserDetail)
  @JoinColumn({ name: 'user_id' })
  user: UserDetail;

  @Column({ type: 'boolean', default: false })
  is_created: boolean;

  @Column({ type: 'boolean', default: false })
  is_liked: boolean;

  @Column({ type: 'boolean', default: false })
  is_saved: boolean;

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
