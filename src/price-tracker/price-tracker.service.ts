import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { PriceEntity } from './entities/price.entity';
import { AlertEntity } from './entities/alert.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class PriceTrackerService {
    constructor(
        private readonly httpService: HttpService,
        private readonly emailService: EmailService,
        @InjectRepository(PriceEntity)
        private readonly priceRepository: Repository<PriceEntity>,
        @InjectRepository(AlertEntity)
        private readonly alertRepository: Repository<AlertEntity>,
    ) { }

    // 1. Fetch current price from Moralis or Solscan API
    async fetchCurrentPrice(chain: 'ethereum' | 'polygon'): Promise<number> {
        try {
            const apiUrl = chain === 'ethereum'
                ? process.env.ETH_API_URL
                : process.env.POLYGON_API_URL;

            const apiKey = process.env.MORALIS_API_KEY;
            const response = await this.httpService
                .get(apiUrl, { headers: { 'Authorization': `Bearer ${apiKey}` } })
                .toPromise();

            const price = response.data?.market_data?.current_price?.usd;
            if (!price) throw new Error(`Failed to fetch ${chain} price.`);

            return price;
        } catch (error) {
            console.error(`Error fetching ${chain} price:`, error.message);
            throw error;
        }
    }

    async getHourlyPrices(chain: 'ethereum' | 'polygon'): Promise<PriceEntity[]> {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return this.priceRepository.find({
            where: { chain, createdAt: MoreThanOrEqual(oneDayAgo) },
            order: { createdAt: 'ASC' },
        });
    }

    // 3. Set a price alert for a specific chain
    async setPriceAlert(chain: 'ethereum' | 'polygon', targetPrice: number, email: string): Promise<AlertEntity> {
        const alert = this.alertRepository.create({ chain, targetPrice, email });
        return await this.alertRepository.save(alert);
    }

    // 4. Fetch the ETH to BTC rate for swap calculations
    async fetchBtcRate(): Promise<number> {
        try {
            const response = await this.httpService
                .get(process.env.BTC_API_URL, { headers: { 'Authorization': `Bearer ${process.env.MORALIS_API_KEY}` } })
                .toPromise();

            const btcRate = response.data?.market_data?.current_price?.btc;
            if (!btcRate) throw new Error('Failed to fetch BTC rate.');

            return btcRate;
        } catch (error) {
            console.error('Error fetching BTC rate:', error.message);
            throw error;
        }
    }
}
