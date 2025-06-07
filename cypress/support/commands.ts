Cypress.Commands.add('containsText', (text, options = {}) => {
  const { caseInsensitive = false } = options;

  const pattern = caseInsensitive
    ? new RegExp(text, 'i')
    : new RegExp(text);

  return cy.contains(pattern);
});

Cypress.Commands.add('getLocalStorage', (key) => {
  return cy.window().then((win) => {
    return win.localStorage.getItem(key);
  });
});

Cypress.Commands.add('setLocalStorage', (key, value) => {
  cy.window().then((win) => {
    win.localStorage.setItem(key, value);
  });
});

Cypress.Commands.add('getSessionStorage', (key) => {
  return cy.window().then((win) => {
    return win.sessionStorage.getItem(key);
  });
});

Cypress.Commands.add('setSessionStorage', (key, value) => {
  cy.window().then((win) => {
    win.sessionStorage.setItem(key, value);
  });
});