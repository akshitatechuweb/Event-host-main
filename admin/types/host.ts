// admin/types/host.ts

export type HostStatus = "pending" | "approved" | "rejected";

export interface Host {
  _id: string;
  userName: string;
  phone: string;
  city: string;
  preferredPartyDate: string;
  status: HostStatus;
}
