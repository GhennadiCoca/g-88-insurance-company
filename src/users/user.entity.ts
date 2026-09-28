import { Role } from './enums/role.enum.js';

export class User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: Role;
  active: boolean;
}
