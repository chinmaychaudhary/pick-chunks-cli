const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const fs = require('fs');
const path = require('path');

function getChunkNameFromArgument(arg){
    return arg.leadingComments[0].value.match(/webpackChunkName="([^."].*)"/)[1];
}

function getFilePath(dir, filePath){
    return path.resolve(dir, filePath + '.js')
}

function shouldDigDeeper(filePath){
    return filePath.startsWith('.');
}

function getDynamicImports(filepath, shoudlDigDynamicImports, ans = [], visited = {}){
    const fileContent = fs.readFileSync(filepath, {encoding: 'utf-8'});
    const ast = parser.parse(fileContent, {sourceType: 'module'});
    const imports = [];
    const dir = path.parse(filepath).dir;

    traverse(ast, {
        ImportDeclaration(astPath){
            const p = astPath.node.source.value;
            if(shouldDigDeeper(p)){
                imports.push(getFilePath(dir, p));
            }
            
        },
        CallExpression(astPath){
            const callExpNode = astPath.node;
            if(callExpNode.callee.type === 'Import'){
                const arg = callExpNode.arguments[0];
                const fp = getFilePath(dir, arg.value)
                ans.push({filepath: fp, chunkName:  getChunkNameFromArgument(arg)});
                if(shoudlDigDynamicImports){
                    imports.push(fp);
                }
            }
        }
    });

    imports.forEach(neighbour => {
        getDynamicImports(neighbour, shoudlDigDynamicImports, ans);
    })
    
    return ans;
}

exports.getDynamicImports = getDynamicImports;