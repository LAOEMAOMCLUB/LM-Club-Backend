// email-template.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class EmailTemplate extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 1000, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  subject: string;

  @Column({ type: 'text', nullable: false })
  message: string;

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
