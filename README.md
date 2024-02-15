# Fraction Library

## Overview
This TypeScript library provides a robust solution for managing fractions, enabling their creation, manipulation, and conversion with ease. It is designed to handle both simple and complex fraction operations.

## Features
- **Fraction Creation**: Create fractions from strings or numerical inputs.
- **Advanced Operations**: Perform arithmetic operations with fractions.
- **Conversion**: Convert fractions to decimals, including handling of repeating decimals.

## Types

### `RepeatingDecimal`
A type representing a decimal number that may have repeating digits. It consists of:
- `integer`: The integer part of the decimal.
- `nonRepeating`: The non-repeating part of the decimal, if any.
- `repeating`: The repeating part of the decimal, if any.

## Classes

### `Fraction`
A class that represents a fraction. It supports operations such as addition, subtraction, multiplication, and division.

#### Constructors
- `constructor(fractionString: string)`: Create a fraction from a string representation.
  - like "1/2","1.23(456)"
  - If invalid string is passed, top and bottom are set to `NaN`
- `constructor(top: number, bottom: number)`: Create a fraction using numerator and denominator.
  - If 0 is passed as bottom, top and bottom are set to `NaN`

### Basic Usage
```typescript
// Example of creating a fraction from a string
const fractionFromString = new Fraction("1/2");

// Example of creating a fraction with numerator and denominator
const fractionFromNumbers = new Fraction(1, 2);

// Example of creating a fraction from a repeating decimal
const fractionFromRepeatingDecimal = new Fraction("0.5");
```

## License
MIT
