import { loginPage } from "./page-objects/login.page";

describe("Login Using Page Objects", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  it("should log in with remember me using the page object pattern", () => {
    loginPage.visit();

    loginPage.fillLoginForm("john@example.com", "password", true).submit();

    loginPage.verifyLocalStorageData({ email: "john@example.com" });

    cy.contains("John Doe").should("be.visible");
  });

  it("should continue as guest using the page object pattern", () => {
    loginPage.visit().continueAsGuest();

    cy.window().then((win) => {
      expect(win.localStorage.getItem("guest")).to.equal("true");
    });

    cy.url().should("include", "/questions");
  });
});
