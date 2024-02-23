import { Fraction, RepeatingDecimal } from './index';

describe('Fraction', () => {
  test('Fraction constructor test.give two numbers', () => {
    const fraction1 = new Fraction(3, 5);
    expect(fraction1.top).toBe(3);
    expect(fraction1.bottom).toBe(5);
    expect(fraction1.sign).toBe(1);

    const fraction2 = new Fraction(-3, 5);
    expect(fraction2.top).toBe(3);
    expect(fraction2.bottom).toBe(5);
    expect(fraction2.sign).toBe(-1);
  });

  test('Fraction constructor return NaN Faction when bottom is 0', () => {
    const fraction = new Fraction(3, 0);
    expect(fraction.top).toBeNaN();
    expect(fraction.bottom).toBeNaN();
    expect(fraction.sign).toBe(1);
  });

  test('Fraction constructor test. give a fraction text like "3/5"', () => {
    const fraction = Fraction.fromString('3/5');
    expect(fraction.top).toBe(3);
    expect(fraction.bottom).toBe(5);
    expect(fraction.sign).toBe(1);

    const fraction2 = Fraction.fromString('-3/5');
    expect(fraction2.top).toBe(3);
    expect(fraction2.bottom).toBe(5);
    expect(fraction2.sign).toBe(-1);

    const fraction3 = Fraction.fromString('123/-5');
    expect(fraction3.top).toBe(123);
    expect(fraction3.bottom).toBe(5);
    expect(fraction3.sign).toBe(-1);

    const fraction4 = Fraction.fromString('1e2/1e7');
    expect(fraction4.top).toBe(100);
    expect(fraction4.bottom).toBe(10000000);
    expect(fraction4.sign).toBe(1);

    const fraction5 = Fraction.fromString('1.2/2.4');
    expect(fraction5.top).toBe(1.2);
    expect(fraction5.bottom).toBe(2.4);
    expect(fraction5.sign).toBe(1);
  });

  test('Fraction constructor test.give a decimal like 12.34(567)', () => {
    const fraction1 = Fraction.fromString('0.(3)');
    expect(fraction1.top).toBe(1);
    expect(fraction1.bottom).toBe(3);
    expect(fraction1.sign).toBe(1);

    const fraction2 = Fraction.fromString('0.(142857)');
    expect(fraction2.top).toBe(1);
    expect(fraction2.bottom).toBe(7);
    expect(fraction2.sign).toBe(1);

    const fraction3 = Fraction.fromString('0.142857(142857)');
    expect(fraction3.top).toBe(1);
    expect(fraction3.bottom).toBe(7);
    expect(fraction3.sign).toBe(1);

    const fraction4 = Fraction.fromString('1.2(0)');
    expect(fraction4.top).toBe(6);
    expect(fraction4.bottom).toBe(5);
    expect(fraction4.sign).toBe(1);

    const fraction5 = Fraction.fromString('-1.(3)');
    expect(fraction5.top).toBe(4);
    expect(fraction5.bottom).toBe(3);
    expect(fraction5.sign).toBe(-1);

    const fraction6 = Fraction.fromString('  -1.125  ');
    expect(fraction6.top).toBe(9);
    expect(fraction6.bottom).toBe(8);
    expect(fraction6.sign).toBe(-1);
  });

  test('one fraction equals another', () => {
    const fraction1 = new Fraction(3, 5);
    const fraction2 = Fraction.fromString('3/5');
    expect(fraction1.equals(fraction2)).toBe(true);

    const fraction3 = new Fraction(3, 5);
    const fraction4 = new Fraction(27, 45);
    expect(fraction3.equals(fraction4)).toBe(true);

    const fraction5 = new Fraction(3, 5);
    const fraction6 = new Fraction(3, 6);
    expect(fraction5.equals(fraction6)).toBe(false);
  });

  test('one fraction is greater than another', () => {
    const fraction1 = new Fraction(3, 5);
    const fraction2 = new Fraction(4, 5);
    expect(fraction1.greaterThan(fraction2)).toBe(false);
    expect(fraction2.greaterThan(fraction1)).toBe(true);

    const fraction3 = new Fraction(3, 5);
    const fraction4 = new Fraction(3, 6);
    expect(fraction3.greaterThan(fraction4)).toBe(true);
    expect(fraction4.greaterThan(fraction3)).toBe(false);

    const fraction5 = new Fraction(1, 2);
    const fraction6 = 0.499999999999;
    expect(fraction5.greaterThan(fraction6)).toBe(true);
  });

  test('one fraction is less than another', () => {
    const fraction1 = new Fraction(3, 5);
    const fraction2 = new Fraction(4, 5);
    expect(fraction1.lessThan(fraction2)).toBe(true);
    expect(fraction2.lessThan(fraction1)).toBe(false);

    const fraction3 = new Fraction(3, 5);
    const fraction4 = new Fraction(3, 6);
    expect(fraction3.lessThan(fraction4)).toBe(false);
    expect(fraction4.lessThan(fraction3)).toBe(true);

    const fraction5 = new Fraction(1, 2);
    const fraction6 = 0.499999999999;
    expect(fraction5.lessThan(fraction6)).toBe(false);
  });

  test('can calculate if top or bottom is not integer', () => {
    const fraction = new Fraction(3.5, 5);
    expect(fraction.added(new Fraction(3.5, 5))).toStrictEqual(new Fraction(7, 5));

    const fraction2 = new Fraction(3, 5.5);
    expect(fraction2.added(new Fraction(3, 5.5))).toStrictEqual(new Fraction(6, 5.5));
  });

  test('isReduced test', () => {
    const fraction1 = new Fraction(1, 3);
    expect(fraction1.isReduced()).toBe(true);

    const fraction2 = new Fraction(3, 9);
    expect(fraction2.isReduced()).toBe(false);
  });

  test('calc method test', () => {
    const frac1 = new Fraction(1, 3);
    const frac2 = new Fraction(2, 3);
    const frac3 = new Fraction(-1, 3);

    expect(frac1.added(frac2)).toStrictEqual(new Fraction(1, 1));
    expect(frac1.added(frac3)).toStrictEqual(new Fraction(0, 1));

    expect(frac1.subtracted(frac2)).toStrictEqual(new Fraction(-1, 3));
    expect(frac1.subtracted(frac3)).toStrictEqual(new Fraction(2, 3));

    expect(frac1.multiplied(frac2)).toStrictEqual(new Fraction(2, 9));
    expect(frac1.multiplied(frac3)).toStrictEqual(new Fraction(-1, 9));

    expect(frac1.divided(frac2)).toStrictEqual(new Fraction(1, 2));
    expect(frac1.divided(frac3)).toStrictEqual(new Fraction(-1, 1));
  });

  test('calc method test with zero', () => {
    const frac1 = new Fraction(0, 3);
    const frac2 = new Fraction(2, 3);

    expect(frac1.added(frac2)).toStrictEqual(new Fraction(2, 3));
    expect(frac1.subtracted(frac2)).toStrictEqual(new Fraction(-2, 3));
    expect(frac1.multiplied(frac2)).toStrictEqual(new Fraction(0, 1));
    expect(frac1.divided(frac2)).toStrictEqual(new Fraction(0, 1));
  });
});
