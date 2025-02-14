import type { FileInfo, ParsingResultOccurrence } from '../astParse'
import * as FindJsxInScript from './findJsxInScriptParser'
import * as FindRequireContextParser from './findRequireContext'
import type { PARSER_TYPES } from '../../constants/constants'

export type ASTParse<Params = void> = {
  (fileInfo: FileInfo, params: Params): ParsingResultOccurrence[] | null
}

export type ParserType = typeof PARSER_TYPES[keyof typeof PARSER_TYPES]

export const parsersMap: {
  [name: string]: {
    astParse: ASTParse
    extensions: string[]
    parserType: ParserType
  }
} = {
  FindJsxInScript,
  FindRequireContextParser
}
