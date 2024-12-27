import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserDetail } from './user.entity';
import { BroadcastPostTracking } from './broadcastPostTracking.entity';

@Entity()
export class BroadcastRewardTransaction {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => UserDetail)
    @JoinColumn({ name: 'user_id' })
    user: UserDetail;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    transaction_date: Date;

    @Column({ length: 1 })
    transaction_type: string;

    @ManyToOne(type => BroadcastPostTracking)
    @JoinColumn({ name: 'broadcast_post_tracking_id' })
    broadcastPostTracking: BroadcastPostTracking;

    @Column({ length: 1000, nullable: true })
    source: string;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    points: number;

    @Column({ default: true })
    is_active: boolean;

    @Column({ nullable: true })
    created_by: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_on: Date;

    @Column({ nullable: true })
    modified_by: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    modified_on: Date;
}
