import { HashComparer } from '@/core/cryptography/hash-comparer.js';
import { HashGenerator } from '@/core/cryptography/hash-generator.js';

export class FakeHasher implements HashGenerator, HashComparer {
  hash(plain: string): Promise<string> {
    return Promise.resolve(plain.concat('-hashed'));
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return Promise.resolve(plain.concat('-hashed') === hash);
  }
}
