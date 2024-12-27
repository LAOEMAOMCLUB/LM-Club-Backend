// business-user-detail.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import { UserDetail } from './user.entity';

@Entity()
export class BusinessUserDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserDetail)
  @JoinColumn({ name: 'user_id' })
  user: UserDetail;

  @Column({ length: 100, nullable: false })
  business_person_name: string;

  @Column({ length: 100, nullable: false })
  type_of_business: string;

  @Column({ length: 100, nullable: true })
  services_offered: string;

  @Column({ length: 100, nullable: false })
  business_by: string;

  @Column({ type: 'date', nullable: true })
  business_established_date: Date;

  @Column({ length: 500, nullable: true })
  location: string;

  @Column({ type: 'time', nullable: true })
  operation_hours_from: string;

  @Column({ type: 'time', nullable: true })
  operation_hours_to: string;

  @Column({ length: 4000, nullable: true })
  logo_image_path: string;

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
