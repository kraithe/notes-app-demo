import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { TokenBlacklistService } from './domain/services/token-blacklist.service';
import { JwtStrategy } from './domain/strategies/jwt.strategy';
import { JwtAuthGuard } from './domain/guards/jwt-auth.guard';
import { transactionScriptRegistry } from './registries/transaction-script.registry';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<number>('JWT_EXPIRY_SECONDS', 7200),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  providers: [
    TokenBlacklistService,
    JwtStrategy,
    JwtAuthGuard,
    ...transactionScriptRegistry.providers,
  ],
  exports: [
    JwtAuthGuard,
    TokenBlacklistService,
    ...transactionScriptRegistry.exports,
  ],
})
export class AuthModule {}
