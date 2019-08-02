import { SUBMIT } from "../../../util/Event";
import UIElement from "../../../util/UIElement";

import ExportManager from "../../../editor/ExportManager";
 
export default class ExportCodePen extends UIElement {
  template() {
    return `
    <form class='codepen' action="https://codepen.io/pen/define" method="POST" target="_code_pen">
      <input type="hidden" name="data" ref="$codepen" value=''>
      <button type="submit">
        <div class='icon codepen'></div>
        <div class='title'>CodePen</div>
      </button>
    </form>     
    `;
  }

  [SUBMIT()]() {
    var obj = ExportManager.generate();
    this.refs.$codepen.val(JSON.stringify({
      title: "sapa - editor.easylogic.studio",
      description: "https://editor.easylogic.studio",
      ...obj
    }))

    return false;
  }

}