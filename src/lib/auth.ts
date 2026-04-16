export function getUserId(): string {
  const id = process.env.DEFAULT_USER_ID;
  if (!id) throw new Error('DEFAULT_USER_ID env variable is not set');
  return id;
}
