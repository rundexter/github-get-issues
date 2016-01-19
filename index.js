var _ = require('lodash'),
    util = require('./util.js'),
    GitHubApi = require("github"),
    github = new GitHubApi({ version: '3.0.0' });

var pickInputs = {
        'filter': 'filter',
        'state': 'state',
        'labels': 'labels',
        'sort': 'sort',
        'direction': 'direction',
        'since': 'since'
    },
    pickOutputs = {
        'id': { key: 'data', fields: ['id'] },
        'html_url': { key: 'data', fields: ['html_url'] },
        'number': { key: 'data', fields: ['number'] },
        'state': { key: 'data', fields: ['state'] },
        'title': { key: 'data', fields: ['title'] },
        'body': { key: 'data', fields: ['body'] },
        'user': { key: 'data', fields: ['user.login'] },
        'labels': { key: 'data', fields: ['labels'] },
        'created_at': { key: 'data', fields: ['created_at'] }
    };

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var credentials = dexter.provider('github').credentials(),
            inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        // check params.
        if (validateErrors)
            return this.fail(validateErrors);

        github.authenticate({
            type: 'oauth',
            token: _.get(credentials, 'access_token')
        });

        github.issues.getAll(inputs, function (error, dataInfo) {


            error ? this.fail(error) : this.complete(util.pickOutputs({data: dataInfo}, pickOutputs));
        }.bind(this));
    }
};
