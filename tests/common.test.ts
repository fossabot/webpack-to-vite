import {stringFormat, stringSplice} from "../src/utils/common";
import {isObject} from "../src/utils/common";

test('isObject', () => {
    expect(isObject({})).toBe(true)
    expect(isObject([])).toBe(false)
    expect(isObject('')).toBe(false)
    expect(isObject(1)).toBe(false)
    expect(isObject(true)).toBe(false)
    expect(isObject(null)).toBe(false)
    expect(isObject(undefined)).toBe(false)
})

test('stringFormat', () => {
    const testStr ='{0} | {1} | {2}'
    const result = stringFormat(testStr, 'replace content 1', 'replace content 2')
    expect(result).toBe('replace content 1 | replace content 2 | {2}')
})

test('stringSplice', () => {
    const testStr ='0123456789'
    const result = stringSplice(testStr, 5, 6, 2)
    expect(result).toBe('012456789')
})
