import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailService } from '../email/email.service';
import { PriceEntity } from '../price-tracker/entities/price.entity';
import { AlertEntity } from '../price-tracker/entities/alert.entity';
import { PriceTrackerService } from '../price-tracker/price-tracker.service';

@Injectable()
export class PriceJobService {
  private readonly alertPercentageThreshold: number = Number(process.env.ALERT_PERCENTAGE_THRESHOLD) / 100;

  constructor(
    private readonly priceTrackerService: PriceTrackerService,
    private readonly emailService: EmailService,
    @InjectRepository(PriceEntity)
    private readonly priceRepository: Repository<PriceEntity>,
    @InjectRepository(AlertEntity)
    private readonly alertRepository: Repository<AlertEntity>,
  ) {}

  // 1. Fetch prices every 5 minutes and save to the database
  @Cron('0 */5 * * * *')
  async handleCron() {
    try {
      const ethPrice = await this.priceTrackerService.fetchCurrentPrice('ethereum');
      const polygonPrice = await this.priceTrackerService.fetchCurrentPrice('polygon');

      // Save prices to the database
      await this.priceRepository.save([
        { chain: 'ethereum', price: ethPrice },
        { chain: 'polygon', price: polygonPrice },
      ]);

      console.log('Saved ETH and Polygon prices to the database.');
    } catch (error) {
      console.error('Error fetching or saving prices:', error.message);
    }
  }

  // 2. Check for a 3% price increase and send alert emails if threshold is exceeded
  @Cron('0 */60 * * * *')
  async checkPriceAlerts() {
    try {
      // Fetch price data from one hour ago for both chains
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const [ethLatest, ethOld] = await Promise.all([
        this.priceRepository.findOne({ where: { chain: 'ethereum' }, order: { createdAt: 'DESC' } }),
        this.priceRepository.findOne({ where: { chain: 'ethereum', createdAt: oneHourAgo } }),
      ]);

      const [polygonLatest, polygonOld] = await Promise.all([
        this.priceRepository.findOne({ where: { chain: 'polygon' }, order: { createdAt: 'DESC' } }),
        this.priceRepository.findOne({ where: { chain: 'polygon', createdAt: oneHourAgo } }),
      ]);

      // Check for price threshold on Ethereum
      if (ethLatest && ethOld && this.checkThresholdExceeded(ethOld.price, ethLatest.price)) {
        await this.emailService.sendAlertEmail(
          process.env.ALERT_EMAIL,
          'Ethereum Price Alert',
          `Ethereum price increased by more than ${process.env.ALERT_PERCENTAGE_THRESHOLD}% in the last hour. Current price: $${ethLatest.price}`
        );
      }

      // Check for price threshold on Polygon
      if (polygonLatest && polygonOld && this.checkThresholdExceeded(polygonOld.price, polygonLatest.price)) {
        await this.emailService.sendAlertEmail(
          process.env.ALERT_EMAIL,
          'Polygon Price Alert',
          `Polygon price increased by more than ${process.env.ALERT_PERCENTAGE_THRESHOLD}% in the last hour. Current price: $${polygonLatest.price}`
        );
      }

      console.log('Checked price alerts and sent notifications if thresholds were exceeded.');
    } catch (error) {
      console.error('Error checking price alerts:', error.message);
    }
  }

  // Utility function to check if price increased by more than the threshold
  private checkThresholdExceeded(oldPrice: number, newPrice: number): boolean {
    const priceIncrease = (newPrice - oldPrice) / oldPrice;
    return priceIncrease > this.alertPercentageThreshold;
  }
}
