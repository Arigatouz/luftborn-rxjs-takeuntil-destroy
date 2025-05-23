'use strict';

module.exports = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Enforce using takeUntilDestroyed operator in subscription pipes',
            category: 'Best Practices',
            recommended: true,
        },
        fixable: null,
        schema: [],
        messages: {
            missingTakeUntilDestroyed: 'Subscription is missing takeUntilDestroyed operator to prevent memory leaks'
        }
    },
    create(context) {
        // Track imported takeUntilDestroyed aliases
        const takeUntilDestroyedAliases = new Set(['takeUntilDestroyed']);

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
            },

            // Look for subscription calls
            'CallExpression[callee.property.name="subscribe"]'(node) {
                // Ignore if part of a return statement (likely not in a component context)
                const ancestors = context.getAncestors();
                if (ancestors.some(ancestor => ancestor.type === 'ReturnStatement')) {
                    return;
                }

                // Skip if inside a subscription callback (nested subscriptions are a different issue)
                if (isInsideSubscriptionCallback(node, ancestors)) {
                    return;
                }

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

                // Check if takeUntilDestroyed is in the pipe arguments
                const hasTakeUntilDestroyed = checkForTakeUntilDestroyedInPipe(pipeCall, takeUntilDestroyedAliases);

                if (!hasTakeUntilDestroyed) {
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
function isInsideSubscriptionCallback(node, ancestors) {
    return ancestors.some(ancestor =>
        ancestor.type === 'CallExpression' &&
        ancestor.callee &&
        ancestor.callee.type === 'MemberExpression' &&
        ancestor.callee.property &&
        ancestor.callee.property.name === 'subscribe'
    );
}

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

// Helper function to check for takeUntilDestroyed in pipe arguments
function checkForTakeUntilDestroyedInPipe(pipeCall, takeUntilDestroyedAliases) {
    if (!pipeCall || !pipeCall.arguments || !pipeCall.arguments.length) {
        return false;
    }

    return pipeCall.arguments.some(arg => {
        // Direct call to takeUntilDestroyed() or an alias
        if (arg.type === 'CallExpression' &&
            arg.callee &&
            arg.callee.type === 'Identifier' &&
            takeUntilDestroyedAliases.has(arg.callee.name)) {
            return true;
        }

        // Reference to a variable that might contain takeUntilDestroyed
        if (arg.type === 'Identifier') {
            // This is a best effort check - we can't track variable assignments fully
            // without more complex scope analysis
            return arg.name.includes('destroy') ||
                arg.name.includes('Destroy') ||
                arg.name.includes('unsubscribe') ||
                arg.name.includes('Unsubscribe');
        }

        // Call using imported takeUntilDestroyed from some module
        if (arg.type === 'CallExpression' &&
            arg.callee &&
            arg.callee.type === 'MemberExpression' &&
            arg.callee.property &&
            takeUntilDestroyedAliases.has(arg.callee.property.name)) {
            return true;
        }

        return false;
    });
}