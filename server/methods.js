//Write
Meteor.methods({
	setup : function(title) {
		if(!this.userId) return;
		Config.remove({});
		Config.insert({title: title});
		Accounts.config({
			forbidClientAccountCreation : true
		});
	}
});
