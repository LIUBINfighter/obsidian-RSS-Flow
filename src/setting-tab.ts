import { App, PluginSettingTab, Setting } from "obsidian";
import type RSSFlowPlugin from "./main";
import { i18n } from "./i18n";

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
			.setName('Language')
			.setDesc('选择界面语言 / Select interface language')
			.addDropdown(dropdown => dropdown
				.addOption('en', 'English')
				.addOption('zh', '中文')
				.setValue(this.plugin.settings.locale)
				.onChange(async (value) => {
					this.plugin.settings.locale = value;
					await this.plugin.saveSettings();
					i18n.changeLanguage(value);
				}));

	}
}
