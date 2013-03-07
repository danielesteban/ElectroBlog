Handlebars.registerHelper('config', function() {
    return Session.get('config');
});

Handlebars.registerHelper('articles', function() {
    return ARTICLES.get();
});

Handlebars.registerHelper('pagination', function() {
    var pagination = [];
    ARTICLES.get().fetch().forEach(function(a, i) {
        pagination.push({i: i + 1, _id: a._id})
    });
    return pagination;
});

Handlebars.registerHelper('signin', function() {
    return Session.get("signin");
});

Handlebars.registerHelper('L', function(key) {
    var L = Session.get("L");
    return L ? L[key] : '';
});

Handlebars.registerHelper('inline', function(text, collection, id, field, tag, multiline) {
    text = LIB.escapeHTML(text);
    multiline === true && (text = text.replace(/\n/g, '<br>'));
    typeof tag !== 'string' && (tag = 'span');
    return new Handlebars.SafeString('<' + tag + ' ' + (Meteor.userId() ? 'contenteditable="true" onblur="LIB.inlineOnBlur(event, ' + collection + ', \'' + id + '\', \'' + field + '\')" onkeydown="LIB.inlineOnKeyDown(event)" onfocus="LIB.inlineOnFocus(event)" value="' + text + '"' : '') + (multiline === true ? ' multiline="true"' : '') + (Meteor.userId() && text === '' ? ' placeholder="' + Session.get("L")[field] + '"' : '') + '>' + (Meteor.userId() && text === '' ? Session.get("L")[field] : LIB.parseLinks(text)) + '</' + tag + '>');
});

Template.setup.events({
    'submit form' : function (e) {
    	LIB.cancelHandler(e);
    	Accounts.createUser({username: e.target.user.value, password: e.target.password.value, profile: {name: e.target.name.value || 'Admin'}}, function(err) {
    		err && console.log(err);
    		Meteor.call('setup', e.target.title.value);
    	});
    }
});

Template.signin.events({
    'submit form' : function (e) {
        LIB.cancelHandler(e);
        Meteor.loginWithPassword(e.target.user.value, e.target.password.value, function(err) {
            !err && Session.set("signin");
        });
    }
});

Template.signin.rendered = function() {
    LIB.scrollTo('#signin');
    $('#user').focus();
};

Template.article.user = function() {
    return Meteor.users.findOne({_id: this.owner});
}

Template.article.image = function() {
    return this.image || '/i/no-photo.jpg';
}

Template.article.date = function() {
    var date = new Date(this.createdAt);
    return LIB.formatDay(date) + ' - ' + LIB.formatHour(date);
};

ARTICLES = {
    get : function() {
        return Articles.find({}, {sort: {createdAt: -1}});
    },
    add : function() {
        var id = Articles.insert({owner: Meteor.userId(), draft: 1});
        Meteor.setTimeout(function() {
            LIB.scrollTo('#article_' + id);
        }, 150);
    },
    setImage : function(e, id) {
        LIB.cancelHandler(e);
        if(!e.dataTransfer.files[0]) return;
        var r = new FileReader();
        r.onload = function(e) {
            var img = $('<img/>')[0];
            img.onload = function(e) {
                var canvas = $('<canvas/>')[0],
                    ctx = canvas.getContext('2d'),
                    w = IMAGE_CROP_WIDTH,
                    h = IMAGE_CROP_HEIGHT,
                    x = 0,
                    y = 0,
                    ow = img.width,
                    oh = img.height,
                    dSrc = img.width / img.height,
                    dDst = w / h;


               if(dSrc < dDst) {
                    if(img.width < w) {
                        h = h * img.width / w;
                        w = img.width;
                    }
                    img.width = w;
                    img.height = oh * w / ow;
                    y = -(img.height - h) / 2;
                } else {                        
                    if(img.height < h) {
                        w = w * img.height / h;
                        h = img.height;
                    }
                    console.log(ow, oh);
                    
                    img.height = h;
                    img.width = ow * h / oh;
                    x = -(img.width - w) / 2;
                }           
                canvas.width = w;
                canvas.height = h;
                ctx.drawImage(img, 0, 0, ow, oh, x, y, img.width, img.height);
                Articles.update({_id: id}, {'$set' : {image: canvas.toDataURL()}});
            };
            img.src = e.target.result;
        };
        r.readAsDataURL(e.dataTransfer.files[0]);
    }
};

Meteor.startup(function () {
    var available_langs = ['en', 'es'],
        langs = {en: L_EN, es: L_ES},
        browser_lang = navigator.language ? navigator.language.substr(navigator.language.length - 2).toLowerCase() : navigator.browserLanguage,
        cookie_lang = window.localStorage.getItem("lang"),
        lang = 'en'; //the default

    if(available_langs.indexOf(cookie_lang) !== -1) lang = cookie_lang;    
    else if(available_langs.indexOf(browser_lang) !== -1) lang = browser_lang;

    Session.set("L", langs[lang]);
    window.localStorage.setItem("lang", lang);

    Meteor.subscribe("config");
    Meteor.subscribe("users");
    Meteor.subscribe("articles");

    $(window).resize(LIB.onResize);

    Meteor.autorun(function() {
    	LIB.articlesCount = ARTICLES.get().count() || 1;
    	LIB.onResize();
    });
    
    Meteor.autorun(function() {
        var config = Config.findOne();
        Session.set('config', config);
        config && config.title && ($('title').text(config.title));
    });

});
