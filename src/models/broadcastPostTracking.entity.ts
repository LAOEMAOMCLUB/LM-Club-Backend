import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BroadcastPost } from './broadcastPost.entity';
import { UserDetail } from './user.entity';

@Entity()
export class BroadcastPostTracking {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => BroadcastPost)
    @JoinColumn({ name: 'broadcast_post_id' })
    broadcastPost: BroadcastPost;

    @ManyToOne(type => UserDetail)
    @JoinColumn({ name: 'user_id' })
    user: UserDetail;

    @Column({ default: false })
    is_created: boolean;

    @Column({ default: false })
    is_shared: boolean;

    @Column({ length: 100, nullable: true })
    mode_of_share: string;

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
