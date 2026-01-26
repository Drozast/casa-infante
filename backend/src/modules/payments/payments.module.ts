import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TransbankService } from './transbank.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, TransbankService],
  exports: [PaymentsService, TransbankService],
})
export class PaymentsModule {}
