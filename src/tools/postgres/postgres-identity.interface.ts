export interface PostgresIdentity {
  host: string;
  port: number;
  password?: string;
  username?: string;
  database?: string;
  tls?: {
    enabled: boolean;
    ca?: string;
    cert?: string;
    key?: string;
  };
}
