const modes = new Map();
const views = new Map();

export class FlowDatepicker {
  static selector = 'input[data-flow-datepicker]:not([data-flow-datepicker="manual"]), [data-flow-datepicker="range"]';

  static modes = {
    register(recipe) {
      modes.set(recipe.name, recipe);
    },
    get(name) {
      return modes.get(name);
    }
  };

  static views = {
    register(name, View) {
      views.set(name, View);
    },
    get(name) {
      return views.get(name);
    }
  };

  static init(root = document) {
    return [];
  }

  static get(element) {
    return null;
  }
}
