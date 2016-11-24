var templateFromUrlLoader = {
    loadTemplate: function(name, templateConfig, callback) {
        if (templateConfig.fromUrl) {
            // Uses jQuery's ajax facility to load the markup from a file
            var fullUrl = '/templates/' + templateConfig.fromUrl + '?cacheAge=' + templateConfig.maxCacheAge;
            $.get(fullUrl, function(markupString) {
                // We need an array of DOM nodes, not a string.
                // We can use the default loader to convert to the
                // required format.
                ko.components.defaultLoader.loadTemplate(name, markupString, callback);
            });
        } else {
            // Unrecognized config format. Let another loader handle it.
            callback(null);
        }
    }
};
 
// Register it
ko.components.loaders.unshift(templateFromUrlLoader);

ko.components.register('app-main', {
    template: { fromUrl: 'main.html'},
    viewModel: function(){
        this.title = "Admin Page";
        this.controller = "admin";
    }
});

Object.defineProperty(window, 'v', {
    value:{
        context:"/vod",
        service:{}
    }
})

