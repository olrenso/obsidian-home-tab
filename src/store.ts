import { writable } from 'svelte/store'
import type { HomeTabSettings } from './settings'
import type { recentFile } from './recentFiles'
import type { customStarredFile } from './starredFiles'

export const pluginSettingsStore = writable<HomeTabSettings>()
export const starredFiles = writable<customStarredFile[]>()
export const recentFiles = writable<recentFile[]>([])