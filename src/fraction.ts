type RepeatingDecimal = {
  integer: number;
  nonRepeating?: number;
  repeating?: number;
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
        fraction = Fraction.parseFractionText(topOrStr);
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
      topOrStr = Math.round(topOrStr);
      bottom = Math.round(bottom);
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
  value() {
    return (this.sign * this.top) / this.bottom;
  }

  static #getNaN(): [number, number, 1] {
    return [NaN, NaN, 1];
  }

  static isNaN(fraction: Fraction) {
    return Number.isNaN(fraction.top) || Number.isNaN(fraction.bottom);
  }

  static #gcd(a: number, b: number): number {
    if (b === 0) return a;
    return Fraction.#gcd(b, a % b);
  }

  static #getNumberLength(num: number): number {
    const [_, digitStr] = num.toExponential().split('e');
    return Number(digitStr) + 1;
  }
  /**
   * reduce the fraction and return a new fraction
   */
  static reduce(fraction: Fraction): Fraction {
    const gcdVal = Fraction.#gcd(fraction.top, fraction.bottom);
    return new Fraction(
      (fraction.sign * fraction.top) / gcdVal,
      fraction.bottom / gcdVal
    );
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

  equals(fraction: Fraction | number): boolean {
    if (typeof fraction === 'number') {
      return this.equals(new Fraction(fraction, 1));
    }
    const reducedFracThis = Fraction.reduce(this);
    const reducedFrac = Fraction.reduce(fraction);
    return (
      reducedFracThis.top === reducedFrac.top &&
      reducedFracThis.bottom === reducedFrac.bottom &&
      reducedFracThis.sign === reducedFrac.sign
    );
  }

  greaterThan(fraction: Fraction | number): boolean {
    if (typeof fraction === 'number') {
      return this.reduced().value() > fraction;
    }
    return this.reduced().value() > fraction.reduced().value();
  }

  lessThan(fraction: Fraction | number): boolean {
    if (typeof fraction === 'number') {
      return this.reduced().value() < fraction;
    }
    return this.reduced().value() < fraction.reduced().value();
  }

  /**
   * add two fractions and return a new fraction.
   * finally, reduce the fraction
   */
  add(fraction: Fraction): Fraction {
    const top = this.top * fraction.bottom + fraction.top * this.bottom;
    const bottom = this.bottom * fraction.bottom;
    return new Fraction(top, bottom).reduced();
  }

  /**
   * subtract two fractions and return a new fraction
   * finally, reduce the fraction
   */
  sub(fraction: Fraction): Fraction {
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
    return /^\s*-?\s*\d+\s*\/\s*-?\s*\d+\s*$/.test(text);
  }

  static parseFractionText(text: string): Fraction | undefined {
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
    const {
      integer: integerStr,
      nonRepeating: nonRepeatingStr,
      repeating: repeatingStr,
    } = match.groups;
    const integer = Number(integerStr);
    const nonRepeating = nonRepeatingStr ? Number(nonRepeatingStr) : undefined;
    const repeating = repeatingStr ? Number(repeatingStr) : undefined;
    if ([integer, nonRepeating, repeating].some(Number.isNaN)) return undefined;

    return { integer, nonRepeating, repeating };
  }

  static fromRepeatingDecimal(repeatingDecimal: RepeatingDecimal): Fraction | undefined {
    const { integer, nonRepeating, repeating } = repeatingDecimal;
    const integerFraction = new Fraction(integer, 1);

    const nonRepeatingLength = nonRepeating ? Fraction.#getNumberLength(nonRepeating) : 0;
    const nonRepeatingFraction = nonRepeating
      ? new Fraction(nonRepeating, 10 ** nonRepeatingLength)
      : new Fraction(0, 1);

    const repeatingLength = repeating ? Fraction.#getNumberLength(repeating) : 0;
    const repeatingFraction = repeating
      ? new Fraction(
          repeating,
          10 ** (repeatingLength + nonRepeatingLength) - 10 ** nonRepeatingLength
        )
      : new Fraction(0, 1);

    return integerFraction.add(nonRepeatingFraction).add(repeatingFraction);
  }
}

export { Fraction, RepeatingDecimal };
