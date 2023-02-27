import { writable } from 'svelte/store'
import type { TFile } from 'obsidian'
import type { HomeTabSettings } from './settings'

export const pluginSettingsStore = writable<HomeTabSettings>()
export const starredFiles = writable<TFile[]>()