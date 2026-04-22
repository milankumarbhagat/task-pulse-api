import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {

    async onModuleInit() {
        await this.$connect();
        
        // Temporary migration: Convert legacy PENDING status to new TODO status
        try {
            await (this as any).task.updateMany({
                where: { status: 'PENDING' },
                data: { status: 'TODO' }
            });
            console.log('Migration: Successfully converted PENDING tasks to TODO');
        } catch (e) {
            // Ignore error if PENDING doesn't exist in the current database state
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}