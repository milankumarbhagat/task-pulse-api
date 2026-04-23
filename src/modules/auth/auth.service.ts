import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    private googleClient: OAuth2Client;

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private mailService: MailService,
    ) {
        this.googleClient = new OAuth2Client(
            this.configService.get<string>('GOOGLE_CLIENT_ID'),
        );
    }

    async register(dto: any) {
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                firstName: dto.firstName,
                lastName: dto.lastName,
                password: hashedPassword,
            },
        });

        return { message: 'User created', user };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) throw new UnauthorizedException('Invalid credentials');

        if (!user.password) {
            throw new UnauthorizedException('Please login with Google or reset your password.');
        }

        const isMatch = await bcrypt.compare(dto.password, user.password);

        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
        });

        return {
            access_token: token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                picture: user.picture
            }
        };
    }

    /* 
        This function is used to verify the token.
    */
    async verifyToken(token: string) {
        try {
            const decoded = this.jwtService.verify(token);
            return decoded;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    async userEmailExists(email: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: { id: true }, // Only return the id
        });
        return !!user;
    }

    async googleLogin(dto: GoogleLoginDto) {
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken: dto.idToken,
                audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
            });

            const payload = ticket.getPayload();
            if (!payload) {
                throw new UnauthorizedException('Invalid Google token payload');
            }

            const { sub: googleId, email, given_name: firstName, family_name: lastName, picture } = payload;

            let user = await this.prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                // Create new user if not exists
                user = await this.prisma.user.create({
                    data: {
                        email: email!,
                        firstName: firstName || 'Google',
                        lastName: lastName || 'User',
                        googleId,
                        picture,
                    },
                });
            } else {
                // Update existing user with Google ID and Picture if needed
                user = await this.prisma.user.update({
                    where: { email },
                    data: { 
                        googleId: user.googleId || googleId,
                        picture: user.picture || picture, // Update picture if not present
                    },
                });
            }

            const token = this.jwtService.sign({
                sub: user.id,
                email: user.email,
            });

            return {
                access_token: token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    picture: user.picture,
                },
            };
        } catch (error) {
            console.error('Google Auth Error:', error);
            throw new UnauthorizedException('Google authentication failed');
        }
    }
    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            // We return success even if user not found for security (don't reveal registered emails)
            return { message: 'If an account exists with this email, you will receive a reset link.' };
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // 1 hour expiry

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: token,
                resetPasswordExpires: expires,
            },
        });

        try {
            await this.mailService.sendPasswordResetEmail(user.email, token, user.firstName);
        } catch (error) {
            console.error('Email Delivery Error:', error);
            // We still return success to the frontend to prevent email enumeration
        }

        return { message: 'If an account exists with this email, you will receive a reset link.' };
    }

    async resetPassword(dto: any) {
        const { token, password } = dto;

        const user = await this.prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { gt: new Date() },
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid or expired reset token');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
        });

        return { message: 'Password has been reset successfully.' };
    }
}