// types/unifi.ts
export interface UnifiClient {
  mac: string;
  ip: string;
  hostname?: string;
  tx_bytes: number;
  rx_bytes: number;
  last_seen: number;
}
