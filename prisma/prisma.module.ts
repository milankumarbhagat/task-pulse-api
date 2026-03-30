import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // You import it ONLY ONCE (in AppModule), PrismaService is available everywhere automatically
@Module({
    providers: [PrismaService], // It means NestJS will create an instance of PrismaService and inject it wherever needed. so anywhere you write 'constructor(private prisma: PrismaService) {}' 👉 NestJS will inject it automatically.
    // This (above line) tells NestJS: “Hey Nest, please create and manage an instance of PrismaService”


    exports: [PrismaService], // It means PrismaService can be imported by other modules. If you remove it: ❌ You cannot use PrismaService in other modules
})
export class PrismaModule { }


/* 
Flow: 

AppModule
   ↓
PrismaModule (@Global)
   ↓
PrismaService (singleton)
   ↓
Injected into any Service

*/