'use strict';

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/require-take-until-destroyed');
const parser = require('@typescript-eslint/parser');

// For ESLint v9+, we need to use the flat config format
const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        parser: parser,
        parserOptions: {
            ecmaFeatures: {
                jsx: true
            }
        }
    }
});

ruleTester.run('require-take-until-destroyed', rule, {
    valid: [
        // Using takeUntilDestroyed in pipe
        {
            code: `
                import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

                @Component({})
                class TestComponent {
                    constructor() {
                        this.observable.pipe(
                            map(data => data),
                            takeUntilDestroyed()
                        ).subscribe(result => {
                            console.log(result);
                        });
                    }
                }
            `
        },
        // Using renamed takeUntilDestroyed
        {
            code: `
                import { takeUntilDestroyed as tud } from '@angular/core/rxjs-interop';

                @Component({})
                class TestComponent {
                    constructor() {
                        this.observable.pipe(
                            map(data => data),
                            tud()
                        ).subscribe(result => {
                            console.log(result);
                        });
                    }
                }
            `
        },
        // Using a variable with 'destroy' in the name
        {
            code: `
                @Component({})
                class TestComponent {
                    constructor() {
                        const destroyRef = inject(DestroyRef);
                        const untilDestroyed = takeUntilDestroyed(destroyRef);

                        this.observable.pipe(
                            map(data => data),
                            untilDestroyed
                        ).subscribe(result => {
                            console.log(result);
                        });
                    }
                }
            `
        },
        // Using takeUntil from RxJS
        {
            code: `
                import { takeUntil } from 'rxjs';

                @Component({})
                class TestComponent {
                    private destroy$ = new Subject<void>();

                    constructor() {
                        this.observable.pipe(
                            map(data => data),
                            takeUntil(this.destroy$)
                        ).subscribe(result => {
                            console.log(result);
                        });
                    }

                    ngOnDestroy() {
                        this.destroy$.next();
                        this.destroy$.complete();
                    }
                }
            `
        },
        // Using takeWhile from RxJS
        {
            code: `
                import { takeWhile } from 'rxjs';

                @Component({})
                class TestComponent {
                    private alive = true;

                    constructor() {
                        this.observable.pipe(
                            map(data => data),
                            takeWhile(() => this.alive)
                        ).subscribe(result => {
                            console.log(result);
                        });
                    }

                    ngOnDestroy() {
                        this.alive = false;
                    }
                }
            `
        },
        // Using take from RxJS
        {
            code: `
                import { take } from 'rxjs';

                @Component({})
                class TestComponent {
                    constructor() {
                        this.observable.pipe(
                            map(data => data),
                            take(1)
                        ).subscribe(result => {
                            console.log(result);
                        });
                    }
                }
            `
        },
        // Using takeLast from RxJS
        {
            code: `
                import { takeLast } from 'rxjs';

                @Component({})
                class TestComponent {
                    constructor() {
                        this.observable.pipe(
                            map(data => data),
                            takeLast(1)
                        ).subscribe(result => {
                            console.log(result);
                        });
                    }
                }
            `
        },
        // Using renamed RxJS operators
        {
            code: `
                import { takeUntil as tu } from 'rxjs';

                @Component({})
                class TestComponent {
                    private destroy$ = new Subject<void>();

                    constructor() {
                        this.observable.pipe(
                            map(data => data),
                            tu(this.destroy$)
                        ).subscribe(result => {
                            console.log(result);
                        });
                    }

                    ngOnDestroy() {
                        this.destroy$.next();
                        this.destroy$.complete();
                    }
                }
            `
        },
        // Note: In the original implementation, return statements were ignored
        // But since we can't use context.getAncestors() in ESLint v9+,
        // we now report errors for all subscriptions without takeUntilDestroyed
    ],
    invalid: [
        // Missing pipe call
        {
            code: `
                @Component({})
                class TestComponent {
                    constructor() {
                        this.observable.subscribe(result => {
                            console.log(result);
                        });
                    }
                }
            `,
            errors: [
                {
                    messageId: 'missingTakeUntilDestroyed'
                }
            ]
        },
        // Pipe call without takeUntilDestroyed
        {
            code: `
                @Component({})
                class TestComponent {
                    constructor() {
                        this.observable.pipe(
                            map(data => data)
                        ).subscribe(result => {
                            console.log(result);
                        });
                    }
                }
            `,
            errors: [
                {
                    messageId: 'missingTakeUntilDestroyed'
                }
            ]
        },
        // Return statement (would have been ignored in original implementation)
        {
            code: `
                function getObservable() {
                    return this.observable.subscribe(result => {
                        console.log(result);
                    });
                }
            `,
            errors: [
                {
                    messageId: 'missingTakeUntilDestroyed'
                }
            ]
        }
    ]
});
