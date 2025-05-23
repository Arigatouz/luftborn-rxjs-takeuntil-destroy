'use strict';

module.exports = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Enforce using takeUntilDestroyed or other take operators in subscription pipes',
            category: 'Best Practices',
            recommended: true,
        },
        fixable: null,
        schema: [],
        messages: {
            missingTakeUntilDestroyed: 'Subscription is missing a take operator (takeUntilDestroyed, takeUntil, takeWhile, take, takeLast) to prevent memory leaks'
        }
    },
    create(context) {
        // Track imported takeUntilDestroyed aliases
        const takeUntilDestroyedAliases = new Set(['takeUntilDestroyed']);

        // Track imported RxJS take operators
        const rxjsTakeOperators = new Set(['takeUntil', 'takeWhile', 'take', 'takeLast']);
        const rxjsTakeOperatorAliases = new Set([...rxjsTakeOperators]);

        return {
            // Track import aliases
            ImportDeclaration(node) {
                if (node.source.value === '@angular/core/rxjs-interop') {
                    node.specifiers.forEach(specifier => {
                        if (specifier.type === 'ImportSpecifier' &&
                            specifier.imported &&
                            specifier.imported.name === 'takeUntilDestroyed') {
                            takeUntilDestroyedAliases.add(specifier.local.name);
                        }
                    });
                }

                // Track RxJS take operators
                if (node.source.value === 'rxjs' || node.source.value === 'rxjs/operators') {
                    node.specifiers.forEach(specifier => {
                        if (specifier.type === 'ImportSpecifier' &&
                            specifier.imported &&
                            rxjsTakeOperators.has(specifier.imported.name)) {
                            rxjsTakeOperatorAliases.add(specifier.local.name);
                        }
                    });
                }
            },

            // Look for subscription calls
            'CallExpression[callee.property.name="subscribe"]'(node) {
                // In ESLint v9+, we don't have access to getAncestors()
                // So we'll just check for pipe calls with takeUntilDestroyed or other take operators

                // Note: This means we won't be able to skip subscriptions in return statements
                // or nested subscriptions, but that's a reasonable trade-off for compatibility

                // Find if there's a pipe call before the subscribe
                const pipeCall = findPipeCallBeforeSubscribe(node.callee.object);

                // If there's no pipe call, report an error
                if (!pipeCall) {
                    context.report({
                        node,
                        messageId: 'missingTakeUntilDestroyed'
                    });
                    return;
                }

                // Check if takeUntilDestroyed or other take operators are in the pipe arguments
                const hasTakeOperator = checkForTakeOperatorsInPipe(
                    pipeCall, 
                    takeUntilDestroyedAliases,
                    rxjsTakeOperatorAliases
                );

                if (!hasTakeOperator) {
                    context.report({
                        node,
                        messageId: 'missingTakeUntilDestroyed'
                    });
                }
            }
        };
    }
};

// Helper function to determine if we're inside a subscription callback
// Note: This function is no longer used since we don't have access to ancestors in ESLint v9+
// Keeping it commented out for reference
/*
function isInsideSubscriptionCallback(node, ancestors) {
    return ancestors.some(ancestor =>
        ancestor.type === 'CallExpression' &&
        ancestor.callee &&
        ancestor.callee.type === 'MemberExpression' &&
        ancestor.callee.property &&
        ancestor.callee.property.name === 'subscribe'
    );
}
*/

// Helper function to find a pipe call in the chain before subscribe
function findPipeCallBeforeSubscribe(objectExpr) {
    if (!objectExpr) return null;

    // Direct pipe call
    if (objectExpr.type === 'CallExpression' &&
        objectExpr.callee &&
        objectExpr.callee.type === 'MemberExpression' &&
        objectExpr.callee.property &&
        objectExpr.callee.property.name === 'pipe') {
        return objectExpr;
    }

    return null;
}

// Helper function to check for takeUntilDestroyed or other take operators in pipe arguments
function checkForTakeOperatorsInPipe(pipeCall, takeUntilDestroyedAliases, rxjsTakeOperatorAliases) {
    if (!pipeCall || !pipeCall.arguments || !pipeCall.arguments.length) {
        return false;
    }

    return pipeCall.arguments.some(arg => {
        // Direct call to takeUntilDestroyed() or an alias
        if (arg.type === 'CallExpression' &&
            arg.callee &&
            arg.callee.type === 'Identifier' &&
            (takeUntilDestroyedAliases.has(arg.callee.name) || rxjsTakeOperatorAliases.has(arg.callee.name))) {
            return true;
        }

        // Reference to a variable that might contain takeUntilDestroyed
        if (arg.type === 'Identifier') {
            // This is a best effort check - we can't track variable assignments fully
            // without more complex scope analysis
            return arg.name.includes('destroy') ||
                arg.name.includes('Destroy') ||
                arg.name.includes('unsubscribe') ||
                arg.name.includes('Unsubscribe') ||
                arg.name.includes('take');
        }

        // Call using imported takeUntilDestroyed or RxJS take operators from some module
        if (arg.type === 'CallExpression' &&
            arg.callee &&
            arg.callee.type === 'MemberExpression' &&
            arg.callee.property &&
            (takeUntilDestroyedAliases.has(arg.callee.property.name) || rxjsTakeOperatorAliases.has(arg.callee.property.name))) {
            return true;
        }

        return false;
    });
}

// Keep the old function for backward compatibility
function checkForTakeUntilDestroyedInPipe(pipeCall, takeUntilDestroyedAliases) {
    return checkForTakeOperatorsInPipe(pipeCall, takeUntilDestroyedAliases, new Set());
}
