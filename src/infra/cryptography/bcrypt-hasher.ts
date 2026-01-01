import { hash, compare } from 'bcryptjs';
import { HashComparer } from '../../core/cryptography/hash-comparer.js';
import { HashGenerator } from '../../core/cryptography/hash-generator.js';

export class BcryptHasher implements HashGenerator, HashComparer {
  private HASH_SALT_LENGTH = 8;

  hash(plain: string): Promise<string> {
    return hash(plain, this.HASH_SALT_LENGTH);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash);
  }
}
