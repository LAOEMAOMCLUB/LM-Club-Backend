import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BroadcastPost } from './broadcastPost.entity';

@Entity()
export class BroadcastPostMedia {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => BroadcastPost)
    @JoinColumn({ name: 'broadcast_post_id' })
    broadcastPost: BroadcastPost;

    @Column({ length: 20 })
    media_type: string;

    @Column({ length: 4000 })
    media_path: string;

    @Column({ nullable: true })
    created_by: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_on: Date;

    @Column({ nullable: true })
    modified_by: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    modified_on: Date;
}
