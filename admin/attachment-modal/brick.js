import Brick            from "zengular/core/brick";
import twig             from "./template.twig";
import "./style.less";
import Ajax             from "zengular/core/ajax";
import pluginManager    from "../../plugin/plugin-manager";
import FormButtonPlugin from "../../plugin/types/FormButtonPlugin";
import Modal            from "z-ui/modal/modal";
import ModalBrick       from "z-ui/modal/modal-brick";

@Brick.register('codex-admin-attachment-modal', twig)
@Brick.registerSubBricksOnRender()
@Brick.renderOnConstruct(false)
export default class CodexAdminAttachmentModal extends ModalBrick {

	initializeModal(modal) {
		super.initializeModal(modal);
		modal.title = "Files";
		modal.height = 'calc(100vh - 60px)';
		modal.width = 'calc(100vw - 60px)';
		modal.classList.add('frameless');
	}

	beforeRender(args) {
		this.form = args.form;
	}

	onInitialize() {
	}

	createViewModel() {
		return Ajax.get(this.form.urlBase + '/attachment/get/'+this.form.data.id).getJson
		.then(attachments=>{
			return {
				attachmentCategories: this.form.attachmentCategories,
				attachments: attachments.response
			}
		});
	}

	onRender() {

		this.$$('attachment')
		.listen('dragstart', (event, target) => {
//			event.dataTransfer.setData('filename', target.dataset.filename);
//			event.dataTransfer.setData('group', target.dataset.group);
//			event.dataTransfer.setData('action', "copy");
		})
		.listen('dblclick', (event, target) => {
//			if (event.target === target) {
//				let win = window.open(target.dataset.url, '_blank');
//				win.focus();
//			}
		});

		this.$$("category", node => node.overCounter = 0)
		.listen('dragover', (event) => {
			event.preventDefault();
		})
		.listen('dragenter', (event, target) => {
			target.overCounter++;
			target.classList.add('dragover');
			event.preventDefault();
		})
		.listen('dragleave', (event, target) => {
			target.overCounter--;
			if (target.overCounter === 0) target.classList.remove('dragover');
			event.preventDefault();
		})
		.listen('drop', (event, target) => {
			event.preventDefault();
			event.stopImmediatePropagation();
			target.classList.remove('dragover');
			target.overCounter = 0;

			if (event.dataTransfer.getData('action') === 'copy') {
				let method = event.shiftKey ? 'copy' : 'move';
				let data = {
					method: method,
					target: target.dataset.group,
					filename: event.dataTransfer.getData('filename'),
					source: event.dataTransfer.getData('group')
				};
				if (data.target !== data.source) {
//					Ajax.request(this.url + '/' + data.method).postJSON(data).do((response) => {
//						if (response.json.status === 'ok') {
//							this.render();
//						} else {
//							Modal.alert(response.json.message, 'Some error occured');
//						}
//					});
				}
			} else {
				for (let i = 0; i < event.dataTransfer.files.length; i++) {
					let file = event.dataTransfer.files[i];
					Ajax.upload(this.form.urlBase + '/attachment/upload/'+this.form.data.id, {category: target.dataset.category}, file).getJson
					.then(()=>{
						console.log('done');
					})
//					Ajax.request(this.url).upload({group: target.dataset.group}, file).do((response) => {
//						if (response.json.status == 'ok') {
//							this.render();
//						} else {
//							Modal.alert(response.json.message, 'Upload error');
//						}
//					});
				}
			}

			console.log(target.dataset.category)
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

	}

	showOverlay() { this.$$('overlay').node.classList.add('visible');}
	hideOverlay() { this.$$('overlay').node.classList.remove('visible');}
}

