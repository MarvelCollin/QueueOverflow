describe("Login Workflows", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });

    cy.visit("/");
  });

  it("should log in with remember me option", () => {
    cy.contains("button", "Log in").click();
    cy.url().should("include", "/login");

    cy.get('input[type="email"]').type("john@example.com");
    cy.get('input[type="password"]').type("password");
    cy.get('input[type="checkbox"]').check();

    cy.contains("button", "Login").click();

    cy.url().should("include", "/questions");

    cy.window().then((win) => {
      expect(win.localStorage.getItem("currentUser")).to.not.be.null;
      expect(win.localStorage.getItem("token")).to.not.be.null;
      expect(win.sessionStorage.getItem("currentUser")).to.be.null;
    });

    cy.contains("John Doe").should("be.visible");
  });

  it("should log in without remember me option", () => {
    cy.contains("button", "Log in").click();
    cy.url().should("include", "/login");

    cy.get('input[type="email"]').type("john@example.com");
    cy.get('input[type="password"]').type("password");

    cy.get('input[type="checkbox"]').uncheck();

    cy.contains("button", "Login").click();

    cy.url().should("include", "/questions");

    cy.window().then((win) => {
      expect(win.localStorage.getItem("currentUser")).to.be.null;
      expect(win.localStorage.getItem("token")).to.be.null;
      expect(win.sessionStorage.getItem("currentUser")).to.not.be.null;
    });

    cy.contains("John Doe").should("be.visible");
  });

  it("should continue as guest and redirect to questions page", () => {
    cy.contains("button", "Log in").click();
    cy.url().should("include", "/login");

    cy.contains("button", "Continue as Guest").click();

    cy.url().should("include", "/questions");

    cy.window().then((win) => {
      expect(win.localStorage.getItem("guest")).to.equal("true");
    });

    cy.contains("button", "Ask Question").should("be.visible");
  });

  it("should log out successfully", () => {
    cy.contains("button", "Log in").click();
    cy.get('input[type="email"]').type("john@example.com");
    cy.get('input[type="password"]').type("password");
    cy.contains("button", "Login").click();

    cy.contains("John Doe").should("be.visible");

    cy.contains("button", "Logout").click();

    cy.url().should("include", "/login");

    cy.window().then((win) => {
      expect(win.localStorage.getItem("currentUser")).to.be.null;
      expect(win.localStorage.getItem("token")).to.be.null;
      expect(win.sessionStorage.getItem("currentUser")).to.be.null;
      expect(win.sessionStorage.getItem("token")).to.be.null;
    });

    cy.contains("button", "Log in").should("be.visible");
  });
});
