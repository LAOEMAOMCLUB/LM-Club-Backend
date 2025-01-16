// beehive-post-media.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BeehivePost } from './beehivePost.entity';

@Entity('beehive_post_media')
export class BeehivePostMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BeehivePost)
  @JoinColumn({ name: 'beehive_post_id' })
  beehivePost: BeehivePost;

  @Column({ type: 'varchar', length: 20 })
  media_type: string;

  @Column({ type: 'varchar', length: 4000 })
  media_path: string;

  @Column({ type: 'int', nullable: true })
  created_by: number;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_on: Date;

  @Column({ type: 'int', nullable: true })
  modified_by: number;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  modified_on: Date;
}
