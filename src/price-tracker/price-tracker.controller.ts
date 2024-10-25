import { PriceEntity } from './entities/price.entity';
import { AlertEntity } from './entities/alert.entity';
import { PriceTrackerService } from './price-tracker.service';
import { Controller, Get, Post, Body, Query } from '@nestjs/common';

@Controller('price-tracker')
export class PriceTrackerController {
    constructor(private readonly priceTrackerService: PriceTrackerService) { }

    // 1. Get hourly prices within the last 24 hours for a specified chain
    @Get('hourly-prices')
    async getHourlyPrices(@Query('chain') chain: 'ethereum' | 'polygon'): Promise<PriceEntity[]> {
        return await this.priceTrackerService.getHourlyPrices(chain);
    }

    // 2. Set a price alert for a specific chain, target price, and email
    @Post('set-alert')
    async setPriceAlert(
        @Body('chain') chain: 'ethereum' | 'polygon',
        @Body('targetPrice') targetPrice: number,
        @Body('email') email: string,
    ): Promise<AlertEntity> {
        return await this.priceTrackerService.setPriceAlert(chain, targetPrice, email);
    }

    // 3. Get ETH to BTC swap rate and calculate BTC amount with fee
    @Get('swap-rate')
    async getSwapRate(@Query('ethereumAmount') ethereumAmount: number) {
        const btcRate = await this.priceTrackerService.fetchBtcRate();
        const feePercentage = Number(process.env.FEE_PERCENTAGE);

        const fee = ethereumAmount * feePercentage;
        const btcAmount = ethereumAmount * btcRate - fee;

        return {
            btcAmount,
            fee: {
                eth: fee,
                dollar: fee * btcRate,
            },
        };
    }
}
