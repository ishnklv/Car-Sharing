import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { CarModule } from "./car/car.module";
import { RentModule } from './rent/rent.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env']
    }),
    Logger,
    CarModule,
    RentModule,
  ],
})
export class AppModule {}
