import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/domain/entities/user.entity';
import { Note } from '../notes/domain/entities/note.entity';

const BCRYPT_SALT_ROUNDS = 10;

const SEED_USER = {
  name: 'DemoUser',
  password: '!falsyTruthy789',
};

const SEED_NOTES = [
  {
    title: 'Lorem Ipsum Dolor Sit Amet',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n\nExcepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
  },
  {
    title: 'Ut Labore Et Dolore Magna',
    content:
      'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.\n\nAt vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi id est laborum et dolorum fuga.',
  },
  {
    title: 'Quis Nostrud Exercitation Ullamco',
    content:
      'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet.\n\nItaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.',
  },
];

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedDatabase();
  }

  private async seedDatabase(): Promise<void> {
    const existingUserCount = await this.userRepository.count();
    if (existingUserCount > 0) {
      this.logger.log('Database already seeded, skipping.');
      return;
    }
    this.logger.log('Seeding database with initial data...');
    const user = await this.createSeedUser();
    await this.createSeedNotes(user);
    this.logger.log('Database seeding complete.');
  }

  private async createSeedUser(): Promise<User> {
    const hashedPassword = await bcrypt.hash(
      SEED_USER.password,
      BCRYPT_SALT_ROUNDS,
    );
    const user = this.userRepository.create({
      name: SEED_USER.name,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  private async createSeedNotes(user: User): Promise<void> {
    const notes = SEED_NOTES.map((noteData) =>
      this.noteRepository.create({
        ownedByUserId: user.id,
        title: noteData.title,
        content: noteData.content,
      }),
    );
    await this.noteRepository.save(notes);
  }
}
