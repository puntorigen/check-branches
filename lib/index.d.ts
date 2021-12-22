/**
* check_branches: Class for the CLI.
* @name 	check_branches
* @module 	check_branches
**/
export default class check_branches {
    workdir: String;
    silent: Boolean;
    constructor(arg?: {
        silent?: boolean;
        workdir?: String;
    });
    getCurrentBranch(): Promise<any>;
    check(branch?: String): Promise<void>;
    install(arg: any): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map