import {copyDirSync, readSync, removeSync, renameSync, writeSync} from '../src/utils/file';
import path from "path";
import {
    astParseRoot,
    AstParsingResult,
    ParsingResultOccurrence,
    FileInfo,
    TransformationParams,
    TransformationResult
} from '../src/ast-parse/astParse'
import { Config } from '../src/config/config'
import fs from "fs";
import {astTransform as addJsxTransform} from "../src/ast-parse/transformations/addJsxTransformation";
import {astTransform as removeHtmlLangTransform} from "../src/ast-parse/transformations/removeHtmlLangInTemplateTransformation";
import {astTransform as indexHtmlVueCliTransform} from "../src/ast-parse/transformations/indexHtmlTransformationVueCli";
import {astTransform as indexHtmlWebpackTransform} from "../src/ast-parse/transformations/indexHtmlTransformationWebpack";
import {astTransform as lazyLoadingRoutesTransform} from "../src/ast-parse/transformations/lazyLoadingRoutesTransformation";
import { astParse as findJsxInScriptParser } from '../src/ast-parse/parsers/findJsxInScriptParser'
import { astParse as findRequireContext } from '../src/ast-parse/parsers/findRequireContext'

beforeAll(() => {
    const srcPath = path.resolve('tests/testdata/ast-parse')
    const destPath = path.resolve('tests/out-ast-parse')
    copyDirSync(srcPath, destPath)
})
afterAll(() => {
    fs.rmdirSync(path.resolve('tests/out-ast-parse'), { recursive: true })
})

test('addJsxTransformation', async () => {
    const filePath: string = path.resolve('tests/out-ast-parse/addJsx.vue')
    const source: string = readSync(filePath).replace(/\r\n/g, '\n')
    const fileInfo: FileInfo = {
        path: filePath,
        source: source
    }
    const config: TransformationParams = {
        config: {
            rootDir: filePath
        }
    }
    const result = await addJsxTransform(fileInfo, config)
    expect(result.content).toContain('lang="tsx"')
})

test('removeHtmlLangInTemplateTransformation', async () => {
    const filePath: string = path.resolve('tests/out-ast-parse/removeHtmlLang.vue')
    const source: string = readSync(filePath).replace(/\r\n/g, '\n')
    const fileInfo: FileInfo = {
        path: filePath,
        source: source
    }
    const config: TransformationParams = {
        config: {
            rootDir: filePath
        }
    }
    const result = await removeHtmlLangTransform(fileInfo, config)
    expect(result.content).not.toContain('lang="html"')
})

test('indexHtmlTransformationVueCli', async () => {
    const oldFilePath: string = path.resolve('tests/out-ast-parse/vue-cli-index.html')
    const filePath: string = path.resolve('tests/out-ast-parse/index.html')
    renameSync(oldFilePath, filePath)
    const source: string = readSync(filePath).replace(/\r\n/g, '\n')
    const fileInfo: FileInfo = {
        path: filePath,
        source: source
    }
    const rootDir: string = path.dirname(filePath)
    const transformationParams: TransformationParams = {
        config: {
            rootDir: rootDir,
            projectType: 'vue-cli'
        }
    }
    const mainJsPath = path.resolve(rootDir, 'src/main.js')
    writeSync(mainJsPath, '')
    const result: TransformationResult = await indexHtmlVueCliTransform(fileInfo, transformationParams)
    expect(result.content).not.toMatch('<script type="module" src="src/main.js"></script>')
    expect(result.content).toMatch('{0}')
    expect(result.content).toMatch(`process.env['BASE_URL']`)
    expect(result.content).toMatch(`process.env['NODE_ENV']`)
    expect(result.content).toMatch(`process.env['VUE_APP_ICON']`)
    removeSync(filePath)
    removeSync(mainJsPath)
})

test('indexHtmlTransformationWebpack', async () => {
    const oldFilePath: string = path.resolve('tests/out-ast-parse/webpack-index.html')
    const filePath: string = path.resolve('tests/out-ast-parse/index.html')
    renameSync(oldFilePath, filePath)
    const source: string = readSync(filePath).replace(/\r\n/g, '\n')
    const fileInfo: FileInfo = {
        path: filePath,
        source: source
    }
    const rootDir: string = path.dirname(filePath)
    const transformationParams: TransformationParams = {
        config: {
            rootDir: rootDir,
            projectType: 'webpack'
        }
    }
    const mainJsPath = path.resolve(rootDir, 'src/main.js')
    writeSync(mainJsPath, '')
    const result: TransformationResult = await indexHtmlWebpackTransform(fileInfo, transformationParams)
    expect(result.content).not.toMatch('<script type="module" src="src/main.js"></script>')
    expect(result.content).toMatch('{0}')
    expect(result.content).toMatch(`process.env['BASE_URL']`)
    expect(result.content).toMatch(`process.env['NODE_ENV']`)
    expect(result.content).toMatch(`process.env['VUE_APP_ICON']`)
    removeSync(filePath)
    removeSync(mainJsPath)
})

test('lazyLoadingRoutesTransformation', async () => {
    const filePath: string = path.resolve('tests/out-ast-parse/routes.js')
    const source: string = readSync(filePath).replace(/\r\n/g, '\n')
    const fileInfo: FileInfo = {
        path: filePath,
        source: source
    }
    const transformationParams: TransformationParams = {
        config: {}
    }
    const result: TransformationResult = await lazyLoadingRoutesTransform(fileInfo, transformationParams)
    expect(result.content).toMatch('() => import("../components/test.vue")')
})

test('findJsxInScriptParser',  () => {
    const filePath: string = path.resolve('tests/out-ast-parse/jsxInScript.vue')
    const source: string = readSync(filePath).replace(/\r\n/g, '\n')
    const fileInfo: FileInfo = {
        path: filePath,
        source: source
    }
    const result: ParsingResultOccurrence[] | null = findJsxInScriptParser(fileInfo)
    expect(result.length).toBeGreaterThan(0)
})

test('findRequireContext',  () => {
    const filePath: string = path.resolve('tests/out-ast-parse/requireContext.js')
    const source: string = readSync(filePath).replace(/\r\n/g, '\n')
    const fileInfo: FileInfo = {
        path: filePath,
        source: source
    }
    const result: ParsingResultOccurrence[] | null = findRequireContext(fileInfo)
    expect(result.length).toBeGreaterThan(0)
})

test('astParse', async () => {
    const srcPath = path.resolve('tests/testdata/ast-parse')
    const destPath = path.resolve('tests/out-ast-parse')
    copyDirSync(srcPath, destPath)

    const config: Config = {
        rootDir: destPath
    }
    const result: AstParsingResult = await astParseRoot(destPath, config)
    Object.keys(result.parsingResult).forEach(key =>
      expect(result.parsingResult[key].length).toBeGreaterThan(0)
    )
    Object.keys(result.transformationResult).forEach(key =>
      expect(result.transformationResult[key].length).toBeGreaterThan(0)
    )
})
