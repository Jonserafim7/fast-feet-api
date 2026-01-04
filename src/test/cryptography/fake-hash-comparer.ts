import { HashComparer } from '@/core/cryptography/hash-comparer.js';

export class FakeHashComparer implements HashComparer {
  compare(plain: string, hash: string): Promise<boolean> {
    return Promise.resolve(plain.concat('-hashed') === hash);
  }
}
