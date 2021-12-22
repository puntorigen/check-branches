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

export default class check_branches {
    workdir:String
    silent:Boolean

	constructor(arg:{silent?:boolean,workdir?:String}={silent:true,workdir:process.cwd() }) {
        this.workdir = arg.workdir;
        this.silent = arg.silent;
    }

    async getCurrentBranch() {
        const resp = await branch(this.workdir);
        return resp;
    }

    async getBranches() {
        let parseBranches = (str) => {
            if (!str) return [];
            const os = require('os');
            let lines = str.trim().split(os.EOL);
            let res:Array<String> = [];
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim().replace(/^\*\s*/, '');
                let line0 = line.split('/').pop();
                if (res.includes(line0)==false) res.push(line0);
            }
            return res;
        };
        const { stdout, stderr } = await exec('git branch -a');
        const resp = parseBranches(stdout);
        return resp;
    }

    async check(branch?:String) {
        let arg = { branch:branch, branches:[] };
        if (arg.branch && arg.branch.trim()!='') console.log('repo->'+branch);
        if (!arg.branch || arg.branch.trim()=='') {
            try {
                arg.branch = await this.getCurrentBranch();
            } catch(ee) {
                x_console.out({ color:'red', message:'Error: no git repo found on current directory!' });
                return;
            }
        }
        console.log('');
        //end required arguments
        //get current repo branches
        arg.branches = await this.getBranches();
        //remove 'branch' from 'branches'
        let pos = arg.branches.indexOf(arg.branch);
        arg.branches.splice(pos,1);
        if (arg.branches.length==0) {
            x_console.out({ color:'red', message:'Error: there is only 1 branch on this repo. Nothing to check!' });
            return;
        }
        //for each branch
        for (let branch in arg.branches) {
            console.log(branch);
        }
        //
        console.log('repo branches',arg.branches);
        console.log('args obj',arg);
    }

    async install(arg:any) {
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
    }
}

