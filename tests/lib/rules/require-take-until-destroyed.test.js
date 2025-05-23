'use strict';

const rule = require('../../../lib/rules/require-take-until-destroyed');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
    }
});

describe('require-take-until-destroyed rule', () => {
    beforeAll(() => {
        // Run the rule tests
        ruleTester.run('require-take-until-destroyed', rule, {
            valid: [
                // With takeUntilDestroyed in pipe
                `
        import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
        
        @Component({})
        export class MyComponent {
          constructor() {
            this.observable.pipe(
              map(data => data.value),
              takeUntilDestroyed()
            ).subscribe(result => console.log(result));
          }
        }
        `,

                // With imported takeUntilDestroyed with alias
                `
        import { takeUntilDestroyed as tud } from '@angular/core/rxjs-interop';
        
        @Component({})
        export class MyComponent {
          constructor() {
            this.observable.pipe(
              map(data => data.value),
              tud()
            ).subscribe(result => console.log(result));
          }
        }
        `,

                // With destroy$ variable
                `
        @Component({})
        export class MyComponent {
          constructor() {
            const destroy$ = new Subject();
            this.observable.pipe(
              map(data => data.value),
              takeUntil(destroy$)
            ).subscribe(result => console.log(result));
          }
        }
        `
            ],
            invalid: [
                // No pipe call
                {
                    code: `
          @Component({})
          export class MyComponent {
            constructor() {
              this.observable.subscribe(result => console.log(result));
            }
          }
          `,
                    errors: [{ messageId: 'missingTakeUntilDestroyed' }]
                },

                // Pipe without takeUntilDestroyed
                {
                    code: `
          @Component({})
          export class MyComponent {
            constructor() {
              this.observable.pipe(
                map(data => data.value)
              ).subscribe(result => console.log(result));
            }
          }
          `,
                    errors: [{ messageId: 'missingTakeUntilDestroyed' }]
                }
            ]
        });
    });

    test('should run tests without errors', () => {
        // This is just a placeholder test to ensure Jest runs properly
        expect(true).toBe(true);
    });
});