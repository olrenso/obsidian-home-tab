import { getLinkpath, normalizePath, TFile, App } from 'obsidian'
import type { MarkdownSearchFile, SearchFile } from '../suggester/fuzzySearch'
import { getExtensionFromFilename, getFileTypeFromExtension } from './getFileTypeUtils'

declare global {
    var app: App;
}

export function getImageFiles(){
    let fileList: TFile[] = []
    app.vault.getFiles().forEach((file) => {
        if (getFileTypeFromExtension(file.extension) === 'image'){
            fileList.push(file)
        }
    })
    return fileList
}

export function getFileAliases(file: TFile): string[]{
    let aliases: string[] = []
    const rawAliases: string[] | string | undefined = app.metadataCache.getFileCache(file)?.frontmatter ? app.metadataCache.getFileCache(file)?.frontmatter?.aliases : undefined

    if(rawAliases instanceof Array){
        aliases.push(...rawAliases)
    }
    else if(typeof rawAliases === 'string'){
        rawAliases.replace('[', '').replace(']', '').split(',').forEach((alias: string) => {
            if (alias.length > 0){
                aliases.push(alias.trim())
            }
        })
    }

    return aliases
}

export function getFileTitle(file: TFile): string | undefined {
    const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
    if (frontmatter && frontmatter.title) {
        return frontmatter.title;
    }
    return undefined;
}

export function getFileHeadings(file: TFile): string[] | undefined {
    const headings = app.metadataCache.getFileCache(file)?.headings;
    if (headings) {
        return headings.map(h => h.heading);
    }
    return undefined;
}

export function generateMarkdownSearchFile(file: TFile): MarkdownSearchFile{
    return {
        name: file.name,
        basename: file.basename,
        path: file.path,
        aliases: getFileAliases(file),
        isCreated: true,
        file: file,
    }
}

export function getMarkdownSearchFiles(): MarkdownSearchFile[]{
    const files = app.vault.getMarkdownFiles()
    const fileList: MarkdownSearchFile[] = []
    
    files.forEach((f) => {
        fileList.push(generateMarkdownSearchFile(f))
    })

    return fileList
}

export function generateSearchFile(file: TFile): SearchFile{
    return {
        name: file.name,
        basename: file.basename,
        path: file.path,
        aliases: getFileAliases(file),
        title: getFileTitle(file),
        headings: getFileHeadings(file),
        isCreated: true,
        file: file,
        fileType: getFileTypeFromExtension(file.extension),
        extension: file.extension
    }
}

export function getUnresolvedLinkPath(cachedFilename: string, newFilePath?: boolean): string{
    const normalizedFilename = getLinkpath(cachedFilename)
    if(newFilePath && !normalizedFilename.includes('/')){
        return normalizePath(`${this.app.fileManager.getNewFileParent('').path}/${normalizedFilename}`)
    }
    return normalizePath(normalizedFilename)
}

export function getUnresolvedLinkBasename(cachedFilename: string): string{
    const normalizedPath = getLinkpath(cachedFilename)
    
    if(normalizedPath.includes('/')){
        const regexResult = normalizedPath.match(/.*\/(.*)/)
        return regexResult ? regexResult[1] : normalizedPath
    }
    return normalizedPath
}

export function generateMarkdownUnresolvedFile(cachedFilename: string): SearchFile{
    const filename = getExtensionFromFilename(cachedFilename) ? cachedFilename.replace('.md', '') : cachedFilename
    return {
        name: `${getUnresolvedLinkBasename(filename)}.md`,
        basename: getUnresolvedLinkBasename(filename),
        path: getUnresolvedLinkPath(`${filename}.md`, true),
        isCreated: false,
        isUnresolved: true,
        fileType: 'markdown',
        extension: 'md'
    }
}

export function getUnresolvedMarkdownFiles(): SearchFile[]{
    const fileList: SearchFile[] = []
    const unresolvedLinkParents = app.metadataCache.unresolvedLinks
    const unresolvedFilenames: string[] = []
    Object.entries(unresolvedLinkParents).forEach(([_, links]) => {
        Object.keys(links).forEach(filename => {
            // md notes does not have any extension, even if the link is [[somefile.md]]
            if(!getExtensionFromFilename(filename) && !unresolvedFilenames.includes(filename)){
                unresolvedFilenames.push(filename)
            }
        })
    })
    unresolvedFilenames.forEach(filename => fileList.push(generateMarkdownUnresolvedFile(filename)))
    return fileList
}

export function getSearchFiles(unresolvedLinks?: boolean): SearchFile[]{
    const files = app.vault.getFiles()
    const fileList: SearchFile[] = []

    files.forEach((f: TFile) => {
        fileList.push(generateSearchFile(f))
    })

    if(unresolvedLinks){
        fileList.push(... getUnresolvedMarkdownFiles())
    }

    return fileList
}

export function getParentFolderFromPath(filepath: string): string{
    const regexResult = filepath.match(/([^\/]+)\/[^\/]+\/*$/)
    return regexResult ? regexResult[1] : '/' 
}