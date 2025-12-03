import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CreateUserData, UpdateUserData, SendOtpRequest, VerifyOtpRequest } from './user.entity';
import { AuthService } from '../auth/auth.service';

@Controller('api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() sendOtpData: SendOtpRequest) {
    return this.usersService.sendOtp(sendOtpData);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpData: VerifyOtpRequest) {
    return this.usersService.verifyOtp(verifyOtpData);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() userData: CreateUserData) {
    return this.usersService.createUser(userData);
  }

  @Get('profile')
  @UseGuards(SupabaseAuthGuard)
  async getProfile(@Req() req: Request) {
    // Get user from request (set by auth guard)
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    return this.usersService.getUserById(userId);
  }

  @Put('profile')
  @UseGuards(SupabaseAuthGuard)
  async updateProfile(@Body() updateData: UpdateUserData, @Req() req: Request) {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    return this.usersService.updateUser(userId, updateData);
  }

  @Get('phone/:phone')
  @UseGuards(SupabaseAuthGuard)
  async getUserByPhone(@Param('phone') phone: string) {
    return this.usersService.getUserByPhone(phone);
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  async deleteUser(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }
}