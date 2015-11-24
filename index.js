var GitHubApi = require("github");
var _ = require('lodash');

var pickResultData = [
    'id',
    'html_url',
    'number',
    'state',
    'title',
    'body',
    'user.login',
    'labels',
    'created_at'
];

module.exports = {
    /**
     * Pick API result.
     *
     * @param issues
     * @returns {Array}
     */
    pickResultData: function (issues) {
        var result = [];

        _.map(issues, function (issue) {
            var tmpResults = {};

            pickResultData.forEach(function (dataKey) {
                if (!_.isUndefined(_.get(issue, dataKey, undefined))) {

                    _.set(tmpResults, dataKey, _.get(issue, dataKey));
                }
            });
            result.push(tmpResults);
        });

        return result;
    },

    /**
     * Authenticate gitHub user.
     *
     * @param dexter
     * @param github
     */
    gitHubAuthenticate: function (dexter, github) {

        if (dexter.environment('GitHubUserName') && dexter.environment('GitHubPassword')) {

            github.authenticate({
                type: dexter.environment('GitHubType') || "basic",
                username: dexter.environment('GitHubUserName'),
                password: dexter.environment('GitHubPassword')
            });
        } else {
            this.fail('A GitHubUserName and GitHubPassword environment variable is required for this module');
        }
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {

        var github = new GitHubApi({
            // required 
            version: "3.0.0"
        });

        this.gitHubAuthenticate(dexter, github);

        github.issues.getAll(step.inputs(), function (err, issues) {

            err? this.fail(err) : this.complete(this.pickResultData(issues));
        }.bind(this));
    }
};
