import { drizzleDb, users, User, UserSkillLevel } from '@surf-sight/database';
import { eq, asc } from 'drizzle-orm';

export class UserService {
  constructor(private db: typeof drizzleDb) {}

  async findAll(): Promise<User[]> {
    const result = await this.db.select().from(users).orderBy(asc(users.email));
    return result;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.userId, id))
      .limit(1);
    return result[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] || null;
  }

  async create(data: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    skillLevel?: UserSkillLevel;
  }): Promise<User> {
    const result = await this.db
      .insert(users)
      .values({
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
        skillLevel: data.skillLevel,
      })
      .returning();
    return result[0];
  }

  async update(
    id: string,
    data: Partial<{
      email: string;
      name: string;
      phone: string;
      skillLevel: UserSkillLevel;
    }>
  ): Promise<User> {
    const result = await this.db
      .update(users)
      .set(data)
      .where(eq(users.userId, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<User> {
    const result = await this.db
      .delete(users)
      .where(eq(users.userId, id))
      .returning();
    return result[0];
  }
}
