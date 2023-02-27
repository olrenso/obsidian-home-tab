export default function cssUnitValidator(inputString: string): boolean{
    const regex = /\d+(?:cm|mm|in|px|pt|pc|em|ex|ch|rem|vw|vh|vmin|vmax|%)(?!.)/g
    if(regex.test(inputString)){
        return true
    }
    return false
}