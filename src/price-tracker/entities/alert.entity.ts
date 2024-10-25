import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('alerts')
export class AlertEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    chain: string;  // Chain name, e.g., 'ethereum' or 'polygon'

    @Column('decimal')
    targetPrice: number;  // The target price for the alert

    @Column()
    email: string;  // Email to send alert to

    @Column({ default: false })
    isTriggered: boolean;  // Marks if the alert has been triggered to avoid duplicate alerts

    @CreateDateColumn()
    createdAt: Date;  // Timestamp of when the alert was created
}
