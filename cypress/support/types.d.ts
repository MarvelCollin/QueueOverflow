/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select text with case insensitivity option
     */
    containsText(text: string, options?: { caseInsensitive?: boolean }): Chainable<JQuery<HTMLElement>>

    /**
     * Get an item from localStorage
     */
    getLocalStorage(key: string): Chainable<string | null>

    /**
     * Set an item in localStorage
     */
    setLocalStorage(key: string, value: string): Chainable<void>

    /**
     * Get an item from sessionStorage
     */
    getSessionStorage(key: string): Chainable<string | null>

    /**
     * Set an item in sessionStorage
     */
    setSessionStorage(key: string, value: string): Chainable<void>

    /**
     * Wait for a toast notification with specific text
     */
    waitForToast(message: string): Chainable<JQuery<HTMLElement>>

    /**
     * Login with credentials
     */
    login(email?: string, password?: string, rememberMe?: boolean): Chainable<void>

    /**
     * Login as guest user
     */
    loginAsGuest(): Chainable<void>

    /**
     * Create a question with title, content and tags
     */
    createQuestion(title: string, content: string, tags: string): Chainable<void>
  }
} 