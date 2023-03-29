import { writable } from 'svelte/store'
import type { HomeTabSettings } from './settings'
import type { recentFile } from './recentFiles'
import type { bookmarkedFile } from './bookmarkedFiles'

export const pluginSettingsStore = writable<HomeTabSettings>()
export const bookmarkedFiles = writable<bookmarkedFile[]>()
export const recentFiles = writable<recentFile[]>([])