import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: 'debug',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            transports: [
                new winston.transports.Console(),

                new winston.transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                }),

                new winston.transports.File({
                    filename: 'logs/combined.log',
                }),
            ],
        });
    }

    debug(message: string, meta?: any) {
        this.logger.debug(message, meta);
    }

    info(message: string, meta?: any) {
        this.logger.info(message, meta);
    }

    error(message: string, meta?: any) {
        this.logger.error(message, meta);
    }
}