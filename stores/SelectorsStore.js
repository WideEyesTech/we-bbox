let instance;

function SelectorsStore() {
  if (!instance) instance = _SelectorsStore();

  return instance;

  function _SelectorsStore() {
    let selectors = [];
    let subscription = null;

    const se = {
      add,
      clear,
      slice,
      subscribe,
      getSelectors,
    };

    return se;

    function clear() {
      selectors = [];
      return se;
    }

    function subscribe(callback) {
      subscription = callback;
    }

    function getSelectors() {
      return selectors;
    }

    function add(selector) {
      selectors = [...selectors, ...[selector]];
      if (subscription) subscription();
      return se;
    }

    function slice() {
      selectors = selectors.slice(1);
      if (subscription) subscription();
      return se;
    }
  }
}

export default SelectorsStore();
