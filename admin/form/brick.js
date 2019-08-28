import Brick            from "zengular/core/brick";
import twig             from "./template.twig";
import "./style.less";
import Ajax             from "zengular/core/ajax";
import pluginManager    from "../../plugin/plugin-manager";
import FormButtonPlugin from "../../plugin/types/FormButtonPlugin";
import Modal            from "z-ui/modal/modal";

@Brick.register('codex-admin-form', twig)
@Brick.registerSubBricksOnRender()
export default class CodexAdminForm extends Brick {

	onInitialize() {
		this.sections = [];
		this.plugins = [];
		this.data = {};
		this.id = null;
	}

	createViewModel() {
		return {
			sections: this.sections,
			label: this.label,
			icon: this.icon,
			id: this.data.id
		}
	}

	load(id = null, urlBase = null) {
		if (urlBase !== null) this.urlBase = urlBase;
		if (id !== null) this.id = id;

		this.showOverlay();
		Ajax.get('/' + this.urlBase + '/get-form-item/' + (this.id === null ? 'new' : this.id)).getJson
		.then(xhr => {
			if (xhr.status !== 200) {
				this.handlerError(xhr, () => {this.tab.close();});
			} else {
				let result = xhr.response;
				console.log(this.tab)
				this.label = result.data.fields[result.descriptor.labelField];
				this.label = this.label ? this.label : 'new';
				this.icon = result.descriptor.formIcon;
				this.plugins = result.descriptor.plugins ? result.descriptor.plugins : [];
				this.tab.root.dataset.icon = result.descriptor.tabIcon;
				this.tab.root.dataset.label = this.label;
				this.tab.root.dataset.id = this.id;
				this.data = result.data;
				this.sections = result.descriptor.sections;
				this.render();
			}
		})
		.finally(() => {
			this.hideOverlay();
		})
		;
	}

	onRender() {
		let promises = [];
		this.sections.forEach(section => section.inputs.forEach(input => {
			promises.push(
				this.$$('input').filter(`[data-name=${input.field}`).node.controller.setOptions(input.options)
				.then(inputBrick => {
					if (this.data.fields.hasOwnProperty(input.field)) inputBrick.setValue(this.data.fields[input.field]);
				})
			);
		}));
		Promise.all(promises)
		.then(() => {
			let plugins = pluginManager.get(this.plugins, FormButtonPlugin, this);
			plugins.forEach(plugin => {
				let button = plugin.createButton();
				if (button) this.$$('buttons').node.appendChild(button);
			});
		});
	}

	handlerError(xhr, cb = null) {
		let message = `Some unknown error occured: ${xhr.statusText} (${xhr.status})`;
		if (typeof xhr.json?.message === "string") message = xhr.json.message;
		let modal = new Modal();
		modal.title = "ERROR";
		modal.body = message;
		modal.addButton('Ok', false, 'danger');
		modal.onClose = cb;
		modal.show();
	}

	collectFieldData() {
		let data = {};
		this.$$('input').each(input => data[input.dataset.name] = input.controller.value);
		return data;
	}

	reloadList() { this.fire('RELOAD-LIST', {urlBase: this.urlBase});}

	showOverlay() { this.$$('overlay').node.classList.add('visible');}
	hideOverlay() { this.$$('overlay').node.classList.remove('visible');}
}

