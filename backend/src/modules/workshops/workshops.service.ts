import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';

@Injectable()
export class WorkshopsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.workshop.findMany({
      include: {
        _count: {
          select: { enrollments: { where: { isActive: true } } },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findOne(id: string) {
    const workshop = await this.prisma.workshop.findUnique({
      where: { id },
      include: {
        enrollments: {
          where: { isActive: true },
          include: {
            child: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    if (!workshop) {
      throw new NotFoundException('Taller no encontrado');
    }

    return workshop;
  }

  async create(dto: CreateWorkshopDto) {
    return this.prisma.workshop.create({
      data: dto,
    });
  }

  async update(id: string, dto: Partial<CreateWorkshopDto>) {
    const workshop = await this.prisma.workshop.findUnique({
      where: { id },
    });

    if (!workshop) {
      throw new NotFoundException('Taller no encontrado');
    }

    return this.prisma.workshop.update({
      where: { id },
      data: dto,
    });
  }

  async enrollChild(workshopId: string, childId: string) {
    const workshop = await this.prisma.workshop.findUnique({
      where: { id: workshopId },
      include: {
        _count: {
          select: { enrollments: { where: { isActive: true } } },
        },
      },
    });

    if (!workshop) {
      throw new NotFoundException('Taller no encontrado');
    }

    if (workshop._count.enrollments >= workshop.maxCapacity) {
      throw new BadRequestException('El taller está lleno');
    }

    const existingEnrollment = await this.prisma.workshopEnrollment.findUnique({
      where: {
        childId_workshopId: {
          childId,
          workshopId,
        },
      },
    });

    if (existingEnrollment) {
      if (existingEnrollment.isActive) {
        throw new BadRequestException('El niño ya está inscrito en este taller');
      }

      return this.prisma.workshopEnrollment.update({
        where: { id: existingEnrollment.id },
        data: { isActive: true },
      });
    }

    return this.prisma.workshopEnrollment.create({
      data: {
        childId,
        workshopId,
      },
    });
  }

  async unenrollChild(workshopId: string, childId: string) {
    const enrollment = await this.prisma.workshopEnrollment.findUnique({
      where: {
        childId_workshopId: {
          childId,
          workshopId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Inscripción no encontrada');
    }

    return this.prisma.workshopEnrollment.update({
      where: { id: enrollment.id },
      data: { isActive: false },
    });
  }

  async delete(id: string) {
    const workshop = await this.prisma.workshop.findUnique({
      where: { id },
      include: { enrollments: { where: { isActive: true } } },
    });

    if (!workshop) {
      throw new NotFoundException('Taller no encontrado');
    }

    if (workshop.enrollments.length > 0) {
      return this.prisma.workshop.update({
        where: { id },
        data: { isActive: false },
      });
    }

    await this.prisma.workshop.delete({
      where: { id },
    });

    return { message: 'Taller eliminado exitosamente' };
  }
}
