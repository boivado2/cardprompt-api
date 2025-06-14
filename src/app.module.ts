import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CardsModule } from './cards/cards.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';

dotenv.config();
@Module({
  imports: [
    CardsModule,
    MongooseModule.forRoot(process.env.MONGO_URI, {
      // auth: { password: 'pass', username: 'admin' },
      // connectionFactory: connection => {
      //   console.log(connection);
      //   return connection;
      // },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
