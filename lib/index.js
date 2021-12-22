(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["check-branches"] = factory());
})(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    /**
    * check_branches: Class for the CLI.
    * @name 	check_branches
    * @module 	check_branches
    **/
    //const prompts = require('prompts');
    const process = require('process');
    const branch = require('git-branch');
    const util = require('util');
    const exec = util.promisify(require('child_process').exec);
    const extractjs = require('extractjs');
    let extractor = extractjs();
    const open_console = require('@concepto/console');
    const x_console = new open_console();
    //
    class check_branches {
        constructor(arg = { silent: true, workdir: process.cwd() }) {
            this.workdir = arg.workdir;
            this.silent = arg.silent;
            x_console.setSilent(this.silent);
        }
        getCurrentBranch() {
            return __awaiter(this, void 0, void 0, function* () {
                const resp = yield branch(this.workdir);
                return resp;
            });
        }
        getBranches() {
            return __awaiter(this, void 0, void 0, function* () {
                let parseBranches = (str) => {
                    if (!str)
                        return [];
                    const os = require('os');
                    let lines = str.trim().split(os.EOL);
                    let res = [];
                    for (let i = 0; i < lines.length; i++) {
                        //console.log('lines['+i+']',lines[i]);
                        let line = lines[i].trim().replace(/^\*\s*/, '');
                        let line0 = line.split('/').pop();
                        if (res.includes(line0) == false)
                            res.push(line0);
                    }
                    return res;
                };
                const { stdout, stderr } = yield exec('git branch -a');
                const resp = parseBranches(stdout);
                return resp;
            });
        }
        getBranchContributors(branch, min_percentage) {
            return __awaiter(this, void 0, void 0, function* () {
                //returns the given branch contributors
                let resp = [];
                let commits = (yield exec(`git log --pretty="%an %ae" --first-parent ${branch}`)).stdout.split('\n');
                const commits_length = commits.length;
                // group and count commits
                let passed = {};
                for (let commit of commits) {
                    let [name, email] = commit.split(' ');
                    if (!passed[name]) {
                        let entries = commits.filter(entry => entry.indexOf(name) > -1 && entry.indexOf(email) > -1);
                        let percentage = (entries.length / commits_length * 100);
                        let percent = parseFloat(Math.max(0.1, percentage).toFixed(1));
                        resp.push({
                            commits: entries.length,
                            name,
                            email,
                            percent
                        });
                        passed[name] = true;
                    }
                }
                //@todo: sort and filter by percentage
                return resp;
            });
        }
        check(branch) {
            return __awaiter(this, void 0, void 0, function* () {
                let arg = { branch: branch, branches: [], branch_current: '', bak_branch: '' };
                if (arg.branch && arg.branch.trim() != '')
                    console.log('repo->' + branch);
                if (!arg.branch)
                    arg.branch = '';
                try {
                    arg.branch_current = yield this.getCurrentBranch();
                    if (arg.branch != '' && arg.branch != arg.branch_current) {
                        arg.bak_branch = arg.branch_current;
                    }
                    arg.branch = arg.branch_current;
                }
                catch (ee) {
                    x_console.out({ color: 'red', message: 'Error: no git repo found on current directory!' });
                    return;
                }
                console.log('');
                //end required arguments
                //change to target branch
                if (arg.bak_branch != '') {
                    try {
                        yield exec('git checkout --track origin/' + arg.branch); //try remote branch first
                    }
                    catch (errc) {
                        try {
                            //maybe its just a local branch
                            yield exec('git checkout ' + arg.branch);
                        }
                        catch (errc2) {
                        }
                    }
                }
                //get current branch contributors
                yield this.getBranchContributors('origin/' + arg.branch, 10);
                //get current repo branches
                console.log('reading branches ..');
                arg.branches = yield this.getBranches();
                //remove 'branch' from 'branches'
                let pos = arg.branches.indexOf(arg.branch);
                arg.branches.splice(pos, 1);
                if (arg.branches.length == 0) {
                    x_console.out({ color: 'red', message: 'Error: there is only 1 branch on this repo. Nothing to check!' });
                    return;
                }
                //for each branch
                let conflicts = {};
                const progress = require('cli-progress');
                const bar = new progress.SingleBar({
                    format: 'checking branches {bar} | {percentage}% | ETA: {eta}s',
                    hideCursor: true,
                    clearOnComplete: true
                }, progress.Presets.shades_classic);
                bar.start(100, 0);
                bar.setTotal(arg.branches.length);
                //
                let count_ = 0;
                for (let branch of arg.branches) {
                    try {
                        bar.update(count_);
                        //get branch contributors
                        let contri = yield this.getBranchContributors('origin/' + branch, 10);
                        //
                        const { stdout, stderr } = yield exec(`git merge origin/${branch} --no-ff --no-commit || git merge --abort`);
                        //console.log(`testing ${branch}`,{ stdout, stderr });
                        for (let line of stdout.split('\n')) {
                            if (line.indexOf('CONFLICT') != -1) {
                                if (!conflicts[branch])
                                    conflicts[branch] = { conflicts: [] };
                                conflicts[branch].contributors = contri.filter((item) => item.percent > 10);
                                let clean_text = line.replaceAll('HEAD', arg.branch).replaceAll('origin/', '');
                                let captured = extractor('CONFLICT ({type}): {explanation}', clean_text);
                                conflicts[branch].conflicts.push(captured);
                            }
                            //console.log('line',line);
                        }
                        count_ += 1;
                    }
                    catch (err) {
                        //console.log(`error ${branch}`,err);
                    }
                }
                bar.stop();
                //restore original branch
                if (arg.bak_branch != '') {
                    try {
                        //console.log('restoring original active local branch '+arg.bak_branch);
                        yield exec('git checkout ' + arg.bak_branch);
                    }
                    catch (errc2) {
                    }
                }
                //show report
                x_console.out({ message: 'conflicts found', data: conflicts });
            });
        }
        install(arg) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('');
                /*
                            //download progress bar
                    const progress = require('cli-progress');
                    const os = require('os');
                    const bar = new progress.SingleBar({
                        format: 'downloading {bar} | {percentage}% | ETA: {eta}s',
                        hideCursor: true,
                        clearOnComplete: true
                    }, progress.Presets.shades_classic);
                    bar.start(100,0);
                    //download
                    const tmpFolder = os.tmpdir();
                    let dmg:any = await download('https://concepto-dsl.s3.amazonaws.com/Concepto.dmg', 'concepto.dmg', tmpFolder, function(curr,total) {
                        bar.setTotal(total);
                        bar.update(curr);
                    });
                    bar.stop();
                */
            });
        }
    }

    return check_branches;

}));
