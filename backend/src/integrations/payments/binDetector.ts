/**
 * Определяет страну банка по BIN карты (первые 6-8 цифр)
 * РФ BIN диапазоны: 220000-220999, 510000-519999, и другие
 */
export class BINDetector {
  private static readonly RUSSIAN_BIN_RANGES: Array<{ start: number; end: number }> = [
    // Мир карты
    { start: 220000, end: 220999 },
    // Visa/MasterCard российских банков (основные диапазоны)
    { start: 510000, end: 519999 },
    { start: 520000, end: 529999 },
    { start: 530000, end: 539999 },
    { start: 411111, end: 411199 }, // Сбербанк
    { start: 548673, end: 548673 }, // Сбербанк
    { start: 4276, end: 4279 }, // Сбербанк
    { start: 63900, end: 63909 }, // Сбербанк Maestro
    // Добавьте другие диапазоны при необходимости
  ]

  /**
   * Определяет является ли BIN карты российским
   * @param bin Первые 6-8 цифр карты
   * @returns true если карта российская
   */
  static isRussianCard(bin: string): boolean {
    const binNum = parseInt(bin.substring(0, 6), 10)
    if (isNaN(binNum)) return false

    // Проверяем диапазоны
    for (const range of this.RUSSIAN_BIN_RANGES) {
      if (binNum >= range.start && binNum <= range.end) {
        return true
      }
    }

    // Альтернативный способ: проверка через API (если доступно)
    // Можно использовать binlist.net или другие сервисы
    return false
  }

  /**
   * Извлекает BIN из номера карты
   * @param cardNumber Номер карты
   * @returns BIN (первые 6-8 цифр)
   */
  static extractBIN(cardNumber: string): string {
    // Удаляем пробелы и дефисы
    const cleaned = cardNumber.replace(/[\s-]/g, '')
    // Возвращаем первые 6-8 цифр
    return cleaned.substring(0, 8)
  }
}

