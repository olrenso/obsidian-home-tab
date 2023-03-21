import { App, Modal, Setting } from 'obsidian'
import iconSuggester from './suggester/iconSuggester'
import { lucideIcons, type LucideIcon } from './utils/lucideIcons'

export class IconSelectionModal extends Modal{
    icon: string | undefined
    onSubmit: (icon: LucideIcon) => void

    constructor(app: App, defaultIcon: LucideIcon | undefined, onSubmit: (icon: LucideIcon) => void){
        super(app)

        this.icon = defaultIcon
        this.onSubmit = onSubmit
    }

    onOpen(): void{
        const { contentEl } = this

        contentEl.createEl('h1', {text: 'Set a custom icon'})

        const iconSetting = new Setting(contentEl)
            .setName('Choose an icon')
            .setDesc('Accepts any lucide icon id.')

        let invalidInputIcon: HTMLElement
        iconSetting
            .addExtraButton((button) => {button
                .setIcon('alert-circle')
                .setTooltip('The icon id is not valid.')
                invalidInputIcon = button.extraSettingsEl
                invalidInputIcon.toggleVisibility(false)
                invalidInputIcon.addClass('mod-warning')})

        iconSetting
            .addSearch((text) => {
                new iconSuggester(this.app, text.inputEl, {
                    isScrollable: true,
                    style: `max-height: 200px`}, 
                    true)

                text
                .setPlaceholder('Type to start search...')
                .setValue(this.icon ?? '')
                .onChange(value => {
                    // if(value === '' || value == '/'){
                    //     invalidInputIcon.toggleVisibility(false)
                    //     return
                    // }
                    if(lucideIcons.includes(value as LucideIcon)){
                        this.icon = value
                        invalidInputIcon.toggleVisibility(false)
                    }
                    else{
                        invalidInputIcon.toggleVisibility(true)
                    }
                })
                .inputEl.parentElement?.addClass('wide-input-container')
        })
        

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                .setButtonText("Close modal")
                // .setCta()
                .onClick(() => {
                    this.close();
                }))
            .addButton((btn) =>
                btn
                .setButtonText("Set icon")
                .setCta()
                .onClick(() => {
                    this.icon ? this.onSubmit(this.icon as LucideIcon) : null
                    this.close()
                }))
    }

    onClose(): void {
        this.icon = undefined
        let { contentEl } = this;
        contentEl.empty();
    }
}