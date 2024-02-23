type sign = -1 | 1;

// type RepeatingDecimal = {
//   integer: string;
//   nonRepeating?: string;
//   repeating?: string;
//   sign: sign;
// };

class RepeatingDecimal {
  private constructor(
    private _sign: sign,
    private _integer: string,
    private _nonRepeating?: string,
    private _repeating?: string
  ) {}

  get integer() {
    return this._integer;
  }
  get nonRepeating() {
    return this._nonRepeating;
  }
  get repeating() {
    return this._repeating;
  }
  get sign() {
    return this._sign;
  }

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
  private _top: number;
  private _bottom: number;
  private _sign: sign;
  constructor(top: number, bottom: number) {
    if (bottom === 0) {
      [this._top, this._bottom, this._sign] = Fraction._getNaN();
      return;
    }
    this._sign = top * bottom >= 0 ? 1 : -1;
    this._top = Math.abs(top);
    this._bottom = Math.abs(bottom);
  }

  get top() {
    return this._top;
  }
  get bottom() {
    return this._bottom;
  }
  get sign() {
    return this._sign;
  }

  toString() {
    if (this._bottom === 1) return `${this._sign * this._top}`;
    return `${this._sign * this._top}/${this._bottom}`;
  }
  toNumber() {
    return (this._sign * this._top) / this._bottom;
  }

  isInteger() {
    return this._top % this._bottom === 0;
  }

  /**
   * This cannot use the method of `equals` because it use the method of `reduce`.
   */
  isReduced() {
    const reduced = Fraction.reduce(this);
    return (
      this._top === reduced._top &&
      this._bottom === reduced._bottom &&
      this._sign === reduced._sign
    );
  }

  private static _getNaN(): [number, number, 1] {
    return [NaN, NaN, 1];
  }

  private static _getNaNFraction(): Fraction {
    const fraction = new Fraction(0, 0);
    [fraction._top, fraction._bottom, fraction._sign] = Fraction._getNaN();
    return fraction;
  }

  static isNaN(fraction: Fraction) {
    return Number.isNaN(fraction._top) || Number.isNaN(fraction._bottom);
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
    if (fraction._top % fraction._bottom === 0) {
      return new Fraction(fraction._top / fraction._bottom, 1);
    }
    if (fraction._bottom % fraction._top === 0) {
      return new Fraction(1, fraction._bottom / fraction._top);
    }
    // 上記の操作が無理で、かつtopやbottomが整数でない場合は、元のfractionを返す
    if (!Number.isInteger(fraction._top) || !Number.isInteger(fraction._bottom)) {
      return new Fraction(fraction._top, fraction._bottom);
    }
    const gcd = Fraction.GCD(fraction._top, fraction._bottom);
    return new Fraction((fraction._sign * fraction._top) / gcd, fraction._bottom / gcd);
  }

  /**
   * reduce the fraction
   */
  reduced(): Fraction {
    return Fraction.reduce(this);
  }

  /**
   * compare two fractions.
   * if the fraction is a number, compare the value of the fraction.
   * if the fraction is a fraction, compare the reduced fraction.
   */
  equals(fraction: Fraction | number): boolean {
    if (typeof fraction === 'number') {
      return this.reduced().toNumber() === fraction;
    }
    const reducedFracThis = Fraction.reduce(this);
    const reducedFrac = Fraction.reduce(fraction);
    return (
      reducedFracThis._top === reducedFrac._top &&
      reducedFracThis._bottom === reducedFrac._bottom &&
      reducedFracThis._sign === reducedFrac._sign
    );
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
    const left = this._top * this._sign * fraction._bottom;
    const right = fraction._top * fraction._sign * this._bottom;
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
    const left = this._top * this._sign * fraction._bottom;
    const right = fraction._top * fraction._sign * this._bottom;
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
    if (this._bottom === fraction._bottom) {
      const top = this._top * fraction._sign + fraction._top * this._sign;
      return new Fraction(top, this._bottom).reduced();
    }
    const top = this._top * fraction._bottom + fraction._top * this._bottom;
    const bottom = this._bottom * fraction._bottom;
    return new Fraction(top, bottom).reduced();
  }

  subtracted(fraction: Fraction): Fraction {
    const sign = -1 * fraction._sign;
    return this.added(new Fraction(sign * fraction._top, fraction._bottom));
  }

  /**
   * multiply two fractions and return a new fraction
   * finally, reduce the fraction
   */
  multiplied(fraction: Fraction): Fraction {
    const top = this._top * fraction._top;
    const bottom = this._bottom * fraction._bottom;
    return new Fraction(top, bottom).reduced();
  }

  /**
   * divide two fractions and return a new fraction
   * finally, reduce the fraction
   */
  divided(fraction: Fraction): Fraction {
    return this.multiplied(
      new Fraction(fraction._sign * fraction._bottom, fraction._top)
    );
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

  private static _getDecimalPart(num: number) {
    return num - (num >= 0 ? Math.floor(num) : Math.ceil(num));
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
      .added(repeatingFraction);
    returnFraction._sign = sign;
    return returnFraction;
  }
}

export { Fraction, RepeatingDecimal };
