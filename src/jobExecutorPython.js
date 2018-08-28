const process = require('process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const {Constants} = require('eae-utils');

const JobExecutorAbstract = require('./jobExecutorAbstract.js');
const { SwiftHelper, ErrorHelper } = require('eae-utils');

/**
 * @class JobExecutorPython
 * @desc Specialization of JobExecutorAbstract for python scripts
 * @param jobID {String} The job unique identifier in DB
 * @param jobCollection MongoDB collection to sync the job model against
 * @param jobModel {Object} Plain js Job model from the mongoDB, optional if fetchModel is called
 * @constructor
 */
function JobExecutorPython(jobID, jobCollection, jobModel) {
    JobExecutorAbstract.call(this, jobID, jobCollection, jobModel);

    // Init member attributes
    this._swift = new SwiftHelper({
        url: global.eae_compute_config.swiftURL,
        username: global.eae_compute_config.swiftUsername,
        password: global.eae_compute_config.swiftPassword
    });
    this._tmpDirectory = null;

    // Bind member functions
    this._preExecution = JobExecutorPython.prototype._preExecution.bind(this);
    this._postExecution = JobExecutorPython.prototype._postExecution.bind(this);
    this.startExecution = JobExecutorPython.prototype.startExecution.bind(this);
    this.stopExecution = JobExecutorPython.prototype.stopExecution.bind(this);

}
JobExecutorPython.prototype = Object.create(JobExecutorAbstract.prototype); //Inherit Js style
JobExecutorPython.prototype.constructor = JobExecutorPython;

/**
 * @fn _preExecution
 * @desc Prepare jobs inputs and params
 * @return {Promise} Resolve to true on successful preparation
 * @private
 * @pure
 */
JobExecutorPython.prototype._preExecution = function() {
    let _this = this;

    return new Promise(function (resolve, reject) {
                resolve(true); // All good
            }, function (error) {
                reject(ErrorHelper('Input download failed', error));
            });
};

/**
 * @fn _postExecution
 * @desc Saves jobs outputs and clean
 * @return {Promise} Resolve to true on successful cleanup
 * @private
 * @pure
 */
JobExecutorPython.prototype._postExecution = function() {
    let _this = this;
    return new Promise(function (resolve, reject) {
            resolve(true);
        }, function(error) {
            reject(ErrorHelper('Creating output container failed', error));
        });
};

/**
 * @fn startExecution
 * @param callback {Function} Function called after execution. callback(error, status)
 * @desc Starts the execution of designated job.
 */
JobExecutorPython.prototype.startExecution = function(callback) {
    let _this = this;

    _this.fetchModel().then(function () {
        //Clean model for execution
        _this._model.stdout = '';
        _this._model.stderr = '';
        _this._model.status.unshift(Constants.EAE_JOB_STATUS_RUNNING);
        _this._model.startDate = new Date();
        _this.pushModel().then(function() {
            let cmd = 'python  -c "import time; time.sleep(1)"';
            let args = _this._model.params;
            let opts = {
                end: process.env,
                shell: true
            };
            _this._exec(cmd, args, opts);
        }, function(error) {
            throw error;
        });
    }, function (error) {
        callback(error);
    });
};

/**
 * @fn stopExecution
 * @desc Interrupts the currently executed job.
 * @param callback {Function} Function called after execution. callback(error, status)
 */
JobExecutorPython.prototype.stopExecution = function(callback) {
    this._callback = callback;
    this._kill();
    // throw 'Should call _kill here';
};

module.exports = JobExecutorPython;
