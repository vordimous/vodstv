
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
                if(templateConfig.postRender instanceof Function){
                    templateConfig.postRender();
                }
            });
        } else {
            // Unrecognized config format. Let another loader handle it.
            callback(null);
        }
    }
};
 
// Register it
ko.components.loaders.unshift(templateFromUrlLoader);

 ko.observableArray.fn.pushAll = function(valuesToPush) {
    if(valuesToPush instanceof Array){
        var underlyingArray = this();
        this.valueWillMutate();
        ko.utils.arrayPushAll(underlyingArray, valuesToPush);
        this.valueHasMutated();
    }
    return this;
};

ko.isObservableArray = function (obj) {
    return ko.isObservable(obj) && (obj.destroyAll !== undefined);
};

ko.wrap = function (instance) {
    if (ko.isSubscribable(instance)) {
        return instance;
    } else if (_.isArray(instance)) {
        return ko.observableArray(instance);
    } else {
        return ko.observable(instance);
    }
};

ko.extenders.vModel = function (target, type) {
    var initialValue = target();
    if(!(ko.isObservableArray(target))){
        var modelObj = h.model[type].create(initialValue);
        target(modelObj);
    }
    target._type = modelObj._type;
    return target;
};

ko.subscribable.fn.load = function(toLoad, preserve){
    var koSub = this;
    var value = ko.unwrap(koSub);
    if(ko.isObservableArray(koSub) && koSub._type){ //arrays
        var loaded = [];
        var load = function(data){
            var model = v.model[koSub._type].create();
            model.load(data);
            loaded.push(model);
        };
        if(_.isArray(toLoad)){
            toLoad.forEach(function (data) {
                load(data);
            });
        }else {
            load(toLoad);
        }
        if(preserve)
            koSub.pushAll(loaded);
        else
            koSub(loaded);
    }else if(value !== null && value._isVModel){ //objects
        value.load(toLoad);
        koSub.notifySubscribers(toLoad);
    }else{ //default
        koSub(toLoad);
    }

    return koSub;
};

ko.subscribable.fn.toJS = function(){
    var result;
    var koSub = this;
    var value = ko.unwrap(koSub);
    if(ko.isObservableArray(koSub) && koSub._type){ //arrays
        var loaded = [];
        value.forEach(function (data) {
            if(data.toJS instanceof Function)
                loaded.push(data.toJS());
        });
        result = loaded;
    }else if(value !== null && value._isHModel){ //objects
        result = value.toJS();
    }else{ //default
        result = ko.mapping.toJS(koSub);
    }

    return result;
};

ko.subscribable.fn.reset = function(){
    var koSub = this;
    var value = ko.unwrap(koSub);
    if(ko.isObservableArray(koSub)){ //arrays
        koSub([]);
    }else if(value !== null && value._isHModel){ //objects
        value.reset();
    }else{ //default
        koSub(null);
    }

    return koSub;
};

//global
window.v = window.v || {};
//const
_.extend(window.v, {
    _propDefinition: function (getter, options) {
        //define object options and allow for override
        return _.extend({
            configurable: true,
            get: getter
        }, options);
    },
    model: {},
    service:{}
});


ko.components.register('app-main', {
    template: { fromUrl: 'main.html'},
    viewModel: function(){
        var vm = {};
        //variables
        _.extend(window.v, {
            context:"/vod",
            // api: "https://esvods-dev.herokuapp.com/v1",
            api: "http://localhost:9000/v1",
            currentUser: v.model.watcher.create(),
            page: {
                comp: ko.observable("match-bank"),
                params: ko.observable(),
                ctx: ko.observable()
            },
        });

        v.Ajax.doGet({
            url: v.api + '/me',
            onSuccess: function(data){
                v.currentUser.load(data);
            },
        })

        var pageControllers = {
            '/': "feed",
            '/feed': "feed",
            '/matchBank': "match-bank",
            '/admin/:content': "admin",
            '/auth/:content': "auth"
        };

        page.base("/#");
        //register pages
        v.Alfred.keys(pageControllers).forEach(function(url){
            page(url, function (ctx) {
                v.page.ctx(ctx);
                v.page.params(ctx.params);
                v.page.comp(pageControllers[url]);
            });
        });
        page('/auth/logout', function(asdf) {
            v.Ajax.doGet({
                url: v.api + '/signout',
                onSuccess: function(data){
                    v.currentUser.reset();
                    page("/");
                },
            })
        });
        page();
        vm.controller = v.page.comp;
        return vm;
    }
});
