import { Length } from "../unit/Length";
import { TimelineItem } from "./TimelineItem";
import icon from "../../csseditor/ui/icon/icon";
import { ComponentManager } from "../ComponentManager";

export class ArtBoard extends TimelineItem {
  getDefaultObject(obj = {}) {
    return super.getDefaultObject({
      itemType: "artboard",
      name: "New ArtBoard",
      width: Length.px(1000),
      height: Length.px(1000),
      'background-color': 'white',
      ...obj
    });
  }

  isLeaf() {
    return false; 
  }

  toCloneObject() {
    return {
      ...super.toCloneObject(),
      name: this.json.name
    }
  }  

  getDefaultTitle() {
    return "ArtBoard";
  }

  getIcon() {
    return icon.artboard;
  }

  toDefaultCSS() {
    return {
      ...super.toDefaultCSS(),
      // 'overflow': 'hidden'
    }
  }

}

ComponentManager.registerComponent('artboard', ArtBoard);