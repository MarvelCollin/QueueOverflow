/// <reference types="cypress" />

describe('Basic Tests', () => {
  it('should visit the home page', () => {
    cy.visit('/');
    // Basic assertion that the page loads
    cy.contains('Log in').should('exist');
  });
}); 