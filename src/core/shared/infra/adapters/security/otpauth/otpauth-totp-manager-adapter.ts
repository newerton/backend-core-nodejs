import * as OTPAuth from 'otpauth';

import {
  GenerateTOTPDataInput,
  TOTPManagerAdapter,
  ValidateTOTPDataInput,
} from '../../../../domain/adapters/totp-manager-adapter';

/**
 * Classe para gerenciar a geração e validação de OTPs.
 */
export class OTPAuthTOTPManagerAdapter implements TOTPManagerAdapter {
  private secret: string;

  /**
   * Define um token para ser utilizado nas operações de geração e validação de códigos OTP.
   * @param email - O email do usuário.
   * @returns O token gerado.
   */
  generateSecret(email: string): void {
    this.secret = OTPAuth.Secret.fromUTF8(email).base32;
  }

  /**
   * Retorna o token gerado.
   * @returns O token gerado.
   */
  getSecret(): string {
    return this.secret;
  }

  /**
   * Define um token para ser utilizado nas operações de geração e validação de códigos OTP.
   * @param token - O token a ser definido.
   */
  setSecret(token: string): void {
    this.secret = token;
  }

  /**
   * Gera um código OTP baseado no tempo (TOTP).
   * @param generateTOTPDataInput - Dados para a geração do código OTP.
   * @returns O código OTP gerado.
   */
  generateTOTP(generateTOTPDataInput: GenerateTOTPDataInput): string {
    const otp = new OTPAuth.TOTP({
      secret: this.secret,
      ...(generateTOTPDataInput.issuer && {
        issuer: generateTOTPDataInput.issuer,
      }),
      ...(generateTOTPDataInput.label && {
        label: generateTOTPDataInput.label,
      }),
      ...(generateTOTPDataInput.length && {
        digits: generateTOTPDataInput.length,
      }),
      ...(generateTOTPDataInput.timeInSeconds && {
        period: generateTOTPDataInput.timeInSeconds,
      }),
    }).generate();
    return otp;
  }

  /**
   * Valida um código OTP fornecido pelo usuário.
   * @param validateTOTPDataInput - Dados para a validação do código OTP.
   * @returns `true` se o código for válido, `false` caso contrário.
   */
  validateTOTP(validateTOTPDataInput: ValidateTOTPDataInput): boolean {
    const isValid = new OTPAuth.TOTP({
      secret: this.secret,
      ...(validateTOTPDataInput.issuer && {
        issuer: validateTOTPDataInput.issuer,
      }),
      ...(validateTOTPDataInput.label && {
        label: validateTOTPDataInput.label,
      }),
      ...(validateTOTPDataInput.length && {
        digits: validateTOTPDataInput.length,
      }),
      ...(validateTOTPDataInput.timeInSeconds && {
        period: validateTOTPDataInput.timeInSeconds,
      }),
    }).validate({
      token: validateTOTPDataInput.token,
      ...(validateTOTPDataInput.window && {
        window: validateTOTPDataInput.window,
      }),
    });

    return isValid > -1;
  }
}
