import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserId } from '../../domain/entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findById(id: UserId): Promise<User | null> {
    return this.repo.findOneBy({ id });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repo.findOneBy({ name: username });
  }

  async createUser(username: string, hashedPassword: string): Promise<User> {
    const user = this.repo.create({ name: username, password: hashedPassword });
    return this.repo.save(user);
  }
}
