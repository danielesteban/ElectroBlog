LIB = {
    cancelHandler : function(e) {
        e.stopPropagation();
        e.preventDefault();
    },
    addZero : function(str) {
        str = str + '';
        if(str.length < 2) str = '0' + str;
        return str;
    },
    escapeHTML : function(text) {
        return $('<div/>').text(text).html();
    },
    inlineOnKeyDown : function(e) {
        if(!$(e.target).attr('multiline') && e.keyCode == 13) {
            LIB.cancelHandler(e);
            e.target.blur();
        }
    },
    inlineOnBlur : function(e, collection, id, field) {
        var t = $(e.target),
            value = t.html(),
            set = {};

        set[field] = value.replace(/<div>/g, "\n").replace(/<\/div>/g, "").replace(/<br>/g, "\n");
        collection.update({_id: id}, {'$set' : set});
        if(value !== '') t.html(LIB.parseLinks(value));
        else {
            var ph = t.attr('placeholder');
            ph !== '' && $(e.target).text(ph);
        }
    },
    inlineOnFocus : function(e) {
        var t = $(e.target),
            val = t.attr('value');
        
        t.html(val);
    },
    isLink : function(text) {
        return text.match(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i);
    },
    parseLinks : function(text) {
        return text.replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i, "<a href='$1' target='_blank'>$1</a>");
    },
    formatDay : function(date, full) {
        var L = Session.get("L");
        return L[full ? 'fullDate' : 'monthDay'].replace(/{{weekday}}/g, L.fullWeekDays[(date.getDay() === 0 ? 6 : date.getDay() - 1)]).replace(/{{month}}/g, L.fullMonths[date.getMonth()]).replace(/{{day}}/g, LIB.addZero(date.getDate())).replace(/{{year}}/g, date.getFullYear());
    },
    formatHour : function(date) {
        return LIB.addZero(date.getHours()) + ":" + LIB.addZero(date.getMinutes());
    },
    scrollTo : function(selector, xOffset, yOffset) {
        var e = $(selector);
        xOffset = xOffset || -50;
        yOffset = yOffset || 0;
        $('html, body').stop().animate({
            scrollTop: e.offset().top + yOffset,
            scrollLeft: e.offset().left + xOffset
        });
    },
    onResize : function() {
    	var b = $('body'),
    		c = $('div.container.ghost'),
    		ac = LIB.articlesCount;
    	
    	if(!c.length) {
    		c = $('<div class="container ghost"></div>');
    		b.append(c);
    	}
    	b.css('width', (ac * (c.width() + 150)) - 40);
    }
};
