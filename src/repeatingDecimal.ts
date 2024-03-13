import { sign } from 'type';

export class RepeatingDecimal {
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
