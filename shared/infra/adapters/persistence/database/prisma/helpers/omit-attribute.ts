export const omitAttributes = <T, Key extends keyof T, Output>(
  user: T | null,
  keys: Key[],
): Output => {
  if (!user) {
    return {} as Output;
  }
  return Object.fromEntries(
    Object.entries(user).filter(([key]) => !keys.includes(key as Key)),
  ) as Output;
};

export const omitAttributesMany = <User, Key extends keyof User>(
  users: User[],
  keys: Key[],
): User[] => {
  return users.map((user) => omitAttributes(user, keys));
};
