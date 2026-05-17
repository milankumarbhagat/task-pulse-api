import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, ParseIntPipe } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { GetNotesFilterDto } from './dto/get-notes-filter.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Req() req: any, @Body() createNoteDto: CreateNoteDto) {
    const userId = +req.user.sub;
    return this.notesService.create(userId, createNoteDto);
  }

  @Get()
  findAll(@Req() req: any, @Query() filterDto: GetNotesFilterDto) {
    const userId = +req.user.sub;
    return this.notesService.findAll(userId, filterDto);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const userId = +req.user.sub;
    return this.notesService.findOne(userId, id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() updateNoteDto: UpdateNoteDto) {
    const userId = +req.user.sub;
    return this.notesService.update(userId, id, updateNoteDto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const userId = +req.user.sub;
    return this.notesService.remove(userId, id);
  }
}
