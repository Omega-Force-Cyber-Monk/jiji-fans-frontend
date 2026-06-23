export interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  category: string;
  submittedAt: string; // ISO string
}
