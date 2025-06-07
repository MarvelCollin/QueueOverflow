describe("Login Test", () => {
  beforeEach(() => {
    cy.clearLocalStorage();

    cy.visit("/login");
  });

  it("should show error for wrong credentials first, then login successfully", () => {
    cy.get("#email").type("wrong@email.com");
    cy.get("#password").type("wrongpassword");
    cy.get('button[type="submit"]').click();

    cy.contains("Invalid email or password").should("be.visible");

    cy.get("#email").clear();
    cy.get("#password").clear();

    cy.get("#email").type("kolin@gmail.com");
    cy.get("#password").type("kolin123");
    cy.get('button[type="submit"]').click();

    cy.url().should("include", "/questions");

    cy.contains("Welcome back").should("be.visible");
  });

  it("should validate required fields", () => {
    cy.get('button[type="submit"]').click();
    cy.contains("Email is required").should("be.visible");

    cy.get("#email").type("kolin@gmail.com");
    cy.get('button[type="submit"]').click();
    cy.contains("Password is required").should("be.visible");
  });

  it("should validate email format", () => {
    cy.get("#email").type("invalid-email");
    cy.get("#password").type("kolin123");
    cy.get('button[type="submit"]').click();

    cy.contains("Please enter a valid email address").should("be.visible");
  });

  it("should allow guest access", () => {
    cy.contains("Continue as Guest").click();

    cy.url().should("include", "/questions");

    cy.contains("Continuing as guest").should("be.visible");
  });
});
