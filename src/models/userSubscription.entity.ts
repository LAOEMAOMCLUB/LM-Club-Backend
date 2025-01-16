// user-subscription.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import { UserDetail } from './user.entity';
import { SubscriptionType } from './subscriptionType.entity';

@Entity()
export class UserSubscription extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserDetail)
  @JoinColumn({ name: 'user_id' })
  user: UserDetail;

  @ManyToOne(() => SubscriptionType)
  @JoinColumn({ name: 'subscription_id' })
  subscription: SubscriptionType;

  @Column({ type: 'timestamptz', nullable: true })
  subscription_from: Date;

  @Column({ type: 'timestamptz', nullable: true })
  subscription_upto: Date;

  @Column({ default: false })
  is_active: boolean;

  @Column({ nullable: true })
  created_by: number;

  @Column({ default: false })
  is_upgraded: boolean

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_on: Date;

  @Column({ nullable: true })
  modified_by: number;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  modified_on: Date;
}
