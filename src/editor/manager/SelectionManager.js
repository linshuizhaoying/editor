import { isFunction, isUndefined, isArray, isObject, isString } from "../../util/functions/func";
import { Length } from "../unit/Length";
import AreaItem from "../items/AreaItem";


const roundedLength = (px, fixedRound = 1) => {
  return Length.px(px).round(fixedRound);
}

function _traverse(obj, id) {
  var results = [] 

  obj.layers.length && obj.layers.forEach(it => {
    results.push(..._traverse(it, id));
  })

  if (id.id) {
    results.push(obj);
  } else if (id.includes(obj.id)) {
    results.push(obj);
  }

  return results; 
}

export class SelectionManager {
  constructor(editor) {

    this.$editor = editor; 
    this.project = null;
    this.artboard = null;
    this.items = [];
    this.itemKeys = {} 
    this.ids = [];
    this.idsString = '';    
    this.colorsteps = []
  }

  initialize() {
    this.colorsteps = []    
    this.items = [];
    this.itemKeys = {} 
    this.ids = []; 
    this.idsString = '';   
  }

  snapshot() {
    const selection = new SelectionManager(this.$editor);
    selection.select(this.cachedItems);

    this.$editor.history.add('selection', 'selection', { selection })
  }

  /**
   * get first item instance
   */
  get current() {
    return this.items[0]
  }

  get currentProject () {
    return this.project;
  }

  get currentArtboard () {
    return this.artboard;
  }

  get isEmpty () {
    return !this.length 
  }

  get length () {
    return this.items.length;
  }

  getRootItem (current) {
    var rootItem = current || this.currentArtboard;
    if (current) {
      if (current.is('artboard')) {
        rootItem = current; 
      } else if (current.parent) {
        rootItem = current.parent; 
      }
    }

    return rootItem;
  }

  selectColorStep (...args) {
    this.colorsteps = args; 
  }

  isSelectedColorStep (id) {
    return this.colorsteps.includes(id);
  }

  selectProject (project) {
    this.project = project;
    this.artboard = null;
    if (this.project.artboards.length) {
      this.selectArtboard(this.project.artboards[0]);
    }
  }

  selectArtboard (artboard) {
    this.artboard = artboard;

    this.items = [];
    if (this.artboard.layers.length) {
      this.select(this.artboard.layers[0]);
    }

  }

  get isRelative () {
    var item = this.items[0] || { }

    return item.position === 'relative'
  }

  hasDifference (list) {

    if (list.length != this.items.length) {
      return true; 
    }

    const listA = list.map(it => it.id);
    listA.sort();

    const isDifferent = listA.join(',') != this.idsString;

    return isDifferent;
  }

  select(...args) {

    var list = (args || []).filter(it => !it.lock && it.isAbsolute)


    // 차이가 없다면 selection 을 다시 하지 않는다. 
    if (this.hasDifference(list) === false) {
      return false; 
    }

    this.items = list; 

    this.itemKeys = {}
    this.items.forEach(it => {
      this.itemKeys[it.id] = it; 
    })
    this.ids = Object.keys(this.itemKeys)
    this.ids.sort();
    this.idsString = this.ids.join(',');

    this.setRectCache();

    return true; 
  }

  reselect () {
    this.setRectCache();
  }

  check (item) {
    return this.itemKeys[item.id]
  }

  get (id) {
    return this.itemKeys[id];
  }

  isArtBoard () {
    return this.items.length ?  this.current.is('artboard') : false;
  }

  empty () {
    this.select()
  }

  itemsByIds(ids = null) {
    if (isArray(ids)) {
      return _traverse(this.project, ids)
    } else if (isString(ids) || isObject(ids)) {
      return _traverse(this.project, [ids]);
    } else {
      return this.items;
    }
  }

  /**
   * 
   * @param {Item|Item[]} id 
   */
  selectById(id) {
    this.select(... _traverse(this.project, id))
  }

  addById(id) {

    if (this.itemKeys[id]) return;

    this.select(...this.items, ... _traverse(this.project, id))
  }  

  removeById(id) {
    this.select(...this.items.filter(it => it.id != id))
  }    

  toggleById (id) {
    if (this.itemKeys[id]) {
      this.removeById(id);
    } else {
      this.addById(id);
    }
  }

  doCache () {
    this.items.forEach(item => {
      item.setCache();
    })
  }

  setRectCache () {
    
    this.cachedItems = this.items.map(it => {
      // 최종 결과물을 clone 한다. 
      // 이렇게 하는 이유는 복합 객체의 넓이 , 높이르 바꿀 때 실제 path 의 각각의 point 도 바뀌어야 하기 때문이다. 
      return it.toCloneObject()
    })

    this.setAllRectCache();
  }

  // 객체 속성만 클론 
  // 부모, 자식은 클론하지 않음. 
  // 부모 자식은, 객체가 추가 삭제시만 필요 
  toCloneObject () {
    let data = {};

    this.each(item => {
      data[item.id] = item.toCloneObject(false);
    })

    return data;     
  }

  cloneValue (...keys) {
    let data = {};

    this.each(item => {
      data[item.id] = {}

      keys.forEach(key => {
        data[item.id][key] = item[key];
      })
    })

    return data; 
  }

  setAllRectCache () {

    var minX = Number.MAX_SAFE_INTEGER;
    var minY = Number.MAX_SAFE_INTEGER;

    var maxX = Number.MIN_SAFE_INTEGER;    
    var maxY = Number.MIN_SAFE_INTEGER;

    this.cachedItems.forEach(it => {
      minX = Math.min(it.screenX.value, minX);
      minY = Math.min(it.screenY.value, minY);

      maxX = Math.max(it.screenX.value + it.screenWidth.value, maxX);
      maxY = Math.max(it.screenY.value + it.screenHeight.value, maxY);      
    })

    if (minX === Number.MAX_SAFE_INTEGER) minX = 0;
    if (minY === Number.MAX_SAFE_INTEGER) minY = 0;
    if (maxX === Number.MIN_SAFE_INTEGER) maxX = 0;
    if (maxY === Number.MIN_SAFE_INTEGER) maxY = 0;

    this.allRect = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }

  }

  each (callback) {

    if ( isFunction(callback)) {
      this.items.forEach( (item, index) => {
        callback (item, this.cachedItems[index]);
      })
    }

  }

  map (callback) {

    if (isFunction (callback)) {
      return this.items.map( (item, index) => {
        return callback (item, this.cachedItems[index]);
      })
    }

    return this.items; 
  }

  reset (obj) {
    this.each(item => item.reset(obj))
  }

  resetCallback (callback) {
    this.each(item => item.reset(callback(item)))
  }

  resize () {
    this.each(item => item.resize());
  }

  remove () {
    this.each(item => item.remove())
    this.empty();
  }

  copy () {
    this.copyItems = this.items.map(item => item)
  }  

  paste() {
    this.select(...this.copyItems.map(item => item.copy()));
    this.copy()
  }

  isInParent (item, parentItems = []) {

    var prevItem = item; 
    var parent = prevItem.parent; 
    var hasParent = !prevItem.is('artboard') && parentItems.includes(parent); 

    while(!hasParent) {
      if (isUndefined(parent)) break; 
      prevItem = parent; 
      parent = parent.parent; 
      hasParent = !prevItem.is('artboard') && parentItems.includes(parent); 
    }

    return hasParent; 
  }
  
  move (dx, dy) {
    this.each ((item, cachedItem, ) => {

      if (this.isInParent(item, this.items)) {
        // noop 
        // 부모가 있을 때는 dx, dy 로 위치를 옮기지 않는다. 
        // 왜냐하면 이미부모로 부터 위치가 모두 옮겨졌기 때문에. 
      } else {
        item.move( 
          roundedLength(cachedItem.x.value + dx),
          roundedLength(cachedItem.y.value + dy)
        )
      }

    })

    this.reselect()
  }
}
