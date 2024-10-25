import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  database: {
    host: process.env.DATABASE_HOST,
    port: +process.env.DATABASE_PORT,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
  },
  apiKeys: {
    moralis: process.env.MORALIS_API_KEY
  },
  alertEmail: process.env.ALERT_EMAIL,
  smtp: {
    host: process.env.SMTP_HOST,
    port: +process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  feePercentage: +process.env.FEE_PERCENTAGE,
}));
