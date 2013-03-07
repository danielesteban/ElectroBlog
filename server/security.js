Meteor.publish("config", function () {
	return Config.find();
});

Meteor.publish("users", function () {
	return Meteor.users.find({}, {fields: {'profile.name' : 1}});
});

Meteor.publish("articles", function () {
	return Articles.find({'$or' : [{draft: {'$exists' : false}}, {owner: this.userId}]});
});

Meteor.startup(function() {
	Articles.allow({
		insert : function(userId, article) {
			article.createdAt = LIB.getTime();
			return (userId && article.owner === userId);
		},
		update : function(userId, articles, fields, modifier) {
			return _.all(articles, function(article) {
				return article.owner === userId;
			});
		},
		remove : function(userId, articles, fields, modifier) {
			return _.all(articles, function(article) {
				return article.owner === userId;
			});
		},
		fetch: ['owner']
	});

	Articles.deny({
		update : function(userId, docs, fields, modifier) {
			return _.contains(fields, 'owner') || _.contains(fields, 'createdAt');
		}
	});
});
