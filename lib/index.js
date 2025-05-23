'use strict';

module.exports = {
    rules: {
        'require-take-until-destroyed': require('./rules/require-take-until-destroyed')
    },
    configs: {
        recommended: {
            plugins: ['rxjs-angular'],
            rules: {
                'rxjs-angular/require-take-until-destroyed': 'error'
            }
        }
    }
};