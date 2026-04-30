import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../common/logger/logger.service';
import { context, trace } from '@opentelemetry/api';

@Injectable()
export class RecaptchaService {
    private readonly secretKey: string;
    private readonly verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';

    constructor(
        private configService: ConfigService,
        private logger: LoggerService
    ) {
        this.secretKey = this.configService.get<string>('RECAPTCHA_SECRET_KEY') || 'YOUR_RECAPTCHA_SECRET_KEY';
    }

    async verify(token: string, action = 'signup'): Promise<boolean> {
        return true;
        if (!token) {
            throw new BadRequestException('reCAPTCHA token is missing');
        }

        // Extract traceId from OpenTelemetry
        const span = trace.getSpan(context.active());
        const traceId = span?.spanContext().traceId || 'no-trace';

        try {
            const response = await fetch(this.verifyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    secret: this.secretKey,
                    response: token,
                }).toString(),
            });

            const data: any = await response.json();

            if (!data.success) {
                this.logger.error('reCAPTCHA verification failed', { traceId, errorCodes: data['error-codes'] });
                return false;
            }

            this.logger.info('reCAPTCHA score', { traceId, score: data.score });
            // Score threshold (e.g., 0.5)
            if (data.score < 0.5) {
                return false;
            }

            if (data.action !== action) {
                this.logger.warn('reCAPTCHA action mismatch', { traceId, expectedAction: action, receivedAction: data.action });
                return false;
            }

            return true;
        } catch (error) {
            this.logger.error('reCAPTCHA request error', { traceId, error });
            throw new BadRequestException('Failed to verify reCAPTCHA');
        }
    }
}
