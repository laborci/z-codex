import FormButtonPlugin from "../plugin/types/FormButtonPlugin";
import Modal            from "z-ui/modal/modal";

@FormButtonPlugin.register()
export default class FormButtonFiles extends FormButtonPlugin {

	get label() { return 'Files';}
	get icon() { return 'fa fa-folder';}
	get color() { return null;}
	createButton() { return this.form.id ? super.createButton() : false; }
	action(event){
		this.modal = new Modal();
		this.modal.height = 'calc(100vh - 60px)';
		this.modal.width = 'calc(100vw - 60px)';
		this.modal.body = "HELLO";
		this.modal.show();
	}

}
