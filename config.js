var config = {};

config.eklase = {};

config.eklase.login_url = process.env.EKLASE_LOGIN_URL || 'https://my.e-klase.lv';
config.eklase.user_name = process.env.EKLASE_USER; // Append your e-klase username like shown above.
config.eklase.password =  process.env.EKLASE_PASSWORD; // Append your e-klase password like shown above.

config.timeout = 2000; // Increase this value if e-klase doesn't finish loading
config.scale = 1.5; // Scale of screenshot
config.updateInterval = 10; // Time interval between updating in minutes

config.headless = process.env.HEADLESS || true;
module.exports = config;

if(config.headless==="false") config.headless = false;
else if(config.headless==="true") config.headless = true;