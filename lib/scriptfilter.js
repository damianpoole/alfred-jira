const Jira = require('./jira');
const keychain = require('./jira/keychain');
const Workflow = require('./workflow');
const list = require('./listTickets');
const settings = require('./settings');
const assign = require('./assign');
const comment = require('./comment');
const status = require('./status');

let wf = new Workflow();
let actions = wf.actionHandler;
let query = process.argv.slice(2)[0];

actions.onAction('tickets', list.menu.bind(list));
actions.onAction('settings', settings.menu.bind(settings));
actions.onAction('search', list.getSearchString.bind(list));
actions.onAction('assign', assign);
actions.onAction('watched', list.watchedIssues.bind(list));
actions.onAction('comment', comment);
actions.onAction('status', status);

actions.onAction('mainMenu', query => {
  let search = { title: 'Search Jira', valid: false, autocomplete: wf._sep + 'search ' + wf._sep + ' ' + query, icon: './resources/icons/search.png' };
  if (keychain.find()) {
    // Kick off background process
    Jira.fetchData();
    
    wf.default(search);
    wf.addItems([
      { title: 'My tickets', valid: false, autocomplete: wf._sep + 'tickets ' + wf._sep, icon: './resources/icons/inbox.png' },
      { title: 'Watched issues', valid: false, autocomplete: wf._sep + 'watched ' + wf._sep, icon: './resources/icons/watched.png'},
      search,
      { title: 'Settings', valid: false, autocomplete: wf._sep + 'settings ' + wf._sep, icon: './resources/icons/config.png' }
    ].filter(s => new RegExp(query, 'i').test(s.title)));
  } else {
    wf.addItem({
      title: 'Login',
      valid: true, 
      arg: 'login',
      icon: './resources/icons/login.png'
    })
  }
  wf.feedback();
  wf.storage.clear();
});

switch(true) {
  case /tickets/.test(query):
    actions.handle('tickets', query)
    break;
  case /watched/.test(query):
    actions.handle('watched', query)
    break;
  case /search/.test(query):
    actions.handle('search', query);
    break;
  case /settings/.test(query):
    actions.handle('settings', query);
    break;
  case /assign/.test(query):
    actions.handle('assign', query);
    break;
  case /comment/.test(query):
    actions.handle('comment', query);
    break;
  case /status/.test(query):
    actions.handle('status', query);
    break;
  default: 
    actions.handle('mainMenu', query)
};
