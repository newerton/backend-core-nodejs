import { z } from 'zod';

import { CreateValidationSchema } from '../schemas';

export class ULIDSchemaValidation implements CreateValidationSchema {
  createSchema(): z.Schema {
    return z
      .string({
        description: 'ULID',
        invalid_type_error: 'ULID must be a string',
        required_error: 'ULID is required',
      })
      .ulid({
        message: 'ULID must be a valid ULID',
      });
  }
}
