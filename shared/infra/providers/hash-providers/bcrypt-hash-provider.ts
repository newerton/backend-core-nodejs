import { compare, hash } from 'bcrypt';

import { HashProvider } from '../../../domain/providers/hash-provider';

export class BCryptHashProvider implements HashProvider {
  async generateHash(payload: string): Promise<string> {
    const result: string = await hash(payload, 8);
    return result;
  }

  async compareHash(payload: string, hashed: string): Promise<boolean> {
    const result: boolean = await compare(payload, hashed);
    return result;
  }
}
