type RepeatingDecimal = {
  integer: string;
  nonRepeating?: string;
  repeating?: string;
};

class Fraction {
  top: number;
  bottom: number;
  sign: -1 | 1;
  constructor(fractionString: string);
  constructor(top: number, bottom: number);
  constructor(topOrStr: number | string, bottom?: number) {
    if (typeof topOrStr === 'string') {
      let fraction: Fraction | undefined;
      if (Fraction.#isFractionText(topOrStr)) {
        fraction = Fraction.fromFractionText(topOrStr);
        if (!fraction) {
          [this.top, this.bottom, this.sign] = Fraction.#getNaN();
          return;
        }
      } else {
        const repeatingDecimal = Fraction.parseRepeatingDecimal(topOrStr);
        if (!repeatingDecimal) {
          [this.top, this.bottom, this.sign] = Fraction.#getNaN();
          return;
        }
        fraction = Fraction.fromRepeatingDecimal(repeatingDecimal);
        if (!fraction) {
          [this.top, this.bottom, this.sign] = Fraction.#getNaN();
          return;
        }
      }
      this.sign = fraction.sign;
      this.top = fraction.top;
      this.bottom = fraction.bottom;
    } else if (typeof topOrStr === 'number' && typeof bottom === 'number') {
      if (bottom === 0) {
        [this.top, this.bottom, this.sign] = Fraction.#getNaN();
        return;
      }
      this.sign = topOrStr * bottom >= 0 ? 1 : -1;
      this.top = Math.abs(topOrStr);
      this.bottom = Math.abs(bottom);
    } else {
      [this.top, this.bottom, this.sign] = Fraction.#getNaN();
    }
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

  static #getNaN(): [number, number, 1] {
    return [NaN, NaN, 1];
  }

  static isNaN(fraction: Fraction) {
    return Number.isNaN(fraction.top) || Number.isNaN(fraction.bottom);
  }

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
      return new Fraction(fraction.top / fraction.bottom, 1);
    }
    if (fraction.bottom % fraction.top === 0) {
      return new Fraction(1, fraction.bottom / fraction.top);
    }
    // 上記の操作が無理で、かつtopやbottomが整数でない場合は、元のfractionを返す
    if (!Number.isInteger(fraction.top) || !Number.isInteger(fraction.bottom)) {
      return new Fraction(fraction.top, fraction.bottom);
    }
    const gcd = Fraction.GCD(fraction.top, fraction.bottom);
    return new Fraction((fraction.sign * fraction.top) / gcd, fraction.bottom / gcd);
  }

  /**
   * reduce the fraction
   */
  reduced(): this {
    const reducedFrac = Fraction.reduce(this);
    this.top = reducedFrac.top;
    this.bottom = reducedFrac.bottom;
    this.sign = reducedFrac.sign;
    return this;
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
      reducedFracThis.top === reducedFrac.top &&
      reducedFracThis.bottom === reducedFrac.bottom &&
      reducedFracThis.sign === reducedFrac.sign
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
  add(fraction: Fraction): Fraction {
    if (this.bottom === fraction.bottom) {
      const top = this.top * fraction.sign + fraction.top * this.sign;
      return new Fraction(top, this.bottom).reduced();
    }
    const top = this.top * fraction.bottom + fraction.top * this.bottom;
    const bottom = this.bottom * fraction.bottom;
    return new Fraction(top, bottom).reduced();
  }

  /**
   * subtract two fractions and return a new fraction
   * finally, reduce the fraction
   */
  sub(fraction: Fraction): Fraction {
    if (this.bottom === fraction.bottom) {
      const top = this.top * fraction.sign - fraction.top * this.sign;
      return new Fraction(top, this.bottom).reduced();
    }
    const top = this.top * fraction.bottom - fraction.top * this.bottom;
    const bottom = this.bottom * fraction.bottom;
    return new Fraction(top, bottom).reduced();
  }

  /**
   * multiply two fractions and return a new fraction
   * finally, reduce the fraction
   */
  mul(fraction: Fraction): Fraction {
    const top = this.top * fraction.top;
    const bottom = this.bottom * fraction.bottom;
    return new Fraction(top, bottom).reduced();
  }

  /**
   * divide two fractions and return a new fraction
   * finally, reduce the fraction
   */
  div(fraction: Fraction): Fraction {
    const top = this.top * fraction.bottom;
    const bottom = this.bottom * fraction.top;
    return new Fraction(top, bottom).reduced();
  }

  static #isFractionText(text: string): boolean {
    return /^[^/]+\/[^/]+$$/.test(text);
  }

  static fromFractionText(text: string): Fraction | undefined {
    const [top, bottom] = text.split('/').map(Number);
    if ([top, bottom].some(Number.isNaN) || bottom === 0) {
      return undefined;
    }
    return new Fraction(top, bottom);
  }

  static parseRepeatingDecimal(text: string): RepeatingDecimal | undefined {
    const regex =
      /^(?<integer>[^.]+)(\.(?<nonRepeating>[^\(\).]+)?(\((?<repeating>[^\(\).]+)\))?)?$/;
    const match = text.trim().match(regex);
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

    return { integer, nonRepeating, repeating };
  }

  static getDecimalPart(num: number) {
    return num - (num >= 0 ? Math.floor(num) : Math.ceil(num));
  }

  static fromRepeatingDecimal(repeatingDecimal: RepeatingDecimal): Fraction | undefined {
    const { integer, nonRepeating, repeating } = repeatingDecimal;
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
    return integerFraction.add(nonRepeatingFraction).add(repeatingFraction);
  }
}

export { Fraction, RepeatingDecimal };
