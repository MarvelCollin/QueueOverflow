import './commands';

Cypress.on('uncaught:exception', (err, runnable) => {

  return false;
});

Cypress.Commands.add('waitForToast', (message: string) => {
  cy.contains(message, { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('login', (email: string = 'john@example.com', password: string = 'password', rememberMe: boolean = false) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);

  if (rememberMe) {
    cy.get('input[type="checkbox"]').check();
  } else {
    cy.get('input[type="checkbox"]').uncheck();
  }

  cy.contains('button', 'Login').click();
  cy.url().should('include', '/questions');
});

Cypress.Commands.add('loginAsGuest', () => {
  cy.visit('/login');
  cy.contains('button', 'Continue as Guest').click();
  cy.url().should('include', '/questions');
});

Cypress.Commands.add('createQuestion', (title: string, content: string, tags: string) => {
  cy.contains('button', 'Ask Question').click();
  cy.url().should('include', '/ask-question');

  cy.get('input[placeholder*="question title"]').type(title);
  cy.get('textarea[placeholder*="question"]').type(content);
  cy.get('input[placeholder*="tags"]').type(tags);

  cy.contains('button', 'Post Question').click();
  cy.contains('Question posted successfully').should('be.visible');
  cy.url().should('include', '/question/');
});

declare global {
  namespace Cypress {
    interface Chainable {
      waitForToast(message: string): Chainable<void>
      login(email?: string, password?: string, rememberMe?: boolean): Chainable<void>
      loginAsGuest(): Chainable<void>
      createQuestion(title: string, content: string, tags: string): Chainable<void>
    }
  }
}