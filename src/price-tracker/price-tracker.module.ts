import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceEntity } from './entities/price.entity';
import { AlertEntity } from './entities/alert.entity';
import { EmailService } from '../email/email.service';
import { PriceTrackerService } from './price-tracker.service';
import { PriceTrackerController } from './price-tracker.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([PriceEntity, AlertEntity]),  // Register Price and Alert entities
        HttpModule,  // Import HttpModule for HTTP requests
    ],
    controllers: [PriceTrackerController],
    providers: [
        PriceTrackerService,
        EmailService,
    ],
    exports: [PriceTrackerService, EmailService],  // Export services if needed in other modules
})
export class PriceTrackerModule { }
