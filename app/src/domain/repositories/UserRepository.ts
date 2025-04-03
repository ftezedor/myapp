import { UserEntity } from "@src/domain/entities/UserEntity";

export abstract class UserRepository {
  abstract create(user: UserEntity): Promise<UserEntity>;
  abstract update(user: Partial<UserEntity>): Promise<UserEntity>;
  abstract findById(id: number): Promise<UserEntity | undefined>;
  abstract findAll(): Promise<UserEntity[]>;
  abstract query(query: any): Promise<UserEntity[]>;
  abstract deleteById(id: number): Promise<boolean>;
  abstract findByUsername(username: string): Promise<UserEntity | undefined>;
  abstract count(query?: any): Promise<number>;

  static isChildOfMine(obj: any): boolean {
    if (!obj || typeof obj !== 'object') {
      return false;
    }

    if (obj instanceof UserRepository) {
      return true;
    }

    const hasRequiredProperties =
      typeof obj.create === 'function' &&
      typeof obj.update === 'function' &&
      typeof obj.findById === 'function' &&
      typeof obj.findAll === 'function' &&
      typeof obj.query === 'function' &&
      typeof obj.deleteById === 'function' &&
      typeof obj.findByUsername === 'function' &&
      typeof obj.count === 'function';

    return hasRequiredProperties;
  }
}