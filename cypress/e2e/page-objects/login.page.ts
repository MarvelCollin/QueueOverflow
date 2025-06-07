class LoginPage {

  private emailInput = 'input[type="email"]';
  private passwordInput = 'input[type="password"]';
  private rememberMeCheckbox = 'input[type="checkbox"]';
  private loginButton = 'button:contains("Login")';
  private guestButton = 'button:contains("Continue as Guest")';

  visit() {
    cy.visit('/login');
    return this;
  }

  fillLoginForm(email: string, password: string, rememberMe: boolean = false) {
    cy.get(this.emailInput).type(email);
    cy.get(this.passwordInput).type(password);

    if (rememberMe) {
      cy.get(this.rememberMeCheckbox).check();
    } else {
      cy.get(this.rememberMeCheckbox).uncheck();
    }

    return this;
  }

  submit() {
    cy.contains('button', 'Login').click();
    cy.url().should('include', '/questions');
    return this;
  }

  continueAsGuest() {
    cy.contains('button', 'Continue as Guest').click();
    cy.url().should('include', '/questions');
    return this;
  }

  login(email: string, password: string, rememberMe: boolean = false) {
    this.fillLoginForm(email, password, rememberMe);
    this.submit();
    return this;
  }

  verifyLocalStorageData(expected: { email: string }) {
    cy.window().then((win) => {
      const user = JSON.parse(win.localStorage.getItem('currentUser') || '{}');
      expect(user.email).to.equal(expected.email);
    });
    return this;
  }
}

export const loginPage = new LoginPage();