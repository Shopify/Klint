export declare class KlintContext {
    private documentation;
    private examples;
    private functionInfo;
    private isInitialized;
    constructor();
    private initializeAsync;
    private ensureInitialized;
    private loadDocumentation;
    private loadExamples;
    private loadFunctionInfo;
    private parseFunctionInfo;
    howDoI(task: string, context?: string): Promise<string>;
    explain(functionName: string, includeExamples?: boolean): Promise<string>;
    debug(code: string, issue?: string): Promise<string>;
    shipIt(code: string, target?: 'react-component' | 'standalone' | 'npm-package'): Promise<string>;
    private generateExampleCode;
    private generateGenericHelp;
    private _findRelevantExamples;
    private findRelevantDocumentation;
    private findSimilarFunctions;
    private findFunctionExamples;
    private analyzeCode;
    private generatePerformanceTips;
    private checkBestPractices;
    private optimizeForProduction;
    private generateDeploymentChecklist;
    private generateBuildConfig;
}
