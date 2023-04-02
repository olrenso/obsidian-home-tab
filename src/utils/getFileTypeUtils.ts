import type { TFile } from "obsidian"
import { getUnresolvedLinkBasename, getUnresolvedLinkPath } from "./getFilesUtils"

const fileTypeLookupTable: FileTypeLookupTable = {
    image : ['jpg', 'jpeg', 'png', 'svg', 'gif', 'bmp'],
    video : ['mp4', 'webm', 'ogv', 'mov', 'mkv'],
    audio : ['mp3', 'wav', 'm4a', 'ogg', '3gp', 'flac'],
    markdown : ['md'],
    pdf : ['pdf'],
    canvas: ['canvas'],
}

type FileTypeLookupTable = {[key in FileType]: string[]}
export const fileTypes = ['image', 'video', 'audio', 'markdown', 'pdf', 'canvas'] as const
export type FileType = typeof fileTypes[number]
// export type FileType = 'image' | 'video' | 'audio' | 'markdown' | 'pdf'
export const fileExtensions = ['jpg', 'jpeg', 'png', 'svg', 'gif', 'bmp', 'mp4', 'webm', 'ogv', 'mov', 'mkv', 
                        'mp3', 'wav', 'm4a', 'ogg', '3gp', 'flac', 'md', 'pdf', 'canvas'] as const
export type FileExtension = typeof fileExtensions[number]
// export type FileExtension = 'jpg' | 'jpeg' | 'png' | 'svg' | 'gif' | 'bmp' | 'mp4' | 'webm' | 'ogv' | 'mov' | 'mkv' | 
//                             'mp3' | 'wav' | 'm4a' | 'ogg' | '3gp' | 'flac' | 'md' | 'pdf'


export function getFileTypeFromExtension(extension: string): FileType | undefined{
    for(const fileType of Object.keys(fileTypeLookupTable) as Array<FileType>){
        if(fileTypeLookupTable[fileType].includes(extension)){
            return fileType
        }
    }
    return undefined
}

export function getExtensionFromFilename(filename: string): FileExtension | undefined{
    // const extension = filename.match(/(?<=\.)[^.]+$/g) on iOS lookbehind groups don't work
    const extension = filename.match(/\.([^.]+$)/g)
    if (extension){
        // Remove the dot selected by the regex and return the string as extension
        return extension[0].substring(1) as FileExtension
    }
    return undefined
}
export interface unresolvedFile {
    basename: string,
    path: string,
    name: string,
    extension: string,
}

export function isUnresolved(unresolvedFile: unresolvedFile): boolean{
    let filename = unresolvedFile.name
    let filePath = unresolvedFile.path
    let extension = unresolvedFile.extension
    let fileBasename = unresolvedFile.basename

    // markdown unresolved links does not have the .md extension
    if(extension === 'md'){
        filename = filename.replace('.md', '')
        filePath = filePath.replace('.md', '')
    }
    
    const parentFiles = Object.entries(app.metadataCache.unresolvedLinks)

    for (let index = 0; index < parentFiles.length; index++) {
        const parentFile = parentFiles[index];
        const unresolvedLinks = Object.keys(parentFile[1])
        if(unresolvedLinks.length > 0){
            for (let index = 0; index < unresolvedLinks.length; index++) {
                const cachedFilename = unresolvedLinks[index];
                const unresolvedBasename = getUnresolvedLinkBasename(cachedFilename)
                const unresolvedPath = getUnresolvedLinkPath(cachedFilename)
                const unresolvedExtension = getExtensionFromFilename(cachedFilename)
                const unresolvedName = unresolvedExtension != 'md' ? `${unresolvedBasename}.${unresolvedExtension}` : unresolvedBasename
    
                if( fileBasename === unresolvedBasename || 
                    filePath === unresolvedPath ||
                    filename === unresolvedName){
                        return true
                    }   
            }
        }        
    }

    return false
}

export function isMarkdown(file: TFile): boolean{
    if(getFileTypeFromExtension(file.extension) === 'markdown'){
        return true
    }
    return false
}
export function isValidExtension(extToCheck: string): boolean{
    const extensions = ['jpg','jpeg','png','svg','gif','bmp','mp4','webm',
    'ogv','mov','mkv','mp3','wav','m4a','ogg','3gp','flac','md','pdf']
    return extensions.includes(extToCheck)
}

export function isValidFileType(typeToCheck: string): boolean{
    const fileTypes = ['image','video','audio','markdown','pdf']
    return fileTypes.includes(typeToCheck)
}