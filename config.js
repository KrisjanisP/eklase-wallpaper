var config = {};

config.eklase = {};

config.eklase.login_url = process.env.EKLASE_LOGIN_URL || 'https://my.e-klase.lv';
config.eklase.user_name = process.env.EKLASE_USER; // Append your e-klase username like shown above.
config.eklase.password =  process.env.EKLASE_PASSWORD; // Append your e-klase password like shown above.

module.exports = config;