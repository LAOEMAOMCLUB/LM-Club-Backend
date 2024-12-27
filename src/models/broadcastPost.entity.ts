import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserDetail } from './user.entity';
import { StatusMaster } from './status.entity';

@Entity()
export class BroadcastPost {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => UserDetail)
    @JoinColumn({ name: 'user_id' })
    user: UserDetail;

    @ManyToOne(type => StatusMaster)
    @JoinColumn({ name: 'status_id' })
    status: StatusMaster;

    @Column({ length: 100 })
    what_are_you_promoting: string;

    @Column({ length: 1000 })
    title: string;

    @Column({ length: 1000 })
    description: string;

    @Column({ length: 1000 })
    post_duration: string;

    @Column({ length: 20, nullable: true })
    coupon_code: string;

    @Column({ type: 'timestamptz', nullable: true })
    valid_from: Date;

    @Column({ type: 'timestamptz', nullable: true })
    valid_upto: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    posted_time: Date;

    @Column({ type: 'timestamptz' })
    expires_at: Date;

    @Column({ default: false })
    is_draft: boolean;

    @Column({ default: false })
    is_deleted: boolean;

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

    @Column({ type: 'boolean', default: false })
    is_edited: boolean;
}
