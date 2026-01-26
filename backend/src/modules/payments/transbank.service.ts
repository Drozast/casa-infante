import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface TransactionResponse {
  token: string;
  url: string;
}

interface CommitResponse {
  vci: string;
  amount: number;
  status: string;
  buy_order: string;
  session_id: string;
  card_detail: { card_number: string };
  accounting_date: string;
  transaction_date: string;
  authorization_code: string;
  payment_type_code: string;
  response_code: number;
  installments_amount: number;
  installments_number: number;
  balance: number;
}

@Injectable()
export class TransbankService {
  private readonly logger = new Logger(TransbankService.name);
  private isProduction: boolean;
  private commerceCode: string;
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.isProduction =
      this.configService.get('NODE_ENV') === 'production' &&
      !!this.configService.get('transbank.commerceCode');

    this.commerceCode = this.isProduction
      ? this.configService.get('transbank.commerceCode') || ''
      : '597055555532';

    this.apiKey = this.isProduction
      ? this.configService.get('transbank.apiKey') || ''
      : '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';
  }

  async createTransaction(
    buyOrder: string,
    sessionId: string,
    amount: number,
    returnUrl: string,
  ): Promise<TransactionResponse> {
    try {
      const tx = await this.getTransaction();

      const response = await tx.create(
        buyOrder,
        sessionId,
        amount,
        returnUrl,
      );

      this.logger.log(`Transaction created: ${buyOrder}`);

      return {
        token: response.token,
        url: response.url,
      };
    } catch (error) {
      this.logger.error(`Error creating transaction: ${error}`);
      throw error;
    }
  }

  async commitTransaction(token: string) {
    try {
      const tx = await this.getTransaction();
      const response = await tx.commit(token) as CommitResponse;

      this.logger.log(`Transaction committed: ${response.buy_order}`);

      return {
        vci: response.vci,
        amount: response.amount,
        status: response.status,
        buyOrder: response.buy_order,
        sessionId: response.session_id,
        cardDetail: response.card_detail,
        accountingDate: response.accounting_date,
        transactionDate: response.transaction_date,
        authorizationCode: response.authorization_code,
        paymentTypeCode: response.payment_type_code,
        responseCode: response.response_code,
        installmentsAmount: response.installments_amount,
        installmentsNumber: response.installments_number,
        balance: response.balance,
      };
    } catch (error) {
      this.logger.error(`Error committing transaction: ${error}`);
      throw error;
    }
  }

  async getTransactionStatus(token: string) {
    try {
      const tx = await this.getTransaction();
      const response = await tx.status(token);
      return response;
    } catch (error) {
      this.logger.error(`Error getting transaction status: ${error}`);
      throw error;
    }
  }

  async refundTransaction(token: string, amount: number) {
    try {
      const tx = await this.getTransaction();
      const response = await tx.refund(token, amount);

      this.logger.log(`Transaction refunded: ${token}`);

      return response;
    } catch (error) {
      this.logger.error(`Error refunding transaction: ${error}`);
      throw error;
    }
  }

  isSuccessful(responseCode: number): boolean {
    return responseCode === 0;
  }

  private async getTransaction() {
    const { WebpayPlus, Options, IntegrationApiKeys, IntegrationCommerceCodes, Environment } =
      await import('transbank-sdk');

    let options: InstanceType<typeof Options>;

    if (this.isProduction) {
      options = new Options(
        this.commerceCode,
        this.apiKey,
        Environment.Production,
      );
    } else {
      options = new Options(
        IntegrationCommerceCodes.WEBPAY_PLUS,
        IntegrationApiKeys.WEBPAY,
        Environment.Integration,
      );
    }

    return new WebpayPlus.Transaction(options);
  }
}
