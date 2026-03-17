import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note, NoteId } from '../../domain/entities/note.entity';
import type { UserId } from '../../../users/domain/entities/user.entity';

@Injectable()
export class NoteRepository {
  constructor(
    @InjectRepository(Note)
    private readonly repo: Repository<Note>,
  ) {}

  async findAllByUserId(userId: UserId): Promise<Note[]> {
    return this.repo.find({
      where: { ownedByUserId: userId },
      order: { lastModifiedDate: 'DESC' },
    });
  }

  async findById(noteId: NoteId): Promise<Note | null> {
    return this.repo.findOneBy({ id: noteId });
  }

  async findOneByIdAndUserId(
    noteId: NoteId,
    userId: UserId,
  ): Promise<Note | null> {
    return this.repo.findOneBy({ id: noteId, ownedByUserId: userId });
  }

  async createNote(
    userId: UserId,
    title: string,
    content: string,
  ): Promise<Note> {
    const note = this.repo.create({ ownedByUserId: userId, title, content });
    return this.repo.save(note);
  }

  async updateNote(note: Note, title: string, content: string): Promise<Note> {
    note.title = title;
    note.content = content;
    return this.repo.save(note);
  }

  async deleteNote(note: Note): Promise<void> {
    await this.repo.remove(note);
  }
}
