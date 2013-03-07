Meteor.startup(function () {
	var config = Config.findOne();
	!config && (config = {setup: 1}) && Config.insert(config);
	if(!config.setup) {
		Accounts.config({
			sendVerificationEmail : false,
			forbidClientAccountCreation : true
		});
	}
});
