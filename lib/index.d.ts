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
    getBranches(): Promise<String[]>;
    getBranchContributors(branch: String, min_percentage?: Number): Promise<any[]>;
    generateReport(repo: String, branch: String, conflicts: any): Promise<void>;
    check(branch?: String): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map