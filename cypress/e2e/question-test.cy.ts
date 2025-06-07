describe('Question Creation and Answering', () => {
  beforeEach(() => {

    cy.clearLocalStorage();

    cy.visit('/');
  });

  it('should verify basic navigation works', () => {

    cy.contains('Log in').should('exist');
    cy.contains('Log in').click();

    cy.url().should('include', '/login');

    cy.contains('Continue as Guest').click();

    cy.url().should('include', '/questions');

    cy.get('button').contains('Ask').should('exist');
  });

  it('should create a question and answer it', () => {

    cy.contains('Ask Question').click();
    cy.url().should('include', '/ask-question');

    const questionTitle = `Test Question ${Date.now()}`;
    cy.get('input[placeholder*="title"]').type(questionTitle);
    cy.get('textarea[placeholder*="question"]').type('This is a test question. How do I test React applications?');
    cy.get('input[placeholder*="tags"]').type('react,testing,cypress');

    cy.contains('Post Question').click();

    cy.url().should('include', '/question/');

    cy.contains(questionTitle).should('exist');

    cy.get('textarea[placeholder*="answer"]').type('To test React applications, you can use Cypress for end-to-end testing.');
    cy.contains('Post Answer').click();

    cy.contains('To test React applications').should('exist');
  });
});