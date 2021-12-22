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
    const open_console = require('@concepto/console');
    const x_console = new open_console();
    //
    class check_branches {
        constructor(arg = { silent: true, workdir: process.cwd() }) {
            this.workdir = arg.workdir;
            this.silent = arg.silent;
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
        check(branch) {
            return __awaiter(this, void 0, void 0, function* () {
                let arg = { branch: branch, branches: [] };
                if (arg.branch && arg.branch.trim() != '')
                    console.log('repo->' + branch);
                if (!arg.branch || arg.branch.trim() == '') {
                    try {
                        arg.branch = yield this.getCurrentBranch();
                    }
                    catch (ee) {
                        x_console.out({ color: 'red', message: 'Error: no git repo found on current directory!' });
                        return;
                    }
                }
                console.log('');
                //end required arguments
                //get current repo branches
                arg.branches = yield this.getBranches();
                if (arg.branches.length == 1 && arg.branch == arg.branches[0]) {
                    x_console.out({ color: 'red', message: 'Error: there is only 1 branch on this repo. Nothing to check!' });
                    return;
                }
                console.log('repo branches', arg.branches);
                console.log('args obj', arg);
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
