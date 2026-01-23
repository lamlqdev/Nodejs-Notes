declare global {
  namespace Express {
    interface User {
      userId: string;
      email: string;
      role: 'admin' | 'user';
    }
  }
}

export { };