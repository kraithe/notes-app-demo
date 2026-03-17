import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { TokenBlacklistService } from './domain/services/token-blacklist.service';
import { AuthService } from './domain/services/auth.service';
import { JwtStrategy } from './domain/strategies/jwt.strategy';
import { JwtAuthGuard } from './domain/guards/jwt-auth.guard';
import { transactionScriptRegistry } from './registries/transaction-script.registry';
import { AuthController } from './application/controllers/auth.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          // jsonwebtoken treats a string expiresIn as a "ms" timespan; e.g. "7200" => 7.2s.
          // We want seconds, so coerce to a number.
          expiresIn: (() => {
            const raw = configService.get<string>('JWT_EXPIRY_SECONDS', '7200');
            const seconds = Number(raw);
            return Number.isFinite(seconds) && seconds > 0 ? seconds : 7200;
          })(),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    TokenBlacklistService,
    AuthService,
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
