import { sign } from 'type';
class RepeatingDecimal {
  // 特にnonRepeatingやrepeatingについて、stringにしないと先頭に0があったときに桁数が変わってしまうため、stringで保持する
  private constructor(
    public readonly sign: sign,
    public readonly integer: string,
    public readonly nonRepeating?: string,
    public readonly repeating?: string
  ) {}

  /**
   *
   * @param decimalString - 1.23(456)
   * @returns - if invalid string is given, return undefined.
   */
  public static fromString(decimalString: string): RepeatingDecimal | undefined {
    const regex =
      /^(?<integer>[^.]+)(\.(?<nonRepeating>[^\(\).]+)?(\((?<repeating>[^\(\).]+)\))?)?$/;
    const match = decimalString.trim().match(regex);
    if (!match?.groups) return undefined;
    const { integer, nonRepeating, repeating } = match.groups;
    if (
      [integer, nonRepeating, repeating]
        .filter((s) => s !== undefined)
        .map(Number)
        .some(Number.isNaN)
    ) {
      return undefined;
    }
    const sign = integer.trim().startsWith('-') ? -1 : 1;
    const replacedInt = integer.replace(/^-/, '');
    return new RepeatingDecimal(sign, replacedInt, nonRepeating, repeating);
  }
}

class Fraction {
  public readonly top: number;
  public readonly bottom: number;
  public readonly sign: sign;
  constructor(top: number, bottom: number) {
    if (bottom === 0 || [top, bottom].some(Number.isNaN)) {
      [this.top, this.bottom, this.sign] = Fraction._getNaN();
      return;
    }
    this.sign = top * bottom >= 0 ? 1 : -1;
    this.top = Math.abs(top);
    this.bottom = Math.abs(bottom);
  }

  toString() {
    if (this.bottom === 1) return `${this.sign * this.top}`;
    return `${this.sign * this.top}/${this.bottom}`;
  }
  toNumber() {
    return (this.sign * this.top) / this.bottom;
  }

  isInteger() {
    return this.top % this.bottom === 0;
  }

  isReduced() {
    const reduced = Fraction.reduce(this);
    return this.strictEquals(reduced);
  }

  private static _getNaN(): [number, number, 1] {
    return [NaN, NaN, 1];
  }

  private static _getNaNFraction(): Fraction {
    return new Fraction(NaN, NaN);
  }

  static isNaN(fraction: Fraction) {
    return Number.isNaN(fraction.top) || Number.isNaN(fraction.bottom);
  }

  /**
   * use Euclidean algorithm to get the greatest common divisor
   */
  static GCD(a: number, b: number): number {
    if (b === 0) return a;
    return Fraction.GCD(b, a % b);
  }

  /**
   * reduce the fraction and return a new fraction
   *
   * if top or bottom is not an integer, return the original fraction.
   * because not integer number can't be reduced.
   */
  static reduce(fraction: Fraction): Fraction {
    // topやbottomが整数でない場合でも、topとbottomのどちらかが最大公約数の場合は約分する
    if (fraction.top % fraction.bottom === 0) {
      return new Fraction((fraction.sign * fraction.top) / fraction.bottom, 1);
    }
    if (fraction.bottom % fraction.top === 0) {
      return new Fraction(fraction.sign * 1, fraction.bottom / fraction.top);
    }
    // 上記の操作が無理で、かつtopやbottomが整数でない場合は、元のfractionを返す
    if (!Number.isInteger(fraction.top) || !Number.isInteger(fraction.bottom)) {
      return new Fraction(fraction.sign * fraction.top, fraction.bottom);
    }
    const gcd = Fraction.GCD(fraction.top, fraction.bottom);
    return new Fraction((fraction.sign * fraction.top) / gcd, fraction.bottom / gcd);
  }

  /**
   * reduce the fraction
   */
  reduced(): Fraction {
    return Fraction.reduce(this);
  }

  /**
   * compare two fractions strictly. This function doesn't reduce the fraction.
   * if the fraction is a number, compare the value of the fraction
   * if the fraction is a fraction, compare the reduced fraction
   */
  strictEquals(fraction: Fraction): boolean {
    return (
      this.top === fraction.top &&
      this.bottom === fraction.bottom &&
      this.sign === fraction.sign
    );
  }

  /**
   * compare two fractions. This function reduces the fractions before comparing.
   * if the fraction is a number, compare the value of the fraction.
   * if the fraction is a fraction, compare the reduced fraction.
   */
  equals(fraction: Fraction | number): boolean {
    if (typeof fraction === 'number') {
      return this.reduced().toNumber() === fraction;
    }
    const reducedFracThis = Fraction.reduce(this);
    const reducedFrac = Fraction.reduce(fraction);
    return reducedFracThis.strictEquals(reducedFrac);
  }

  /**
   * compare two fractions
   * if the fraction is a number, compare the value of the fraction
   * if the fraction is a fraction, compare the reduced fraction
   */
  greaterThan(fraction: Fraction | number): boolean {
    if (typeof fraction === 'number') {
      return this.reduced().toNumber() > fraction;
    }
    const left = this.top * this.sign * fraction.bottom;
    const right = fraction.top * fraction.sign * this.bottom;
    return left > right;
  }

  greaterThanOrEquals(fraction: Fraction | number): boolean {
    return this.equals(fraction) || this.greaterThan(fraction);
  }

  /**
   * compare two fractions
   * if the fraction is a number, compare the value of the fraction
   * if the fraction is a fraction, compare the reduced fraction
   */
  lessThan(fraction: Fraction | number): boolean {
    if (typeof fraction === 'number') {
      return this.reduced().toNumber() < fraction;
    }
    const left = this.top * this.sign * fraction.bottom;
    const right = fraction.top * fraction.sign * this.bottom;
    return left < right;
  }

  lessThanOrEquals(fraction: Fraction | number): boolean {
    return this.equals(fraction) || this.lessThan(fraction);
  }

  /**
   * add two fractions and return a new fraction.
   * finally, reduce the fraction
   */
  added(fraction: Fraction): Fraction {
    if (this.bottom === fraction.bottom) {
      const top = this.top * this.sign + fraction.top * fraction.sign;
      return new Fraction(top, this.bottom).reduced();
    }
    const top =
      this.top * this.sign * fraction.bottom + fraction.top * fraction.sign * this.bottom;
    const bottom = this.bottom * fraction.bottom;
    return new Fraction(top, bottom).reduced();
  }

  subtracted(fraction: Fraction): Fraction {
    const sign = -1 * fraction.sign;
    return this.added(new Fraction(sign * fraction.top, fraction.bottom));
  }

  /**
   * multiply two fractions and return a new fraction
   * finally, reduce the fraction
   */
  multiplied(fraction: Fraction): Fraction {
    const top = this.top * fraction.top * this.sign * fraction.sign;
    const bottom = this.bottom * fraction.bottom;
    return new Fraction(top, bottom).reduced();
  }

  /**
   * divide two fractions and return a new fraction
   * finally, reduce the fraction
   */
  divided(fraction: Fraction): Fraction {
    return this.multiplied(new Fraction(fraction.sign * fraction.bottom, fraction.top));
  }

  private static _isFractionText(text: string): boolean {
    return /^[^/]+\/[^/]+$$/.test(text);
  }

  static fromNumber(top: number, bottom: number = 1) {
    return new Fraction(top, bottom);
  }

  static fromString(fractionStr: string): Fraction {
    if (Fraction._isFractionText(fractionStr)) {
      return Fraction._fromFractionText(fractionStr);
    }
    const repeatingDecimal = RepeatingDecimal.fromString(fractionStr);
    if (repeatingDecimal) {
      return Fraction._fromRepeatingDecimal(repeatingDecimal);
    }

    return Fraction._getNaNFraction();
  }

  private static _fromFractionText(text: string): Fraction {
    const [top, bottom] = text.split('/').map(Number);
    if ([top, bottom].some(Number.isNaN) || bottom === 0) {
      return Fraction._getNaNFraction();
    }
    return new Fraction(top, bottom);
  }

  private static _fromRepeatingDecimal(repeatingDecimal: RepeatingDecimal): Fraction {
    const { integer, nonRepeating, repeating, sign } = repeatingDecimal;
    const integerFraction = new Fraction(Number(integer), 1);

    const nonRepeatingLength = nonRepeating ? nonRepeating.length : 0;
    const nonRepeatingFraction = nonRepeating
      ? new Fraction(Number(nonRepeating), 10 ** nonRepeatingLength)
      : new Fraction(0, 1);

    const repeatingLength = repeating ? repeating.length : 0;
    const repeatingFraction = repeating
      ? new Fraction(
          Number(repeating),
          10 ** (repeatingLength + nonRepeatingLength) - 10 ** nonRepeatingLength
        )
      : new Fraction(0, 1);
    const returnFraction = integerFraction
      .added(nonRepeatingFraction)
      .added(repeatingFraction)
      .multiplied(new Fraction(1 * sign, 1));
    return returnFraction;
  }
}

export { Fraction, RepeatingDecimal };
