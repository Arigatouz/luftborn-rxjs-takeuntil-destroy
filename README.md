# es-lint-rule-package

An ESLint plugin that enforces the use of `takeUntilDestroyed` operator in RxJS subscription pipes to prevent memory leaks in Angular applications.

## Description

This ESLint rule helps prevent memory leaks in Angular applications by ensuring that all Observable subscriptions use the `takeUntilDestroyed` operator from `@angular/core/rxjs-interop`. This operator automatically unsubscribes from Observables when the component or service is destroyed, preventing memory leaks.

## Installation

```bash
npm install es-lint-rule-package --save-dev
```

## Requirements

- ESLint 6.0.0 or higher (compatible with ESLint 9+)
- Node.js 14.0.0 or higher

## Usage

Add the plugin to your ESLint configuration:

### ESLint Config (eslintrc.js)

```js
module.exports = {
  plugins: ['es-lint-rule-package'],
  rules: {
    'es-lint-rule-package/require-take-until-destroyed': 'error'
  }
};
```

### ESLint Flat Config (eslint.config.js)

```js
const eslintRulePackage = require('es-lint-rule-package');

module.exports = [
  {
    plugins: {
      'es-lint-rule-package': eslintRulePackage
    },
    rules: {
      'es-lint-rule-package/require-take-until-destroyed': 'error'
    }
  }
];
```

## Rule Details

The `require-take-until-destroyed` rule enforces that all Observable subscriptions use the `takeUntilDestroyed` operator to automatically unsubscribe when the component or service is destroyed.

### Examples

#### ❌ Incorrect

```typescript
// Missing takeUntilDestroyed operator
this.observable.subscribe(result => {
  console.log(result);
});

// Using pipe but missing takeUntilDestroyed
this.observable.pipe(
  map(data => data)
).subscribe(result => {
  console.log(result);
});
```

#### ✅ Correct

```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Using takeUntilDestroyed in pipe
this.observable.pipe(
  map(data => data),
  takeUntilDestroyed()
).subscribe(result => {
  console.log(result);
});

// Using renamed import
import { takeUntilDestroyed as tud } from '@angular/core/rxjs-interop';

this.observable.pipe(
  map(data => data),
  tud()
).subscribe(result => {
  console.log(result);
});

// Using a variable with 'destroy' in the name
const destroyRef = inject(DestroyRef);
const untilDestroyed = takeUntilDestroyed(destroyRef);

this.observable.pipe(
  map(data => data),
  untilDestroyed
).subscribe(result => {
  console.log(result);
});
```

## Rule Options

This rule has no options.

## Implementation Details

The rule checks for:

1. Observable subscriptions without a pipe call
2. Observable subscriptions with a pipe call but missing the `takeUntilDestroyed` operator
3. Proper import and usage of the `takeUntilDestroyed` operator from `@angular/core/rxjs-interop`

The rule also recognizes renamed imports and variables that might contain the `takeUntilDestroyed` operator.

## License

MIT © Luftborn

