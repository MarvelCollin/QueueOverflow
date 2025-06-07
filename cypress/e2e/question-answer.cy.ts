describe('Question and Answer Flow', () => {
  beforeEach(() => {

    cy.clearLocalStorage();

    cy.visit('/');

    cy.contains('button', 'Log in').click();
    cy.contains('button', 'Continue as Guest').click();

    cy.url().should('include', '/questions');
  });

  it('should create a new question and answer it', () => {

    cy.contains('button', 'Ask Question').click();

    cy.url().should('include', '/ask-question');

    const questionTitle = `Test Question ${Date.now()}`;
    cy.get('input[placeholder*="question title"]').type(questionTitle);
    cy.get('textarea[placeholder*="question"]').type('This is a test question created by Cypress. How do I test React applications?');

    cy.get('input[placeholder*="tags"]').type('react,testing,cypress{enter}');

    cy.contains('button', 'Post Question').click();

    cy.contains('Question posted successfully').should('be.visible');

    cy.url().should('include', '/question/');

    cy.get('textarea[placeholder*="answer"]').type('You can test React applications using Cypress, which provides end-to-end testing capabilities. Here\'s an example of how to set it up...');

    cy.contains('button', 'Post Answer').click();

    cy.contains('Answer posted successfully').should('be.visible');

    cy.contains('You can test React applications using Cypress').should('be.visible');

    cy.get('.answer-container').first().within(() => {
      cy.get('button[aria-label="Upvote"]').click();
    });

    cy.get('.answer-container').first().within(() => {
      cy.get('button[aria-label="Accept answer"]').click();
    });

    cy.contains('Solved').should('be.visible');
  });
});