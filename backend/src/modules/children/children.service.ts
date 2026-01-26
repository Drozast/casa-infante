import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { ChildPreferencesDto } from './dto/child-preferences.dto';
import { UserRole } from '@prisma/client';
import {
  getPaginationParams,
  createPaginatedResult,
} from '../../common/utils/pagination';

@Injectable()
export class ChildrenService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const { skip } = getPaginationParams({ page, limit });

    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [children, total] = await Promise.all([
      this.prisma.child.findMany({
        where,
        include: {
          guardian: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          preferences: true,
          _count: {
            select: {
              bookings: true,
              attendances: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.child.count({ where }),
    ]);

    return createPaginatedResult(children, total, page, limit);
  }

  async findByGuardian(guardianId: string) {
    return this.prisma.child.findMany({
      where: { guardianId },
      include: {
        preferences: true,
        _count: {
          select: {
            bookings: true,
            attendances: true,
          },
        },
      },
      orderBy: { firstName: 'asc' },
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const child = await this.prisma.child.findUnique({
      where: { id },
      include: {
        guardian: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        preferences: true,
        workshopEnrollments: {
          include: {
            workshop: true,
          },
        },
        observations: userRole !== UserRole.GUARDIAN ? true : {
          where: { isInternal: false },
        },
      },
    });

    if (!child) {
      throw new NotFoundException('Niño no encontrado');
    }

    if (userRole === UserRole.GUARDIAN && child.guardianId !== userId) {
      throw new ForbiddenException('No tienes acceso a este registro');
    }

    return child;
  }

  async create(guardianId: string, dto: CreateChildDto) {
    const child = await this.prisma.child.create({
      data: {
        ...dto,
        guardianId,
        preferences: {
          create: {},
        },
      },
      include: {
        preferences: true,
      },
    });

    return child;
  }

  async update(
    id: string,
    dto: UpdateChildDto,
    userId: string,
    userRole: UserRole,
  ) {
    const child = await this.prisma.child.findUnique({
      where: { id },
    });

    if (!child) {
      throw new NotFoundException('Niño no encontrado');
    }

    if (userRole === UserRole.GUARDIAN && child.guardianId !== userId) {
      throw new ForbiddenException('No tienes acceso a este registro');
    }

    return this.prisma.child.update({
      where: { id },
      data: dto,
      include: {
        preferences: true,
      },
    });
  }

  async updatePreferences(
    id: string,
    dto: ChildPreferencesDto,
    userId: string,
    userRole: UserRole,
  ) {
    const child = await this.prisma.child.findUnique({
      where: { id },
      include: { preferences: true },
    });

    if (!child) {
      throw new NotFoundException('Niño no encontrado');
    }

    if (userRole === UserRole.GUARDIAN && child.guardianId !== userId) {
      throw new ForbiddenException('No tienes acceso a este registro');
    }

    if (child.preferences) {
      return this.prisma.childPreferences.update({
        where: { childId: id },
        data: dto,
      });
    } else {
      return this.prisma.childPreferences.create({
        data: {
          ...dto,
          childId: id,
        },
      });
    }
  }

  async addObservation(
    childId: string,
    content: string,
    createdById: string,
    isInternal: boolean,
  ) {
    const child = await this.prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      throw new NotFoundException('Niño no encontrado');
    }

    return this.prisma.childObservation.create({
      data: {
        childId,
        content,
        createdById,
        isInternal,
      },
    });
  }

  async delete(id: string, userId: string, userRole: UserRole) {
    const child = await this.prisma.child.findUnique({
      where: { id },
      include: {
        bookings: true,
        attendances: true,
      },
    });

    if (!child) {
      throw new NotFoundException('Niño no encontrado');
    }

    if (userRole === UserRole.GUARDIAN && child.guardianId !== userId) {
      throw new ForbiddenException('No tienes acceso a este registro');
    }

    if (child.bookings.length > 0 || child.attendances.length > 0) {
      return this.prisma.child.update({
        where: { id },
        data: { isActive: false },
      });
    }

    await this.prisma.child.delete({
      where: { id },
    });

    return { message: 'Niño eliminado exitosamente' };
  }
}
