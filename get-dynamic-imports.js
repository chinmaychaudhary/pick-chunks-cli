const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const fs = require('fs');
const path = require('path');

function getChunkNameFromArgument(arg){
    return arg.leadingComments[0].value.match(/webpackChunkName="([^."].*)"/)[1];
}

function getContextualisedPath(filePath){
    const fp = path.resolve(process.cwd(), CONTEXT, filePath + '.js');
    return fs.existsSync(fp) ? fp : null;
}

function getFilePath(dir, filePath){
    return getContextualisedPath(filePath) || path.resolve(dir, filePath + '.js')
}

// same as webpack config context
const CONTEXT = './code';

function isContextualisedPath(filePath){
    const fp = path.resolve(process.cwd(), CONTEXT, filePath + '.js');
    return fs.existsSync(fp);
}

function shouldDigDeeper(filePath){
    return filePath.startsWith('.') || isContextualisedPath(filePath);
}

function getDynamicImports(filepath, shoudlDigDynamicImports, ans = [], visited = {}){
    const fileContent = fs.readFileSync(filepath, {encoding: 'utf-8'});
    const ast = parser.parse(fileContent, {sourceType: 'module'});
    const imports = [];
    const dir = path.parse(filepath).dir;

    visited[filepath] = true;

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

    imports.filter(fp => !visited[fp]).forEach(neighbour => {
        getDynamicImports(neighbour, shoudlDigDynamicImports, ans, visited);
    })
    
    return ans;
}

exports.getDynamicImports = getDynamicImports;