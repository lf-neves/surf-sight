import { GraphQLScalarType, Kind } from 'graphql';

// DateTime scalar
export const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      return value;
    }
    throw new Error('DateTime cannot serialize non-Date value.');
  },
  parseValue(value: unknown): Date {
    if (typeof value === 'string') {
      return new Date(value);
    }
    throw new Error('DateTime cannot parse non-string value.');
  },
  parseLiteral(ast): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    throw new Error('DateTime can only parse string literals.');
  },
});

// JSON scalar
export const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value: unknown): any {
    return value;
  },
  parseValue(value: unknown): any {
    return value;
  },
  parseLiteral(ast): any {
    switch (ast.kind) {
      case Kind.STRING:
      case Kind.BOOLEAN:
        return ast.value;
      case Kind.INT:
      case Kind.FLOAT:
        return parseFloat(ast.value);
      case Kind.OBJECT: {
        const value: any = {};
        ast.fields.forEach((field) => {
          value[field.name.value] = JSONScalar.parseLiteral(field.value);
        });
        return value;
      }
      case Kind.LIST:
        return ast.values.map((v) => JSONScalar.parseLiteral(v));
      default:
        return null;
    }
  },
});

