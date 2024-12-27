// subscription-widget-map.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import { SubscriptionType } from './subscriptionType.entity';
import { WidgetMaster } from './widget.entity';

@Entity()
export class SubscriptionWidgetMap extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SubscriptionType)
  @JoinColumn({ name: 'subscription_type_id' })
  subscriptionType: SubscriptionType;

  @ManyToOne(() => WidgetMaster)
  @JoinColumn({ name: 'widget_id' })
  widget: WidgetMaster;

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
