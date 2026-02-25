import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  getPaginationParams,
  createPaginatedResult,
} from '../../common/utils/pagination';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page?: number, limit?: number, role?: UserRole, search?: string) {
    const pagination = getPaginationParams({ page, limit });

    const where = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          rut: true,
          role: true,
          profession: true,
          shareProfile: true,
          isActive: true,
          emailVerified: true,
          profileImage: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: { children: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return createPaginatedResult(users, total, pagination.page, pagination.limit);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        rut: true,
        role: true,
        profession: true,
        shareProfile: true,
        isActive: true,
        emailVerified: true,
        profileImage: true,
        createdAt: true,
        lastLoginAt: true,
        children: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            birthDate: true,
            profileImage: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingEmail) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    if (dto.rut) {
      const existingRut = await this.prisma.user.findUnique({
        where: { rut: dto.rut },
      });

      if (existingRut) {
        throw new ConflictException('El RUT ya está registrado');
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        ...dto,
        email: dto.email.toLowerCase(),
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });

      if (existingEmail) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }
    }

    if (dto.rut && dto.rut !== user.rut) {
      const existingRut = await this.prisma.user.findUnique({
        where: { rut: dto.rut },
      });

      if (existingRut) {
        throw new ConflictException('El RUT ya está registrado');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.email && { email: dto.email.toLowerCase() }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        rut: true,
        role: true,
        isActive: true,
        profileImage: true,
      },
    });
  }

  async toggleActive(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        isActive: true,
      },
    });
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.children.length > 0) {
      throw new ConflictException(
        'No se puede eliminar un usuario con niños registrados',
      );
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Usuario eliminado exitosamente' };
  }

  async findSharedGuardians(excludeUserId?: string) {
    const guardians = await this.prisma.user.findMany({
      where: {
        role: 'GUARDIAN',
        shareProfile: true,
        isActive: true,
        ...(excludeUserId && { id: { not: excludeUserId } }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        profession: true,
        profileImage: true,
        children: {
          where: { isActive: true },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            schoolName: true,
          },
        },
      },
      orderBy: { lastName: 'asc' },
    });

    return guardians;
  }
}
