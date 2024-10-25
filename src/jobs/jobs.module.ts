import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceJobService } from './price-job.service';
import { EmailService } from './../email/email.service';
import { AlertEntity } from 'src/price-tracker/entities/alert.entity';
import { PriceEntity } from 'src/price-tracker/entities/price.entity';
import { PriceTrackerService } from '../price-tracker/price-tracker.service';

@Module({
    imports: [TypeOrmModule.forFeature([PriceEntity, AlertEntity]), HttpModule],
    providers: [EmailService, PriceJobService, PriceTrackerService],
    exports: [PriceJobService],
})

export class JobsModule { }
