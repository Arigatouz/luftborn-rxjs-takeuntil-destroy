const requireTakeUntilDestroyed = require('./rules/require-take-until-destroyed');

module.exports = {
    rules: {
        'require-take-until-destroyed': requireTakeUntilDestroyed
    }
};
