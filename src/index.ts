/**
* check_branches: Class for the CLI.
* @name 	check_branches
* @module 	check_branches
**/

const open_console = require('@concepto/console');
const prompts = require('prompts');
const process = require('process');
const branch = require('git-branch');
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

    async check(branch:String=null) {
        let arg = { branch };
        if (branch) console.log('repo->'+branch);
        console.log('');
        //required arguments
        if (!branch) arg.branch = (await prompts({
            type: 'text',
            name: 'value',
            message: `What's the branch name you wish to check`,
            validate: value => {
                if (value.length<3) return `Name to short!`;
                if (value.trim().indexOf(' ')!=-1) return `Name cannot contain spaces!`;
                return true; 
            }
        })).value;
        console.log('received args',arg);
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

