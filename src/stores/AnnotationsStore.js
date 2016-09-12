let instance;

function AnnotationsStore() {
  if (!instance) instance = _AnnotationsStore();

  return instance;

  function _AnnotationsStore() {
    let annotations = [];
    let subscription = null;

    const an = {
      add,
      clear,
      remove,
      subscribe,
      getAnnotations,
    };

    return an;

    function clear() {
      annotations = [];
      return an;
    }

    function subscribe(callback) {
      subscription = callback;
    }

    function getAnnotations() {
      return annotations;
    }

    function add(annotation) {
      annotations = [...annotations, ...[annotation]];
      if (subscription) subscription();
      return an;
    }

    function remove(annotationID) {
      annotations.splice(annotations.findIndex(x => x.id === annotationID), 1);
      if (subscription) subscription();
      return an;
    }
  }
}
export default AnnotationsStore();
