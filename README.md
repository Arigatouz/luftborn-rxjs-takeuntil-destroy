# luftborn-rxjs-takeuntill-destroy

An ESLint plugin that enforces the use of `takeUntilDestroyed` or other take operators in RxJS subscription pipes to prevent memory leaks in Angular applications.

## Description

This ESLint rule helps prevent memory leaks in Angular applications by ensuring that all Observable subscriptions use either the `takeUntilDestroyed` operator from `@angular/core/rxjs-interop` or one of the RxJS take operators (`takeUntil`, `takeWhile`, `take`, `takeLast`). These operators ensure that subscriptions are properly terminated, preventing memory leaks.

## Installation

```bash
npm install luftborn-rxjs-takeuntill-destroy --save-dev
```

## Requirements

- ESLint 6.0.0 or higher (compatible with ESLint 9+)
- Node.js 14.0.0 or higher
- Angular 16.0.0 or higher (for @angular/core/rxjs-interop)
- RxJS 7.0.0 or higher

## Usage

Add the plugin to your ESLint configuration:

### ESLint Config (eslintrc.js / eslintrc.json)

```json
{
  "plugins": ["luftborn-rxjs-takeuntill-destroy"],
  "rules": {
    "luftborn-rxjs-takeuntill-destroy/require-take-until-destroyed": "error"
  }
}
```

### ESLint Flat Config (eslint.config.js)

```js
const luftbornRxjsTakeuntillDestroy = require('luftborn-rxjs-takeuntill-destroy');

module.exports = [
  {
    plugins: {
      'luftborn-rxjs-takeuntill-destroy': luftbornRxjsTakeuntillDestroy
    },
    rules: {
      'luftborn-rxjs-takeuntill-destroy/require-take-until-destroyed': 'error'
    }
  }
];
```

## Rule Details

The `require-take-until-destroyed` rule enforces that all Observable subscriptions use either the `takeUntilDestroyed` operator or one of the RxJS take operators (`takeUntil`, `takeWhile`, `take`, `takeLast`) to ensure subscriptions are properly terminated, preventing memory leaks.

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

// Using takeUntil from RxJS
import { takeUntil } from 'rxjs';

destroy$ = new Subject<void>();

this.observable.pipe(
  map(data => data),
  takeUntil(this.destroy$)
).subscribe(result => {
  console.log(result);
});

// Using takeWhile from RxJS
import { takeWhile } from 'rxjs';

alive = true;

this.observable.pipe(
  map(data => data),
  takeWhile(() => this.alive)
).subscribe(result => {
  console.log(result);
});

// Using take from RxJS
import { take } from 'rxjs';

this.observable.pipe(
  map(data => data),
  take(1)
).subscribe(result => {
  console.log(result);
});

// Using takeLast from RxJS
import { takeLast } from 'rxjs';

this.observable.pipe(
  map(data => data),
  takeLast(1)
).subscribe(result => {
  console.log(result);
});
```

## Rule Options

This rule has no options.

## Implementation Details

The rule checks for:

1. Observable subscriptions without a pipe call
2. Observable subscriptions with a pipe call but missing any of the supported take operators
3. Proper import and usage of the `takeUntilDestroyed` operator from `@angular/core/rxjs-interop`
4. Proper import and usage of RxJS take operators (`takeUntil`, `takeWhile`, `take`, `takeLast`) from 'rxjs'

The rule recognizes:
- Renamed imports for all supported operators
- Variables that might contain any of the supported operators
- Various patterns for subscription cleanup

## License

MIT © Luftborn

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository https://github.com/Arigatouz/luftborn-rxjs-takeuntill-destroy
2. Create your feature branch (`git switch -c feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
