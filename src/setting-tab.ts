import { App, PluginSettingTab, Setting } from "obsidian";
import type RSSFlowPlugin from "./main";

export class ReactLabSettingTab extends PluginSettingTab {
	plugin: RSSFlowPlugin;

	constructor(app: App, plugin: RSSFlowPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for RSS Flow.'});

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

	}
}
