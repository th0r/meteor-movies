
// ==================================== Layout ====================================

Template.layout.events = {
    
    'click .layout-trigger': function (event, tmpl) {
        var oldValue = store.get('isControlsShown');

        store.set('isControlsShown', !oldValue);
        $(tmpl.firstNode).toggleClass('one-column', oldValue);
    }
    
};

Template.layout.controlsHidden = function () {
    return !store.get('isControlsShown');
};