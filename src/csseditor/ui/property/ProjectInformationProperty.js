import BaseProperty from "./BaseProperty";
import { EVENT } from "../../../util/UIElement";

export default class ProjectInformationProperty extends BaseProperty {
  getTitle() {
    return this.$i18n('project.information.property.title');
  }

  getClassName() {
    return 'full';
  }

  refresh() {
    var project = this.$selection.currentProject || { name: '', description: ''}
    
    this.refs.$name.val(project.name);
    this.refs.$description.val(project.description);
  }

  getBody() {

    var project = this.$selection.currentProject || { name: '', description: ''}

    return /*html*/`
      <div class="project-info" ref="$info">
        <div class='project-info-item'>
          <label>${this.$i18n('project.information.property.name')}</label>
          <div class='input'><input type='text' value='${project.name}' ref='$name' /></div>
        </div>
        <div class='project-info-item'>
          <label>${this.$i18n('project.information.property.description')}</label>
          <div class='input'>
            <textarea  value='${project.description}' ref='$description'></textarea>
          </div>
        </div>
      </div>
    `;
  }

  [EVENT('refreshProjectList', 'refreshAllSelectProject')] () {
    this.refresh();
  }

}
