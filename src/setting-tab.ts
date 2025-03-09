import { App, PluginSettingTab, Setting } from "obsidian";
import type ReactLabPlugin from "./main";
import { KanbanLayout } from "./types";

export class ReactLabSettingTab extends PluginSettingTab {
	plugin: ReactLabPlugin;

	constructor(app: App, plugin: ReactLabPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for React Lab.'});

		new Setting(containerEl)
			.setName('Setting')
			.setDesc('It\'s a setting')
			.addText(text => text
				.setPlaceholder('Enter your setting')
				.setValue(this.plugin.settings.setting)
				.onChange(async (value) => {
					this.plugin.settings.setting = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('看板布局')
			.setDesc('选择看板的布局方式')
			.addDropdown(dropdown => dropdown
				.addOption('horizontal', '横向布局')
				.addOption('vertical', '纵向布局')
				.setValue(this.plugin.settings.kanbanLayout)
				.onChange(async (value: KanbanLayout) => {
					this.plugin.settings.kanbanLayout = value;
					await this.plugin.saveSettings();
				}));
	}
}
