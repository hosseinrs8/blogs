import { Authorities } from '../dto/authorities.dto';

export class PermissionEntity {
  id: string;
  userId: string;
  authorities: Array<Authorities>;
}
