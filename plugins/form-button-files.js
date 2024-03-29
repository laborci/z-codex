import FormButtonPlugin          from "../plugin/types/FormButtonPlugin";
import CodexAdminAttachmentModal from "../admin/attachment-modal/brick";

@FormButtonPlugin.register()
export default class FormButtonFiles extends FormButtonPlugin {

	get label() { return 'Files';}
	get icon() { return 'fa fa-folder';}
	get color() { return null;}
	createButton() { return this.form.id ? super.createButton() : false; }
	action(event) { CodexAdminAttachmentModal.createModal(this.form.root).then(modal => modal.show({form: this.form}));}

}
