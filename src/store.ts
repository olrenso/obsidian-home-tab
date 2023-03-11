import { writable } from 'svelte/store'
import type { TFile } from 'obsidian'
import type { HomeTabSettings } from './settings'
import type { recentFile } from './recentFiles'

export const pluginSettingsStore = writable<HomeTabSettings>()
export const starredFiles = writable<TFile[]>()
export const recentFiles = writable<recentFile[]>([])