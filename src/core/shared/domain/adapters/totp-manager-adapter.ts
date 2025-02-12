export interface GenerateTOTPDataInput {
  issuer?: string;
  label?: string;
  length?: number;
  timeInSeconds?: number;
  window?: number;
}

export interface ValidateTOTPDataInput {
  issuer?: string;
  label?: string;
  length?: number;
  timeInSeconds?: number;
  token: string;
  window?: number;
}

export interface TOTPManagerAdapter {
  /**
   * Gera um token aleatório.
   * @returns O token gerado.
   */
  generateSecret(email: string): void;

  /**
   * Retorna o token gerado.
   * @returns O token gerado.
   */
  getSecret(): string;

  /**
   * Define um token para ser utilizado nas operações de geração e validação de códigos OTP.
   * @param token - O token a ser definido.
   */
  setSecret(token: string): void;

  /**
   * Gera um código OTP baseado no tempo (TOTP).
   * @param generateTOTPDataInput - Dados para a geração do código OTP.
   * @returns O código OTP gerado.
   */
  generateTOTP(generateTOTPDataInput: GenerateTOTPDataInput): string;

  /**
   * Valida um código OTP fornecido pelo usuário.
   * @param validateTOTPDataInput - Dados para a validação do código OTP.
   * @returns `true` se o código for válido, `false` caso contrário.
   */
  validateTOTP(validateTOTPDataInput: ValidateTOTPDataInput): boolean;
}
