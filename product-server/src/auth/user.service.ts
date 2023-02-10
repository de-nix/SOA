import { Injectable } from '@nestjs/common';
import User from '../model/User';

@Injectable()
export class UserService {
  private readonly users = [
    new User(0, 'Denis', 'pass'),
    new User(1, 'Bughi', 'pass'),
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
