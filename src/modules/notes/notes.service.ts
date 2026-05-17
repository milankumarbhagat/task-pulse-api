import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { GetNotesFilterDto } from './dto/get-notes-filter.dto';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createNoteDto: CreateNoteDto) {
    return this.prisma.note.create({
      data: {
        ...createNoteDto,
        userId,
      },
    });
  }

  async findAll(userId: number, filterDto: GetNotesFilterDto) {
    const { page = 1, limit = 10, category, keyword, sortBy = 'createdAt', sortOrder = 'desc' } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (category) {
      where.category = category;
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { content: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const sortParams: any[] = [{ isPinned: 'desc' }];
    if (['title', 'createdAt', 'updatedAt'].includes(sortBy)) {
      sortParams.push({ [sortBy]: sortOrder });
    } else {
      sortParams.push({ createdAt: 'desc' });
    }

    const [items, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        skip,
        take: limit,
        orderBy: sortParams,
      }),
      this.prisma.note.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findOne(userId: number, id: number) {
    const note = await this.prisma.note.findFirst({
      where: { id, userId },
    });

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    return note;
  }

  async update(userId: number, id: number, updateNoteDto: UpdateNoteDto) {
    await this.findOne(userId, id); // Ensure it exists and belongs to the user

    return this.prisma.note.update({
      where: { id },
      data: updateNoteDto,
    });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id); // Ensure it exists and belongs to the user

    return this.prisma.note.delete({
      where: { id },
    });
  }
}
