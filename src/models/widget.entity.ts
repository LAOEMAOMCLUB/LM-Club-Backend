// widget-master.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class WidgetMaster {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  widget_name: string;

  @Column({ length: 4000, nullable: true })
  image_path: string;

  @Column({ type: 'text', nullable: true })
  description: string;

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
}
