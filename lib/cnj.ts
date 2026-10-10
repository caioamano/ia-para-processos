// Numeração única do CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO (20 dígitos).
// Sem React e sem banco: fácil de ler e de testar.

export const CNJ_NUMBER_FORMAT = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/

// Os dois dígitos depois do hífen (DD) são "dígitos verificadores": saem de uma conta (módulo 97,
// Resolução CNJ 65/2008) feita com todos os outros números. Se a conta não bate, o número
// foi digitado errado ou foi inventado. Devolve true quando o número está matematicamente certo.
export function cnjCheckDigitsValid(number: string) {
  const match = /^(\d{7})-(\d{2})\.(\d{4})\.(\d)\.(\d{2})\.(\d{4})$/.exec(number)
  if (!match) return false
  const [, sequence, check, year, segment, court, origin] = match

  // Resto da divisão por 97 do número "NNNNNNN AAAA J TR OOOO 00", calculado em pedaços
  // (os números inteiros do JavaScript perdem precisão acima de ~16 dígitos).
  const digits = `${sequence}${year}${segment}${court}${origin}00`
  let remainder = 0
  for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97

  return 98 - remainder === Number(check)
}
