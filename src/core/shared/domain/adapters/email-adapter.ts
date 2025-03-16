export interface SendDataInput {
  html: string;
  subject: string;
  to: string[];
  custom_args?: Record<string, never>;
}
export interface EmailAdapter {
  send({ html, subject, to, custom_args }: SendDataInput): Promise<any>;
}
